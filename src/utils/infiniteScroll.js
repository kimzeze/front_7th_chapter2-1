/**
 * 무한 스크롤 초기화
 * @param {string} selector - 감지할 요소 선택자
 * @param {Function} callback - 화면에 보일 때 실행할 함수
 * @returns {IntersectionObserver | null}
 */
export const setupInfiniteScroll = (selector, callback) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
        }
      });
    },
    {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    },
  );

  const $target = document.querySelector(selector);
  if ($target) {
    observer.observe($target);
  }

  return observer;
};

/**
 * 무한 스크롤 해제
 * @param {IntersectionObserver} observer
 */
export const teardownInfiniteScroll = (observer) => {
  if (observer) {
    observer.disconnect();
  }
};
