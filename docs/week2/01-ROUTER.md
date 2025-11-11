# 01. 라우팅 시스템 구현하기

> **React 개념**: React Router (`useNavigate`, `useLocation`, `useParams`)
> **난이도**: ⭐⭐ (보통)
> **예상 시간**: 4-6시간

## 🎯 이번 단계의 목표

React Router처럼 동작하는 클라이언트 사이드 라우팅 시스템을 만듭니다.

### 구현할 기능
- ✅ `router.push(path)` - 페이지 이동 (React Router의 `navigate()`)
- ✅ `router.replace(path)` - 현재 히스토리 교체
- ✅ `router.back()` / `router.forward()` - 뒤로/앞으로 가기
- ✅ 동적 라우팅 (`/product/:id`)
- ✅ 쿼리 파라미터 처리 (`?search=keyword`)
- ✅ 404 Not Found 페이지
- ✅ 페이지 전환 시 새로고침 없음

---

## 📚 배경 지식

### React Router는 어떻게 동작하나요?

```jsx
// React Router 사용 예시
import { useNavigate, useParams, useLocation } from 'react-router-dom';

function ProductList() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (id) => {
    navigate(`/product/${id}`); // 페이지 이동
  };

  return <div>...</div>;
}

function ProductDetail() {
  const { id } = useParams(); // URL 파라미터 추출
  return <div>Product ID: {id}</div>;
}
```

### 우리가 만들 Router

```javascript
// 우리의 Router 사용 예시
import { router } from './core/Router.js';

function ProductList() {
  const handleClick = (id) => {
    router.push(`/product/${id}`); // 페이지 이동
  };

  return `<div>...</div>`;
}

function ProductDetail() {
  const { id } = router.params; // URL 파라미터 추출
  return `<div>Product ID: ${id}</div>`;
}
```

---

## 🏗️ 구현 단계

### Step 1: Router 클래스 뼈대 만들기 (30분)

**파일 생성**: `src/core/Router.js`

```javascript
class Router {
  constructor() {
    this.routes = [];
    this.currentRoute = null;
    this.params = {};
    this.query = {};

    // popstate: 뒤로가기/앞으로가기 감지
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });
  }

  // 라우트 등록
  addRoute(path, handler) {
    this.routes.push({ path, handler });
    return this;
  }

  // 페이지 이동 (pushState)
  push(path) {
    history.pushState(null, '', path);
    this.handleRoute();
  }

  // 현재 히스토리 교체 (replaceState)
  replace(path) {
    history.replaceState(null, '', path);
    this.handleRoute();
  }

  // 뒤로 가기
  back() {
    history.back();
  }

  // 앞으로 가기
  forward() {
    history.forward();
  }

  // 현재 경로 처리
  handleRoute() {
    const path = window.location.pathname;
    const matchedRoute = this.matchRoute(path);

    if (matchedRoute) {
      this.currentRoute = matchedRoute;
      this.extractParams(path, matchedRoute.path);
      this.extractQuery();
      matchedRoute.handler(this.params, this.query);
    } else {
      this.handle404();
    }
  }

  // 라우트 매칭 (동적 라우트 지원)
  matchRoute(path) {
    // 구현 예정
  }

  // URL 파라미터 추출 (/product/:id)
  extractParams(path, routePath) {
    // 구현 예정
  }

  // 쿼리 파라미터 추출 (?search=keyword)
  extractQuery() {
    const params = new URLSearchParams(window.location.search);
    this.query = Object.fromEntries(params);
  }

  // 404 처리
  handle404() {
    // 구현 예정
  }

  // 초기화
  init() {
    this.handleRoute();
  }
}

// 싱글톤 인스턴스
export const router = new Router();
```

---

### Step 2: 동적 라우팅 구현 (1시간)

`/product/:id` 같은 패턴을 매칭하는 로직을 구현합니다.

```javascript
class Router {
  // ...

  // 라우트 패턴을 정규식으로 변환
  pathToRegex(path) {
    // /product/:id -> /product/([^/]+)
    return new RegExp(
      '^' + path.replace(/:\w+/g, '([^/]+)') + '$'
    );
  }

  // 파라미터 이름 추출
  getParamNames(path) {
    // /product/:id/:name -> ['id', 'name']
    const matches = path.match(/:\w+/g) || [];
    return matches.map(match => match.slice(1));
  }

  // 라우트 매칭
  matchRoute(path) {
    for (const route of this.routes) {
      const regex = this.pathToRegex(route.path);
      const match = path.match(regex);

      if (match) {
        return route;
      }
    }
    return null;
  }

  // 파라미터 값 추출
  extractParams(path, routePath) {
    const regex = this.pathToRegex(routePath);
    const match = path.match(regex);
    const paramNames = this.getParamNames(routePath);

    this.params = {};
    if (match) {
      paramNames.forEach((name, index) => {
        this.params[name] = match[index + 1];
      });
    }
  }
}
```

---

### Step 3: main.js에서 Router 사용하기 (1시간)

**기존 코드** (`src/main.js`):
```javascript
// ❌ 조건문으로 라우팅
if (location.pathname === "/") {
  // 홈 페이지
} else if (location.pathname.includes("/product/")) {
  // 상품 상세
}
```

**개선된 코드**:
```javascript
// ✅ Router 사용
import { router } from './core/Router.js';
import { Homepage } from './pages/HomePage.js';
import { DetailPage } from './pages/DetailPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

// 라우트 등록
router
  .addRoute('/', async (params, query) => {
    const $root = document.querySelector("#root");

    // 로딩 상태
    $root.innerHTML = Homepage({ loading: true });

    // 데이터 로드
    const data = await getProducts({
      search: query.search,
      category: query.category,
      sort: query.sort,
      limit: query.limit || 20
    });

    // 렌더링
    $root.innerHTML = Homepage({ ...data, loading: false });
  })
  .addRoute('/product/:id', async (params, query) => {
    const $root = document.querySelector("#root");

    $root.innerHTML = DetailPage({ loading: true });

    const product = await getProduct(params.id);

    $root.innerHTML = DetailPage({ product, loading: false });
  })
  .addRoute('*', () => {
    const $root = document.querySelector("#root");
    $root.innerHTML = NotFoundPage();
  });

// 초기화
router.init();
```

---

### Step 4: 링크 클릭 시 라우터 사용하기 (1시간)

**이벤트 위임**으로 모든 링크 클릭을 가로채서 Router를 사용합니다.

```javascript
// src/main.js에 추가

// 모든 링크 클릭 가로채기
document.body.addEventListener('click', (e) => {
  // data-link 속성이 있는 요소만 처리
  const link = e.target.closest('[data-link]');

  if (link) {
    e.preventDefault();
    const href = link.getAttribute('href');
    router.push(href);
  }
});

// 상품 카드 클릭 처리
document.body.addEventListener('click', (e) => {
  const productCard = e.target.closest('.product-card');

  if (productCard) {
    const productId = productCard.dataset.productId;
    router.push(`/product/${productId}`);
  }
});
```

**컴포넌트에서 링크 사용**:
```javascript
// src/components/ProductCard.js
export const ProductCard = (product) => {
  return `
    <div class="product-card" data-product-id="${product.id}">
      <img src="${product.thumbnail}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p>$${product.price}</p>
    </div>
  `;
};
```

---

### Step 5: 404 페이지 구현 (30분)

**파일 생성**: `src/pages/NotFoundPage.js`

```javascript
import { router } from '../core/Router.js';

export const NotFoundPage = () => {
  return `
    <div class="not-found-page">
      <div class="not-found-content">
        <h1>404</h1>
        <p>페이지를 찾을 수 없습니다</p>
        <button onclick="handleGoHome()">홈으로 돌아가기</button>
      </div>
    </div>
  `;
};

// 전역 함수로 등록 (인라인 핸들러에서 사용)
window.handleGoHome = () => {
  router.push('/');
};
```

---

### Step 6: 쿼리 파라미터 업데이트 유틸 (1시간)

검색, 필터링, 정렬 등을 URL에 반영하는 헬퍼 함수를 만듭니다.

```javascript
// src/core/Router.js에 추가

class Router {
  // ...

  // 쿼리 파라미터 업데이트
  updateQuery(updates) {
    const currentQuery = { ...this.query, ...updates };

    // 빈 값 제거
    Object.keys(currentQuery).forEach(key => {
      if (!currentQuery[key]) {
        delete currentQuery[key];
      }
    });

    const queryString = new URLSearchParams(currentQuery).toString();
    const newPath = `${window.location.pathname}${queryString ? '?' + queryString : ''}`;

    this.replace(newPath); // pushState가 아닌 replaceState 사용
  }

  // 특정 쿼리 파라미터 제거
  removeQuery(key) {
    const currentQuery = { ...this.query };
    delete currentQuery[key];

    const queryString = new URLSearchParams(currentQuery).toString();
    const newPath = `${window.location.pathname}${queryString ? '?' + queryString : ''}`;

    this.replace(newPath);
  }
}
```

**사용 예시**:
```javascript
// 검색어 입력 시
searchInput.addEventListener('input', debounce((e) => {
  router.updateQuery({ search: e.target.value });
}, 300));

// 카테고리 선택 시
categorySelect.addEventListener('change', (e) => {
  router.updateQuery({ category: e.target.value });
});

// 정렬 선택 시
sortSelect.addEventListener('change', (e) => {
  router.updateQuery({ sort: e.target.value });
});
```

---

## ✅ 체크리스트

구현을 완료하면 다음을 확인하세요:

### 기본 기능
- [ ] `router.push('/path')` 동작
- [ ] `router.back()` / `router.forward()` 동작
- [ ] 새로고침 없이 페이지 이동
- [ ] 브라우저 뒤로가기/앞으로가기 동작

### 동적 라우팅
- [ ] `/product/:id` 패턴 매칭
- [ ] `router.params.id`로 파라미터 추출
- [ ] 여러 파라미터 지원 (`/user/:userId/post/:postId`)

### 쿼리 파라미터
- [ ] `?search=keyword` 파싱
- [ ] `router.query.search`로 값 추출
- [ ] `router.updateQuery()` 동작

### 404 처리
- [ ] 존재하지 않는 경로 접근 시 404 페이지 표시
- [ ] "홈으로 돌아가기" 버튼 동작

### 테스트
```bash
# e2e 테스트 실행
pnpm run test:e2e:advanced

# 라우팅 관련 테스트만 확인
pnpm run test:e2e:ui
```

---

## 🐛 디버깅 팁

### 문제 1: 뒤로가기가 작동하지 않아요
```javascript
// ❌ 잘못된 코드
window.addEventListener('popstate', () => {
  this.handleRoute(); // this가 undefined
});

// ✅ 올바른 코드
window.addEventListener('popstate', () => {
  this.handleRoute();
}.bind(this)); // bind 사용

// 또는
window.addEventListener('popstate', this.handleRoute.bind(this));
```

### 문제 2: 라우트가 매칭되지 않아요
```javascript
// 디버깅용 로그 추가
matchRoute(path) {
  console.log('Matching path:', path);

  for (const route of this.routes) {
    const regex = this.pathToRegex(route.path);
    console.log('Testing route:', route.path, regex);

    const match = path.match(regex);
    if (match) {
      console.log('Matched!', match);
      return route;
    }
  }

  console.log('No match found');
  return null;
}
```

### 문제 3: 쿼리 파라미터가 사라져요
```javascript
// ❌ push를 사용하면 히스토리가 쌓임
router.push(newPath);

// ✅ replace를 사용하면 현재 히스토리 교체
router.replace(newPath);
```

---

## 🎓 학습 포인트

### React Router와의 비교

| React Router | 우리의 Router | 차이점 |
|-------------|--------------|--------|
| `useNavigate()` | `router.push()` | Hook vs 직접 호출 |
| `useParams()` | `router.params` | Hook vs 프로퍼티 접근 |
| `useLocation()` | `window.location` | Hook vs 전역 객체 |
| `useSearchParams()` | `router.query` | Hook vs 파싱된 객체 |

### 왜 이렇게 만들었나요?

1. **Hooks 없이도 동작**: React처럼 컴포넌트 단위가 아니므로 전역 싱글톤 사용
2. **이벤트 위임**: 모든 링크를 감시하지 않고 `document.body`에서 처리
3. **replaceState 활용**: 검색/필터링은 히스토리를 쌓지 않음

---

## 📖 추가 학습 자료

- [MDN - History API](https://developer.mozilla.org/ko/docs/Web/API/History_API)
- [MDN - URLSearchParams](https://developer.mozilla.org/ko/docs/Web/API/URLSearchParams)
- [React Router 공식 문서](https://reactrouter.com/)
- [Build Your Own React Router](https://tylermcginnis.com/build-your-own-react-router-v4/)

---

## 🚀 다음 단계

Router를 완성했다면, 이제 상태 관리 시스템을 만들 차례입니다!

다음: **[02-STATE-MANAGEMENT.md - 상태 관리 시스템 구현하기](./02-STATE-MANAGEMENT.md)** →
