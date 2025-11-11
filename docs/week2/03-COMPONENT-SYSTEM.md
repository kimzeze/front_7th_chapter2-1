# 03. 컴포넌트 시스템 구현하기

> **React 개념**: Component, Props, Composition
> **난이도**: ⭐⭐ (보통)
> **예상 시간**: 4-6시간

## 🎯 이번 단계의 목표

React의 컴포넌트 기반 아키텍처를 이해하고, 재사용 가능한 컴포넌트를 만듭니다.

### 구현할 기능
- ✅ Props를 통한 데이터 전달
- ✅ 컴포넌트 합성 (Composition)
- ✅ 조건부 렌더링
- ✅ 리스트 렌더링
- ✅ 이벤트 처리

---

## 📚 배경 지식

### React의 컴포넌트

```jsx
// React 컴포넌트
function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <img src={product.thumbnail} alt={product.title} />
      <h3>{product.title}</h3>
      <p>${product.price}</p>
      <button onClick={() => onAddToCart(product)}>
        장바구니에 추가
      </button>
    </div>
  );
}

// 사용
<ProductCard
  product={product}
  onAddToCart={handleAddToCart}
/>
```

### 우리가 만들 컴포넌트

```javascript
// 우리의 컴포넌트 (함수형)
const ProductCard = ({ product, onAddToCart }) => {
  return `
    <div class="product-card">
      <img src="${product.thumbnail}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p>$${product.price}</p>
      <button onclick="handleAddToCart(${product.id})">
        장바구니에 추가
      </button>
    </div>
  `;
};

// 사용
const html = ProductCard({
  product: product,
  onAddToCart: handleAddToCart
});
```

---

## 🏗️ 구현 단계

### Step 1: 컴포넌트 기본 패턴 (1시간)

**파일 구조**:
```
src/components/
├── common/          # 공통 컴포넌트
│   ├── Button.js
│   ├── Modal.js
│   ├── Loading.js
│   └── Skeleton.js
├── product/         # 상품 관련
│   ├── ProductCard.js
│   ├── ProductList.js
│   ├── ProductFilter.js
│   └── ProductDetail.js
└── cart/            # 장바구니 관련
    ├── CartModal.js
    ├── CartItem.js
    └── CartSummary.js
```

**기본 컴포넌트 패턴**:
```javascript
// src/components/common/Button.js
export const Button = ({
  text,
  onClick,
  variant = 'primary',
  disabled = false
}) => {
  const className = `btn btn-${variant} ${disabled ? 'btn-disabled' : ''}`;

  return `
    <button
      class="${className}"
      onclick="${onClick}"
      ${disabled ? 'disabled' : ''}
    >
      ${text}
    </button>
  `;
};
```

---

### Step 2: Props와 기본값 (1시간)

**Props 검증 및 기본값 처리**:

```javascript
// src/components/product/ProductCard.js
export const ProductCard = (props) => {
  // Props 기본값 설정
  const {
    product = {},
    showAddButton = true,
    onClick = null
  } = props;

  // 필수 Props 검증
  if (!product.id) {
    console.error('ProductCard: product.id is required');
    return '';
  }

  // 조건부 렌더링
  const renderAddButton = () => {
    if (!showAddButton) return '';

    return `
      <button
        class="add-to-cart-btn"
        onclick="handleAddToCart(${product.id})"
      >
        장바구니에 추가
      </button>
    `;
  };

  return `
    <div
      class="product-card"
      data-product-id="${product.id}"
      ${onClick ? `onclick="${onClick}"` : ''}
    >
      <img src="${product.thumbnail}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p class="price">$${product.price}</p>
      ${product.discount ? `
        <span class="discount">-${product.discount}%</span>
      ` : ''}
      ${renderAddButton()}
    </div>
  `;
};
```

---

### Step 3: 컴포넌트 합성 (Composition) (1.5시간)

여러 컴포넌트를 조합하여 복잡한 UI를 만듭니다.

```javascript
// src/components/product/ProductList.js
import { ProductCard } from './ProductCard.js';
import { Loading } from '../common/Loading.js';
import { Skeleton } from '../common/Skeleton.js';

export const ProductList = ({ products, loading, error }) => {
  // 에러 상태
  if (error) {
    return `
      <div class="product-list-error">
        <p>상품을 불러오는데 실패했습니다.</p>
        <button onclick="location.reload()">다시 시도</button>
      </div>
    `;
  }

  // 로딩 상태
  if (loading) {
    return `
      <div class="product-list">
        ${Array(8).fill(0).map(() => Skeleton()).join('')}
      </div>
    `;
  }

  // 빈 상태
  if (!products || products.length === 0) {
    return `
      <div class="product-list-empty">
        <p>상품이 없습니다.</p>
      </div>
    `;
  }

  // 정상 상태
  return `
    <div class="product-list">
      ${products.map(product => ProductCard({ product })).join('')}
    </div>
  `;
};
```

**페이지 레벨 합성**:
```javascript
// src/pages/HomePage.js
import { Header } from '../components/common/Header.js';
import { SearchForm } from '../components/product/SearchForm.js';
import { ProductList } from '../components/product/ProductList.js';
import { Footer } from '../components/common/Footer.js';

export const HomePage = ({ products, loading, filters }) => {
  return `
    <div class="page home-page">
      ${Header({ cartCount: 3 })}
      <main>
        ${SearchForm({ filters })}
        ${ProductList({ products, loading })}
      </main>
      ${Footer()}
    </div>
  `;
};
```

---

### Step 4: 리스트 렌더링 최적화 (1시간)

```javascript
// src/utils/renderList.js
export const renderList = (items, renderItem, options = {}) => {
  const {
    emptyMessage = '항목이 없습니다.',
    keyExtractor = (item) => item.id,
    className = 'list'
  } = options;

  if (!items || items.length === 0) {
    return `<div class="${className}-empty">${emptyMessage}</div>`;
  }

  return `
    <div class="${className}">
      ${items.map((item, index) => {
        const key = keyExtractor(item, index);
        return renderItem(item, index, key);
      }).join('')}
    </div>
  `;
};
```

**사용 예시**:
```javascript
import { renderList } from '../../utils/renderList.js';

export const CartItems = ({ items }) => {
  return renderList(
    items,
    (item) => CartItem({ item }),
    {
      emptyMessage: '장바구니가 비어있습니다.',
      className: 'cart-items'
    }
  );
};
```

---

### Step 5: 이벤트 처리 시스템 (1.5시간)

인라인 핸들러 대신 이벤트 위임을 사용합니다.

**파일 생성**: `src/core/EventBus.js`

```javascript
class EventBus {
  constructor() {
    this.handlers = new Map();
  }

  // 이벤트 핸들러 등록
  on(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType).push(handler);

    // 제거 함수 반환
    return () => this.off(eventType, handler);
  }

  // 이벤트 핸들러 제거
  off(eventType, handler) {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // 이벤트 발생
  emit(eventType, data) {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }
}

export const eventBus = new EventBus();
```

**이벤트 위임 패턴**:
```javascript
// src/main.js
import { eventBus } from './core/EventBus.js';

// 전역 이벤트 리스너 (이벤트 위임)
document.body.addEventListener('click', (e) => {
  const target = e.target;

  // 장바구니 추가 버튼
  if (target.matches('.add-to-cart-btn')) {
    const productCard = target.closest('.product-card');
    const productId = productCard?.dataset.productId;
    if (productId) {
      eventBus.emit('cart:add', { productId });
    }
  }

  // 상품 카드 클릭
  if (target.closest('.product-card')) {
    const card = target.closest('.product-card');
    const productId = card?.dataset.productId;
    if (productId && !target.matches('button')) {
      eventBus.emit('product:click', { productId });
    }
  }

  // 모달 닫기
  if (target.matches('.modal-close') || target.matches('.modal-backdrop')) {
    eventBus.emit('modal:close');
  }
});

// 이벤트 핸들러 등록
eventBus.on('cart:add', ({ productId }) => {
  console.log('Add to cart:', productId);
  // 장바구니에 추가 로직
});

eventBus.on('product:click', ({ productId }) => {
  router.push(`/product/${productId}`);
});
```

---

### Step 6: 컴포넌트 생명주기 (선택) (1시간)

```javascript
// src/core/Component.js
export class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this.element = null;
  }

  // 마운트 전
  beforeMount() {}

  // 마운트 후
  mounted() {}

  // 업데이트 전
  beforeUpdate(newProps) {}

  // 업데이트 후
  updated() {}

  // 언마운트 전
  beforeUnmount() {}

  // 렌더링
  render() {
    return '';
  }

  // DOM에 마운트
  mount(container) {
    this.beforeMount();

    const html = this.render();
    container.innerHTML = html;

    this.element = container.firstElementChild;
    this.mounted();
  }

  // 업데이트
  update(newProps) {
    this.beforeUpdate(newProps);

    this.props = { ...this.props, ...newProps };
    const html = this.render();

    if (this.element) {
      this.element.outerHTML = html;
      this.element = this.element.parentElement.firstElementChild;
    }

    this.updated();
  }

  // 언마운트
  unmount() {
    this.beforeUnmount();

    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}
```

**사용 예시**:
```javascript
// src/components/cart/CartModal.js
import { Component } from '../../core/Component.js';
import { cartStore } from '../../stores/cartStore.js';

export class CartModal extends Component {
  constructor(props) {
    super(props);
    this.unsubscribe = null;
  }

  mounted() {
    // 장바구니 상태 구독
    this.unsubscribe = cartStore.subscribe(() => {
      this.update();
    });

    // ESC 키 이벤트
    this.handleEscape = (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    window.addEventListener('keydown', this.handleEscape);
  }

  beforeUnmount() {
    // 구독 해제
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    // 이벤트 리스너 제거
    window.removeEventListener('keydown', this.handleEscape);
  }

  close() {
    this.unmount();
  }

  render() {
    const state = cartStore.getState();

    return `
      <div class="modal cart-modal">
        <div class="modal-backdrop"></div>
        <div class="modal-content">
          <button class="modal-close">&times;</button>
          <h2>장바구니 (${state.count}개)</h2>
          <!-- 장바구니 내용 -->
        </div>
      </div>
    `;
  }
}
```

---

## ✅ 체크리스트

### 컴포넌트 기본
- [ ] Props 전달 동작
- [ ] 기본값 설정 동작
- [ ] 조건부 렌더링
- [ ] 리스트 렌더링

### 합성
- [ ] 작은 컴포넌트를 조합하여 큰 컴포넌트 생성
- [ ] 페이지 레벨 컴포넌트 구성

### 이벤트 처리
- [ ] 이벤트 위임 동작
- [ ] EventBus를 통한 통신
- [ ] 메모리 누수 방지 (이벤트 리스너 정리)

---

## 🐛 디버깅 팁

### 문제 1: 이벤트 핸들러가 동작하지 않아요
```javascript
// ❌ 잘못된 코드
<button onclick="handleClick()"> <!-- 함수가 전역에 없음 -->

// ✅ 올바른 코드 (전역 함수 등록)
window.handleClick = () => {
  console.log('Clicked!');
};

// 또는 이벤트 위임 사용
document.body.addEventListener('click', (e) => {
  if (e.target.matches('.my-button')) {
    handleClick();
  }
});
```

### 문제 2: HTML이 이스케이프되어 표시돼요
```javascript
// ❌ 잘못된 코드
element.textContent = '<div>Hello</div>'; // 텍스트로 표시됨

// ✅ 올바른 코드
element.innerHTML = '<div>Hello</div>'; // HTML로 파싱됨
```

---

## 🎓 학습 포인트

### React와의 차이점

| React | 우리의 구현 |
|-------|------------|
| JSX | Template Literal |
| onClick={handler} | onclick="handler()" |
| Automatic Re-render | 수동 렌더링 |
| Virtual DOM | Direct DOM 조작 |
| Component Lifecycle | 수동 생명주기 관리 |

---

## 📖 추가 학습 자료

- [React - Components and Props](https://react.dev/learn/passing-props-to-a-component)
- [React - Composition vs Inheritance](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children)
- [Event Delegation](https://javascript.info/event-delegation)

---

다음: **[04-EFFECTS-AND-LIFECYCLE.md - 생명주기와 Effects 구현하기](./04-EFFECTS-AND-LIFECYCLE.md)** →
