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
      className="rounded-md p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
    >
      <span className="dark:hidden">🌙</span>
      <span className="hidden dark:inline">☀️</span>
    </button>
  );
}
