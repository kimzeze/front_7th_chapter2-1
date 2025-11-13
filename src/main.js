import * as router from "./core/router.js";
import { store } from "./state/store.js";
import { Homepage } from "./pages/HomePage.js";
import { DetailPage } from "./pages/DetailPage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { showToast } from "./utils/toast.js";
import { openCartModal, closeCartModal, getSelectedIds, setSelectedIds } from "./utils/cartModal.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
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

  // 모달이 열려있으면 전체 렌더링 스킵 (모달이 사라지는 것 방지)
  // 단, 장바구니 개수는 업데이트
  if (document.getElementById("cart-modal-container")) {
    const cart = store.getState().cart;
    const $cartBadge = document.querySelector("#cart-icon-btn span");
    if ($cartBadge) {
      if (cart.length > 0) {
        $cartBadge.textContent = cart.length;
      } else {
        // 장바구니가 비었으면 뱃지 제거
        $cartBadge.remove();
      }
    } else if (cart.length > 0) {
      // 뱃지가 없는데 장바구니에 상품이 있으면 뱃지 추가
      const $cartBtn = document.getElementById("cart-icon-btn");
      if ($cartBtn) {
        const badge = document.createElement("span");
        badge.className =
          "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center";
        badge.textContent = cart.length;
        $cartBtn.appendChild(badge);
      }
    }
    return;
  }

  // 다른 컴포넌트로 전환 시에만 unmount 호출
  if (currentComponent && currentComponent !== newComponent) {
    if (currentComponent.unmount) {
      currentComponent.unmount();
    }
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
  if (e.target.classList.contains("cart-modal-overlay")) {
    closeCartModal();
    return;
  }

  // 장바구니 모달 내 기능들
  const $cartModal = document.getElementById("cart-modal-container");
  if ($cartModal) {
    // 전체 비우기
    const $clearCartBtn = e.target.closest("#cart-modal-clear-cart-btn");
    if ($clearCartBtn) {
      const cart = store.getState().cart;
      if (cart.length > 0) {
        store.dispatch({ type: "clearCart" });
        setSelectedIds([]); // 선택 상태도 초기화
        showToast("장바구니가 비워졌습니다", "info");
      }
      return;
    }

    // 선택 삭제
    const $removeSelectedBtn = e.target.closest("#cart-modal-remove-selected-btn");
    if ($removeSelectedBtn) {
      const selectedIds = getSelectedIds();
      if (selectedIds.length > 0) {
        selectedIds.forEach((productId) => {
          store.dispatch({ type: "removeFromCart", payload: productId });
        });
        setSelectedIds([]);
        showToast(`${selectedIds.length}개 상품이 삭제되었습니다`, "info");
      }
      return;
    }

    // 수량 증가
    const $increaseBtn = e.target.closest(".quantity-increase-btn");
    if ($increaseBtn) {
      const productId = $increaseBtn.dataset.productId;
      const cart = store.getState().cart;
      const item = cart.find((item) => item.id === productId);
      if (item) {
        store.dispatch({
          type: "updateQuantity",
          payload: { productId, quantity: item.quantity + 1 },
        });
      }
      return;
    }

    // 수량 감소
    const $decreaseBtn = e.target.closest(".quantity-decrease-btn");
    if ($decreaseBtn) {
      const productId = $decreaseBtn.dataset.productId;
      const cart = store.getState().cart;
      const item = cart.find((item) => item.id === productId);
      if (item && item.quantity > 1) {
        store.dispatch({
          type: "updateQuantity",
          payload: { productId, quantity: item.quantity - 1 },
        });
      }
      return;
    }

    // 개별 삭제
    const $removeBtn = e.target.closest(".cart-item-remove-btn");
    if ($removeBtn) {
      const productId = $removeBtn.dataset.productId;
      store.dispatch({ type: "removeFromCart", payload: productId });
      // 선택 상태에서도 제거
      const selectedIds = getSelectedIds();
      setSelectedIds(selectedIds.filter((id) => id !== productId));
      showToast("상품이 삭제되었습니다", "info");
      return;
    }

    // 상품 이미지/제목 클릭 - 상세 페이지로 이동
    const $cartItemImage = e.target.closest(".cart-item-image");
    const $cartItemTitle = e.target.closest(".cart-item-title");
    if ($cartItemImage || $cartItemTitle) {
      const productId = ($cartItemImage || $cartItemTitle).dataset.productId;
      closeCartModal();
      router.push(`/product/${productId}`);
      return;
    }
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
    // 히스토리가 있으면 뒤로가기, 없으면 홈으로
    if (window.history.length > 1) {
      window.history.back();
    } else {
      router.push("/");
    }
    return;
  }

  // 상세 페이지 브레드크럼 - 카테고리 클릭
  const $breadcrumbLink = e.target.closest(".breadcrumb-link");
  if ($breadcrumbLink) {
    const category1 = $breadcrumbLink.dataset.category1;
    const category2 = $breadcrumbLink.dataset.category2;

    // category2 클릭 시: category1 + category2 필터
    if (category2) {
      // category1도 함께 전달해야 하므로 상위 요소에서 찾기
      const $nav = $breadcrumbLink.closest("nav");
      const $category1Btn = $nav.querySelector("[data-category1]");
      const cat1Value = $category1Btn ? $category1Btn.dataset.category1 : "";
      router.push(`/?category1=${cat1Value}&category2=${category2}`);
    }
    // category1 클릭 시: category1만 필터
    else if (category1) {
      router.push(`/?category1=${category1}`);
    }
    return;
  }

  // 상세 페이지 - 수량 증가
  const $quantityIncrease = e.target.closest("#quantity-increase");
  if ($quantityIncrease) {
    const $quantityInput = document.getElementById("quantity-input");
    if ($quantityInput) {
      const currentValue = parseInt($quantityInput.value);
      const maxValue = parseInt($quantityInput.max);
      if (currentValue < maxValue) {
        $quantityInput.value = currentValue + 1;
      }
    }
    return;
  }

  // 상세 페이지 - 수량 감소
  const $quantityDecrease = e.target.closest("#quantity-decrease");
  if ($quantityDecrease) {
    const $quantityInput = document.getElementById("quantity-input");
    if ($quantityInput) {
      const currentValue = parseInt($quantityInput.value);
      const minValue = parseInt($quantityInput.min);
      if (currentValue > minValue) {
        $quantityInput.value = currentValue - 1;
      }
    }
    return;
  }

  // 상세 페이지 - 장바구니 담기
  const $detailAddToCartBtn = e.target.closest("#add-to-cart-btn");
  if ($detailAddToCartBtn) {
    const $quantityInput = document.getElementById("quantity-input");
    const quantity = $quantityInput ? parseInt($quantityInput.value) : 1;
    const productId = $detailAddToCartBtn.dataset.productId;

    // store에서 현재 상품 정보 가져오기
    const { product } = store.getState().detail;
    if (product) {
      // 장바구니에 추가 (또는 기존 수량 업데이트)
      const cart = store.getState().cart;
      const existingItem = cart.find((item) => item.id === productId);

      if (existingItem) {
        // 이미 있으면 수량 업데이트
        store.dispatch({
          type: "updateQuantity",
          payload: { productId, quantity: existingItem.quantity + quantity },
        });
      } else {
        // 없으면 새로 추가
        store.dispatch({
          type: "addToCart",
          payload: {
            id: productId,
            title: product.title,
            image: product.image,
            lprice: product.lprice,
            brand: product.brand,
            quantity: quantity,
          },
        });
      }
      showToast(`${quantity}개 상품이 장바구니에 추가되었습니다`, "success");
    }
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

// 필터/정렬 및 체크박스 기능
document.body.addEventListener("change", (e) => {
  // 장바구니 모달 체크박스
  const $cartModal = document.getElementById("cart-modal-container");
  if ($cartModal) {
    // 전체 선택 체크박스
    const $selectAllCheckbox = e.target.closest("#cart-modal-select-all-checkbox");
    if ($selectAllCheckbox) {
      const cart = store.getState().cart;
      if ($selectAllCheckbox.checked) {
        // 전체 선택
        setSelectedIds(cart.map((item) => item.id));
      } else {
        // 전체 해제
        setSelectedIds([]);
      }
      return;
    }

    // 개별 체크박스
    const $itemCheckbox = e.target.closest(".cart-item-checkbox");
    if ($itemCheckbox) {
      const productId = $itemCheckbox.dataset.productId;
      const selectedIds = getSelectedIds();

      if ($itemCheckbox.checked) {
        // 선택 추가
        setSelectedIds([...selectedIds, productId]);
      } else {
        // 선택 제거
        setSelectedIds(selectedIds.filter((id) => id !== productId));
      }
      return;
    }
  }

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
  const basePath = import.meta.env.BASE_URL;
  const pathName = location.pathname;
  const relativePath = pathName.replace(basePath, "/").replace(/\/$/, "") || "/";
  router.push(relativePath + location.search);
};

if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
