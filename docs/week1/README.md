# Week 1: 바닐라 JS SPA 개발 가이드

> **프레임워크 없이 실용적인 SPA를 만들며 React가 해결하는 문제를 경험합니다**

## 📚 문서 읽는 순서

### 1️⃣ 시작하기 전에
**[00-OVERVIEW.md](./00-OVERVIEW.md)** - 이번주 목표와 전체 로드맵
- 무엇을 만드는지
- 왜 만드는지
- 어떻게 진행할지

### 2️⃣ 설계 이해하기
**[01-ARCHITECTURE.md](./01-ARCHITECTURE.md)** - 아키텍처 설계 철학
- 폴더 구조와 책임 분리
- 데이터 흐름
- 이벤트 기반 아키텍처
- 성능 최적화 전략

### 3️⃣ 코드 작성 규칙
**[02-CODING-STYLE.md](./02-CODING-STYLE.md)** - 바닐라 JS 코딩 스타일
- 네이밍 규칙
- 함수 작성 패턴
- 컴포넌트 작성법
- DOM 조작 best practices
- **리팩토링할 때 가장 중요한 문서!**

### 4️⃣ 실제 구현하기
**[03-IMPLEMENTATION-GUIDE.md](./03-IMPLEMENTATION-GUIDE.md)** - 단계별 구현 가이드
- Step 1: 라우팅 시스템
- Step 2: 상태 관리
- Step 3: 이벤트 시스템
- Step 4: 무한 스크롤
- Step 5: 최적화
- **복붙 가능한 코드 포함**

### 5️⃣ 빠른 참조
**[QUICK-REFERENCE.md](./QUICK-REFERENCE.md)** - 개발 중 빠른 참조
- 네이밍 치트시트
- 자주 쓰는 코드 스니펫
- 체크리스트
- 자주 하는 실수 vs 올바른 방법

---

## 🎯 이렇게 활용하세요

### 처음 시작할 때
1. **00-OVERVIEW.md** 읽고 전체 그림 파악
2. **01-ARCHITECTURE.md** 읽고 설계 이해
3. **03-IMPLEMENTATION-GUIDE.md** 보면서 코딩 시작

### 코드 작성 중
- **QUICK-REFERENCE.md** 자주 열어두고 참고
- 함수명 고민될 때 → 네이밍 치트시트
- 패턴 고민될 때 → 코드 스니펫

### 리팩토링할 때
- **02-CODING-STYLE.md** 체크리스트 확인
- 파일 길이 100줄 넘으면 → 분리
- 함수 길이 30줄 넘으면 → 분리
- 중복 코드 발견하면 → 유틸 함수로 추출

---

## 📋 주요 원칙 요약

### KISS (Keep It Simple, Stupid)
```javascript
// ✅ Good - 단순하고 명확
const navigate = (path) => {
  history.pushState(null, '', path);
  render();
};

// ❌ Bad - 과도한 추상화
class RouterManager extends EventEmitter {
  // ... 100줄
}
```

### 테스트 통과가 최우선
아키텍처보다 **동작하는 코드** 먼저 만들고, 테스트 통과 후 리팩토링

### 다음주를 위한 준비
- 깔끔한 함수명 (나중에 리팩토링 편하게)
- 명확한 책임 분리
- 불변성 유지

---

## 🚀 빠른 시작

```bash
# 1. 폴더 생성
mkdir -p src/core src/utils src/state src/components/common src/pages

# 2. 첫 파일들 생성
touch src/core/router.js
touch src/core/storage.js
touch src/core/eventBus.js
touch src/pages/NotFoundPage.js

# 3. 개발 서버 실행
pnpm run dev

# 4. 테스트 확인
pnpm run test:e2e:ui
```

---

## ✅ 완료 체크리스트

### 라우팅 ✓
- [ ] `navigate()` 함수 구현
- [ ] URL 파라미터 추출 (`/product/:id`)
- [ ] 쿼리 파라미터 관리
- [ ] 404 페이지
- [ ] 뒤로/앞으로 가기

### 상태 관리 ✓
- [ ] localStorage 래퍼
- [ ] 장바구니 상태 캡슐화
- [ ] 이벤트로 상태 변경 알림

### UI/UX ✓
- [ ] 토스트 메시지
- [ ] 로딩 상태
- [ ] 모달
- [ ] 무한 스크롤

### 성능 ✓
- [ ] DocumentFragment
- [ ] 이벤트 위임
- [ ] Debounce/Throttle

### 코드 품질 ✓
- [ ] 함수 30줄 이내
- [ ] 파일 100줄 이내
- [ ] JSDoc 주석
- [ ] 명확한 네이밍

### 테스트 ✓
- [ ] e2e 테스트 통과
- [ ] 배포 완료

---

## 💡 팁

### 막힐 때
1. **QUICK-REFERENCE.md** 확인
2. **03-IMPLEMENTATION-GUIDE.md**에서 유사한 예제 찾기
3. 테스트 코드 읽어보기

### 리팩토링할 때
1. **02-CODING-STYLE.md** 체크리스트
2. 한 번에 하나씩만 수정
3. 수정 후 테스트 확인

### 시간 절약하려면
1. **03-IMPLEMENTATION-GUIDE.md** 코드 복붙해서 시작
2. 동작하게 만들기
3. 테스트 통과시키기
4. 리팩토링

---

## 🎓 학습 포인트

이번주 과제를 하면서 다음을 경험합니다:

- ❓ **왜 React Router가 필요한가?**
  → 직접 라우팅 구현하면서 이해

- ❓ **왜 useState가 필요한가?**
  → 상태 관리의 어려움 체험

- ❓ **왜 useEffect가 필요한가?**
  → 이벤트와 렌더링 타이밍 조율의 복잡함

- ❓ **왜 Virtual DOM이 필요한가?**
  → DOM 조작의 비효율성 경험

**다음주에는 이 모든 문제를 React처럼 해결합니다!**

---

**이제 [00-OVERVIEW.md](./00-OVERVIEW.md)부터 시작하세요!** 🚀
