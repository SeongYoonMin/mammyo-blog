"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/** 사이드바 링크: 현재 경로면 강조 */
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = decodeURIComponent(pathname) === decodeURIComponent(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center justify-between rounded-lg px-2 py-1 text-[15px] transition-colors ${
        active ? "font-medium text-accent" : "text-muted hover:text-fg"
      }`}
    >
      {children}
    </Link>
  );
}

/**
 * 데스크톱: 사이드바 내용을 항상 표시.
 * 모바일: 상단 바에 메뉴 버튼만 두고, 누르면 내용이 펼쳐짐.
 */
export function SidebarShell({ header, children }: { header: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const closeOnLink = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a")) setOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        {header}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="메뉴"
          className="grid size-9 place-items-center rounded-full bg-chip text-fg md:hidden"
        >
          <motion.svg width="16" height="16" viewBox="0 0 16 16" animate={{ rotate: open ? 90 : 0 }}>
            {open ? (
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <path d="M2.5 5h11M2.5 11h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            )}
          </motion.svg>
        </button>
      </div>

      <div className="hidden md:contents">{children}</div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="mobile-menu"
            className="overflow-hidden md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={closeOnLink}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
