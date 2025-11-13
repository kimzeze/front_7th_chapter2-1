import { Header, Footer } from "../components/index.js";
import { store } from "../state/store.js";

export const PageLayout = ({ children }) => {
  const cart = store.getState().cart;
  const cartCount = cart.length;

  return /* HTML */ `
    <div class="min-h-screen bg-gray-50">
      <main class="max-w-md mx-auto px-4 py-4">${Header({ cartCount })} ${children}</main>
      ${Footer()}
    </div>
  `;
};
