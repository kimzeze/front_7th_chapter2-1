import * as router from "./core/router.js";
import { store } from "./state/store.js";
import { Homepage } from "./pages/HomePage.js";
import { DetailPage } from "./pages/DetailPage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { getProducts, getProduct } from "./api/productApi.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

// ===== 1. 라우트 설정 =====
router.setup({
  "/": Homepage,
  "/product/:id": DetailPage,
  "*": NotFoundPage,
});

// ===== 2. 렌더링 함수 =====
const render = async () => {
  const route = router.getCurrentRoute();
  const state = store.getState();
  const $root = document.querySelector("#root");

  // 라우트에 따라 데이터를 가져와서 렌더링
  if (route.name === "/") {
    // 홈페이지: 상품 목록
    // Store의 loading 상태가 true이면 로딩 표시
    if (state.home.loading) {
      $root.innerHTML = route.component({ loading: true });
      return;
    }

    // 데이터가 없으면 API 호출
    if (state.home.products.length === 0 && !state.home.error) {
      store.dispatch({ type: "pendingProducts" });
      try {
        const data = await getProducts(route.query);
        store.dispatch({ type: "setProducts", payload: data });
      } catch (error) {
        store.dispatch({ type: "errorProducts", payload: error });
      }
      return;
    }

    // Store의 상태로 렌더링
    $root.innerHTML = route.component({
      ...state.home,
      loading: false,
    });
  } else if (route.name === "/product/:id") {
    // 상세 페이지: 특정 상품
    if (state.detail.loading) {
      $root.innerHTML = route.component({ loading: true });
      return;
    }

    const productId = route.params.id;

    // 상품이 없거나 다른 상품이면 API 호출
    if (!state.detail.product || state.detail.product.productId !== productId) {
      store.dispatch({ type: "pendingProduct" });
      try {
        const product = await getProduct(productId);
        store.dispatch({ type: "setProduct", payload: product });
      } catch (error) {
        store.dispatch({ type: "errorProduct", payload: error });
      }
      return;
    }

    // Store의 상태로 렌더링
    $root.innerHTML = route.component({
      product: state.detail.product,
      loading: false,
    });
  } else {
    // 404 페이지
    $root.innerHTML = route.component();
  }
};

// ===== 3. Router, Store 구독 =====
// Router나 Store 상태가 변경되면 자동으로 render 실행
router.subscribe(render);
store.subscribe(render);

// ===== 4. 전역 이벤트 핸들러 =====
document.body.addEventListener("click", (e) => {
  // 링크 클릭 처리 (a 태그 또는 data-link 속성)
  const $link = e.target.closest('a[href^="/"]');
  if ($link) {
    e.preventDefault();
    router.push($link.getAttribute("href"));
    return;
  }

  // 상품 카드 클릭 처리
  const $productCard = e.target.closest(".product-card");
  if ($productCard) {
    const productId = $productCard.dataset.productId;
    router.push(`/product/${productId}`);
    return;
  }

  // 관련 상품 클릭 처리
  const $relatedProduct = e.target.closest(".related-product-card");
  if ($relatedProduct) {
    const productId = $relatedProduct.dataset.productId;
    router.push(`/product/${productId}`);
    return;
  }

  // "상품 목록으로 돌아가기" 버튼
  if (e.target.closest(".go-to-product-list")) {
    router.push("/");
    return;
  }
});

// ===== 5. 애플리케이션 시작 =====
const main = async () => {
  router.push(location.pathname + location.search);
};

if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
