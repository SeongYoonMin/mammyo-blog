import type { Metadata } from "next";
import Link from "next/link";
import { getTagsWithCount } from "@/lib/posts";

// 태그 목록: SSG + 'posts' 태그 무효화로 ISR
export const ensureStatic = "navigation";

export const metadata: Metadata = {
  title: "태그",
  alternates: { canonical: "/tags" },
};

export default async function TagsPage() {
  const tags = await getTagsWithCount();
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">태그</h1>
      <ul className="flex flex-wrap gap-3">
        {tags.map((t) => (
          <li key={t.name}>
            <Link
              href={`/tags/${encodeURIComponent(t.name)}`}
              className="rounded bg-zinc-100 px-3 py-1 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              #{t.name} <span className="text-zinc-500">({t.count})</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
