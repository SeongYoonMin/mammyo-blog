import Link from "next/link";
import { CardGrid, CardItem } from "@/components/motion";
import type { PostSummary } from "@/lib/posts";
import { formatDate } from "@/lib/site";

/** 페이지 제목 + 설명 */
export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-[32px] font-medium leading-tight tracking-tight">{title}</h1>
      {description && <p className="mt-2 text-muted">{description}</p>}
    </header>
  );
}

/** 알약형 태그 필터. active가 없으면 '전체'가 선택된 상태 */
export function TagFilter({ tags, active }: { tags: string[]; active?: string }) {
  const items = [{ label: "전체", href: "/", on: !active }].concat(
    tags.map((t) => ({ label: t, href: `/tags/${encodeURIComponent(t)}`, on: t === active })),
  );
  return (
    <nav aria-label="태그 필터" className="mb-6 flex flex-wrap gap-1.5">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={i.on ? "page" : undefined}
          className={`h-8 rounded-full px-3 text-[13px] leading-8 transition-colors ${
            i.on ? "bg-chip-active text-chip-active-fg" : "bg-chip text-muted hover:text-fg"
          }`}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

export function PostList({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) return <p className="text-muted">아직 글이 없습니다.</p>;

  return (
    <CardGrid className="grid gap-3 sm:grid-cols-2">
      {posts.map((post) => (
        <CardItem
          key={post.slug}
          className="group relative flex flex-col rounded-panel bg-elevated p-5 transition-colors hover:bg-elevated-hover"
        >
          <time dateTime={post.publishedAt.toISOString()} className="text-[13px] text-muted">
            {formatDate(post.publishedAt)}
          </time>
          <h2 className="mt-3 text-lg font-medium leading-snug">
            {/* 카드 전체를 클릭 영역으로 (태그 링크는 z-10으로 위에 둠) */}
            <Link href={`/posts/${post.slug}`} className="after:absolute after:inset-0 after:rounded-panel">
              {post.title}
            </Link>
          </h2>
          <p className="mt-1.5 line-clamp-2 text-[15px] text-muted">{post.description}</p>
          {post.tags.length > 0 && (
            <div className="relative z-10 mt-auto flex flex-wrap gap-1.5 pt-5">
              {post.tags.map((tag) => (
                <TagLink key={tag} tag={tag} />
              ))}
            </div>
          )}
        </CardItem>
      ))}
    </CardGrid>
  );
}

export function TagLink({ tag }: { tag: string }) {
  return (
    <Link
      href={`/tags/${encodeURIComponent(tag)}`}
      className="rounded-full bg-chip px-2.5 py-0.5 text-[13px] text-muted transition-colors hover:text-fg"
    >
      #{tag}
    </Link>
  );
}
