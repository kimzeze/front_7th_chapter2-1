import * as router from "./core/router.js";
import { store } from "./state/store.js";
import { Homepage } from "./pages/HomePage.js";
import { DetailPage } from "./pages/DetailPage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { showToast } from "./utils/toast.js";
import { openCartModal, closeCartModal } from "./utils/cartModal.js";

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

  // 장바구니 아이콘 클릭 - 모달 열기
  if (e.target.closest("#cart-icon-btn")) {
    openCartModal();
    return;
  }

  // 장바구니 모달 닫기 버튼
  if (e.target.closest("#cart-modal-close-btn")) {
    closeCartModal();
    return;
  }

  // 장바구니 모달 배경 클릭 - 닫기
  if (e.target.id === "cart-modal-backdrop") {
    closeCartModal();
    return;
  }

  // 장바구니 담기 버튼 (상품 카드 클릭보다 먼저 체크)
  const $addToCartBtn = e.target.closest(".add-to-cart-btn");
  if ($addToCartBtn) {
    e.stopPropagation(); // 상품 카드 클릭 이벤트 방지
    const productData = $addToCartBtn.dataset.product;
    if (productData) {
      const product = JSON.parse(productData);
      store.dispatch({ type: "addToCart", payload: product });
      showToast("장바구니에 추가되었습니다", "success");
    }
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

  // 카테고리 필터 - 1depth
  const $category1Btn = e.target.closest(".category1-filter-btn");
  if ($category1Btn) {
    const category1 = $category1Btn.dataset.category1;
    router.updateQuery({ category1, category2: undefined });
    return;
  }

  // 카테고리 필터 - 2depth
  const $category2Btn = e.target.closest(".category2-filter-btn");
  if ($category2Btn) {
    const category2 = $category2Btn.dataset.category2;
    router.updateQuery({ category2 });
    return;
  }

  // breadcrumb - 전체 (카테고리 초기화)
  const $resetBtn = e.target.closest('[data-breadcrumb="reset"]');
  if ($resetBtn) {
    router.updateQuery({ category1: undefined, category2: undefined });
    return;
  }

  // breadcrumb - category1 클릭 (category2 초기화)
  const $breadcrumbCat1 = e.target.closest('[data-breadcrumb="category1"]');
  if ($breadcrumbCat1) {
    router.updateQuery({ category2: undefined });
    return;
  }
});

// 검색 기능 및 ESC 키 핸들러
document.body.addEventListener("keydown", (e) => {
  // ESC 키로 모달 닫기
  if (e.key === "Escape") {
    closeCartModal();
    return;
  }

  // 검색 기능
  const $searchInput = e.target.closest("#search-input");
  if ($searchInput && e.key === "Enter") {
    const searchValue = $searchInput.value.trim();
    router.updateQuery({ search: searchValue || undefined });
  }
});

// 필터/정렬 기능
document.body.addEventListener("change", (e) => {
  // 페이지당 상품 수 변경
  const $limitSelect = e.target.closest("#limit-select");
  if ($limitSelect) {
    router.updateQuery({ limit: $limitSelect.value });
    return;
  }

  // 정렬 변경
  const $sortSelect = e.target.closest("#sort-select");
  if ($sortSelect) {
    router.updateQuery({ sort: $sortSelect.value });
    return;
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
