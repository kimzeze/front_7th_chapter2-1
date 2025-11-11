# 커밋 가이드

## 과제 목표
- 프레임워크 없이 SPA(Single Page Application) 구현
- React가 해결하고자 하는 문제를 이해하고 직접 해결
- 라우팅, 상태관리, 컴포넌트 구조를 vanilla JS로 구현
- 테스트 코드 통과 및 GitHub Pages 배포

## 커밋 컨벤션

### 커밋 메시지 형식
```
<타입>: <제목>

<본문> (선택사항)

<꼬리말> (선택사항)
```

### 커밋 타입

| 타입 | 설명 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 추가 | feat: 상품 목록 무한 스크롤 구현 |
| `refactor` | 코드 리팩토링 (기능 변경 없이 구조 개선) | refactor: 컴포넌트 기반 아키텍처로 전환 |
| `style` | 코드 포매팅, 세미콜론 누락 등 | style: Prettier 설정 추가 |
| `fix` | 버그 수정 | fix: 장바구니 수량 계산 오류 수정 |
| `chore` | 빌드 설정, 패키지 매니저 설정 등 | chore: MSW 설정 및 mock 데이터 추가 |
| `docs` | 문서 수정 | docs: README에 프로젝트 실행 방법 추가 |
| `test` | 테스트 코드 추가/수정 | test: 상품 목록 e2e 테스트 추가 |
| `design` | UI/UX 디자인 변경 | design: 상품 카드 레이아웃 개선 |

## 현재 변경사항 커밋 제안

### 방안 1: 상세하게 분리 (권장)

```bash
# 1. 코드 포매팅 설정
git add .prettierrc
git commit -m "style: Prettier 포매팅 설정 추가

- embeddedLanguageFormatting: auto 추가
- htmlWhitespaceSensitivity: css 추가
- HTML 템플릿 리터럴 포매팅 개선"

# 2. 템플릿 분리
git add src/template.js
git commit -m "refactor: HTML 템플릿을 별도 파일로 분리

- main.js에 있던 대량의 HTML 템플릿 코드를 template.js로 이동
- 상품목록, 장바구니, 상세페이지 등 모든 템플릿 포함
- 코드 가독성 및 유지보수성 향상"

# 3. 컴포넌트 구조 추가
git add src/components/
git commit -m "refactor: 재사용 가능한 컴포넌트 구조 추가

컴포넌트 목록:
- Header: 헤더 및 장바구니 아이콘
- Footer: 푸터 영역
- SearchForm: 검색 및 필터 폼
- ProductList: 상품 목록 그리드
- ProductDetail: 상품 상세 정보

각 컴포넌트는 독립적으로 재사용 가능하도록 구현"

# 4. 페이지 구조 추가
git add src/pages/
git commit -m "refactor: 페이지 레벨 컴포넌트 구조 추가

페이지 목록:
- PageLayout: 공통 레이아웃 (Header + Footer)
- HomePage: 상품 목록 페이지
- DetailPage: 상품 상세 페이지

SPA 라우팅을 위한 페이지 단위 분리"

# 5. 메인 파일 리팩토링
git add src/main.js
git commit -m "refactor: main.js를 컴포넌트 기반으로 리팩토링

- 템플릿 코드 제거
- 페이지 및 컴포넌트 import로 대체
- 코드 라인 수 대폭 감소 (1100+ → 40 lines)
- 전체 코드 구조 개선"
```

### 방안 2: 간단하게 분리

```bash
# 1. 코드 포매팅 설정
git add .prettierrc
git commit -m "style: Prettier 포매팅 설정 추가"

# 2. 전체 리팩토링
git add src/
git commit -m "refactor: 컴포넌트 기반 아키텍처로 전환

변경사항:
- HTML 템플릿을 template.js로 분리
- 재사용 가능한 컴포넌트 구조 추가 (Header, Footer, SearchForm, ProductList, ProductDetail)
- 페이지 레벨 컴포넌트 추가 (PageLayout, HomePage, DetailPage)
- main.js 간결화 및 모듈화

목적:
- 코드 가독성 및 유지보수성 향상
- SPA 구현을 위한 구조적 기반 마련"
```

## 이후 개발 시 커밋 가이드

### 기능 개발 단계별 커밋 예시

#### 1단계: 라우팅 시스템
```bash
feat: 클라이언트 사이드 라우팅 시스템 구현

- History API를 이용한 SPA 라우팅
- popstate 이벤트 핸들링
- 동적 페이지 렌더링
```

#### 2단계: 상태 관리
```bash
feat: 전역 상태 관리 시스템 구현

- Observer 패턴 기반 상태 관리
- 상태 변경 시 자동 리렌더링
- 장바구니 상태 관리
```

#### 3단계: 상품 목록 기능
```bash
feat: 상품 목록 조회 및 필터링 기능 구현

- API 연동 및 상품 데이터 로드
- 검색, 카테고리 필터링
- 정렬 기능 (가격순, 이름순)
```

#### 4단계: 무한 스크롤
```bash
feat: 상품 목록 무한 스크롤 구현

- Intersection Observer API 활용
- 페이지네이션 로직
- 로딩 스켈레톤 UI
```

#### 5단계: 장바구니 기능
```bash
feat: 장바구니 CRUD 기능 구현

- 상품 추가/삭제
- 수량 조절
- 전체 선택/삭제
- LocalStorage 연동
```

#### 6단계: 상품 상세
```bash
feat: 상품 상세 페이지 구현

- 동적 라우팅 (/product/:id)
- 상품 상세 정보 표시
- 관련 상품 추천
```

#### 7단계: URL 상태 동기화
```bash
feat: URL 쿼리 파라미터 상태 동기화

- 검색어, 필터, 정렬 조건 URL 반영
- 새로고침 시 상태 복원
- 브라우저 히스토리 관리
```

#### 8단계: 에러 처리
```bash
feat: 404 페이지 및 에러 처리 구현

- 존재하지 않는 경로 처리
- API 에러 핸들링
- 사용자 피드백 (토스트)
```

### 리팩토링 커밋 예시

```bash
refactor: 이벤트 핸들러 로직 분리

- 컴포넌트에서 이벤트 로직 추출
- 재사용 가능한 이벤트 핸들러 함수 작성
```

```bash
refactor: API 호출 로직 유틸리티로 분리

- 중복된 fetch 로직 제거
- 에러 처리 일관성 확보
```

```bash
refactor: 상태 업데이트 로직 최적화

- 불필요한 리렌더링 방지
- 성능 개선
```

## 커밋 작성 원칙

### DO ✅

1. **의미 있는 단위로 커밋**
   - 하나의 커밋은 하나의 목적
   - 독립적으로 이해 가능한 변경사항

2. **구체적인 제목 작성**
   ```
   ❌ feat: 기능 추가
   ✅ feat: 상품 검색 기능 구현
   ```

3. **Why를 설명하는 본문 작성**
   ```
   feat: Observer 패턴으로 상태 관리 구현

   React의 useState와 유사한 반응형 상태 관리를 위해
   Observer 패턴을 구현했습니다.
   상태 변경 시 자동으로 구독자들에게 알림을 보내
   UI가 자동으로 업데이트됩니다.
   ```

4. **테스트와 함께 커밋**
   ```
   feat: 무한 스크롤 구현

   - Intersection Observer 활용
   - 스크롤 위치 감지 및 다음 페이지 로드
   - e2e 테스트 통과 확인
   ```

### DON'T ❌

1. **너무 큰 커밋 지양**
   - 여러 기능을 한 번에 커밋하지 않기
   - 리팩토링과 기능 추가를 섞지 않기

2. **모호한 커밋 메시지**
   ```
   ❌ fix: 수정
   ❌ update: 업데이트
   ❌ refactor: 코드 정리
   ```

3. **WIP(Work In Progress) 커밋 남기지 않기**
   - 개발 중간에 임시 커밋하지 않기
   - 완성된 단위로 커밋

4. **포매팅과 로직 변경을 함께 커밋**
   - 포매팅은 별도 커밋으로 분리

## 과제 제출 시 체크리스트

- [ ] 각 커밋이 독립적으로 의미를 가지는가?
- [ ] 커밋 메시지가 변경 내용을 명확히 설명하는가?
- [ ] feat/refactor/fix 등 타입이 올바르게 사용되었는가?
- [ ] 모든 테스트가 통과하는가?
- [ ] 배포가 정상적으로 되는가?

## 참고 자료

- [Conventional Commits](https://www.conventionalcommits.org/ko/v1.0.0/)
- [좋은 git commit 메시지를 위한 영어 사전](https://blog.ull.im/engineering/2019/03/10/logs-on-git.html)
- [커밋 메시지 가이드](https://github.com/RomuloOliveira/commit-messages-guide/blob/master/README_ko-KR.md)
