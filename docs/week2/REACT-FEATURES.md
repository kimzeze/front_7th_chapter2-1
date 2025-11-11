# 🎯 최종적으로 구현하게 될 React 기능들

이 프로젝트를 완료하면 다음과 같은 React의 핵심 기능들을 직접 구현하게 됩니다.

---

## 📦 Core React Features

### 1. Hooks API

| React Hook | 우리의 구현 | 파일 위치 | 난이도 |
|-----------|-----------|----------|--------|
| `useState` | `createState()` | `src/core/hooks/useState.js` | ⭐⭐⭐ |
| `useEffect` | `createEffect()` | `src/core/hooks/useEffect.js` | ⭐⭐⭐⭐ |
| `useContext` | `createContext()` | `src/core/hooks/useContext.js` | ⭐⭐⭐⭐ |
| `useReducer` | `Store` + `reducer` | `src/core/Store.js` | ⭐⭐⭐⭐ |
| `useRef` | `createRef()` | `src/core/hooks/useRef.js` | ⭐⭐ |
| `useMemo` | `createMemo()` | `src/core/hooks/useMemo.js` | ⭐⭐⭐ |
| `useCallback` | `createCallback()` | `src/core/hooks/useCallback.js` | ⭐⭐⭐ |
| Custom Hooks | `useXXX()` | `src/hooks/` | ⭐⭐⭐ |

### 2. Component System

| React Feature | 우리의 구현 | 설명 |
|--------------|-----------|------|
| JSX | Template Literal | HTML 문자열로 컴포넌트 작성 |
| Props | Function Parameters | 함수 인자로 데이터 전달 |
| Component Class | `Component` 클래스 | 생명주기 관리 |
| Lifecycle Methods | `onMounted`, `onUpdated` | 생명주기 훅 |
| Composition | 함수 합성 | 컴포넌트 조합 |

### 3. Virtual DOM & Reconciliation

| React Feature | 우리의 구현 | 파일 위치 |
|--------------|-----------|----------|
| `React.createElement` | `h()` | `src/core/vdom/createElement.js` |
| Virtual DOM | VNode 객체 | `src/core/vdom/` |
| Diffing Algorithm | `diff()` | `src/core/vdom/diff.js` |
| Reconciliation | `patch()` | `src/core/vdom/patch.js` |
| Key-based Lists | Key 기반 최적화 | `src/core/vdom/diff.js` |

### 4. State Management

| Redux Feature | 우리의 구현 | 파일 위치 |
|--------------|-----------|----------|
| Store | `Store` 클래스 | `src/core/Store.js` |
| Actions | 메서드 호출 | `cartStore.addItem()` |
| Reducers | Store 내부 로직 | `src/stores/` |
| Subscribe | Observer 패턴 | `store.subscribe()` |
| Middleware | EventBus | `src/core/EventBus.js` |

### 5. Router

| React Router Feature | 우리의 구현 | 설명 |
|---------------------|-----------|------|
| `useNavigate()` | `router.push()` | 페이지 이동 |
| `useParams()` | `router.params` | URL 파라미터 |
| `useLocation()` | `window.location` | 현재 경로 |
| `useSearchParams()` | `router.query` | 쿼리 파라미터 |
| Dynamic Routes | `/product/:id` | 동적 라우팅 |
| 404 Page | NotFoundPage | 404 처리 |

### 6. Performance Optimization

| React Feature | 우리의 구현 | 설명 |
|--------------|-----------|------|
| `React.memo` | `memo()` | 컴포넌트 메모이제이션 |
| `useMemo` | `createMemo()` | 값 메모이제이션 |
| `useCallback` | `createCallback()` | 함수 메모이제이션 |
| Code Splitting | Dynamic Import | 지연 로딩 |
| Lazy Loading | Intersection Observer | 이미지/컴포넌트 지연 로딩 |

---

## 🔥 구현 완성도 비교

### 완전히 구현되는 기능 ✅

1. **useState** - 상태 관리
2. **useEffect** - 부수효과 처리
3. **useRef** - DOM 참조
4. **useMemo** - 값 메모이제이션
5. **useCallback** - 함수 메모이제이션
6. **Virtual DOM** - 가상 DOM 트리
7. **Diffing** - 변경 감지
8. **Router** - 클라이언트 라우팅
9. **Custom Hooks** - 커스텀 훅

### 간소화된 구현 ⚠️

1. **useContext** - 기본 구현 (Provider/Consumer)
2. **Reconciliation** - 기본 알고리즘 (Fiber 없음)
3. **Event System** - 기본 이벤트 위임 (Synthetic Events 없음)
4. **Concurrent Rendering** - 동기 렌더링만 지원

### 구현하지 않는 기능 ❌

1. **React Server Components**
2. **Suspense**
3. **Concurrent Features** (useTransition, useDeferredValue)
4. **Error Boundaries**
5. **Portals**
6. **Strict Mode**

---

## 💡 각 기능의 실제 사용 예시

### 1. useState 구현

```javascript
// React
const [count, setCount] = useState(0);

// 우리의 구현
const [count, setCount] = createState(0);
```

### 2. useEffect 구현

```javascript
// React
useEffect(() => {
  document.title = `Count: ${count}`;
  return () => console.log('cleanup');
}, [count]);

// 우리의 구현
createEffect(() => {
  document.title = `Count: ${count}`;
  return () => console.log('cleanup');
}, [count]);
```

### 3. Virtual DOM 구현

```javascript
// React
<div className="container">
  <h1>Hello</h1>
  <p>World</p>
</div>

// 우리의 구현
h('div', { className: 'container' },
  h('h1', {}, 'Hello'),
  h('p', {}, 'World')
)
```

### 4. Router 구현

```javascript
// React Router
const navigate = useNavigate();
navigate('/product/123');

// 우리의 구현
router.push('/product/123');
```

### 5. Context 구현

```javascript
// React
const ThemeContext = createContext('light');
const theme = useContext(ThemeContext);

// 우리의 구현
const ThemeContext = createContext('light');
const theme = ThemeContext.use();
```

### 6. Memo 구현

```javascript
// React
const MemoizedComponent = React.memo(MyComponent);

// 우리의 구현
const MemoizedComponent = memo(MyComponent);
```

---

## 🎓 학습 효과

이 프로젝트를 완료하면:

### 1. React의 내부 동작 이해

- ✅ Hook이 어떻게 동작하는지
- ✅ Virtual DOM이 왜 필요한지
- ✅ Reconciliation이 무엇인지
- ✅ 상태 관리가 어떻게 이루어지는지

### 2. 프레임워크의 필요성 체감

- ✅ 직접 구현하면서 복잡성 경험
- ✅ React가 해결한 문제들 이해
- ✅ 최적화의 중요성 깨달음

### 3. 실전 JavaScript 능력 향상

- ✅ 고급 JavaScript 패턴
- ✅ 클린코드 작성 능력
- ✅ 아키텍처 설계 능력
- ✅ 성능 최적화 기술

### 4. 디버깅 능력 향상

- ✅ React DevTools 없이도 디버깅 가능
- ✅ 프레임워크의 에러 메시지 이해
- ✅ 성능 병목 지점 파악

---

## 📊 난이도 순서대로 구현하기

### Phase 1: 기초 (1-2주)
1. ⭐⭐ Router 시스템
2. ⭐⭐ Component 시스템
3. ⭐⭐ useRef

### Phase 2: 중급 (2-3주)
4. ⭐⭐⭐ useState
5. ⭐⭐⭐ useMemo
6. ⭐⭐⭐ useCallback

### Phase 3: 고급 (3-4주)
7. ⭐⭐⭐⭐ useEffect
8. ⭐⭐⭐⭐ useContext
9. ⭐⭐⭐⭐ Optimization

### Phase 4: 심화 (4-5주)
10. ⭐⭐⭐⭐⭐ Virtual DOM
11. ⭐⭐⭐⭐⭐ Reconciliation

---

## 🚀 실무에서의 활용

### 이 프로젝트 경험이 실무에서 도움이 되는 이유:

1. **프레임워크 선택 능력**
   - 각 프레임워크의 장단점 이해
   - 프로젝트에 맞는 도구 선택

2. **성능 최적화**
   - 렌더링 최적화 방법 숙지
   - 메모이제이션 적절한 활용

3. **디버깅**
   - React 내부 동작 이해로 빠른 문제 해결
   - 복잡한 버그도 원인 파악 가능

4. **코드 리뷰**
   - 다른 사람의 코드 이해도 향상
   - 좋은 패턴과 나쁜 패턴 구별

5. **기술 면접**
   - React 내부 동작 질문에 답변 가능
   - 깊이 있는 기술 토론 가능

---

## 📝 체크리스트

프로젝트를 완료하면서 다음을 확인하세요:

### 구현 완료
- [ ] useState ✅
- [ ] useEffect ✅
- [ ] useContext ✅
- [ ] useRef ✅
- [ ] useMemo ✅
- [ ] useCallback ✅
- [ ] Virtual DOM ✅
- [ ] Router ✅
- [ ] Custom Hooks ✅

### 최적화
- [ ] 메모이제이션 적용
- [ ] 디바운싱/쓰로틀링
- [ ] 지연 로딩
- [ ] 코드 스플리팅

### 테스트
- [ ] e2e 테스트 통과
- [ ] 성능 측정 완료
- [ ] 메모리 누수 없음

### 배포
- [ ] 빌드 성공
- [ ] gh-pages 배포
- [ ] 프로덕션 환경 테스트

---

## 🎉 다음 단계

이 프로젝트를 완료했다면:

1. **실제 React 프로젝트** 진행
   - 이제 React를 더 깊이 이해하고 사용 가능

2. **다른 프레임워크 학습**
   - Vue, Svelte, Solid.js 등 빠르게 학습 가능

3. **오픈소스 기여**
   - React 코드베이스 이해 가능

4. **기술 블로그 작성**
   - "Vanilla JS로 React 만들기" 시리즈

5. **포트폴리오 강화**
   - 깊이 있는 기술 이해 어필 가능

---

← 처음으로: **[00-OVERVIEW.md](./00-OVERVIEW.md)**
