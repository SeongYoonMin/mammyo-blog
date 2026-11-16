import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostList } from "@/components/post-list";
import { getPostsByTag, getTagsWithCount } from "@/lib/posts";

// 태그별 목록: 모든 태그를 빌드 때 SSG, 새 태그는 첫 요청 때 ISR
export const ensureStatic = "navigation";
// params를 Suspense 밖에서 읽는 것은 의도된 설계(완성된 HTML·실제 404 응답). 출력은 ensureStatic으로 정적 보장.
export const instant = false;

export async function generateStaticParams() {
  const tags = await getTagsWithCount();
  return tags.length > 0 ? tags.map((t) => ({ tag: t.name })) : [{ tag: "_" }];
}

async function resolveTag(params: PageProps<"/tags/[tag]">["params"]) {
  const { tag } = await params;
  return decodeURIComponent(tag);
}

export async function generateMetadata({ params }: PageProps<"/tags/[tag]">): Promise<Metadata> {
  const tag = await resolveTag(params);
  return {
    title: `#${tag}`,
    description: `'${tag}' 태그가 붙은 글 목록`,
    alternates: { canonical: `/tags/${encodeURIComponent(tag)}` },
  };
}

export default async function TagPage({ params }: PageProps<"/tags/[tag]">) {
  const tag = await resolveTag(params);
  const posts = await getPostsByTag(tag);
  if (posts.length === 0) notFound();

  return (
    <>
      <h1 className="mb-8 text-2xl font-bold">#{tag}</h1>
      <PostList posts={posts} />
    </>
  );
}
