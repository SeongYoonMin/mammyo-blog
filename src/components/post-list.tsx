import Link from "next/link";
import type { PostSummary } from "@/lib/posts";
import { formatDate } from "@/lib/site";

export function PostList({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) return <p className="text-zinc-500">아직 글이 없습니다.</p>;

  return (
    <ul className="space-y-8">
      {posts.map((post) => (
        <li key={post.slug}>
          <article>
            <Link href={`/posts/${post.slug}`} className="group block">
              <h2 className="text-xl font-semibold group-hover:underline">{post.title}</h2>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">{post.description}</p>
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
              <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
              {post.tags.map((tag) => (
                <TagLink key={tag} tag={tag} />
              ))}
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

export function TagLink({ tag }: { tag: string }) {
  return (
    <Link
      href={`/tags/${encodeURIComponent(tag)}`}
      className="rounded bg-zinc-100 px-2 py-0.5 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
    >
      #{tag}
    </Link>
  );
}
