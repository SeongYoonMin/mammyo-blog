import Link from "next/link";
import type { PostSummary } from "@/lib/posts";
import { formatDate } from "@/lib/site";

/*
 * 글 목록 표현 컴포넌트 (flex.team/blog 참고: 큰 썸네일 + "태그 | 날짜" + 제목 + 요약).
 * 서버 페이지와 클라이언트 HomeFeed 양쪽에서 쓰므로 서버 전용 코드를 두지 않는다.
 */

/** 페이지 제목 + 설명 */
export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-[32px] font-medium leading-tight tracking-tight">{title}</h1>
      {description && <p className="mt-2 text-muted">{description}</p>}
    </header>
  );
}

export const pillClass = "relative h-8 rounded-full px-3 text-[13px] leading-8 transition-colors";

/** 알약형 태그 필터(링크). active가 없으면 '전체'가 선택된 상태 */
export function TagFilter({ tags, active }: { tags: string[]; active?: string }) {
  const items = [{ label: "전체", href: "/", on: !active }].concat(
    tags.map((t) => ({ label: t, href: `/tags/${encodeURIComponent(t)}`, on: t === active })),
  );
  return (
    <nav aria-label="태그 필터" className="mb-8 flex flex-wrap gap-1.5">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={i.on ? "page" : undefined}
          className={`${pillClass} ${i.on ? "bg-chip-active text-chip-active-fg" : "bg-chip text-muted hover:text-fg"}`}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

// 썸네일이 없는 글은 첫 태그로 대표 컬러(#AA9281)의 명도 단계를 골라 제목을 크게 넣은 커버를 만든다.
// [배경, 글자] — 모두 대비 4.5:1 이상
const coverColors = [
  ["#ede5de", "#2a211b"],
  ["#d6c6b9", "#2a211b"],
  ["#aa9281", "#2a211b"],
  ["#6f5a4b", "#ffffff"],
] as const;
function coverColor(seed: string) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
  return coverColors[Math.abs(h) % coverColors.length];
}

const zoom = "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]";

/**
 * 16:10 썸네일. 카드(.group) hover 시 살짝 확대.
 * bare: 커버 이미지가 없을 때 태그·제목 없이 색 배경(+작은 이미지 아이콘)만 그린다 — 옆에 제목이 따로 있는 admin 목록용.
 */
export function PostCover({ post, large, bare }: { post: PostSummary; large?: boolean; bare?: boolean }) {
  const [backgroundColor, color] = coverColor(post.tags[0] ?? post.slug);
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-[14px] bg-elevated">
      {post.coverImage ? (
        // 외부 URL을 그대로 쓰므로 next/image(remotePatterns) 대신 img 사용
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt=""
          loading={large ? "eager" : "lazy"}
          className={`size-full object-cover ${zoom}`}
        />
      ) : bare ? (
        <div
          aria-hidden
          style={{ backgroundColor, color }}
          className={`flex size-full items-center justify-center ${zoom}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-[22%] min-w-4 opacity-35">
            <rect x="3" y="4" width="18" height="16" rx="2.5" />
            <circle cx="9" cy="10" r="1.75" />
            <path d="m21 16-5-5-9 9" />
          </svg>
        </div>
      ) : (
        <div
          aria-hidden
          style={{ backgroundColor, color }}
          className={`flex size-full flex-col justify-between p-[7%] ${zoom}`}
        >
          {post.tags[0] && (
            <span className="w-fit rounded-full border border-current/40 px-2.5 text-[11px] leading-5">
              {post.tags[0]}
            </span>
          )}
          <p
            className={`line-clamp-3 font-semibold leading-snug tracking-tight ${large ? "text-[clamp(20px,3vw,30px)]" : "text-[clamp(17px,2.2vw,22px)]"}`}
          >
            {post.title}
          </p>
        </div>
      )}
    </div>
  );
}

/** "태그 | 날짜" 메타 줄 */
function PostMeta({ post }: { post: PostSummary }) {
  return (
    <div className="flex items-center gap-2 text-[13px] text-muted">
      {post.tags[0] && (
        <>
          <Link
            href={`/tags/${encodeURIComponent(post.tags[0])}`}
            className="relative z-10 transition-colors hover:text-accent"
          >
            {post.tags[0]}
          </Link>
          <span aria-hidden className="h-3 w-px bg-hairline" />
        </>
      )}
      <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
    </div>
  );
}

/** 카드 전체를 클릭 영역으로 만드는 제목 링크. hover 시 밑줄이 왼쪽에서 그려짐 */
function TitleLink({ post }: { post: PostSummary }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="bg-[linear-gradient(var(--accent),var(--accent))] bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover:bg-[length:100%_2px] after:absolute after:inset-0"
    >
      {post.title}
    </Link>
  );
}

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="group relative flex flex-col">
      <PostCover post={post} />
      <div className="mt-4">
        <PostMeta post={post} />
        <h2 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug tracking-tight">
          <TitleLink post={post} />
        </h2>
        <p className="mt-1.5 line-clamp-2 text-[14px] text-muted">{post.description}</p>
      </div>
    </article>
  );
}

/** 커버스토리: 최신 글을 텍스트(좌) + 큰 썸네일(우)로 강조 */
export function CoverStory({ post }: { post: PostSummary }) {
  return (
    <>
      <div className="mb-5 flex items-center gap-3">
        <span className="text-[13px] font-medium text-accent">커버스토리</span>
        <span aria-hidden className="h-px flex-1 bg-hairline" />
      </div>
      <article className="group relative grid items-center gap-5 md:grid-cols-[2fr_3fr] md:gap-8">
        <div className="order-2 md:order-1">
          <PostMeta post={post} />
          <h2 className="mt-3 text-[clamp(22px,3vw,28px)] font-semibold leading-snug tracking-tight">
            <TitleLink post={post} />
          </h2>
          <p className="mt-3 line-clamp-3 text-[15px] text-muted">{post.description}</p>
        </div>
        <div className="order-1 md:order-2">
          <PostCover post={post} large />
        </div>
      </article>
    </>
  );
}

export const gridClass = "grid gap-x-6 gap-y-10 sm:grid-cols-2";

/** 정적 카드 그리드 (태그 페이지용) */
export function PostList({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) return <p className="text-muted">아직 글이 없습니다.</p>;
  return (
    <ul className={gridClass}>
      {posts.map((post) => (
        <li key={post.slug}>
          <PostCard post={post} />
        </li>
      ))}
    </ul>
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
