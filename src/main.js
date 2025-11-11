import { Homepage } from "./pages/HomePage.js";
import { getProducts, getProduct } from "./api/productApi.js";

import { DetailPage } from "./pages/DetailPage.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

const render = async () => {
  const $root = document.querySelector("#root");

  if (location.pathname === "/") {
    $root.innerHTML = Homepage({ loading: true });
    const data = await getProducts();
    $root.innerHTML = Homepage({ ...data, loading: false });

    document.body.addEventListener("click", (e) => {
      if (e.target.closest(".product-card")) {
        const productId = e.target.closest(".product-card").dataset.productId;
        history.pushState(null, null, `/product/${productId}`);
        render();
      }
    });
  } else {
    $root.innerHTML = DetailPage({ loading: true });
    const productId = location.pathname.split("/").pop();
    const data = await getProduct(productId);

    $root.innerHTML = DetailPage({ product: data, loading: false });
  }
  window.addEventListener("popstate", () => {
    render();
  });
};

const main = async () => {
  render();
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
