# 빠른 참조 가이드

> **개발하면서 빠르게 확인할 수 있는 체크리스트**

## 🎨 네이밍 치트시트

```javascript
// 변수 - camelCase, 명사
const productList = [];
const isLoading = false;
const userCount = 0;

// 함수 - camelCase, 동사
const fetchProducts = () => {};
const handleClick = () => {};
const formatPrice = () => {};

// 컴포넌트 - PascalCase
const ProductCard = () => {};
const HomePage = () => {};

// 상수 - UPPER_SNAKE_CASE
const API_URL = 'https://api.example.com';
const MAX_COUNT = 100;

// 파일명
ProductCard.js      // 컴포넌트
router.js           // 유틸
cartState.js        // 상태
```

---

## 📁 파일 구조 참조

```
src/
├── core/              # 핵심 유틸 (router, storage, eventBus)
├── utils/             # 헬퍼 함수 (debounce, formatters, dom)
├── components/        # UI 컴포넌트
│   ├── common/       # 공통 (Toast, Modal, Loading)
│   ├── product/      # 상품 (Card, Grid, Filter)
│   └── cart/         # 장바구니 (Modal, Item)
├── pages/            # 페이지 (HomePage, DetailPage, NotFoundPage)
├── state/            # 상태 관리 (cartState)
├── api/              # API (productApi)
└── main.js           # 진입점
```

---

## 🔧 자주 쓰는 코드 스니펫

### 라우팅

```javascript
// 페이지 이동
navigate('/product/123');

// 파라미터 가져오기
const { id } = getParams();  // /product/:id

// 쿼리 가져오기
const { search, sort } = getQuery();  // ?search=laptop&sort=price

// 쿼리 업데이트
updateQuery({ search: 'laptop' });
```

### 상태 관리

```javascript
// 장바구니 조회
const cart = getCart();

// 추가
addToCart(product);

// 제거
removeFromCart(productId);

// 수량 변경
updateQuantity(productId, 3);

// 전체 삭제
clearCart();
```

### 이벤트

```javascript
// 발행
emit('cart:updated', cart);

// 구독
on('cart:updated', (cart) => {
  console.log('장바구니 업데이트:', cart);
});

// 해제
off('cart:updated', handler);
```

### DOM 조작

```javascript
// 선택
const $el = document.querySelector('#id');
const $list = document.querySelectorAll('.item');

// 클래스
$el.classList.add('active');
$el.classList.remove('hidden');
$el.classList.toggle('selected');

// 속성
const id = $el.dataset.productId;
$el.dataset.quantity = '5';

// 대량 추가 (Fragment)
const fragment = document.createDocumentFragment();
items.forEach(item => {
  const div = document.createElement('div');
  div.innerHTML = ItemComponent({ item });
  fragment.appendChild(div.firstElementChild);
});
$container.appendChild(fragment);
```

### 이벤트 위임

```javascript
document.body.addEventListener('click', (e) => {
  // data-action 기반
  const action = e.target.dataset.action;
  if (action === 'add-to-cart') {
    handleAddToCart(e);
  }

  // closest로 부모 찾기
  const $card = e.target.closest('.product-card');
  if ($card) {
    const id = $card.dataset.productId;
    navigate(`/product/${id}`);
  }
});
```

---

## ✅ 코드 리뷰 체크리스트

### 함수 작성

```javascript
// ✅ 30줄 이내
// ✅ 하나의 책임
// ✅ Early return
// ✅ JSDoc (export된 함수)
// ✅ 불변성 유지

/**
 * 상품 목록 조회
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export const fetchProducts = async ({ search = '', limit = 20 } = {}) => {
  if (!search) return { products: [], total: 0 };

  const response = await fetch(`/api/products?search=${search}&limit=${limit}`);
  return response.json();
};
```

### 컴포넌트 작성

```javascript
// ✅ PascalCase
// ✅ Props 구조 분해
// ✅ Early return
// ✅ data-* 속성

export function ProductCard({ product }) {
  if (!product) {
    return '<div class="empty">상품 정보 없음</div>';
  }

  return `
    <div class="product-card" data-product-id="${product.id}">
      <h3>${product.title}</h3>
      <button data-action="add-to-cart">담기</button>
    </div>
  `;
}
```

### 파일 구조

```javascript
// ✅ 100줄 이내
// ✅ 1 파일 1 책임
// ✅ Import 순서 정확
// ✅ Named export

// Import 순서
import { debounce } from './utils/debounce.js';        // utils
import { getCart } from './state/cartState.js';        // state
import { ProductCard } from './components/ProductCard.js';  // components
import { getProducts } from './api/productApi.js';     // api
```

---

## 🎯 자주 하는 실수

### ❌ Bad

```javascript
// 원본 수정
items.push(newItem);

// any 타입
const data: any = response.data;

// 매직 넘버
if (count > 20) { ... }

// 모호한 이름
const data = [];
const temp = 0;

// 각 요소에 리스너
buttons.forEach(btn => {
  btn.addEventListener('click', handleClick);
});

// className 직접 수정
element.className = 'active selected';

// 중첩 조건문
if (a) {
  if (b) {
    if (c) {
      // ...
    }
  }
}
```

### ✅ Good

```javascript
// 불변성
const newItems = [...items, newItem];

// 명확한 타입
const products: Product[] = response.data;

// 상수 사용
const MAX_ITEMS = 20;
if (count > MAX_ITEMS) { ... }

// 명확한 이름
const productList = [];
const selectedIndex = 0;

// 이벤트 위임
document.body.addEventListener('click', (e) => {
  if (e.target.matches('button')) {
    handleClick(e);
  }
});

// classList
element.classList.add('active', 'selected');

// Early return
if (!a) return;
if (!b) return;
if (!c) return;
// ...
```

---

## 🚀 성능 최적화 팁

```javascript
// DocumentFragment (대량 DOM 추가)
const fragment = document.createDocumentFragment();
items.forEach(item => fragment.appendChild(createItem(item)));
container.appendChild(fragment);

// Debounce (검색 입력)
searchInput.addEventListener('input', debounce((e) => {
  search(e.target.value);
}, 300));

// 이벤트 위임 (메모리 절약)
container.addEventListener('click', handleClick);

// 조건부 렌더링 (불필요한 HTML 생성 방지)
${items.length > 0 ? renderItems(items) : ''}

// 캐싱
let cachedProducts = null;
const getProducts = async () => {
  if (cachedProducts) return cachedProducts;
  cachedProducts = await fetchProducts();
  return cachedProducts;
};
```

---

## 📦 자주 쓰는 유틸 함수

### Debounce

```javascript
export const debounce = (fn, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};
```

### Throttle

```javascript
export const throttle = (fn, delay = 300) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall < delay) return;
    lastCall = now;
    fn(...args);
  };
};
```

### formatPrice

```javascript
export const formatPrice = (price) => {
  return new Intl.NumberFormat('ko-KR').format(price);
};
```

### formatDate

```javascript
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ko-KR');
};
```

---

## 🎨 HTML 템플릿 패턴

### 조건부 렌더링

```javascript
// 삼항 연산자
${isLoading ? '<div>로딩 중...</div>' : ''}

// 논리 연산자
${error && `<div class="error">${error.message}</div>`}

// 복잡한 조건은 함수로
const renderStatus = (status) => {
  if (status === 'loading') return '<div>로딩 중</div>';
  if (status === 'error') return '<div>에러</div>';
  return '<div>완료</div>';
};

${renderStatus(status)}
```

### 리스트 렌더링

```javascript
// map + join
${products.map(p => ProductCard({ product: p })).join('')}

// filter + map
${products
  .filter(p => p.stock > 0)
  .map(p => ProductCard({ product: p }))
  .join('')
}

// 빈 배열 처리
${products.length > 0
  ? products.map(p => ProductCard({ product: p })).join('')
  : '<div class="empty">상품이 없습니다</div>'
}
```

---

## 🔍 디버깅 팁

```javascript
// 이벤트 확인
document.body.addEventListener('click', (e) => {
  console.log('클릭된 요소:', e.target);
  console.log('data-action:', e.target.dataset.action);
});

// 상태 확인
on('cart:updated', (cart) => {
  console.log('장바구니 업데이트:', cart);
});

// 렌더링 확인
const render = () => {
  console.log('현재 경로:', location.pathname);
  console.log('쿼리:', getQuery());
  // ...
};

// localStorage 확인
console.log('저장된 장바구니:', localStorage.getItem('shopping-cart'));
```

---

**이 문서를 북마크하고 개발하면서 자주 참고하세요!** 📌
