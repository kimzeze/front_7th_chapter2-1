import { CartModal } from "../components/CartModal.js";
import { store } from "../state/store.js";

/**
 * 장바구니 모달 열기
 */
export function openCartModal() {
  // 이미 열려있으면 무시
  if (document.getElementById("cart-modal")) {
    return;
  }

  // 장바구니 상태 가져오기
  const cart = store.getState().cart;

  // 모달 컨테이너 생성
  const modalContainer = document.createElement("div");
  modalContainer.id = "cart-modal";
  modalContainer.className = "fixed inset-0 z-50 bg-black bg-opacity-50";
  modalContainer.innerHTML = CartModal({ cart, selectedIds: [] });

  // body에 추가
  document.body.appendChild(modalContainer);

  // body 스크롤 방지
  document.body.style.overflow = "hidden";
}

/**
 * 장바구니 모달 닫기
 */
export function closeCartModal() {
  const modalContainer = document.getElementById("cart-modal");
  if (modalContainer) {
    modalContainer.remove();
    // body 스크롤 복원
    document.body.style.overflow = "";
  }
}

/**
 * 장바구니 모달 업데이트 (선택 상태 반영)
 */
export function updateCartModal(selectedIds = []) {
  const modalContainer = document.getElementById("cart-modal");
  if (!modalContainer) {
    return;
  }

  const cart = store.getState().cart;
  modalContainer.innerHTML = CartModal({ cart, selectedIds });
}
