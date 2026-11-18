import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { marked } from "marked";
import { db } from "./db";

/**
 * 공개 페이지용 읽기 함수. 모두 "use cache"로 캐시되어 빌드 때 정적 HTML에 포함되고,
 * 관리자 페이지에서 글을 저장하면 updateTag()로 즉시 무효화된다.
 *
 * - CACHE_TAG_POSTS : 목록·태그·RSS·sitemap 등 "글 모음"에 의존하는 모든 캐시
 * - postCacheTag(slug): 글 상세 한 건
 */
export const CACHE_TAG_POSTS = "posts";
export const postCacheTag = (slug: string) => `post:${slug}`;

export type PostSummary = {
  slug: string;
  title: string;
  description: string;
  coverImage: string | null;
  publishedAt: Date;
  updatedAt: Date;
  tags: string[];
};

export type PostDetail = PostSummary & { html: string };

const summarySelect = {
  slug: true,
  title: true,
  description: true,
  coverImage: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  tags: { select: { name: true }, orderBy: { name: "asc" } },
} as const;

type SummaryRow = {
  slug: string;
  title: string;
  description: string;
  coverImage: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tags: { name: string }[];
};

function toSummary(p: SummaryRow): PostSummary {
  return {
    slug: p.slug,
    title: p.title,
    description: p.description,
    coverImage: p.coverImage,
    publishedAt: p.publishedAt ?? p.createdAt,
    updatedAt: p.updatedAt,
    tags: p.tags.map((t) => t.name),
  };
}

export async function getPublishedPosts(): Promise<PostSummary[]> {
  "use cache";
  cacheLife("hours"); // 안전망: 태그 무효화가 누락돼도 1시간 뒤 백그라운드 재생성
  cacheTag(CACHE_TAG_POSTS);

  const rows = await db.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: summarySelect,
  });
  return rows.map(toSummary);
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  "use cache";
  cacheLife("days");
  cacheTag(postCacheTag(slug));

  const row = await db.post.findFirst({
    where: { slug, published: true },
    select: { ...summarySelect, content: true },
  });
  if (!row) return null;
  // 글은 관리자 본인만 작성하므로 Markdown 원문의 HTML을 그대로 허용한다.
  return { ...toSummary(row), html: await marked.parse(row.content) };
}

export async function getTagsWithCount(): Promise<{ name: string; count: number }[]> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAG_POSTS);

  const tags = await db.tag.findMany({
    select: { name: true, _count: { select: { posts: { where: { published: true } } } } },
    orderBy: { name: "asc" },
  });
  return tags.filter((t) => t._count.posts > 0).map((t) => ({ name: t.name, count: t._count.posts }));
}

export async function getPostsByTag(tag: string): Promise<PostSummary[]> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAG_POSTS);

  const rows = await db.post.findMany({
    where: { published: true, tags: { some: { name: tag } } },
    orderBy: { publishedAt: "desc" },
    select: summarySelect,
  });
  return rows.map(toSummary);
}
