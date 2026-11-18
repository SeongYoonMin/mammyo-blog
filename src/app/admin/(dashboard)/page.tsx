import Link from "next/link";
import { DeletePostButton } from "@/components/admin-delete-button";
import { PostCover } from "@/components/post-list";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/site";

export const instant = false;

const action =
  "h-8 rounded-full px-3 text-[13px] leading-8 transition-colors disabled:opacity-60";

export default async function AdminPostsPage() {
  // 레이아웃과 페이지는 병렬 렌더링되므로 데이터를 읽는 페이지에서도 반드시 인증 확인
  await requireAdmin();
  // 초안 포함 전체 글 — 캐시 없이 매 요청 DB 조회 (SSR)
  const posts = await db.post.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverImage: true,
      published: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      tags: { select: { name: true }, orderBy: { name: "asc" } },
    },
  });
  const publishedCount = posts.filter((p) => p.published).length;

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-medium leading-tight tracking-tight">글 관리</h1>
          <p className="mt-1 text-[14px] text-muted">
            전체 {posts.length} · 공개 {publishedCount} · 초안 {posts.length - publishedCount}
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="h-10 rounded-full bg-chip-active px-5 text-[14px] font-medium leading-10 text-chip-active-fg transition-opacity hover:opacity-90"
        >
          새 글 쓰기
        </Link>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-panel bg-elevated px-6 py-16 text-center">
          <p className="text-muted">아직 글이 없습니다.</p>
          <Link href="/admin/posts/new" className="mt-3 inline-block text-[14px] font-medium text-accent hover:underline">
            첫 글 쓰기 →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => {
            const tags = post.tags.map((t) => t.name);
            const editHref = `/admin/posts/${post.id}`;
            return (
              <li
                key={post.id}
                className="group relative flex gap-4 rounded-panel bg-elevated p-3 transition-colors hover:bg-elevated-hover sm:items-center sm:p-4"
              >
                <div className="w-28 shrink-0 sm:w-40">
                  <PostCover
                    bare
                    post={{
                      slug: post.slug,
                      title: post.title,
                      description: post.description,
                      coverImage: post.coverImage,
                      publishedAt: post.publishedAt ?? post.createdAt,
                      updatedAt: post.updatedAt,
                      tags,
                    }}
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
                      <span
                        className={`rounded-full px-2 text-[12px] font-medium leading-5 ${
                          post.published ? "bg-chip-active text-chip-active-fg" : "bg-chip text-muted"
                        }`}
                      >
                        {post.published ? "공개" : "초안"}
                      </span>
                      <time dateTime={post.updatedAt.toISOString()}>{formatDate(post.updatedAt)} 수정</time>
                    </div>
                    <h2 className="mt-1.5 line-clamp-2 text-[16px] font-semibold leading-snug tracking-tight sm:text-[17px]">
                      {/* 카드 전체를 수정 링크로 (after:inset-0). 동작 버튼은 z-10 으로 위에 둔다 */}
                      <Link href={editHref} className="after:absolute after:inset-0 group-hover:text-accent">
                        {post.title}
                      </Link>
                    </h2>
                    {post.description && (
                      <p className="mt-1 hidden text-[14px] text-muted sm:line-clamp-1">{post.description}</p>
                    )}
                    {tags.length > 0 && (
                      <ul className="mt-2 hidden flex-wrap gap-1.5 sm:flex">
                        {tags.map((t) => (
                          <li key={t} className="rounded-full bg-chip px-2.5 py-0.5 text-[12px] text-muted">
                            #{t}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="relative z-10 flex shrink-0 flex-wrap gap-1.5">
                    {post.published && (
                      <Link href={`/posts/${post.slug}`} className={`${action} bg-chip text-muted hover:text-fg`}>
                        보기
                      </Link>
                    )}
                    <Link href={editHref} className={`${action} bg-chip text-muted hover:text-fg`}>
                      수정
                    </Link>
                    <DeletePostButton
                      id={post.id}
                      title={post.title}
                      className={`${action} bg-chip text-red-600 hover:bg-red-500/10 dark:text-red-400`}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
