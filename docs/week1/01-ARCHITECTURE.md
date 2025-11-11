# 아키텍처 설계 가이드

> **원칙**: 과도한 추상화보다 명확한 구조. 테스트 통과가 최우선.

## 🎯 설계 철학

### YAGNI (You Aren't Gonna Need It)
지금 당장 필요하지 않은 기능은 만들지 않습니다.

```javascript
// ❌ Bad - 지금 필요 없는 복잡한 시스템
class RouterSystem {
  #routes = new Map();
  #middleware = [];
  #guards = [];
  #errorHandlers = [];
  // ... 100줄
}

// ✅ Good - 지금 필요한 것만
const routes = {
  '/': renderHome,
  '/product/:id': renderDetail
};

const navigate = (path) => {
  history.pushState(null, '', path);
  render();
};
```

### 책임 분리
각 파일/함수는 하나의 명확한 역할만 합니다.

---

## 📁 폴더 구조 상세

### `/core` - 핵심 유틸리티

**역할**: 앱의 기반이 되는 작은 유틸리티 함수들

```javascript
// core/router.js - 라우팅 관련 함수만
export const navigate = (path) => { ... };
export const getParams = () => { ... };
export const getQuery = () => { ... };
export const updateQuery = (updates) => { ... };

// core/storage.js - localStorage 래퍼만
export const save = (key, value) => { ... };
export const load = (key) => { ... };
export const remove = (key) => { ... };

// core/eventBus.js - 이벤트 시스템만
export const emit = (event, data) => { ... };
export const on = (event, handler) => { ... };
export const off = (event, handler) => { ... };
```

**규칙**:
- ✅ 순수 함수만 (side effect 최소화)
- ✅ export된 함수는 JSDoc 필수
- ✅ 파일당 50줄 이내

---

### `/utils` - 헬퍼 함수

**역할**: 재사용 가능한 유틸리티

```javascript
// utils/dom.js
export const createElement = (tag, attrs = {}, children = []) => { ... };
export const addClass = (el, className) => { ... };
export const removeClass = (el, className) => { ... };

// utils/debounce.js
export const debounce = (fn, delay) => { ... };
export const throttle = (fn, delay) => { ... };

// utils/formatters.js
export const formatPrice = (price) => { ... };
export const formatDate = (date) => { ... };
```

**규칙**:
- ✅ 순수 함수 (입력 → 출력)
- ✅ 함수명은 동사 시작
- ✅ 한 파일에 관련된 함수만

---

### `/components` - UI 컴포넌트

**역할**: 재사용 가능한 UI 조각. 템플릿 문자열 반환.

```javascript
// components/common/Toast.js
/**
 * 토스트 메시지 UI를 생성합니다
 * @param {Object} options
 * @param {string} options.message - 표시할 메시지
 * @param {'success'|'error'|'info'} options.type - 토스트 타입
 * @returns {string} HTML 문자열
 */
export const Toast = ({ message, type = 'info' }) => {
  return `
    <div class="toast toast--${type}">
      <p>${message}</p>
      <button class="toast__close" data-action="close-toast">×</button>
    </div>
  `;
};

// components/product/ProductCard.js
export const ProductCard = ({ product }) => {
  return `
    <div class="product-card" data-product-id="${product.id}">
      <img src="${product.thumbnail}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p class="price">$${formatPrice(product.price)}</p>
      <button data-action="add-to-cart">장바구니 담기</button>
    </div>
  `;
};
```

**규칙**:
- ✅ 함수명은 PascalCase (React 컴포넌트처럼)
- ✅ props 객체로 데이터 받기
- ✅ HTML 문자열 반환
- ✅ data-* 속성으로 이벤트 핸들링
- ✅ 파일당 1개 컴포넌트

---

### `/pages` - 페이지 컴포넌트

**역할**: 전체 페이지 레이아웃

```javascript
// pages/HomePage.js
import { ProductGrid } from '../components/product/ProductGrid.js';
import { SearchForm } from '../components/SearchForm.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';

export const HomePage = ({ products = [], loading = false, search = '' }) => {
  if (loading) {
    return LoadingSpinner();
  }

  return `
    <div class="home-page">
      <header>
        ${SearchForm({ value: search })}
      </header>
      <main>
        ${ProductGrid({ products })}
      </main>
    </div>
  `;
};

// pages/DetailPage.js
export const DetailPage = ({ product, relatedProducts = [] }) => {
  return `
    <div class="detail-page">
      <article class="product-detail">
        <img src="${product.images[0]}" alt="${product.title}">
        <div class="product-info">
          <h1>${product.title}</h1>
          <p class="price">$${product.price}</p>
          <button data-action="add-to-cart" data-product-id="${product.id}">
            장바구니 담기
          </button>
        </div>
      </article>

      <section class="related-products">
        <h2>관련 상품</h2>
        ${relatedProducts.map(p => ProductCard({ product: p })).join('')}
      </section>
    </div>
  `;
};
```

**규칙**:
- ✅ 페이지 단위 컴포넌트
- ✅ 여러 컴포넌트 조합
- ✅ 로딩/에러 상태 처리

---

### `/state` - 상태 관리

**역할**: 앱의 상태를 관리하는 간단한 시스템

```javascript
// state/cartState.js
import { save, load } from '../core/storage.js';
import { emit } from '../core/eventBus.js';

const CART_KEY = 'shopping-cart';

// 상태 (private)
let cart = load(CART_KEY) || [];

// Getter (public)
export const getCart = () => [...cart];

// Actions (public)
export const addToCart = (product) => {
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  save(CART_KEY, cart);
  emit('cart:updated', getCart());
};

export const removeFromCart = (productId) => {
  cart = cart.filter(item => item.id !== productId);
  save(CART_KEY, cart);
  emit('cart:updated', getCart());
};

export const updateQuantity = (productId, quantity) => {
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity = quantity;
    save(CART_KEY, cart);
    emit('cart:updated', getCart());
  }
};

export const clearCart = () => {
  cart = [];
  save(CART_KEY, cart);
  emit('cart:updated', getCart());
};
```

**규칙**:
- ✅ 상태는 파일 내부에서만 수정
- ✅ Getter로 읽기만 허용
- ✅ Actions로 상태 변경
- ✅ 상태 변경 시 이벤트 발생

---

## 🔄 데이터 흐름

### 1. 단방향 데이터 플로우

```
User Action → Event Handler → State Update → Re-render
```

**예시: 장바구니에 상품 추가**

```javascript
// 1. User Action (클릭)
document.body.addEventListener('click', (e) => {
  const button = e.target.closest('[data-action="add-to-cart"]');
  if (!button) return;

  // 2. Event Handler
  const productId = button.dataset.productId;
  handleAddToCart(productId);
});

// 3. State Update
const handleAddToCart = async (productId) => {
  const product = await getProduct(productId);
  addToCart(product);  // state 업데이트
};

// 4. Re-render (이벤트 구독)
on('cart:updated', (cart) => {
  updateCartBadge(cart.length);
  showToast({ message: '장바구니에 추가되었습니다', type: 'success' });
});
```

---

### 2. 이벤트 기반 아키텍처

**이벤트 종류**:
```javascript
// core/events.js - 이벤트 타입 정의
export const EVENTS = {
  CART_UPDATED: 'cart:updated',
  ROUTE_CHANGED: 'route:changed',
  TOAST_SHOW: 'toast:show',
  LOADING_START: 'loading:start',
  LOADING_END: 'loading:end',
};
```

**발행 (Publisher)**:
```javascript
// state/cartState.js
export const addToCart = (product) => {
  cart.push(product);
  emit(EVENTS.CART_UPDATED, getCart());
};
```

**구독 (Subscriber)**:
```javascript
// main.js
import { on } from './core/eventBus.js';
import { EVENTS } from './core/events.js';

on(EVENTS.CART_UPDATED, (cart) => {
  // 장바구니 뱃지 업데이트
  const badge = document.querySelector('.cart-badge');
  badge.textContent = cart.length;
});

on(EVENTS.TOAST_SHOW, ({ message, type }) => {
  showToast(message, type);
});
```

---

## 🎨 렌더링 전략

### 1. 전체 렌더링 (페이지 전환)

```javascript
// main.js
const render = async () => {
  const $root = document.querySelector('#root');
  const path = location.pathname;
  const query = getQuery();

  // 페이지별 렌더링
  if (path === '/') {
    $root.innerHTML = HomePage({ loading: true });

    const products = await getProducts(query);

    $root.innerHTML = HomePage({
      products,
      loading: false,
      search: query.search
    });
  }
  else if (path.startsWith('/product/')) {
    const { id } = getParams();
    $root.innerHTML = DetailPage({ loading: true });

    const product = await getProduct(id);

    $root.innerHTML = DetailPage({ product });
  }
};

// 라우팅 이벤트 시 재렌더링
window.addEventListener('popstate', render);
on(EVENTS.ROUTE_CHANGED, render);
```

### 2. 부분 렌더링 (상태 변경)

```javascript
// 장바구니만 업데이트
on(EVENTS.CART_UPDATED, (cart) => {
  const $cartModal = document.querySelector('#cart-modal');
  if ($cartModal) {
    const $cartItems = $cartModal.querySelector('.cart-items');
    $cartItems.innerHTML = cart.map(item => CartItem({ item })).join('');
  }
});

// 토스트만 추가
on(EVENTS.TOAST_SHOW, ({ message, type }) => {
  const $toastContainer = document.querySelector('#toast-container');
  const toastEl = createElement('div', { class: 'toast' });
  toastEl.innerHTML = Toast({ message, type });
  $toastContainer.appendChild(toastEl);

  setTimeout(() => toastEl.remove(), 3000);
});
```

---

## 🚦 라우팅 패턴

### URL 구조
```
/                          → 홈 (상품 목록)
/?search=laptop            → 검색 결과
/?category=electronics     → 카테고리 필터
/?sort=price-asc           → 정렬
/product/123               → 상품 상세
/notfound                  → 404
```

### 라우팅 구현

```javascript
// core/router.js
const routes = {
  '/': 'home',
  '/product/:id': 'detail',
  '*': 'notfound'
};

export const matchRoute = (path) => {
  for (const [pattern, name] of Object.entries(routes)) {
    if (pattern === '*') continue;

    const regex = new RegExp('^' + pattern.replace(/:(\w+)/g, '([^/]+)') + '$');
    const match = path.match(regex);

    if (match) {
      const paramNames = [...pattern.matchAll(/:(\w+)/g)].map(m => m[1]);
      const params = {};

      paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });

      return { name, params };
    }
  }

  return { name: 'notfound', params: {} };
};
```

---

## 📊 성능 최적화 전략

### 1. DocumentFragment 사용

```javascript
// ❌ Bad - 매번 reflow 발생
products.forEach(product => {
  container.innerHTML += ProductCard({ product });
});

// ✅ Good - 한 번에 추가
const fragment = document.createDocumentFragment();
products.forEach(product => {
  const div = document.createElement('div');
  div.innerHTML = ProductCard({ product });
  fragment.appendChild(div.firstElementChild);
});
container.appendChild(fragment);
```

### 2. 이벤트 위임

```javascript
// ❌ Bad - 각 버튼마다 리스너
buttons.forEach(btn => {
  btn.addEventListener('click', handleClick);
});

// ✅ Good - 하나의 리스너로 처리
document.body.addEventListener('click', (e) => {
  const action = e.target.dataset.action;

  if (action === 'add-to-cart') {
    handleAddToCart(e);
  } else if (action === 'remove-from-cart') {
    handleRemoveFromCart(e);
  }
});
```

### 3. Debounce/Throttle

```javascript
// 검색 입력 - debounce
searchInput.addEventListener('input', debounce((e) => {
  updateQuery({ search: e.target.value });
  render();
}, 300));

// 스크롤 - throttle
window.addEventListener('scroll', throttle(() => {
  checkInfiniteScroll();
}, 200));
```

---

## 🎯 핵심 원칙 요약

1. **단순함 우선** - 복잡한 추상화 지양
2. **명확한 책임 분리** - 한 파일/함수는 하나의 역할
3. **이벤트 기반** - 느슨한 결합
4. **불변성** - 상태는 직접 수정 금지
5. **테스트 우선** - 동작하는 코드가 최우선

---

**다음**: [02-CODING-STYLE.md - 코딩 스타일 가이드](./02-CODING-STYLE.md) →
