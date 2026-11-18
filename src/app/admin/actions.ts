"use server";

import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, requireAdmin } from "@/lib/auth";
import { parsePostForm, type PostFormState } from "@/lib/post-input";
import { postMutationTags, removePost, upsertPost } from "@/lib/posts";

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

/** 글 저장/삭제 후 공개 페이지 캐시를 즉시 무효화 (온디맨드 ISR, read-your-own-writes) */
function invalidate(...slugs: (string | null | undefined)[]) {
  for (const tag of postMutationTags(...slugs)) updateTag(tag);
}

/** 검증·저장까지 수행하고, 실패하면 폼 상태를, 성공하면 null 을 돌려준다(redirect 는 호출 측에서). */
async function persist(formData: FormData): Promise<PostFormState | null> {
  await requireAdmin();

  const parsed = parsePostForm(formData);
  if (!parsed.ok) {
    return { ok: false, message: "입력값을 확인하세요.", fieldErrors: parsed.fieldErrors, values: parsed.values };
  }

  const result = await upsertPost(parsed.data);
  if (!result.ok) {
    const d = parsed.data;
    return {
      ok: false,
      message: result.message,
      fieldErrors: result.field ? { [result.field]: result.message } : {},
      values: {
        title: d.title,
        slug: d.slug,
        description: d.description,
        coverImage: d.coverImage ?? "",
        tags: d.tags.join(", "),
        content: d.content,
        published: d.published,
      },
    };
  }

  invalidate(result.slug, result.previousSlug);
  return null;
}

/**
 * 기존 시그니처: `<form action={savePost}>`.
 * 검증 실패 시 예외를 던진다(가장 가까운 error.tsx). 에러를 폼에 표시하려면 savePostAction 을 쓸 것.
 */
export async function savePost(formData: FormData): Promise<void> {
  const failed = await persist(formData);
  if (failed) {
    const detail = Object.values(failed.fieldErrors).join(" ");
    throw new Error(detail || failed.message || "글을 저장하지 못했습니다.");
  }
  redirect("/admin");
}

/**
 * useActionState 호환 버전: `useActionState(savePostAction, initialPostFormState)`.
 * 실패하면 PostFormState 를 반환하고, 성공하면 /admin 으로 redirect 한다.
 */
export async function savePostAction(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  const failed = await persist(formData);
  if (failed) return failed;
  redirect("/admin");
}

export async function deletePost(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id === "string" && id) {
    const slug = await removePost(id);
    if (slug) invalidate(slug);
  }
  redirect("/admin");
}
