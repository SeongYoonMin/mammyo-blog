"use client";

export function ThemeToggle() {
  function toggle() {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {}
  }

  // 서버는 현재 테마를 모르므로 아이콘은 CSS(dark:)로만 전환 → 하이드레이션 불일치 없음
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="다크 모드 전환"
      className="grid size-8 place-items-center rounded-full bg-chip text-muted transition-colors hover:text-fg"
    >
      <svg className="dark:hidden" width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <path d="M13.5 10.2A6 6 0 0 1 5.8 2.5a6 6 0 1 0 7.7 7.7Z" />
      </svg>
      <svg className="hidden dark:block" width="15" height="15" viewBox="0 0 16 16" aria-hidden>
        <circle cx="8" cy="8" r="3" fill="currentColor" />
        <path
          d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1 1M12 12l1 1M3 13l1-1M12 4l1-1"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
