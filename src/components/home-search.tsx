import { UI } from "@/lib/ui-text";
import Icon from "./icon";

/**
 * Home-page search: a plain GET form to /books?q=… (no JavaScript, no
 * suggestions, no search data loaded). Candidates appear on /books itself.
 */
export default function HomeSearch() {
  return (
    <form action="/books" method="get" role="search" className="flex flex-col gap-1.5">
      <label htmlFor="home-search" className="sr-only">
        {UI.search}
      </label>
      <div className="join w-full">
        <label className="input join-item w-full">
          <Icon name="search" className="text-muted" />
          <input
            id="home-search"
            name="q"
            type="search"
            placeholder="書名・著者・版本など"
            aria-describedby="home-search-hint"
            enterKeyHint="search"
          />
        </label>
        <button type="submit" className="btn btn-primary join-item">
          {UI.search}
        </button>
      </div>
      <p id="home-search-hint" className="text-[0.8125rem] leading-normal text-muted">
        異体字・拼音（例：zhouyi、zy）でも検索できます。
      </p>
    </form>
  );
}
