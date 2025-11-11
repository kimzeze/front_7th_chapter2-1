# 02. 상태 관리 시스템 구현하기

> **React 개념**: `useState`, `useReducer`, Redux
> **난이도**: ⭐⭐⭐ (중상)
> **예상 시간**: 6-8시간

## 🎯 이번 단계의 목표

React의 `useState`와 `useReducer`를 직접 구현하고, 전역 상태 관리 시스템을 만듭니다.

### 구현할 기능
- ✅ `createState()` - useState와 유사한 상태 관리
- ✅ `createStore()` - Redux와 유사한 전역 상태 관리
- ✅ Observer 패턴을 통한 상태 변경 알림
- ✅ 불변성 유지
- ✅ 상태 구독/구독 해제

---

## 📚 배경 지식

### React의 useState는 어떻게 동작하나요?

```jsx
// React의 useState
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1); // 상태 업데이트
  };

  return <button onClick={handleClick}>{count}</button>;
}
```

**핵심 개념:**
1. 상태는 **컴포넌트 외부**에 저장됨
2. `setState` 호출 시 **리렌더링** 발생
3. **불변성**을 유지해야 함 (새로운 값으로 교체)

### React의 useReducer

```jsx
// React의 useReducer
const reducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    default:
      return state;
  }
};

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>{state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
    </div>
  );
}
```

---

## 🏗️ 구현 단계

### Step 1: Observer 패턴 구현 (1시간)

상태가 변경되면 구독자들에게 알림을 보내는 시스템을 만듭니다.

**파일 생성**: `src/core/Observer.js`

```javascript
// 옵저버 패턴 베이스 클래스
class Observable {
  constructor() {
    this.observers = [];
  }

  // 구독
  subscribe(observer) {
    this.observers.push(observer);

    // 구독 해제 함수 반환 (React의 useEffect cleanup과 유사)
    return () => {
      this.observers = this.observers.filter(obs => obs !== observer);
    };
  }

  // 모든 구독자에게 알림
  notify(data) {
    this.observers.forEach(observer => observer(data));
  }
}

export default Observable;
```

---

### Step 2: Store 구현 (Redux-like) (2시간)

**파일 생성**: `src/core/Store.js`

```javascript
import Observable from './Observable.js';

class Store extends Observable {
  constructor(initialState = {}) {
    super();
    this.state = initialState;
  }

  // 현재 상태 가져오기
  getState() {
    return this.state;
  }

  // 상태 업데이트 (불변성 유지)
  setState(updates) {
    // 객체인 경우 merge, 함수인 경우 실행
    const newState = typeof updates === 'function'
      ? updates(this.state)
      : { ...this.state, ...updates };

    // 실제로 변경되었을 때만 알림
    if (JSON.stringify(this.state) !== JSON.stringify(newState)) {
      this.state = newState;
      this.notify(this.state);
    }
  }

  // 특정 필드만 업데이트
  update(key, value) {
    this.setState({ [key]: value });
  }
}

export default Store;
```

---

### Step 3: createState 구현 (useState와 유사) (2시간)

**파일 생성**: `src/core/hooks/useState.js`

```javascript
// 전역 상태 저장소
const states = [];
let currentStateIndex = 0;

// useState와 유사한 함수
export function createState(initialValue) {
  const stateIndex = currentStateIndex;

  // 초기화
  if (states[stateIndex] === undefined) {
    states[stateIndex] = {
      value: initialValue,
      listeners: []
    };
  }

  const state = states[stateIndex];

  // setState 함수
  const setState = (newValue) => {
    // 함수형 업데이트 지원
    const nextValue = typeof newValue === 'function'
      ? newValue(state.value)
      : newValue;

    // 불변성 체크
    if (JSON.stringify(state.value) !== JSON.stringify(nextValue)) {
      state.value = nextValue;

      // 모든 리스너에게 알림
      state.listeners.forEach(listener => listener(nextValue));
    }
  };

  // 구독
  const subscribe = (listener) => {
    state.listeners.push(listener);

    // 구독 해제 함수 반환
    return () => {
      state.listeners = state.listeners.filter(l => l !== listener);
    };
  };

  currentStateIndex++;

  return [state.value, setState, subscribe];
}

// 상태 인덱스 리셋 (렌더링 시작 전 호출)
export function resetStateIndex() {
  currentStateIndex = 0;
}
```

---

### Step 4: 전역 상태 관리 (장바구니 예시) (2시간)

**파일 생성**: `src/stores/cartStore.js`

```javascript
import Store from '../core/Store.js';

class CartStore extends Store {
  constructor() {
    super({
      items: [], // 장바구니 아이템
      total: 0,  // 총 금액
      count: 0   // 총 개수
    });

    // localStorage에서 복원
    this.loadFromStorage();
  }

  // 상품 추가
  addItem(product, quantity = 1) {
    const items = [...this.state.items];
    const existingIndex = items.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
      // 이미 있는 상품이면 수량 증가
      items[existingIndex] = {
        ...items[existingIndex],
        quantity: items[existingIndex].quantity + quantity
      };
    } else {
      // 새 상품 추가
      items.push({ ...product, quantity });
    }

    this.updateCart(items);
  }

  // 상품 삭제
  removeItem(productId) {
    const items = this.state.items.filter(item => item.id !== productId);
    this.updateCart(items);
  }

  // 수량 변경
  updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const items = this.state.items.map(item =>
      item.id === productId
        ? { ...item, quantity }
        : item
    );

    this.updateCart(items);
  }

  // 장바구니 비우기
  clear() {
    this.updateCart([]);
  }

  // 선택 상품 삭제
  removeSelected(selectedIds) {
    const items = this.state.items.filter(
      item => !selectedIds.includes(item.id)
    );
    this.updateCart(items);
  }

  // 총합 계산 및 상태 업데이트
  updateCart(items) {
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    this.setState({ items, total, count });
    this.saveToStorage();
  }

  // localStorage에 저장
  saveToStorage() {
    localStorage.setItem('cart', JSON.stringify(this.state));
  }

  // localStorage에서 불러오기
  loadFromStorage() {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        this.state = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load cart from storage:', e);
      }
    }
  }
}

// 싱글톤 인스턴스
export const cartStore = new CartStore();
```

---

### Step 5: 컴포넌트에서 Store 사용하기 (1시간)

**예시**: 장바구니 모달

```javascript
// src/components/cart/CartModal.js
import { cartStore } from '../../stores/cartStore.js';

export class CartModal {
  constructor() {
    this.isOpen = false;

    // 장바구니 상태 구독
    this.unsubscribe = cartStore.subscribe((state) => {
      this.render();
    });
  }

  open() {
    this.isOpen = true;
    this.render();
  }

  close() {
    this.isOpen = false;
    this.render();
  }

  render() {
    if (!this.isOpen) {
      document.getElementById('cart-modal')?.remove();
      return;
    }

    const state = cartStore.getState();

    const html = `
      <div id="cart-modal" class="modal">
        <div class="modal-content">
          <button onclick="window.cartModal.close()">&times;</button>

          <h2>장바구니 (${state.count}개)</h2>

          <div class="cart-items">
            ${state.items.map(item => `
              <div class="cart-item" data-id="${item.id}">
                <img src="${item.thumbnail}" alt="${item.title}">
                <div class="item-info">
                  <h3>${item.title}</h3>
                  <p>$${item.price} × ${item.quantity}</p>
                </div>
                <div class="item-controls">
                  <button onclick="handleQuantityChange(${item.id}, ${item.quantity - 1})">-</button>
                  <span>${item.quantity}</span>
                  <button onclick="handleQuantityChange(${item.id}, ${item.quantity + 1})">+</button>
                  <button onclick="handleRemoveItem(${item.id})">삭제</button>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="cart-summary">
            <p>총 금액: $${state.total.toFixed(2)}</p>
            <button onclick="handleClearCart()">전체 삭제</button>
          </div>
        </div>
      </div>
    `;

    // 기존 모달 제거 후 새로 추가
    document.getElementById('cart-modal')?.remove();
    document.body.insertAdjacentHTML('beforeend', html);
  }

  destroy() {
    // 구독 해제
    this.unsubscribe();
  }
}

// 전역 이벤트 핸들러
window.handleQuantityChange = (id, quantity) => {
  cartStore.updateQuantity(id, quantity);
};

window.handleRemoveItem = (id) => {
  cartStore.removeItem(id);
};

window.handleClearCart = () => {
  if (confirm('장바구니를 비우시겠습니까?')) {
    cartStore.clear();
  }
};

// 전역 인스턴스
window.cartModal = new CartModal();
```

---

### Step 6: 상품 목록에서 장바구니에 추가 (30분)

```javascript
// src/components/product/ProductCard.js
import { cartStore } from '../../stores/cartStore.js';

export const ProductCard = (product) => {
  return `
    <div class="product-card" data-product-id="${product.id}">
      <img src="${product.thumbnail}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p>$${product.price}</p>
      <button
        class="add-to-cart-btn"
        onclick="handleAddToCart(${product.id}, '${product.title}', ${product.price}, '${product.thumbnail}')"
      >
        장바구니에 추가
      </button>
    </div>
  `;
};

// 전역 핸들러
window.handleAddToCart = (id, title, price, thumbnail) => {
  cartStore.addItem({ id, title, price, thumbnail }, 1);

  // 토스트 알림 (다음 단계에서 구현)
  showToast('장바구니에 추가되었습니다', 'success');
};
```

---

## ✅ 체크리스트

### Observer 패턴
- [ ] `subscribe()` 동작
- [ ] `notify()` 호출 시 모든 구독자에게 알림
- [ ] `unsubscribe()` 동작

### Store
- [ ] `getState()` 동작
- [ ] `setState()` 호출 시 상태 업데이트
- [ ] 불변성 유지 (기존 객체 변경 안 됨)
- [ ] 변경 시에만 구독자에게 알림

### 장바구니
- [ ] 상품 추가
- [ ] 상품 삭제
- [ ] 수량 증가/감소
- [ ] 장바구니 비우기
- [ ] localStorage 저장/복원
- [ ] 새로고침 시 장바구니 유지

### 테스트
```bash
# 장바구니 테스트
pnpm run test:e2e:basic

# 특정 테스트만 실행
pnpm run test:e2e:ui
```

---

## 🐛 디버깅 팁

### 문제 1: 상태가 업데이트되지 않아요
```javascript
// ❌ 잘못된 코드 (불변성 위반)
const items = this.state.items;
items.push(newItem);
this.setState({ items }); // 참조가 같아서 변경 감지 안 됨

// ✅ 올바른 코드 (불변성 유지)
const items = [...this.state.items, newItem];
this.setState({ items });
```

### 문제 2: 구독자가 호출되지 않아요
```javascript
// 디버깅용 로그 추가
notify(data) {
  console.log('Notifying observers:', this.observers.length, data);
  this.observers.forEach(observer => {
    console.log('Calling observer:', observer);
    observer(data);
  });
}
```

### 문제 3: localStorage가 작동하지 않아요
```javascript
// localStorage 디버깅
saveToStorage() {
  const data = JSON.stringify(this.state);
  console.log('Saving to storage:', data);
  localStorage.setItem('cart', data);

  // 저장 확인
  const saved = localStorage.getItem('cart');
  console.log('Saved data:', saved);
}
```

---

## 🎓 학습 포인트

### React와의 비교

| React | 우리의 구현 | 차이점 |
|-------|------------|--------|
| `useState()` | `createState()` | Hook vs 함수 호출 |
| `useReducer()` | `Store` + `reducer` | Hook vs 클래스 |
| Re-render | `notify()` + 수동 렌더링 | 자동 vs 수동 |
| Context API | 전역 Store | Hook vs 싱글톤 |

### 왜 이렇게 만들었나요?

1. **Observer 패턴**: React의 리렌더링 메커니즘을 모방
2. **불변성**: 상태 변경 감지를 위해 필수
3. **싱글톤**: 전역 상태를 여러 컴포넌트에서 공유
4. **localStorage**: 새로고침 시 상태 유지

---

## 💡 실전 팁

### 1. 상태 구조 설계
```javascript
// ❌ 나쁜 구조 (평면적)
{
  item1Id: 1,
  item1Name: 'Product 1',
  item2Id: 2,
  item2Name: 'Product 2'
}

// ✅ 좋은 구조 (계층적)
{
  items: [
    { id: 1, name: 'Product 1' },
    { id: 2, name: 'Product 2' }
  ],
  meta: {
    total: 100,
    count: 2
  }
}
```

### 2. 선택적 구독
```javascript
// 특정 필드만 구독
cartStore.subscribe((state) => {
  // count만 변경되었을 때만 헤더 업데이트
  updateCartBadge(state.count);
}, { fields: ['count'] });
```

### 3. 디버깅 도구
```javascript
// Redux DevTools처럼 상태 변경 로깅
class Store extends Observable {
  setState(updates) {
    const prevState = { ...this.state };
    super.setState(updates);
    console.log('State changed:', {
      prev: prevState,
      next: this.state,
      diff: this.getDiff(prevState, this.state)
    });
  }

  getDiff(prev, next) {
    // 변경된 필드만 추출
  }
}
```

---

## 📖 추가 학습 자료

- [React - useState](https://react.dev/reference/react/useState)
- [React - useReducer](https://react.dev/reference/react/useReducer)
- [Redux 공식 문서](https://redux.js.org/)
- [Observer Pattern](https://refactoring.guru/design-patterns/observer)
- [Build Your Own Redux](https://zapier.com/engineering/how-to-build-redux/)

---

## 🚀 다음 단계

상태 관리를 완성했다면, 이제 컴포넌트 시스템을 만들 차례입니다!

다음: **[03-COMPONENT-SYSTEM.md - 컴포넌트 시스템 구현하기](./03-COMPONENT-SYSTEM.md)** →
