import { PageLayout } from "./PageLayout.js";
import { SearchForm, ProductList } from "../components/index.js";

export const Homepage = ({ filters, pagination, products, loading }) => {
  return PageLayout({
    children: /* HTML */ ` ${SearchForm({ filters, pagination })} ${ProductList({ loading, products })} `,
  });
};
