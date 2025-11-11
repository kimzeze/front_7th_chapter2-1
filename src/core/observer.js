/**
 * Observer 패턴 구현
 *
 * 실생활 비유: YouTube 구독 시스템
 * - subscribe(): 채널 구독 버튼 누르기
 * - notify(): 새 영상 올리면 구독자들에게 알림 보내기
 * - unsubscribe(): 구독 취소
 *
 * 사용 목적:
 * - Router: URL이 변경되면 → 자동으로 화면 렌더링
 * - Store: 상태가 변경되면 → 자동으로 UI 업데이트
 *
 * @returns {Object} { subscribe, unsubscribe, notify }
 */
export const createObserver = () => {
  const observers = new Set();

  const subscribe = (callback) => {
    if (typeof callback !== "function") {
      return;
    }
    observers.add(callback);
  };

  const unsubscribe = (callback) => {
    observers.delete(callback);
  };
  const notify = (data) => {
    observers.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("Observer callback error:", error);
      }
    });
  };

  return {
    subscribe,
    unsubscribe,
    notify,
  };
};

// ===== 사용 예시 =====
//
// import { createObserver } from './core/observer.js';
//
// // Observer 생성
// const routerObserver = createObserver();
//
// // 구독자 추가
// routerObserver.subscribe((route) => {
//   console.log("URL 변경됨:", route);
//   render();  // 자동으로 렌더링!
// });
//
// // 알림 보내기 (URL이 변경되었을 때)
// routerObserver.notify({ path: "/product/1" });
// // → "URL 변경됨: { path: "/product/1" }"
// // → render() 자동 실행!
