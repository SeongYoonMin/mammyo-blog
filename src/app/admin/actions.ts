"use server";

import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { CACHE_TAG_POSTS, postCacheTag } from "@/lib/posts";

/** GitHub 로그인 페이지로 보낸다. 허용되지 않은 계정이면 errorCallbackURL로 돌아온다. */
export async function login() {
  const { url } = await auth.api.signInSocial({
    body: { provider: "github", callbackURL: "/admin", errorCallbackURL: "/admin/login?error=1" },
  });
  redirect(url!);
}

export async function logout() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/admin/login");
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** 글 저장 후 공개 페이지 캐시를 즉시 무효화 (온디맨드 ISR) */
function invalidate(...slugs: string[]) {
  updateTag(CACHE_TAG_POSTS);
  for (const slug of new Set(slugs)) updateTag(postCacheTag(slug));
}

export async function savePost(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "") || null;
  const title = String(formData.get("title") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || title);
  const description = String(formData.get("description") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  const published = formData.get("published") === "on";
  const tagNames = [
    ...new Set(
      String(formData.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
  if (!title || !slug || !content) throw new Error("제목, slug, 본문은 필수입니다.");

  const connectOrCreate = tagNames.map((name) => ({ where: { name }, create: { name } }));
  const previous = id
    ? await db.post.findUnique({ where: { id }, select: { slug: true, publishedAt: true } })
    : null;
  const publishedAt = published ? (previous?.publishedAt ?? new Date()) : (previous?.publishedAt ?? null);
  const fields = { title, slug, description, content, published, publishedAt };

  if (previous && id) {
    await db.post.update({ where: { id }, data: { ...fields, tags: { set: [], connectOrCreate } } });
    invalidate(slug, previous.slug);
  } else {
    await db.post.create({ data: { ...fields, tags: { connectOrCreate } } });
    invalidate(slug);
  }
  redirect("/admin");
}

export async function deletePost(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const post = await db.post.delete({ where: { id }, select: { slug: true } });
  invalidate(post.slug);
  redirect("/admin");
}
