import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-[13px] text-muted">404</p>
      <h1 className="mt-2 text-[32px] font-medium tracking-tight">페이지를 찾을 수 없습니다</h1>
      <Link
        href="/"
        className="mt-6 inline-block h-9 rounded-full bg-chip-active px-4 text-[14px] leading-9 text-chip-active-fg"
      >
        홈으로
      </Link>
    </div>
  );
}
