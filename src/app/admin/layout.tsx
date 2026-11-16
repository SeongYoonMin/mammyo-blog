import type { Metadata } from "next";

// 관리자 영역은 검색엔진에 노출하지 않음 (robots.txt에서도 차단)
export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
