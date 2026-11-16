import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/site";
import { deletePost } from "../actions";

export const instant = false;

export default async function AdminPostsPage() {
  // 레이아웃과 페이지는 병렬 렌더링되므로 데이터를 읽는 페이지에서도 반드시 인증 확인
  await requireAdmin();
  // 초안 포함 전체 글 — 캐시 없이 매 요청 DB 조회 (SSR)
  const posts = await db.post.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, slug: true, title: true, published: true, updatedAt: true },
  });

  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {posts.map((post) => (
        <li key={post.id} className="flex items-center justify-between gap-4 py-3">
          <div>
            <Link href={`/admin/posts/${post.id}`} className="font-medium hover:underline">
              {post.title}
            </Link>
            <div className="text-xs text-zinc-500">
              {post.published ? "공개" : "초안"} · {formatDate(post.updatedAt)} 수정
            </div>
          </div>
          <div className="flex shrink-0 gap-3 text-sm">
            {post.published && (
              <Link href={`/posts/${post.slug}`} className="text-zinc-500 hover:underline">
                보기
              </Link>
            )}
            <form action={deletePost}>
              <input type="hidden" name="id" value={post.id} />
              <button className="text-red-600 hover:underline">삭제</button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
