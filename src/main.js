import * as router from "./core/router.js";
import { store } from "./state/store.js";
import { Homepage } from "./pages/HomePage.js";
import { DetailPage } from "./pages/DetailPage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

// 라우트 설정
router.setup({
  "/": Homepage,
  "/product/:id": DetailPage,
  "*": NotFoundPage,
});

// 현재 컴포넌트 저장 (unmount 호출용)
let currentComponent = null;

// 렌더링 함수
const render = () => {
  const route = router.getCurrentRoute();
  const $root = document.querySelector("#root");
  const newComponent = route.component;

  // 다른 컴포넌트로 전환 시에만 unmount 호출
  if (currentComponent && currentComponent !== newComponent) {
    currentComponent.unmount();
  }

  currentComponent = newComponent;
  $root.innerHTML = newComponent();
};

// Router, Store 구독
router.subscribe(render);
store.subscribe(render);

// 전역 이벤트 핸들러
document.body.addEventListener("click", (e) => {
  // 링크 클릭
  const $link = e.target.closest('a[href^="/"]');
  if ($link) {
    e.preventDefault();
    router.push($link.getAttribute("href"));
    return;
  }

  // 상품 카드 클릭
  const $productCard = e.target.closest(".product-card");
  if ($productCard) {
    const productId = $productCard.dataset.productId;
    router.push(`/product/${productId}`);
    return;
  }

  // 관련 상품 클릭
  const $relatedProduct = e.target.closest(".related-product-card");
  if ($relatedProduct) {
    const productId = $relatedProduct.dataset.productId;
    router.push(`/product/${productId}`);
    return;
  }

  // 상품 목록으로 돌아가기
  if (e.target.closest(".go-to-product-list")) {
    router.push("/");
    return;
  }
});

// 검색 기능
document.body.addEventListener("keydown", (e) => {
  const $searchInput = e.target.closest("#search-input");
  if ($searchInput && e.key === "Enter") {
    const searchValue = $searchInput.value.trim();
    router.updateQuery({ search: searchValue || undefined });
  }
});

// 애플리케이션 시작
const main = async () => {
  router.push(location.pathname + location.search);
};

if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
