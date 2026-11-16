import { PageTransition } from "@/components/motion";

// 라우트가 바뀔 때마다 새로 마운트되어 페이지 전환 애니메이션을 실행한다.
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
