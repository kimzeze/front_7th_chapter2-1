import { createObserver } from "./observer.js";

/**
 * Router 시스템
 *
 * Observer 패턴 기반 SPA 라우터
 * - 선언형 라우트 설정
 * - URL 파라미터 추출 (/product/:id)
 * - 쿼리 파라미터 관리 (?search=abc)
 * - 자동 렌더링 (subscribe)
 */

// ===== 1. Observer 및 상태 초기화 =====
const observer = createObserver();
let routes = {};
let currentRoute = { name: "", params: {}, query: {}, component: null };

/**
 * 라우트 설정 (선언형)
 * @param {Object} routeConfig - { "/": HomePage, "/product/:id": DetailPage, "*": NotFoundPage }
 *
 * 사용 예시:
 * setup({
 *   "/": HomePage,
 *   "/products/:id": DetailPage,
 *   "*": NotFoundPage
 * });
 */
export const setup = (routeConfig) => {
  routes = routeConfig;
  updateCurrentRoute();
};

/**
 * 구독 - 라우트 변경 시 자동 실행
 * @param {Function} callback - 실행할 함수
 *
 * 사용 예시:
 * subscribe((route) => {
 *   console.log("라우트 변경:", route);
 *   render();
 * });
 */
export const subscribe = (callback) => {
  observer.subscribe(callback);
};

/**
 * 네비게이션 (페이지 이동)
 * @param {string} path - 이동할 경로
 *
 * 사용 예시:
 * push("/product/123");
 */
export const push = (path) => {
  const basePath = import.meta.env.BASE_URL;
  const fullPath = basePath === "/" ? path : basePath.replace(/\/$/, "") + path;
  window.history.pushState(null, "", fullPath);
  updateCurrentRoute();
  observer.notify(currentRoute); // 구독자들에게 알림!
};

/**
 * 현재 라우트 정보 반환
 * @returns {Object} { name, params, query, component }
 *
 * 사용 예시:
 * const route = getCurrentRoute();
 * console.log(route.params.id); // "123"
 */
export const getCurrentRoute = () => currentRoute;

/**
 * 쿼리 파라미터 업데이트 (replaceState)
 * @param {Object} updates - 업데이트할 쿼리 객체
 *
 * 사용 예시:
 * updateQuery({ search: "abc", page: "2" });
 * // → URL이 ?search=abc&page=2 로 변경됨
 *
 * updateQuery({ search: "" });
 * // → search 파라미터 제거됨
 */
export const updateQuery = (updates) => {
  const current = currentRoute.query;
  const merged = { ...current, ...updates };

  // 빈 값 제거
  Object.keys(merged).forEach((key) => {
    if (!merged[key]) delete merged[key];
  });

  // 쿼리 스트링 생성
  const queryString = new URLSearchParams(merged).toString();
  const newPath = `${location.pathname}${queryString ? "?" + queryString : ""}`;

  // replaceState: 히스토리 스택에 추가하지 않고 URL만 변경
  window.history.replaceState(null, "", newPath);
  updateCurrentRoute();
  observer.notify(currentRoute);
};

// ===== 내부 함수 =====

/**
 * 현재 URL을 파싱하여 currentRoute 업데이트
 */
const updateCurrentRoute = () => {
  const basePath = import.meta.env.BASE_URL;
  const pathName = location.pathname;
  const path = pathName.replace(basePath, "/").replace(/\/$/, "") || "/";
  const query = Object.fromEntries(new URLSearchParams(location.search));

  // 등록된 라우트와 매칭
  for (const [pattern, component] of Object.entries(routes)) {
    const match = matchRoute(path, pattern);
    if (match) {
      currentRoute = { name: pattern, params: match.params, query, component };
      return;
    }
  }

  // 매칭 실패 → 404
  currentRoute = { name: "*", params: {}, query, component: routes["*"] };
};

/**
 * URL 패턴 매칭 및 파라미터 추출
 * @param {string} path - 현재 경로 (예: "/product/123")
 * @param {string} pattern - 라우트 패턴 (예: "/product/:id")
 * @returns {Object|null} { params: { id: "123" } } or null
 */
const matchRoute = (path, pattern) => {
  // 404 라우트는 매칭하지 않음 (마지막 fallback)
  if (pattern === "*") return null;

  // 정확히 일치
  if (pattern === path) return { params: {} };

  // 동적 라우트 매칭 (예: /product/:id)
  // 1. :id를 ([^/]+) 정규식으로 변환
  const regex = new RegExp("^" + pattern.replace(/:(\w+)/g, "([^/]+)") + "$");
  const match = path.match(regex);

  if (match) {
    // 2. 파라미터 이름 추출
    const paramNames = [...pattern.matchAll(/:(\w+)/g)].map((m) => m[1]);

    // 3. 파라미터 값과 이름 매핑
    const params = {};
    paramNames.forEach((name, i) => {
      params[name] = match[i + 1];
    });

    return { params };
  }

  return null;
};

// ===== popstate 이벤트 리스너 (뒤로/앞으로 가기) =====
window.addEventListener("popstate", () => {
  updateCurrentRoute();
  observer.notify(currentRoute);
});
