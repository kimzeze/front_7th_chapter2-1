# 🎯 Vanilla JS로 React 만들기 - 전체 로드맵

## 📋 프로젝트 개요

이 프로젝트는 **Vanilla JavaScript만으로 React의 핵심 기능들을 직접 구현**하는 과정입니다.
`template.js`에 있는 기존 코드를 점진적으로 리팩토링하며, React가 해결한 문제들을 직접 경험하고 이해합니다.

## 🎓 최종적으로 구현할 React 기능들

### Core Hooks
- ✅ `useState` - 상태 관리
- ✅ `useEffect` - 부수효과 처리 및 생명주기
- ✅ `useContext` - 전역 상태 관리
- ✅ `useReducer` - 복잡한 상태 로직
- ✅ `useRef` - DOM 참조 및 값 유지
- ✅ `useMemo` - 연산 최적화
- ✅ `useCallback` - 함수 메모이제이션
- ✅ Custom Hooks - 로직 재사용

### Core Systems
- ✅ **Virtual DOM** - 효율적인 DOM 업데이트
- ✅ **Reconciliation** - 변경 감지 및 최소 업데이트
- ✅ **Component System** - 컴포넌트 기반 아키텍처
- ✅ **Event System** - 합성 이벤트 (Synthetic Events)
- ✅ **Router** - 클라이언트 사이드 라우팅 (React Router)
- ✅ **State Management** - 상태 관리 패턴 (Redux-like)

---

## 📚 학습 단계 및 순서

### 난이도: ⭐ (쉬움) → ⭐⭐⭐⭐⭐ (어려움)

| 단계 | 주제 | 난이도 | 예상 시간 | React 개념 |
|------|------|--------|-----------|-----------|
| 1 | [라우팅 시스템](./01-ROUTER.md) | ⭐⭐ | 4-6시간 | React Router |
| 2 | [상태 관리 기초](./02-STATE-MANAGEMENT.md) | ⭐⭐⭐ | 6-8시간 | useState, useReducer |
| 3 | [컴포넌트 시스템](./03-COMPONENT-SYSTEM.md) | ⭐⭐ | 4-6시간 | Component, Props |
| 4 | [생명주기와 Effects](./04-EFFECTS-AND-LIFECYCLE.md) | ⭐⭐⭐⭐ | 8-10시간 | useEffect, Lifecycle |
| 5 | [Virtual DOM](./05-VIRTUAL-DOM.md) | ⭐⭐⭐⭐⭐ | 10-12시간 | Virtual DOM, Reconciliation |
| 6 | [고급 Hooks](./06-HOOKS.md) | ⭐⭐⭐⭐ | 6-8시간 | useMemo, useCallback, Custom Hooks |
| 7 | [최적화 기법](./07-OPTIMIZATION.md) | ⭐⭐⭐⭐ | 6-8시간 | React.memo, Performance |

**총 예상 시간: 44-58시간**

---

## 🗓️ 권장 학습 스케줄

### Week 1: 기초 다지기
- **Day 1-2**: Router 시스템 구현
- **Day 3-4**: 기본 상태 관리 (useState)
- **Day 5-6**: 컴포넌트 시스템 이해
- **Day 7**: 복습 및 리팩토링

### Week 2: 심화 학습
- **Day 1-3**: useEffect와 생명주기
- **Day 4-6**: Virtual DOM 구현
- **Day 7**: 복습 및 통합 테스트

### Week 3: 최적화 및 완성
- **Day 1-3**: 고급 Hooks 구현
- **Day 4-5**: 성능 최적화
- **Day 6-7**: 최종 리팩토링 및 테스트

---

## 🎯 학습 전략

### 1. 점진적 개선 (Progressive Enhancement)
```
template.js (기존 코드)
    ↓
기능별로 하나씩 분리
    ↓
React 패턴으로 리팩토링
    ↓
최적화 및 개선
```

### 2. 작은 단위로 쪼개기
- ❌ "한 번에 전체 리팩토링"
- ✅ "하나의 기능씩 완성하고 테스트"

### 3. 테스트 주도 개발
```bash
# 각 단계마다 테스트 실행
pnpm run test:e2e:basic

# 특정 테스트만 실행
pnpm run test:e2e:ui
```

---

## 🏗️ 최종 아키텍처 구조

```
src/
├── core/                    # React 핵심 기능
│   ├── hooks/
│   │   ├── useState.js      # ✅ useState 구현
│   │   ├── useEffect.js     # ✅ useEffect 구현
│   │   ├── useContext.js    # ✅ useContext 구현
│   │   ├── useReducer.js    # ✅ useReducer 구현
│   │   ├── useRef.js        # ✅ useRef 구현
│   │   ├── useMemo.js       # ✅ useMemo 구현
│   │   └── useCallback.js   # ✅ useCallback 구현
│   ├── vdom/
│   │   ├── createElement.js # ✅ Virtual DOM 생성
│   │   ├── diff.js          # ✅ Diffing 알고리즘
│   │   └── patch.js         # ✅ DOM 패치
│   ├── component/
│   │   ├── Component.js     # ✅ 컴포넌트 베이스 클래스
│   │   └── render.js        # ✅ 렌더링 시스템
│   ├── Router.js            # ✅ React Router
│   ├── Store.js             # ✅ Redux-like Store
│   └── EventBus.js          # ✅ 이벤트 시스템
│
├── components/              # 실제 UI 컴포넌트
│   ├── common/
│   ├── product/
│   └── cart/
│
├── pages/
├── hooks/                   # Custom Hooks
│   ├── useInfiniteScroll.js
│   ├── useDebounce.js
│   └── useLocalStorage.js
│
└── main.js
```

---

## 💡 핵심 개념 매핑

### React vs 우리가 만들 것

| React | 우리의 구현 | 파일 위치 |
|-------|------------|----------|
| `useState()` | `createState()` | `core/hooks/useState.js` |
| `useEffect()` | `createEffect()` | `core/hooks/useEffect.js` |
| `React.createElement()` | `h()` | `core/vdom/createElement.js` |
| `ReactDOM.render()` | `mount()` | `core/component/render.js` |
| `useRouter()` | `router.navigate()` | `core/Router.js` |
| `useContext()` | `createContext()` | `core/hooks/useContext.js` |
| Virtual DOM | VNode 구조체 | `core/vdom/` |
| Reconciliation | diff + patch | `core/vdom/diff.js` |

---

## 🚀 시작하기

### 현재 상태 확인
```bash
# 현재 어떤 파일들이 있는지 확인
ls -la src/

# template.js 크기 확인 (리팩토링할 코드)
wc -l src/template.js
```

### 다음 단계
1. **[01-ROUTER.md](./01-ROUTER.md)** 부터 시작하세요
2. 각 문서의 순서대로 진행하면 됩니다
3. 막히면 다음 문서로 넘어가지 말고, 현재 단계를 완성하세요

---

## 📖 참고 자료

### React 공식 문서
- [React 공식 문서 - Hooks](https://react.dev/reference/react)
- [React 공식 문서 - Virtual DOM](https://react.dev/learn/preserving-and-resetting-state)
- [React Router 공식 문서](https://reactrouter.com/)

### 내부 동작 이해
- [Build Your Own React](https://pomb.us/build-your-own-react/)
- [React 톺아보기](https://goidle.github.io/)
- [React 파이버 아키텍처](https://github.com/acdlite/react-fiber-architecture)

---

## ✅ 체크리스트

각 단계를 완료할 때마다 체크하세요:

### Week 1
- [ ] Router 시스템 구현 완료
- [ ] useState 구현 완료
- [ ] 컴포넌트 시스템 이해
- [ ] 기본 과제 50% 완료

### Week 2
- [ ] useEffect 구현 완료
- [ ] Virtual DOM 기본 구현
- [ ] 기본 과제 100% 완료
- [ ] 심화 과제 시작

### Week 3
- [ ] 모든 Hooks 구현 완료
- [ ] 성능 최적화 완료
- [ ] 심화 과제 100% 완료
- [ ] 배포 완료

---

## 🎓 학습 목표

이 프로젝트를 완료하면:

1. ✅ **React가 왜 만들어졌는지** 이해합니다
2. ✅ **Hooks의 내부 동작 원리**를 이해합니다
3. ✅ **Virtual DOM의 필요성**을 체감합니다
4. ✅ **상태 관리의 어려움**을 경험합니다
5. ✅ **프레임워크 없이도 복잡한 앱**을 만들 수 있습니다
6. ✅ **클린코드와 아키텍처**를 고민하게 됩니다

---

다음: **[01-ROUTER.md - 라우팅 시스템 구현하기](./01-ROUTER.md)** →
