# 바닐라 JS 코딩 스타일 가이드

> **목표**: 깔끔하고 유지보수 가능한 바닐라 JavaScript 코드 작성

## 📋 목차

1. [네이밍 규칙](#1-네이밍-규칙)
2. [함수 작성 규칙](#2-함수-작성-규칙)
3. [컴포넌트 패턴](#3-컴포넌트-패턴)
4. [DOM 조작](#4-dom-조작)
5. [이벤트 처리](#5-이벤트-처리)
6. [상태 관리](#6-상태-관리)
7. [모듈 시스템](#7-모듈-시스템)
8. [파일 구조](#8-파일-구조)

---

## 1. 네이밍 규칙

### 변수명

```javascript
// ✅ Good - camelCase, 명사형
const productList = [];
const isLoading = false;
const hasError = false;
const userCount = 0;

// ✅ Boolean은 is/has/should/can 접두사
const isVisible = true;
const hasPermission = false;
const shouldUpdate = true;
const canEdit = false;

// ❌ Bad - 모호한 이름
const data = [];
const flag = false;
const temp = 0;
```

### 함수명

```javascript
// ✅ Good - camelCase, 동사 시작
const fetchProducts = async () => { ... };
const renderProductList = (products) => { ... };
const handleClick = (e) => { ... };
const validateEmail = (email) => { ... };
const formatPrice = (price) => { ... };

// ✅ 컴포넌트는 PascalCase (React 컨벤션 차용)
const ProductCard = ({ product }) => { ... };
const HomePage = ({ products }) => { ... };
const Toast = ({ message, type }) => { ... };

// ❌ Bad - 동사 없음
const products = () => { ... };
const click = (e) => { ... };
```

### 상수명

```javascript
// ✅ Good - UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;
const DEFAULT_PAGE_SIZE = 20;

// ✅ Good - 이벤트 타입
const EVENTS = Object.freeze({
  CART_UPDATED: 'cart:updated',
  ROUTE_CHANGED: 'route:changed',
  TOAST_SHOW: 'toast:show',
});

// ❌ Bad - 일반 변수처럼 작성
const apiUrl = 'https://api.example.com';
```

### 파일명

```javascript
// ✅ Good - 컴포넌트는 PascalCase
ProductCard.js
HomePage.js
CartModal.js

// ✅ Good - 유틸/함수는 camelCase
router.js
storage.js
formatters.js
debounce.js

// ✅ Good - 상태 관리는 ~State.js
cartState.js
userState.js
```

---

## 2. 함수 작성 규칙

### 함수 선언 방식

```javascript
// ✅ Good - 컴포넌트는 function 키워드 (hoisting 활용)
export function ProductCard({ product }) {
  return `
    <div class="product-card">
      <h3>${product.title}</h3>
    </div>
  `;
}

// ✅ Good - 일반 함수는 화살표 함수
export const formatPrice = (price) => {
  return new Intl.NumberFormat('ko-KR').format(price);
};

// ✅ Good - 이벤트 핸들러도 화살표 함수
const handleSubmit = (e) => {
  e.preventDefault();
  // ...
};
```

### 함수 길이: 30줄 이내

```javascript
// ✅ Good - 작고 명확한 함수
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8;
};

const validateForm = ({ email, password }) => {
  if (!validateEmail(email)) return { valid: false, error: '이메일 형식이 올바르지 않습니다' };
  if (!validatePassword(password)) return { valid: false, error: '비밀번호는 8자 이상이어야 합니다' };
  return { valid: true };
};

// ❌ Bad - 100줄짜리 거대 함수
const validateForm = (data) => {
  // ... 모든 검증 로직이 한 함수에
};
```

### Early Return 패턴

```javascript
// ✅ Good - Early return으로 depth 줄이기
const processUser = (user) => {
  if (!user) return null;
  if (!user.email) return null;
  if (!user.isActive) return null;

  // 실제 로직 (depth 1)
  return formatUser(user);
};

// ❌ Bad - 중첩된 조건문
const processUser = (user) => {
  if (user) {
    if (user.email) {
      if (user.isActive) {
        return formatUser(user);
      }
    }
  }
  return null;
};
```

### JSDoc 주석

```javascript
/**
 * 상품 목록을 가져옵니다
 * @param {Object} options - 검색 옵션
 * @param {string} [options.search] - 검색어
 * @param {number} [options.limit=20] - 페이지당 개수
 * @param {number} [options.skip=0] - 건너뛸 개수
 * @returns {Promise<{products: Product[], total: number}>}
 * @example
 * const { products, total } = await getProducts({ search: 'laptop', limit: 10 });
 */
export const getProducts = async ({ search = '', limit = 20, skip = 0 } = {}) => {
  // ...
};
```

---

## 3. 컴포넌트 패턴

### 기본 구조

```javascript
/**
 * 상품 카드 컴포넌트
 * @param {Object} props
 * @param {Product} props.product - 상품 객체
 * @returns {string} HTML 문자열
 */
export function ProductCard({ product }) {
  // 1. 데이터 가공 (있다면)
  const price = formatPrice(product.price);
  const discount = calculateDiscount(product);

  // 2. 조건부 렌더링
  if (!product) {
    return '<div class="product-card--empty">상품 정보가 없습니다</div>';
  }

  // 3. 템플릿 반환
  return `
    <div class="product-card" data-product-id="${product.id}">
      <img src="${product.thumbnail}" alt="${product.title}">
      <h3 class="product-card__title">${product.title}</h3>
      <p class="product-card__price">${price}</p>
      ${discount > 0 ? `<span class="badge">-${discount}%</span>` : ''}
      <button
        class="btn btn--primary"
        data-action="add-to-cart"
        data-product-id="${product.id}"
      >
        장바구니 담기
      </button>
    </div>
  `;
}
```

### Props 구조 분해

```javascript
// ✅ Good - 명확한 구조 분해
export function UserProfile({ name, email, avatar, isOnline = false }) {
  return `
    <div class="user-profile">
      <img src="${avatar}" alt="${name}">
      <h3>${name}</h3>
      <p>${email}</p>
      ${isOnline ? '<span class="badge--online">Online</span>' : ''}
    </div>
  `;
}

// ❌ Bad - props 객체 그대로 사용
export function UserProfile(props) {
  return `
    <div class="user-profile">
      <h3>${props.name}</h3>
    </div>
  `;
}
```

### 조건부 렌더링

```javascript
// ✅ Good - Early return
export function ProductList({ products, loading, error }) {
  if (loading) {
    return '<div class="loading">로딩 중...</div>';
  }

  if (error) {
    return `<div class="error">${error.message}</div>`;
  }

  if (products.length === 0) {
    return '<div class="empty">상품이 없습니다</div>';
  }

  return `
    <div class="product-list">
      ${products.map(product => ProductCard({ product })).join('')}
    </div>
  `;
}

// ✅ Good - 간단한 조건은 삼항 연산자
const badgeHTML = discount > 0
  ? `<span class="badge">-${discount}%</span>`
  : '';

// ❌ Bad - 중첩된 삼항 연산자
const statusHTML = isLoading
  ? '<span>로딩 중</span>'
  : hasError
    ? '<span>에러</span>'
    : products.length === 0
      ? '<span>비어있음</span>'
      : '<span>완료</span>';
```

### 리스트 렌더링

```javascript
// ✅ Good - map + join
export function ProductGrid({ products }) {
  return `
    <div class="product-grid">
      ${products
        .map(product => ProductCard({ product }))
        .join('')
      }
    </div>
  `;
}

// ✅ Good - 복잡한 경우 함수 분리
const renderProduct = (product) => {
  const price = formatPrice(product.price);
  const isNew = isNewProduct(product);

  return `
    <div class="product-card">
      ${isNew ? '<span class="badge--new">NEW</span>' : ''}
      <h3>${product.title}</h3>
      <p>${price}</p>
    </div>
  `;
};

export function ProductGrid({ products }) {
  return `
    <div class="product-grid">
      ${products.map(renderProduct).join('')}
    </div>
  `;
}
```

---

## 4. DOM 조작

### querySelector 사용

```javascript
// ✅ Good - 명확한 선택자
const $root = document.querySelector('#root');
const $modal = document.querySelector('[data-modal="cart"]');
const $buttons = document.querySelectorAll('[data-action="add-to-cart"]');

// ✅ Good - $ 접두사로 DOM 요소 표시
const $form = document.querySelector('#login-form');
const $input = $form.querySelector('input[name="email"]');

// ❌ Bad - ID 선택자 남용
const root = document.getElementById('root');
const modal = document.getElementById('modal');
```

### DocumentFragment 사용

```javascript
// ✅ Good - 대량 DOM 추가는 Fragment 사용
const renderProducts = (products) => {
  const fragment = document.createDocumentFragment();

  products.forEach(product => {
    const div = document.createElement('div');
    div.innerHTML = ProductCard({ product });
    fragment.appendChild(div.firstElementChild);
  });

  $container.appendChild(fragment);
};

// ❌ Bad - 매번 appendChild (성능 저하)
const renderProducts = (products) => {
  products.forEach(product => {
    const div = document.createElement('div');
    div.innerHTML = ProductCard({ product });
    $container.appendChild(div.firstElementChild);
  });
};
```

### 클래스 조작

```javascript
// ✅ Good - classList 사용
$element.classList.add('active');
$element.classList.remove('hidden');
$element.classList.toggle('selected');
$element.classList.contains('visible');

// ❌ Bad - className 직접 수정
$element.className = 'active';
$element.className += ' selected';
```

### data 속성 사용

```javascript
// ✅ Good - data-* 속성으로 정보 저장
const html = `
  <button
    data-action="add-to-cart"
    data-product-id="${product.id}"
    data-quantity="1"
  >
    장바구니 담기
  </button>
`;

// 읽기
const action = button.dataset.action;  // 'add-to-cart'
const productId = button.dataset.productId;  // kebab-case → camelCase

// ❌ Bad - id나 class에 데이터 저장
<button id="add-to-cart-123" class="quantity-1">
```

---

## 5. 이벤트 처리

### 이벤트 위임

```javascript
// ✅ Good - document.body에 하나의 리스너
document.body.addEventListener('click', (e) => {
  const action = e.target.dataset.action;

  if (action === 'add-to-cart') {
    handleAddToCart(e);
  } else if (action === 'remove-from-cart') {
    handleRemoveFromCart(e);
  } else if (action === 'close-modal') {
    handleCloseModal(e);
  }
});

// ✅ Good - closest로 부모 요소 찾기
document.body.addEventListener('click', (e) => {
  const $productCard = e.target.closest('.product-card');

  if ($productCard) {
    const productId = $productCard.dataset.productId;
    navigate(`/product/${productId}`);
  }
});

// ❌ Bad - 각 요소에 개별 리스너
$buttons.forEach($btn => {
  $btn.addEventListener('click', handleClick);
});
```

### 이벤트 핸들러 네이밍

```javascript
// ✅ Good - handle + 동사 + 명사
const handleSubmit = (e) => { ... };
const handleInputChange = (e) => { ... };
const handleAddToCart = (e) => { ... };
const handleDeleteItem = (e) => { ... };

// ✅ Good - on + 명사 (커스텀 이벤트)
const onCartUpdated = (cart) => { ... };
const onRouteChanged = (route) => { ... };
```

### 커스텀 이벤트

```javascript
// ✅ Good - CustomEvent 활용
const emit = (eventName, detail = {}) => {
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
};

const on = (eventName, handler) => {
  window.addEventListener(eventName, (e) => handler(e.detail));
};

// 사용
emit('cart:updated', { items: cart, total: 100 });

on('cart:updated', ({ items, total }) => {
  console.log('장바구니 업데이트:', items, total);
});
```

---

## 6. 상태 관리

### 캡슐화 패턴

```javascript
// ✅ Good - 상태는 private, getter/action만 export
// state/cartState.js

// Private 상태
let cart = [];

// Public Getter (읽기 전용)
export const getCart = () => [...cart];

// Public Actions
export const addToCart = (product) => {
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveToLocalStorage('cart', cart);
  emit('cart:updated', getCart());
};

export const removeFromCart = (productId) => {
  cart = cart.filter(item => item.id !== productId);
  saveToLocalStorage('cart', cart);
  emit('cart:updated', getCart());
};

// ❌ Bad - 상태를 직접 export
export let cart = [];  // 외부에서 직접 수정 가능!
```

### 불변성 유지

```javascript
// ✅ Good - 새 배열/객체 반환
const addItem = (items, newItem) => {
  return [...items, newItem];
};

const updateItem = (items, id, updates) => {
  return items.map(item =>
    item.id === id ? { ...item, ...updates } : item
  );
};

const removeItem = (items, id) => {
  return items.filter(item => item.id !== id);
};

// ❌ Bad - 원본 수정
const addItem = (items, newItem) => {
  items.push(newItem);  // 원본 변경!
  return items;
};
```

---

## 7. 모듈 시스템

### Export 규칙

```javascript
// ✅ Good - Named export (권장)
export const fetchProducts = () => { ... };
export const getProduct = (id) => { ... };

// ✅ Good - 컴포넌트는 default export도 허용
export default function ProductCard({ product }) { ... }

// ❌ Bad - export default를 남용
export default { fetchProducts, getProduct };
```

### Import 순서

```javascript
// 1. 외부 라이브러리 (있다면)
import dayjs from 'dayjs';

// 2. Core 모듈
import { navigate, getQuery } from './core/router.js';
import { save, load } from './core/storage.js';
import { emit, on } from './core/eventBus.js';

// 3. Utils
import { debounce } from './utils/debounce.js';
import { formatPrice } from './utils/formatters.js';

// 4. State
import { getCart, addToCart } from './state/cartState.js';

// 5. Components
import { ProductCard } from './components/product/ProductCard.js';
import { Toast } from './components/common/Toast.js';

// 6. Pages
import { HomePage } from './pages/HomePage.js';

// 7. API
import { getProducts } from './api/productApi.js';

// 8. 상수
import { EVENTS } from './core/events.js';
```

---

## 8. 파일 구조

### 파일 길이 제한

```javascript
// 목표: 100줄 이내
// 함수: 30줄 이내

// ✅ 초과 시 상단에 주석
/**
 * 이 파일은 복잡한 인피니트 스크롤 로직으로 120줄입니다.
 * 추후 다음과 같이 분리 예정:
 * - useInfiniteScroll.js (스크롤 감지)
 * - loadMoreProducts.js (데이터 로드)
 */
```

### 1 파일 1 책임

```javascript
// ✅ Good
// components/product/ProductCard.js - 카드만
// components/product/ProductGrid.js - 그리드만
// components/product/ProductFilter.js - 필터만

// ❌ Bad
// components/product/index.js - 모든 것
```

---

## 🎯 체크리스트

코드 작성 후 확인:

### 네이밍
- [ ] 변수명이 명확한가?
- [ ] 함수명이 동사로 시작하는가?
- [ ] Boolean은 is/has 접두사가 있는가?
- [ ] 상수는 UPPER_SNAKE_CASE인가?

### 함수
- [ ] 함수가 30줄 이내인가?
- [ ] 하나의 책임만 있는가?
- [ ] Early return을 사용했는가?
- [ ] JSDoc이 작성되었는가? (export된 함수)

### DOM
- [ ] DocumentFragment를 사용했는가? (대량 추가)
- [ ] classList를 사용했는가?
- [ ] data-* 속성을 활용했는가?

### 이벤트
- [ ] 이벤트 위임을 사용했는가?
- [ ] 불필요한 리스너가 없는가?

### 상태
- [ ] 불변성을 유지하는가?
- [ ] 상태가 캡슐화되어 있는가?

### 파일
- [ ] 파일이 100줄 이내인가?
- [ ] Import 순서가 올바른가?
- [ ] 1 파일 1 책임인가?

---

**다음**: [03-IMPLEMENTATION-GUIDE.md - 구체적인 구현 방법](./03-IMPLEMENTATION-GUIDE.md) →
