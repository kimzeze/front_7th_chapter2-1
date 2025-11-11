# 구현 가이드

> **단계별로 차근차근 구현하기**

## 🎯 구현 순서

```
1. 라우팅 (4h) → 2. 상태 관리 (2h) → 3. 이벤트 시스템 (2h)
→ 4. 무한 스크롤 (3h) → 5. 최적화 (2h)
```

---

## Step 1: 라우팅 시스템 (4시간)

### 1-1. 기본 유틸 함수 만들기 (1시간)

**파일**: `src/core/router.js`

```javascript
/**
 * 페이지 이동 (새로고침 없음)
 * @param {string} path - 이동할 경로
 */
export const navigate = (path) => {
  history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

/**
 * URL 파라미터 추출 (/product/:id)
 * @returns {Object} 파라미터 객체
 */
export const getParams = () => {
  const path = location.pathname;

  // /product/123 → { id: '123' }
  const match = path.match(/\/product\/(\d+)/);
  if (match) {
    return { id: match[1] };
  }

  return {};
};

/**
 * 쿼리 파라미터 가져오기
 * @returns {Object} 쿼리 객체
 */
export const getQuery = () => {
  const params = new URLSearchParams(location.search);
  return Object.fromEntries(params);
};

/**
 * 쿼리 파라미터 업데이트 (히스토리 쌓지 않음)
 * @param {Object} updates - 업데이트할 쿼리
 */
export const updateQuery = (updates) => {
  const current = getQuery();
  const merged = { ...current, ...updates };

  // 빈 값 제거
  Object.keys(merged).forEach(key => {
    if (!merged[key] || merged[key] === '') {
      delete merged[key];
    }
  });

  const queryString = new URLSearchParams(merged).toString();
  const newPath = `${location.pathname}${queryString ? '?' + queryString : ''}`;

  history.replaceState(null, '', newPath);
  window.dispatchEvent(new PopStateEvent('popstate'));
};
```

### 1-2. NotFoundPage 만들기 (30분)

**파일**: `src/pages/NotFoundPage.js`

```javascript
import { navigate } from '../core/router.js';

export function NotFoundPage() {
  return `
    <div class="not-found-page">
      <div class="not-found-content">
        <h1 class="not-found-title">404</h1>
        <p class="not-found-message">페이지를 찾을 수 없습니다</p>
        <button
          class="btn btn--primary"
          data-action="go-home"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  `;
}

// 전역 이벤트 핸들러에 추가
document.body.addEventListener('click', (e) => {
  if (e.target.dataset.action === 'go-home') {
    navigate('/');
  }
});
```

### 1-3. main.js 리팩토링 (2시간)

**파일**: `src/main.js`

```javascript
import { navigate, getParams, getQuery } from './core/router.js';
import { HomePage } from './pages/HomePage.js';
import { DetailPage } from './pages/DetailPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { getProducts, getProduct } from './api/productApi.js';

// 렌더링 함수
const render = async () => {
  const $root = document.querySelector('#root');
  const path = location.pathname;
  const query = getQuery();

  try {
    // 홈 페이지
    if (path === '/') {
      $root.innerHTML = HomePage({ loading: true });

      const data = await getProducts({
        search: query.search,
        limit: query.limit || 20,
        skip: 0,
      });

      $root.innerHTML = HomePage({
        products: data.products,
        total: data.total,
        loading: false,
        search: query.search || '',
      });
    }
    // 상품 상세
    else if (path.startsWith('/product/')) {
      const { id } = getParams();

      if (!id) {
        $root.innerHTML = NotFoundPage();
        return;
      }

      $root.innerHTML = DetailPage({ loading: true });

      const product = await getProduct(id);

      $root.innerHTML = DetailPage({
        product,
        loading: false,
      });
    }
    // 404
    else {
      $root.innerHTML = NotFoundPage();
    }
  } catch (error) {
    console.error('렌더링 오류:', error);
    $root.innerHTML = `<div class="error">오류가 발생했습니다</div>`;
  }
};

// 이벤트 핸들러
const setupEventListeners = () => {
  // 상품 카드 클릭
  document.body.addEventListener('click', (e) => {
    const $card = e.target.closest('.product-card');

    if ($card) {
      e.preventDefault();
      const productId = $card.dataset.productId;
      navigate(`/product/${productId}`);
    }
  });

  // 검색
  document.body.addEventListener('submit', (e) => {
    const $form = e.target.closest('#search-form');

    if ($form) {
      e.preventDefault();
      const formData = new FormData($form);
      updateQuery({ search: formData.get('search') });
    }
  });
};

// 초기화
const init = async () => {
  setupEventListeners();
  window.addEventListener('popstate', render);
  await render();
};

// 시작
if (import.meta.env.MODE !== 'test') {
  enableMocking().then(init);
} else {
  init();
}
```

### 1-4. 테스트

```bash
# 브라우저에서 확인
pnpm run dev

# 테스트 실행
pnpm run test:e2e:ui
```

**확인 사항**:
- [ ] 상품 클릭 → `/product/123` 이동
- [ ] 뒤로가기 → 홈으로 복귀
- [ ] `/asdfasdf` → 404 페이지
- [ ] 검색 → URL에 `?search=laptop` 반영

---

## Step 2: 상태 관리 (2시간)

### 2-1. localStorage 래퍼 (30분)

**파일**: `src/core/storage.js`

```javascript
/**
 * localStorage에 저장
 * @param {string} key
 * @param {any} value
 */
export const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('localStorage 저장 실패:', error);
  }
};

/**
 * localStorage에서 불러오기
 * @param {string} key
 * @returns {any}
 */
export const load = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('localStorage 불러오기 실패:', error);
    return null;
  }
};

/**
 * localStorage에서 제거
 * @param {string} key
 */
export const remove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('localStorage 제거 실패:', error);
  }
};
```

### 2-2. 장바구니 상태 관리 (1시간)

**파일**: `src/state/cartState.js`

```javascript
import { save, load } from '../core/storage.js';
import { emit } from '../core/eventBus.js';

const CART_KEY = 'shopping-cart';

// Private 상태
let cart = load(CART_KEY) || [];

// Getter
export const getCart = () => [...cart];

// Actions
export const addToCart = (product) => {
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1, selected: true });
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
    item.quantity = Math.max(1, quantity);
    save(CART_KEY, cart);
    emit('cart:updated', getCart());
  }
};

export const toggleSelect = (productId) => {
  const item = cart.find(item => item.id === productId);

  if (item) {
    item.selected = !item.selected;
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

### 2-3. 이벤트 버스 (30분)

**파일**: `src/core/eventBus.js`

```javascript
const listeners = {};

/**
 * 이벤트 발행
 * @param {string} event - 이벤트 이름
 * @param {any} data - 전달할 데이터
 */
export const emit = (event, data) => {
  if (!listeners[event]) return;

  listeners[event].forEach(handler => {
    try {
      handler(data);
    } catch (error) {
      console.error(`이벤트 핸들러 오류 (${event}):`, error);
    }
  });
};

/**
 * 이벤트 구독
 * @param {string} event - 이벤트 이름
 * @param {Function} handler - 핸들러 함수
 */
export const on = (event, handler) => {
  if (!listeners[event]) {
    listeners[event] = [];
  }

  listeners[event].push(handler);
};

/**
 * 이벤트 구독 해제
 * @param {string} event - 이벤트 이름
 * @param {Function} handler - 핸들러 함수
 */
export const off = (event, handler) => {
  if (!listeners[event]) return;

  listeners[event] = listeners[event].filter(h => h !== handler);
};
```

---

## Step 3: 이벤트 시스템 (2시간)

### 3-1. 이벤트 상수 정의

**파일**: `src/core/events.js`

```javascript
export const EVENTS = Object.freeze({
  // 장바구니
  CART_UPDATED: 'cart:updated',

  // 라우팅
  ROUTE_CHANGED: 'route:changed',

  // UI
  TOAST_SHOW: 'toast:show',
  MODAL_OPEN: 'modal:open',
  MODAL_CLOSE: 'modal:close',

  // 로딩
  LOADING_START: 'loading:start',
  LOADING_END: 'loading:end',
});
```

### 3-2. 토스트 시스템

**컴포넌트**: `src/components/common/Toast.js`

```javascript
export function Toast({ message, type = 'info' }) {
  return `
    <div class="toast toast--${type}">
      <p class="toast__message">${message}</p>
      <button class="toast__close" data-action="close-toast">×</button>
    </div>
  `;
}
```

**토스트 매니저**: `src/utils/toast.js`

```javascript
import { Toast } from '../components/common/Toast.js';

let $container = null;

const getContainer = () => {
  if (!$container) {
    $container = document.createElement('div');
    $container.id = 'toast-container';
    $container.className = 'toast-container';
    document.body.appendChild($container);
  }
  return $container;
};

export const showToast = (message, type = 'info', duration = 3000) => {
  const container = getContainer();

  const $toast = document.createElement('div');
  $toast.innerHTML = Toast({ message, type });

  const $toastEl = $toast.firstElementChild;
  container.appendChild($toastEl);

  // 자동 제거
  setTimeout(() => {
    $toastEl.classList.add('toast--fade-out');
    setTimeout(() => $toastEl.remove(), 300);
  }, duration);

  // 닫기 버튼
  $toastEl.querySelector('[data-action="close-toast"]')
    .addEventListener('click', () => $toastEl.remove());
};
```

**사용**:

```javascript
import { on } from './core/eventBus.js';
import { EVENTS } from './core/events.js';
import { showToast } from './utils/toast.js';

// 장바구니 추가 시 토스트
on(EVENTS.CART_UPDATED, () => {
  showToast('장바구니에 추가되었습니다', 'success');
});
```

---

## Step 4: 무한 스크롤 (3시간)

### 4-1. IntersectionObserver 유틸

**파일**: `src/utils/infiniteScroll.js`

```javascript
/**
 * 무한 스크롤 초기화
 * @param {string} selector - 감지할 요소 선택자
 * @param {Function} callback - 화면에 보일 때 실행할 함수
 * @returns {IntersectionObserver}
 */
export const setupInfiniteScroll = (selector, callback) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
        }
      });
    },
    {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    }
  );

  const $target = document.querySelector(selector);
  if ($target) {
    observer.observe($target);
  }

  return observer;
};
```

### 4-2. 페이지네이션 로직

```javascript
// main.js에 추가
let currentPage = 0;
let isLoading = false;
let hasMore = true;

const loadMoreProducts = async () => {
  if (isLoading || !hasMore) return;

  isLoading = true;
  const query = getQuery();

  const data = await getProducts({
    search: query.search,
    limit: 20,
    skip: currentPage * 20,
  });

  // 기존 상품에 추가
  const $grid = document.querySelector('.product-grid');
  const fragment = document.createDocumentFragment();

  data.products.forEach(product => {
    const div = document.createElement('div');
    div.innerHTML = ProductCard({ product });
    fragment.appendChild(div.firstElementChild);
  });

  $grid.appendChild(fragment);

  currentPage += 1;
  hasMore = data.products.length === 20;
  isLoading = false;
};

// 무한 스크롤 초기화
setupInfiniteScroll('#scroll-trigger', loadMoreProducts);
```

---

## Step 5: 최적화 (2시간)

### 5-1. Debounce

**파일**: `src/utils/debounce.js`

```javascript
/**
 * 디바운스 (마지막 호출만 실행)
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export const debounce = (fn, delay = 300) => {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};
```

**사용**:

```javascript
import { debounce } from './utils/debounce.js';

// 검색 input
const $searchInput = document.querySelector('#search');
$searchInput.addEventListener('input', debounce((e) => {
  updateQuery({ search: e.target.value });
}, 300));
```

### 5-2. DocumentFragment

```javascript
// 대량 DOM 추가 시
const renderProducts = (products) => {
  const fragment = document.createDocumentFragment();

  products.forEach(product => {
    const div = document.createElement('div');
    div.innerHTML = ProductCard({ product });
    fragment.appendChild(div.firstElementChild);
  });

  $container.innerHTML = '';
  $container.appendChild(fragment);
};
```

---

## 🎯 최종 체크리스트

### 라우팅
- [ ] 페이지 전환 시 새로고침 없음
- [ ] URL 파라미터 추출 (`/product/:id`)
- [ ] 쿼리 파라미터 관리
- [ ] 404 페이지
- [ ] 뒤로/앞으로 가기 동작

### 상태 관리
- [ ] localStorage에 장바구니 저장
- [ ] 새로고침 후에도 장바구니 유지
- [ ] URL 쿼리로 검색/필터 상태 관리

### 이벤트
- [ ] 이벤트 위임
- [ ] 토스트 메시지
- [ ] 장바구니 업데이트 시 뱃지 변경

### 성능
- [ ] DocumentFragment 사용
- [ ] Debounce 적용
- [ ] 무한 스크롤 동작

### 테스트
- [ ] e2e 테스트 통과
- [ ] 배포 완료

---

**이제 시작하세요!** 🚀
