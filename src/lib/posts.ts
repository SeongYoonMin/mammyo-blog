import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { marked } from "marked";
import { db } from "./db";
import { POST_LIMITS, type PostInput } from "./post-input";

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

// ── 관리자 쓰기 함수 (Server Action 전용, 캐시하지 않음) ──────────────────────────
// 인증 확인과 캐시 무효화(updateTag)는 호출하는 Server Action 이 담당한다.

/** 글 저장/삭제 후 무효화해야 할 캐시 태그: 목록·태그·피드·sitemap(posts) + 이전/현재 slug 상세 */
export function postMutationTags(...slugs: (string | null | undefined)[]): string[] {
  const tags = new Set([CACHE_TAG_POSTS]);
  for (const slug of slugs) if (slug) tags.add(postCacheTag(slug));
  return [...tags];
}

const isUniqueViolation = (e: unknown) =>
  typeof e === "object" && e !== null && "code" in e && (e as { code: unknown }).code === "P2002";

/**
 * 다른 글이 쓰지 않는 slug 를 고른다.
 * strict=true(사용자가 직접 입력)면 중복 시 null, 아니면 "-2", "-3" … 접미사를 붙인다.
 */
async function resolveSlug(base: string, excludeId: string | null, strict: boolean): Promise<string | null> {
  const taken = await db.post.findMany({
    where: { slug: { startsWith: base }, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { slug: true },
  });
  const used = new Set(taken.map((p) => p.slug));
  if (!used.has(base)) return base;
  if (strict) return null;
  for (let n = 2; ; n++) {
    const suffix = `-${n}`;
    const candidate = base.slice(0, POST_LIMITS.slug - suffix.length).replace(/-+$/, "") + suffix;
    if (!used.has(candidate)) return candidate;
  }
}

export type SavePostResult =
  | { ok: true; slug: string; previousSlug: string | null }
  | { ok: false; field?: "slug"; message: string };

/** 검증을 마친 입력으로 글을 생성/수정한다. */
export async function upsertPost(input: PostInput): Promise<SavePostResult> {
  const previous = input.id
    ? await db.post.findUnique({ where: { id: input.id }, select: { slug: true, publishedAt: true } })
    : null;
  if (input.id && !previous) return { ok: false, message: "수정하려는 글을 찾을 수 없습니다. 이미 삭제되었을 수 있습니다." };

  const slug = await resolveSlug(input.slug, input.id, input.slugProvided);
  if (!slug) return { ok: false, field: "slug", message: `이미 다른 글이 사용 중인 slug 입니다: ${input.slug}` };

  // 처음 공개될 때 발행일을 기록하고, 이후 비공개/재공개해도 최초 발행일을 유지한다(목록 정렬 기준).
  const publishedAt = previous?.publishedAt ?? (input.published ? new Date() : null);
  const fields = {
    title: input.title,
    slug,
    description: input.description,
    content: input.content,
    coverImage: input.coverImage,
    published: input.published,
    publishedAt,
  };
  const connectOrCreate = input.tags.map((name) => ({ where: { name }, create: { name } }));

  try {
    if (input.id) {
      await db.post.update({ where: { id: input.id }, data: { ...fields, tags: { set: [], connectOrCreate } } });
      await pruneOrphanTags();
    } else {
      await db.post.create({ data: { ...fields, tags: { connectOrCreate } } });
    }
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: false, field: "slug", message: `이미 다른 글이 사용 중인 slug 입니다: ${slug}` };
    throw e;
  }
  return { ok: true, slug, previousSlug: previous?.slug ?? null };
}

/** 글을 삭제하고 삭제된 slug 를 돌려준다. 이미 없으면 null. */
export async function removePost(id: string): Promise<string | null> {
  const post = await db.post.findUnique({ where: { id }, select: { slug: true } });
  if (!post) return null;
  await db.post.delete({ where: { id } });
  await pruneOrphanTags();
  return post.slug;
}

/** 어떤 글에도 붙어 있지 않은 태그 정리 */
async function pruneOrphanTags() {
  await db.tag.deleteMany({ where: { posts: { none: {} } } });
}
