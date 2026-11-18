import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/post-list";
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
      <PageHeader title="태그" description={`주제별로 글을 모아 봅니다. 태그 ${tags.length}개`} />
      <ul className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <li key={t.name}>
            <Link
              href={`/tags/${encodeURIComponent(t.name)}`}
              className="flex h-10 items-center gap-2 rounded-full bg-chip px-4 text-[15px] transition-colors hover:bg-elevated-hover"
            >
              #{t.name}
              <span className="text-[13px] text-muted">{t.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
