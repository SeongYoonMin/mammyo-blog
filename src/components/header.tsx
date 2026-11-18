"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/lib/site";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = decodeURIComponent(pathname) === decodeURIComponent(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg px-2 py-1 text-[15px] transition-colors ${
        active ? "font-medium text-accent" : "text-muted hover:text-fg"
      }`}
    >
      {children}
    </Link>
  );
}

export function Header() {
  return (
    <header className="flex items-center gap-1 rounded-panel bg-surface px-4 py-3">
      <Link href="/" className="mr-4 text-lg font-semibold tracking-tight text-fg">
        {site.name}
      </Link>

      <nav className="flex items-center gap-1">
        <NavLink href="/">전체 글</NavLink>
        <NavLink href="/tags">태그</NavLink>
        <NavLink href="/about">소개</NavLink>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <a href="/feed.xml" className="text-[13px] text-muted hover:text-fg">
          RSS
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
