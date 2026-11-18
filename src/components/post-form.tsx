import { savePost } from "@/app/admin/actions";

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

const input = "w-full rounded border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700";

export function PostForm({ post }: { post?: Initial }) {
  return (
    <form action={savePost} className="space-y-4">
      {post && <input type="hidden" name="id" value={post.id} />}
      <input name="title" required placeholder="제목" defaultValue={post?.title} className={input} />
      <input
        name="slug"
        placeholder="slug (비우면 제목으로 생성, 예: my-first-post)"
        defaultValue={post?.slug}
        className={input}
      />
      <input
        name="description"
        required
        placeholder="요약 (검색 결과·OG 설명에 사용)"
        defaultValue={post?.description}
        className={input}
      />
      <input
        name="coverImage"
        type="url"
        placeholder="썸네일 이미지 URL (선택, 16:10 권장 · 비우면 자동 커버)"
        defaultValue={post?.coverImage ?? ""}
        className={input}
      />
      <input
        name="tags"
        placeholder="태그 (쉼표로 구분)"
        defaultValue={post?.tags.join(", ")}
        className={input}
      />
      <textarea
        name="content"
        required
        rows={20}
        placeholder="본문 (Markdown)"
        defaultValue={post?.content}
        className={`${input} font-mono text-sm`}
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={post?.published} />
          공개
        </label>
        <button className="rounded bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900">
          저장
        </button>
      </div>
    </form>
  );
}
