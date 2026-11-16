import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TagLink } from "@/components/post-list";
import { getPostBySlug, getPublishedPosts } from "@/lib/posts";
import { absoluteUrl, formatDate, site } from "@/lib/site";

/**
 * 글 상세 = SSG + ISR
 * - 최근 글 PRERENDER_COUNT개는 빌드 때 정적 생성(SSG)
 * - 나머지/새 글은 첫 요청 때 완성된 HTML을 생성해 캐시(ISR, blocking 방식 → 크롤러도 완전한 HTML 수신)
 * - 글 수정 시 관리자 Server Action이 updateTag(`post:${slug}`)로 즉시 무효화
 */
export const ensureStatic = "navigation";
// params를 Suspense 밖에서 읽는 것은 의도된 설계(완성된 HTML·실제 404 응답). 출력은 ensureStatic으로 정적 보장.
export const instant = false;

const PRERENDER_COUNT = 20;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  const params = posts.slice(0, PRERENDER_COUNT).map((p) => ({ slug: p.slug }));
  // Cache Components는 최소 1개가 필요하다. 글이 없으면 404가 될 placeholder로 대체.
  return params.length > 0 ? params : [{ slug: "_" }];
}

export async function generateMetadata({ params }: PageProps<"/posts/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const url = `/posts/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [site.author],
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: PageProps<"/posts/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: site.author },
    mainEntityOfPage: absoluteUrl(`/posts/${post.slug}`),
    keywords: post.tags.join(", "),
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="mb-8">
        <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
          {post.tags.map((tag) => (
            <TagLink key={tag} tag={tag} />
          ))}
        </div>
      </header>
      <div
        className="prose prose-zinc max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </article>
  );
}
