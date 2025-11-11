import { PageLayout } from "./PageLayout";
/**
 * 404 Not Found 페이지
 */
export function NotFoundPage() {
  return PageLayout({
    children: /* HTML */ `
      <div
        style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
      padding: 2rem;
    "
      >
        <h1
          style="
        font-size: 6rem;
        margin: 0;
        color: #333;
      "
        >
          404
        </h1>
        <p
          style="
        font-size: 1.5rem;
        margin: 1rem 0 2rem;
        color: #666;
      "
        >
          페이지를 찾을 수 없습니다
        </p>
        <a
          href="/"
          style="
        display: inline-block;
        padding: 0.75rem 1.5rem;
        background-color: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 500;
        transition: background-color 0.2s;
      "
          onmouseover="this.style.backgroundColor='#0056b3'"
          onmouseout="this.style.backgroundColor='#007bff'"
        >
          홈으로 돌아가기
        </a>
      </div>
    `,
  });
}
