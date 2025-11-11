# Week 1: 프레임워크 없이 SPA 만들기

> **목표**: React나 Vue 없이 바닐라 JavaScript로 실용적인 SPA를 구현하며, 프레임워크가 해결하는 문제를 직접 경험합니다.

## 📋 이번주 목표

### 핵심 요구사항
- ✅ **URL 기반 라우팅** - 새로고침 없는 페이지 전환
- ✅ **상태 유지** - URL 쿼리, localStorage 활용
- ✅ **이벤트 기반 렌더링** - 효율적인 DOM 업데이트
- ✅ **테스트 통과** - e2e 테스트 100% 통과

### 구현할 기능
1. **상품 목록** - 검색, 필터, 정렬, 무한 스크롤
2. **상품 상세** - 동적 라우팅, 관련 상품
3. **장바구니** - 모달, CRUD, 로컬 저장
4. **카테고리** - 계층 구조, 브레드크럼
5. **사용자 피드백** - 토스트, 로딩 상태

---

## 🏗️ 프로젝트 구조

```
src/
├── core/                    # 핵심 유틸리티
│   ├── router.js           # 간단한 라우팅 함수들
│   ├── storage.js          # localStorage 래퍼
│   └── eventBus.js         # 이벤트 시스템
│
├── utils/                   # 헬퍼 함수
│   ├── dom.js              # DOM 조작 유틸
│   ├── debounce.js         # 디바운스
│   └── formatters.js       # 데이터 포맷팅
│
├── components/              # 재사용 가능한 UI
│   ├── common/
│   │   ├── Toast.js        # 토스트 메시지
│   │   ├── LoadingSpinner.js
│   │   └── Modal.js
│   ├── product/
│   │   ├── ProductCard.js
│   │   └── ProductGrid.js
│   └── cart/
│       ├── CartModal.js
│       └── CartItem.js
│
├── pages/                   # 페이지 컴포넌트
│   ├── HomePage.js
│   ├── DetailPage.js
│   └── NotFoundPage.js
│
├── state/                   # 상태 관리
│   └── cartState.js        # 장바구니 상태
│
├── api/                     # API 호출
│   └── productApi.js
│
└── main.js                  # 진입점
```

---

## 🎯 개발 원칙

### 1. 단순함 우선 (Keep It Simple)
```javascript
// ✅ Good - 직관적이고 명확
const navigate = (path) => {
  history.pushState(null, '', path);
  render();
};

// ❌ Bad - 과도한 추상화
class RouterManager {
  #history;
  #middleware = [];
  navigate(path, options = {}) { ... }
}
```

### 2. 테스트 통과가 최우선
- 아키텍처보다 **동작하는 코드** 먼저
- 리팩토링은 테스트 통과 후

### 3. 다음주를 위한 준비
- 깔끔한 코드 작성 (네이밍, 함수 분리)
- 다음주에 React 패턴으로 쉽게 전환 가능하도록

---

## 📚 학습 단계

### Step 1: 라우팅 시스템 (4시간)
- [ ] 간단한 라우팅 유틸 함수 작성
- [ ] URL 파라미터 추출 (`/product/:id`)
- [ ] 쿼리 파라미터 관리
- [ ] 404 페이지

**목표**: 새로고침 없이 페이지 전환

### Step 2: 상태 관리 (2시간)
- [ ] localStorage 래퍼 작성
- [ ] 장바구니 상태 관리
- [ ] URL 쿼리로 검색/필터 상태 관리

**목표**: 새로고침해도 상태 유지

### Step 3: 이벤트 시스템 (2시간)
- [ ] 이벤트 위임 패턴
- [ ] 커스텀 이벤트로 컴포넌트 간 통신
- [ ] 토스트 시스템

**목표**: 효율적인 이벤트 처리

### Step 4: 무한 스크롤 (3시간)
- [ ] IntersectionObserver 활용
- [ ] 페이지네이션 로직
- [ ] 로딩 상태 관리

**목표**: 부드러운 UX

### Step 5: 최적화 (2시간)
- [ ] DocumentFragment 사용
- [ ] 디바운스/스로틀링
- [ ] 불필요한 렌더링 방지

**목표**: 성능 개선

---

## 🚀 시작하기

### 1. 첫 번째 작업
```bash
# 1. 라우팅 유틸 만들기
touch src/core/router.js

# 2. NotFoundPage 만들기
touch src/pages/NotFoundPage.js

# 3. main.js 리팩토링
```

### 2. 다음 단계
- [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) - 아키텍처 설계
- [02-CODING-STYLE.md](./02-CODING-STYLE.md) - 코딩 스타일 가이드
- [03-IMPLEMENTATION-GUIDE.md](./03-IMPLEMENTATION-GUIDE.md) - 구체적인 구현 방법

---

## 📖 참고 자료

### MDN 문서
- [History API](https://developer.mozilla.org/ko/docs/Web/API/History_API)
- [URLSearchParams](https://developer.mozilla.org/ko/docs/Web/API/URLSearchParams)
- [IntersectionObserver](https://developer.mozilla.org/ko/docs/Web/API/Intersection_Observer_API)
- [DocumentFragment](https://developer.mozilla.org/ko/docs/Web/API/DocumentFragment)

### 학습 포인트
- 왜 React Router가 필요한지
- 왜 useState/useEffect가 필요한지
- 왜 Virtual DOM이 필요한지

---

**다음**: [01-ARCHITECTURE.md - 아키텍처 설계](./01-ARCHITECTURE.md) →
