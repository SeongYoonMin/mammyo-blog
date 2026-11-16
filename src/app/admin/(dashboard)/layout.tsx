import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";

// 관리자 대시보드 = SSR: 요청마다 쿠키로 인증 확인, 캐시하지 않음
export const instant = false;

export default async function DashboardLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div>
      <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-3 text-sm dark:border-zinc-800">
        <div className="flex gap-4">
          <Link href="/admin" className="font-semibold">
            글 관리
          </Link>
          <Link href="/admin/posts/new">새 글</Link>
        </div>
        <form action={logout}>
          <button className="text-zinc-500 hover:underline">로그아웃</button>
        </form>
      </div>
      {children}
    </div>
  );
}
