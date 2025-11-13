import { createStore } from "../core/store.js";
import { save, load } from "../core/storage.js";

/**
 * 앱 전역 Store
 *
 * 상태 구조:
 * - home: 홈페이지 상태 (상품 목록)
 * - detail: 상세 페이지 상태 (단일 상품)
 * - cart: 장바구니
 *
 * loading/error 패턴:
 * - pending: 로딩 시작
 * - set: 성공
 * - error: 에러
 */
export const store = createStore({
  // ===== 초기 상태 =====
  state: {
    // 홈페이지 (상품 목록)
    home: {
      products: [],
      filters: {},
      pagination: {},
      loading: false,
      error: null,
    },

    // 카테고리
    categories: {},

    // 상세 페이지 (단일 상품)
    detail: {
      product: null,
      relatedProducts: [],
      loading: false,
      error: null,
    },

    // 장바구니 (localStorage에서 복원)
    cart: load("shopping_cart") || [],
  },

  // ===== 액션 =====
  actions: {
    // ━━━━━ Home (상품 목록) ━━━━━

    // 로딩 시작
    pendingProducts(setState) {
      setState({
        home: {
          products: [],
          filters: {},
          pagination: {},
          loading: true,
          error: null,
        },
      });
    },

    // 성공
    setProducts(setState, data) {
      setState({
        home: {
          products: data.products || [],
          filters: data.filters || {},
          pagination: data.pagination || {},
          loading: false,
          error: null,
        },
      });
    },

    // 에러
    errorProducts(setState, error) {
      setState({
        home: {
          products: [],
          filters: {},
          pagination: {},
          loading: false,
          error: error.message || "상품 로딩 실패",
        },
      });
    },

    // ━━━━━ Categories (카테고리) ━━━━━

    // 카테고리 설정
    setCategories(setState, categories) {
      setState({ categories });
    },

    // ━━━━━ Detail (상품 상세) ━━━━━

    // 로딩 시작
    pendingProduct(setState) {
      setState({
        detail: {
          product: null,
          relatedProducts: [],
          loading: true,
          error: null,
        },
      });
    },

    // 성공
    setProduct(setState, product, getState) {
      const currentState = getState();
      setState({
        detail: {
          product,
          relatedProducts: currentState.detail.relatedProducts || [],
          loading: false,
          error: null,
        },
      });
    },

    // 관련 상품 설정
    setRelatedProducts(setState, relatedProducts, getState) {
      const currentState = getState();
      setState({
        detail: {
          ...currentState.detail,
          relatedProducts,
        },
      });
    },

    // 에러
    errorProduct(setState, error) {
      setState({
        detail: {
          product: null,
          relatedProducts: [],
          loading: false,
          error: error.message || "상품 상세 로딩 실패",
        },
      });
    },

    // ━━━━━ Cart (장바구니) ━━━━━

    // 장바구니에 상품 추가
    addToCart(setState, product, getState) {
      const currentState = getState();
      const cart = [...currentState.cart];

      // 이미 있는 상품인지 확인
      const existing = cart.find((item) => item.id === product.id);

      if (existing) {
        // 수량만 증가 (product.quantity가 있으면 그만큼, 없으면 1)
        existing.quantity += product.quantity || 1;
      } else {
        // 새로 추가 (product.quantity가 있으면 그대로, 없으면 1)
        cart.push({ ...product, quantity: product.quantity || 1 });
      }

      // localStorage에 저장
      save("shopping_cart", cart);

      // 상태 업데이트
      setState({ cart });
    },

    // 장바구니에서 상품 제거
    removeFromCart(setState, productId, getState) {
      const currentState = getState();
      const cart = currentState.cart.filter((item) => item.id !== productId);

      save("shopping_cart", cart);
      setState({ cart });
    },

    // 수량 변경
    updateQuantity(setState, { productId, quantity }, getState) {
      const currentState = getState();
      const cart = [...currentState.cart];
      const item = cart.find((item) => item.id === productId);

      if (item) {
        // 최소 수량은 1
        item.quantity = Math.max(1, quantity);
        save("shopping_cart", cart);
        setState({ cart });
      }
    },

    // 장바구니 전체 비우기
    clearCart(setState) {
      save("shopping_cart", []);
      setState({ cart: [] });
    },
  },
});
