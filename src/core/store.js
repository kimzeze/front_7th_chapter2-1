import { createObserver } from "./observer.js";

/**
 * Store 생성 (상태 관리)
 *
 * Observer 패턴 기반 상태 관리
 * - 상태 변경 시 자동으로 구독자들에게 알림
 * - Redux의 단순화 버전
 * - Flux 패턴 적용 (단방향 데이터 흐름)
 *
 * @param {Object} config - { state, actions }
 * @returns {Object} { subscribe, getState, dispatch }
 *
 * 사용 예시:
 * const store = createStore({
 *   state: { count: 0 },
 *   actions: {
 *     increment(setState) {
 *       setState({ count: getState().count + 1 });
 *     }
 *   }
 * });
 *
 * store.subscribe(() => render());
 * store.dispatch({ type: 'increment' });
 */
export const createStore = (config) => {
  const observer = createObserver();
  let state = config.state;
  const actions = config.actions;

  // ===== 1. 구독 (Subscribe) =====
  // 상태 변경 시 실행할 함수 등록
  const subscribe = (callback) => {
    observer.subscribe(callback);
  };

  // ===== 2. 상태 읽기 (GetState) =====
  // 현재 상태를 반환
  const getState = () => state;

  // ===== 3. 상태 업데이트 (SetState) - 내부용 =====
  // 상태를 업데이트하고 구독자들에게 알림
  const setState = (updates) => {
    // 불변성 유지: 기존 state를 변경하지 않고 새로운 객체 생성
    state = { ...state, ...updates };

    // 구독자들에게 알림 (자동 렌더링!)
    observer.notify(state);
  };

  // ===== 4. 액션 디스패치 (Dispatch) =====
  // 액션을 실행하여 상태 변경
  // Redux의 dispatch와 유사
  const dispatch = ({ type, payload }) => {
    const action = actions[type];

    if (action) {
      // 액션 함수 실행
      // - setState: 상태 업데이트 함수
      // - payload: 액션에 전달된 데이터
      // - getState: 현재 상태를 읽는 함수
      action(setState, payload, getState);
    } else {
      console.warn(`Unknown action: ${type}`);
    }
  };

  // ===== 공개 API =====
  return {
    subscribe, // 구독
    getState, // 상태 읽기
    dispatch, // 액션 실행
  };
};

// ===== 사용 예시 =====
//
// // 1. Store 생성
// const store = createStore({
//   state: {
//     products: [],
//     loading: false,
//     error: null,
//   },
//   actions: {
//     // 로딩 시작
//     pendingProducts(setState) {
//       setState({ loading: true, error: null });
//     },
//
//     // 상품 로드 성공
//     setProducts(setState, products) {
//       setState({ products, loading: false, error: null });
//     },
//
//     // 에러 발생
//     errorProducts(setState, error) {
//       setState({ loading: false, error: error.message });
//     },
//   },
// });
//
// // 2. 구독 (상태 변경 시 자동 렌더링)
// store.subscribe(() => {
//   console.log("상태 변경됨:", store.getState());
//   render();
// });
//
// // 3. 액션 디스패치
// store.dispatch({ type: 'pendingProducts' });
// // → loading: true
//
// store.dispatch({ type: 'setProducts', payload: [{ id: 1, name: '상품' }] });
// // → products: [...], loading: false
