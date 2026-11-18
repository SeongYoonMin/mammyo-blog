"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { savePostAction } from "@/app/admin/actions";
import { PostCover } from "@/components/post-list";
import {
  POST_LIMITS,
  initialPostFormState,
  isHttpUrl,
  parseTags,
  type PostField,
  type PostFormState,
} from "@/lib/post-input";

type Initial = {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  content: string;
  published: boolean;
  tags: string[];
};

type Values = Record<PostField, string> & { published: boolean };

/*
 * 글 작성/수정 폼. 공개 페이지와 같은 색 토큰·둥근 카드 스타일을 쓰고,
 * 입력값으로 목록 카드(PostCover + 메타 + 제목 + 요약)를 실시간 미리보기한다.
 *
 * - useActionState(savePostAction): 실패 시 PostFormState(메시지·필드 에러·입력값)를 받고, 성공 시 서버가 /admin 으로 redirect.
 * - 모든 필드를 제어 컴포넌트로 둔다. React 19 는 action 제출 후 비제어 필드를 초기화하므로
 *   실패해도 입력이 사라지지 않게 하고, state.values 로 상태(와 미리보기)를 다시 맞춘다.
 * - FormData 키(id·title·slug·description·coverImage·tags·content·published)는 서버 계약이므로 바꾸지 않는다.
 * - 태그·URL 해석과 글자수 제한은 서버와 같은 post-input.ts 함수를 재사용한다.
 */

const field =
  "w-full rounded-xl border border-hairline bg-elevated px-3.5 py-2.5 text-[15px] text-fg transition-colors placeholder:text-muted hover:bg-elevated-hover focus:bg-surface aria-invalid:border-red-500/70";
const card = "rounded-panel bg-elevated p-4 md:p-5";
const errorText = "text-[12px] text-red-600 dark:text-red-400";

/** 서버 squish 와 같은 기준(연속 공백 1칸, 앞뒤 공백 제외)의 글자수 */
const visibleLength = (s: string) => s.replace(/\s+/g, " ").trim().length;

/** 필드 하나의 접근성 속성: 에러가 있으면 aria-invalid, 설명(힌트·에러)을 aria-describedby 로 연결 */
function describe(name: PostField, error: string | undefined, hasHint: boolean) {
  const ids = [hasHint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(" ");
  return { "aria-invalid": error ? true : undefined, "aria-describedby": ids || undefined } as const;
}

function Field({
  name,
  label,
  hint,
  error,
  counter,
  children,
}: {
  name: PostField;
  label: string;
  hint?: string;
  error?: string;
  counter?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={name} className="block text-[13px] font-medium text-muted">
          {label}
        </label>
        {counter}
      </div>
      {children}
      {hint && (
        <p id={`${name}-hint`} className="text-[12px] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className={errorText}>
          {error}
        </p>
      )}
    </div>
  );
}

function Counter({ value, max }: { value: number; max: number }) {
  const over = value > max;
  return (
    <span aria-hidden className={`text-[12px] tabular-nums ${over ? "text-red-600 dark:text-red-400" : "text-muted"}`}>
      {value}/{max}
    </span>
  );
}

function initialValues(post?: Initial): Values {
  return {
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    description: post?.description ?? "",
    coverImage: post?.coverImage ?? "",
    tags: post?.tags.join(", ") ?? "",
    content: post?.content ?? "",
    published: post?.published ?? false,
  };
}

export function PostForm({ post }: { post?: Initial }) {
  const editing = Boolean(post);
  const [state, formAction, isPending] = useActionState(savePostAction, initialPostFormState);
  const [values, setValues] = useState<Values>(() => initialValues(post));

  // 새 실패 응답을 받으면 서버가 돌려준 입력값으로 상태를 맞춘다 (렌더 중 이전 state 비교 패턴)
  const [syncedState, setSyncedState] = useState<PostFormState>(state);
  if (state !== syncedState) {
    setSyncedState(state);
    if (!state.ok) {
      const defined = Object.fromEntries(Object.entries(state.values).filter(([, v]) => v !== undefined));
      setValues((v) => ({ ...v, ...defined }));
    }
  }

  const set = (name: PostField) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [name]: e.target.value }));

  const errors = state.fieldErrors;
  const errorCount = Object.keys(errors).length;
  const tagList = parseTags(values.tags);
  const coverUrl = values.coverImage.trim();
  const coverInvalid = coverUrl !== "" && !isHttpUrl(coverUrl);
  const coverError = errors.coverImage ?? (coverInvalid ? "커버 이미지는 http(s) URL 이어야 합니다." : undefined);

  return (
    <form action={formAction} noValidate>
      {post && <input type="hidden" name="id" value={post.id} />}

      {/* 상단: 제목 + 저장 */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <Link href="/admin" className="text-[13px] text-muted transition-colors hover:text-fg">
            ← 글 관리
          </Link>
          <h1 className="mt-1 text-[28px] font-medium leading-tight tracking-tight">{editing ? "글 수정" : "새 글"}</h1>
        </div>
        <button
          disabled={isPending}
          className="h-10 rounded-full bg-chip-active px-5 text-[14px] font-medium text-chip-active-fg transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "저장 중…" : editing ? "변경 저장" : "저장"}
        </button>
      </div>

      {/* 저장 실패 배너 */}
      {!state.ok && (state.message || errorCount > 0) && (
        <div
          role="alert"
          className="mb-6 rounded-panel border border-red-500/30 bg-red-500/[0.06] px-4 py-3 text-[14px] text-red-700 dark:text-red-300"
        >
          <p className="font-medium">{state.message ?? "저장하지 못했습니다."}</p>
          {errorCount > 0 && (
            <p className="mt-0.5 text-[13px] opacity-80">입력값 {errorCount}곳을 확인해 주세요.</p>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* 본문 영역 */}
        <div className="min-w-0 space-y-5">
          <div className="space-y-1.5">
            <input
              id="title"
              name="title"
              required
              placeholder="제목을 입력하세요"
              aria-label="제목"
              value={values.title}
              onChange={set("title")}
              {...describe("title", errors.title, false)}
              className="w-full border-b border-hairline bg-transparent pb-3 text-[clamp(22px,3vw,30px)] font-semibold leading-snug tracking-tight placeholder:text-muted focus:border-accent aria-invalid:border-red-500/70"
            />
            <div className="flex justify-between gap-2">
              {errors.title ? (
                <p id="title-error" className={errorText}>
                  {errors.title}
                </p>
              ) : (
                <span />
              )}
              <Counter value={visibleLength(values.title)} max={POST_LIMITS.title} />
            </div>
          </div>

          <Field
            name="description"
            label="요약"
            hint="목록 카드·검색 결과·OG 설명에 쓰입니다."
            error={errors.description}
            counter={<Counter value={visibleLength(values.description)} max={POST_LIMITS.description} />}
          >
            <textarea
              id="description"
              name="description"
              required
              rows={2}
              placeholder="글을 한두 문장으로 소개하세요"
              value={values.description}
              onChange={set("description")}
              {...describe("description", errors.description, true)}
              className={`${field} resize-y`}
            />
          </Field>

          <Field name="content" label="본문 (Markdown)" error={errors.content}>
            <textarea
              id="content"
              name="content"
              required
              rows={24}
              placeholder={"# 제목\n\n본문을 Markdown으로 작성하세요"}
              value={values.content}
              onChange={set("content")}
              {...describe("content", errors.content, false)}
              className={`${field} min-h-[50dvh] resize-y font-mono text-[14px] leading-relaxed`}
            />
          </Field>
        </div>

        {/* 설정 사이드바 (모바일에서는 본문 아래) */}
        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <section className={card}>
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span>
                <span className="block text-[15px] font-medium">공개</span>
                <span className="block text-[12px] text-muted">
                  {values.published ? "저장하면 블로그에 노출됩니다" : "초안으로 저장됩니다"}
                </span>
              </span>
              <input
                type="checkbox"
                name="published"
                checked={values.published}
                onChange={(e) => setValues((v) => ({ ...v, published: e.target.checked }))}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className="relative h-7 w-12 shrink-0 rounded-full bg-chip transition-colors peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent after:absolute after:left-0.5 after:top-0.5 after:size-6 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
              />
            </label>
          </section>

          <section className={`${card} space-y-4`}>
            <h2 className="text-[13px] font-medium text-accent">카드 미리보기</h2>
            <div className="group">
              <PostCover
                post={{
                  slug: values.slug || "preview",
                  title: values.title || "제목을 입력하세요",
                  description: values.description,
                  coverImage: coverUrl && !coverInvalid ? coverUrl : null,
                  publishedAt: new Date(0),
                  updatedAt: new Date(0),
                  tags: tagList,
                }}
              />
              <div className="mt-3">
                {tagList[0] && <div className="text-[13px] text-muted">{tagList[0]}</div>}
                <p className="mt-1 line-clamp-2 text-[16px] font-semibold leading-snug tracking-tight">
                  {values.title || <span className="text-muted">제목 없음</span>}
                </p>
                {values.description && (
                  <p className="mt-1 line-clamp-2 text-[13px] text-muted">{values.description}</p>
                )}
              </div>
            </div>

            <Field
              name="coverImage"
              label="커버 이미지 URL"
              hint="16:10 권장 · 비우면 첫 태그 색으로 자동 커버"
              error={coverError}
            >
              <input
                id="coverImage"
                name="coverImage"
                type="url"
                inputMode="url"
                maxLength={POST_LIMITS.coverImage}
                placeholder="https://…"
                value={values.coverImage}
                onChange={set("coverImage")}
                {...describe("coverImage", coverError, true)}
                className={field}
              />
            </Field>
          </section>

          <section className={`${card} space-y-4`}>
            <Field
              name="slug"
              label="슬러그"
              hint="비우면 제목으로 생성 (예: my-first-post)"
              error={errors.slug}
              counter={<Counter value={values.slug.trim().length} max={POST_LIMITS.slug} />}
            >
              <div
                aria-invalid={errors.slug ? true : undefined}
                className="flex items-center rounded-xl border border-hairline bg-elevated pl-3.5 text-[15px] transition-colors focus-within:bg-surface focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent hover:bg-elevated-hover aria-invalid:border-red-500/70"
              >
                <span className="shrink-0 text-muted">/posts/</span>
                <input
                  id="slug"
                  name="slug"
                  placeholder="my-first-post"
                  value={values.slug}
                  onChange={set("slug")}
                  {...describe("slug", errors.slug, true)}
                  className="min-w-0 flex-1 bg-transparent py-2.5 pr-3.5 placeholder:text-muted focus-visible:outline-none"
                />
              </div>
            </Field>

            <Field
              name="tags"
              label="태그"
              hint={`쉼표로 구분 · 첫 태그가 대표 태그 · 태그당 ${POST_LIMITS.tag}자 이하`}
              error={errors.tags}
              counter={<Counter value={tagList.length} max={POST_LIMITS.tags} />}
            >
              <input
                id="tags"
                name="tags"
                placeholder="design, nextjs"
                value={values.tags}
                onChange={set("tags")}
                {...describe("tags", errors.tags, true)}
                className={field}
              />
              {tagList.length > 0 && (
                <ul className="flex flex-wrap gap-1.5 pt-1">
                  {tagList.map((t, i) => (
                    <li
                      key={t}
                      className={`rounded-full px-2.5 py-0.5 text-[13px] ${
                        t.length > POST_LIMITS.tag
                          ? "bg-red-500/10 text-red-700 dark:text-red-300"
                          : i === 0
                            ? "bg-chip-active text-chip-active-fg"
                            : "bg-chip text-muted"
                      }`}
                    >
                      #{t}
                    </li>
                  ))}
                </ul>
              )}
            </Field>
          </section>
        </aside>
      </div>
    </form>
  );
}
