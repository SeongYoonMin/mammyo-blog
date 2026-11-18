import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";

// 관리자 대시보드 = SSR: 요청마다 쿠키로 인증 확인, 캐시하지 않음
export const instant = false;

export default async function DashboardLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-3 border-b border-hairline pb-4">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-accent">관리자</span>
          <span aria-hidden className="h-3 w-px bg-hairline" />
          <AdminNav />
        </div>
        <form action={logout}>
          <button className="text-[13px] text-muted transition-colors hover:text-fg">로그아웃</button>
        </form>
      </div>
      {children}
    </div>
  );
}
