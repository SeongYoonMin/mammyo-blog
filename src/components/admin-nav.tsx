"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pillClass } from "@/components/post-list";

/** 관리자 탭: 공개 페이지 태그 필터와 같은 알약 스타일. 현재 경로를 강조한다. */
export function AdminNav() {
  const pathname = usePathname();
  const items = [
    { label: "글 관리", href: "/admin", on: pathname === "/admin" || /^\/admin\/posts\/(?!new)/.test(pathname) },
    { label: "새 글", href: "/admin/posts/new", on: pathname === "/admin/posts/new" },
  ];
  return (
    <nav aria-label="관리자 메뉴" className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={i.on ? "page" : undefined}
          className={`${pillClass} ${i.on ? "bg-chip-active text-chip-active-fg" : "bg-chip text-muted hover:text-fg"}`}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
