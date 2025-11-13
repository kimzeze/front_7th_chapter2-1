/**
 * Lifecycle 시스템 - withLifecycle HOC
 *
 * React의 useEffect와 유사한 생명주기 관리 시스템
 * - mount: 컴포넌트가 처음 렌더링될 때 1번만 실행
 * - watch: 감시하는 값이 변경될 때마다 실행
 * - unmount: 컴포넌트가 제거될 때 정리 작업
 *
 * @param {Object} hooks - { mount, watchs, unmount }
 * @param {Function} renderFn - 렌더링 함수
 * @returns {Function} 래핑된 컴포넌트
 */
export function withLifecycle(hooks, renderFn) {
  // 내부 상태 (클로저)
  let isMounted = false; // mount가 실행되었는지 여부
  let oldValues = {}; // watch의 이전 값 저장소

  const wrappedComponent = (props) => {
    let justMounted = false;

    // 1. mount 실행 (처음 1번만)
    if (!isMounted && hooks.mount) {
      isMounted = true;
      justMounted = true;

      // mount 호출 전에 watch의 초기값 저장
      // (mount 내부에서 dispatch -> render 시 watch가 변경 감지하지 않도록)
      if (hooks.watchs) {
        hooks.watchs.forEach(({ target }) => {
          const initialValue = target();
          const key = target.toString();
          oldValues[key] = initialValue;
        });
      }

      hooks.mount();
    }

    // 2. watch 실행 (값 변경 감지)
    if (hooks.watchs && !justMounted) {
      hooks.watchs.forEach(({ target, callback }) => {
        const newValue = target();
        const key = target.toString();
        const oldValue = oldValues[key];

        // 객체를 JSON.stringify로 비교
        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
          callback(newValue, oldValue);
          oldValues[key] = newValue;
        }
      });
    }

    // 3. 렌더링
    return renderFn(props);
  };

  // unmount 함수 추가
  wrappedComponent.unmount = () => {
    if (hooks.unmount) {
      hooks.unmount();
    }
    // 상태 초기화
    isMounted = false;
    oldValues = {};
  };

  return wrappedComponent;
}
