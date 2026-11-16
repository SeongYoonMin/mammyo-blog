import type { Metadata } from "next";
import Script from "next/script";
import { Sidebar } from "@/components/sidebar";
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
      <body className="min-h-dvh bg-canvas font-sans text-fg antialiased">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInit}
        </Script>
        <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-2 p-2 md:flex-row-reverse md:p-4">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col rounded-panel bg-surface p-5 md:p-8">
            <main className="flex-1">{children}</main>
            <footer className="mt-16 text-[13px] text-muted">© {site.author}</footer>
          </div>
        </div>
      </body>
    </html>
  );
}
