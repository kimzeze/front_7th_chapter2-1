import { Header, Footer } from "../components/index.js";

export const PageLayout = ({ children }) => {
  return /* HTML */ `
    <div class="min-h-screen bg-gray-50">
      <main class="max-w-md mx-auto px-4 py-4">${Header()} ${children}</main>
      ${Footer()}
    </div>
  `;
};
