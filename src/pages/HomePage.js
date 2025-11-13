import { withLifecycle } from "../core/lifecycle.js";
import * as router from "../core/router.js";
import { store } from "../state/store.js";
import { getProducts } from "../api/productApi.js";
import { PageLayout } from "./PageLayout.js";
import { SearchForm, ProductList } from "../components/index.js";

/**
 * 상품 목록 로드
 * 현재 쿼리 파라미터를 읽어서 API 호출
 */
async function loadProducts() {
  const query = router.getCurrentRoute().query;

  store.dispatch({ type: "pendingProducts" });

  try {
    const data = await getProducts(query);
    store.dispatch({ type: "setProducts", payload: data });
  } catch (error) {
    store.dispatch({ type: "errorProducts", payload: error });
  }
}

/**
 * HomePage - withLifecycle 적용
 */
export const Homepage = withLifecycle(
  {
    // 컴포넌트 초기화 시 1번만 실행
    mount() {
      loadProducts();
    },

    // 쿼리 파라미터 변경 감지
    watchs: [
      {
        target() {
          return router.getCurrentRoute().query;
        },
        callback() {
          loadProducts();
        },
      },
    ],
  },

  // 렌더링 함수
  () => {
    const { products, loading, filters, pagination } = store.getState().home;

    return PageLayout({
      children: /* HTML */ ` ${SearchForm({ filters, pagination })} ${ProductList({ loading, products, pagination })} `,
    });
  },
);
