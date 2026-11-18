/**
 * 관리자 글 작성/수정 폼 입력의 서버측 검증·정규화.
 *
 * 순수 함수만 두어 클라이언트 컴포넌트(useActionState 초기값·타입)에서도 import 할 수 있게 한다.
 * FormData 키: id, title, slug, description, coverImage, tags, content, published("on")
 */

export const POST_LIMITS = {
  title: 120,
  slug: 80,
  description: 300,
  coverImage: 2048,
  tag: 30,
  tags: 10,
} as const;

export type PostField = "title" | "slug" | "description" | "coverImage" | "tags" | "content";

/** useActionState(savePostAction, initialPostFormState) 용 상태. 성공 시에는 redirect 되므로 반환되지 않는다. */
export type PostFormState = {
  ok: boolean;
  /** 폼 상단에 띄울 요약 메시지 */
  message: string | null;
  /** 필드별 에러 메시지 (input name 과 동일한 키) */
  fieldErrors: Partial<Record<PostField, string>>;
  /** 실패 시 사용자가 입력했던 원본 값 — 폼을 다시 채우는 데 사용 (defaultValue/key 리셋 대응) */
  values: Partial<Record<PostField, string>> & { published?: boolean };
};

export const initialPostFormState: PostFormState = { ok: true, message: null, fieldErrors: {}, values: {} };

export type PostInput = {
  id: string | null;
  title: string;
  /** 정규화된 slug. 사용자가 비워 두면 제목에서 생성 */
  slug: string;
  /** 사용자가 slug 를 직접 입력했는지 (중복 시 자동 접미사 대신 에러를 낸다) */
  slugProvided: boolean;
  description: string;
  content: string;
  coverImage: string | null;
  published: boolean;
  tags: string[];
};

export type ParseResult =
  | { ok: true; data: PostInput }
  | { ok: false; fieldErrors: Partial<Record<PostField, string>>; values: PostFormState["values"] };

const str = (formData: FormData, key: string) => {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
};

/** 공백 정리: 앞뒤 공백 제거 + 연속 공백/개행을 한 칸으로 */
const squish = (s: string) => s.normalize("NFC").replace(/\s+/g, " ").trim();

/** URL 경로에 쓰는 slug: 소문자 영숫자·한글·하이픈만 남긴다. */
export function slugify(input: string, maxLength: number = POST_LIMITS.slug) {
  return input
    .normalize("NFKD") // 악센트 분리 후 제거(é→e). 한글은 NFC 로 다시 조합된다.
    .replace(/\p{M}/gu, "")
    .normalize("NFC")
    .toLowerCase()
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}

export function isHttpUrl(value: string) {
  try {
    const { protocol, hostname } = new URL(value);
    return (protocol === "http:" || protocol === "https:") && hostname.length > 0;
  } catch {
    return false;
  }
}

/** "a, #B ,a，c" → ["a", "b", "c"]  (쉼표·전각 쉼표·개행 구분, 선행 # 제거, 소문자, 중복 제거) */
export function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  for (const part of raw.split(/[,，、\n]/)) {
    const name = squish(part)
      .replace(/^#+/, "")
      .replace(/[/?#\\%]/g, "") // URL(/tags/[tag]) 에서 문제를 일으키는 문자 제거
      .trim()
      .toLowerCase();
    if (name) seen.add(name);
  }
  return [...seen];
}

export function parsePostForm(formData: FormData): ParseResult {
  const id = str(formData, "id").trim() || null;
  const raw = {
    title: str(formData, "title"),
    slug: str(formData, "slug"),
    description: str(formData, "description"),
    coverImage: str(formData, "coverImage"),
    tags: str(formData, "tags"),
    // 본문은 Markdown 이므로 공백을 보존하고 개행만 통일한다.
    content: str(formData, "content").replace(/\r\n?/g, "\n"),
    published: formData.get("published") === "on",
  };

  const title = squish(raw.title);
  const slugProvided = raw.slug.trim().length > 0;
  const slug = slugify(slugProvided ? raw.slug : title);
  const description = squish(raw.description);
  const coverImage = raw.coverImage.trim() || null;
  const tags = parseTags(raw.tags);
  const content = raw.content.trim() ? raw.content.replace(/\s+$/, "") + "\n" : "";

  const fieldErrors: Partial<Record<PostField, string>> = {};
  if (!title) fieldErrors.title = "제목을 입력하세요.";
  else if (title.length > POST_LIMITS.title) fieldErrors.title = `제목은 ${POST_LIMITS.title}자 이하여야 합니다.`;

  if (!slug) {
    fieldErrors.slug = slugProvided
      ? "slug 에는 영문 소문자·숫자·한글·하이픈만 사용할 수 있습니다."
      : "제목으로 slug 를 만들 수 없습니다. slug 를 직접 입력하세요.";
  }

  if (!description) fieldErrors.description = "요약을 입력하세요.";
  else if (description.length > POST_LIMITS.description)
    fieldErrors.description = `요약은 ${POST_LIMITS.description}자 이하여야 합니다. (현재 ${description.length}자)`;

  if (coverImage) {
    if (coverImage.length > POST_LIMITS.coverImage) fieldErrors.coverImage = "커버 이미지 URL 이 너무 깁니다.";
    else if (!isHttpUrl(coverImage)) fieldErrors.coverImage = "커버 이미지는 http(s) URL 이어야 합니다.";
  }

  const longTag = tags.find((t) => t.length > POST_LIMITS.tag);
  if (longTag) fieldErrors.tags = `태그는 ${POST_LIMITS.tag}자 이하여야 합니다: "${longTag.slice(0, 40)}…"`;
  else if (tags.length > POST_LIMITS.tags) fieldErrors.tags = `태그는 최대 ${POST_LIMITS.tags}개까지 붙일 수 있습니다.`;

  if (!content) fieldErrors.content = "본문을 입력하세요.";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, values: raw };
  }

  return {
    ok: true,
    data: { id, title, slug, slugProvided, description, content, coverImage, published: raw.published, tags },
  };
}
