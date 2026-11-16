import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  authors: [{ name: site.author }],
  openGraph: { type: "website", siteName: site.name, locale: site.locale },
  twitter: { card: "summary" },
  alternates: {
    types: { "application/rss+xml": [{ url: "/feed.xml", title: site.name }] },
  },
};

// 첫 페인트 전에 테마 클래스를 적용해 깜빡임 방지
const themeInit = `try{var t=localStorage.getItem('theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInit}
        </Script>
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4">
          <header className="flex items-center justify-between py-8">
            <Link href="/" className="text-lg font-bold">
              {site.name}
            </Link>
            <nav className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              <Link href="/tags" className="hover:text-zinc-900 dark:hover:text-zinc-100">
                태그
              </Link>
              <Link href="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100">
                소개
              </Link>
              <a href="/feed.xml" className="hover:text-zinc-900 dark:hover:text-zinc-100">
                RSS
              </a>
              <ThemeToggle />
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="py-10 text-sm text-zinc-500">© {site.author}</footer>
        </div>
      </body>
    </html>
  );
}
