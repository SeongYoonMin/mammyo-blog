"use client";

import { useFormStatus } from "react-dom";
import { deletePost } from "@/app/admin/actions";

function Submit({ className }: { className: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={className}>
      {pending ? "삭제 중…" : "삭제"}
    </button>
  );
}

/** 기존 deletePost 액션을 그대로 쓰되, 실수로 지우지 않도록 확인을 받는다. */
export function DeletePostButton({ id, title, className }: { id: string; title: string; className: string }) {
  return (
    <form
      action={deletePost}
      onSubmit={(e) => {
        if (!confirm(`"${title}" 글을 삭제할까요? 되돌릴 수 없습니다.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Submit className={className} />
    </form>
  );
}
