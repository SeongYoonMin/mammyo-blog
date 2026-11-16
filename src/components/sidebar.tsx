import Link from "next/link";
import { NavLink, SidebarShell } from "@/components/nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { getTagsWithCount } from "@/lib/posts";
import { site } from "@/lib/site";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="mb-1 px-2 text-[13px] text-muted">{children}</p>;
}

/** 왼쪽 사이드바 (태그 목록은 'posts' 캐시 태그로 함께 갱신됨) */
export async function Sidebar() {
  const tags = await getTagsWithCount();

  return (
    <aside className="flex shrink-0 flex-col gap-6 rounded-panel bg-surface p-4 md:sticky md:top-4 md:h-[calc(100dvh-2rem)] md:w-60 md:overflow-y-auto md:p-5">
      <SidebarShell
        header={
          <Link href="/" className="px-2 text-lg font-semibold tracking-tight text-fg">
            {site.name}
          </Link>
        }
      >
        <nav className="mt-6 space-y-6 md:mt-0">
          <div>
            <SectionTitle>둘러보기</SectionTitle>
            <NavLink href="/">전체 글</NavLink>
            <NavLink href="/tags">태그</NavLink>
            <NavLink href="/about">소개</NavLink>
          </div>

          {tags.length > 0 && (
            <div>
              <SectionTitle>태그</SectionTitle>
              {tags.map((t) => (
                <NavLink key={t.name} href={`/tags/${encodeURIComponent(t.name)}`}>
                  <span>#{t.name}</span>
                  <span className="text-[13px] text-muted">{t.count}</span>
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        <div className="mt-6 flex items-center justify-between px-2 md:mt-auto">
          <a href="/feed.xml" className="text-[13px] text-muted hover:text-fg">
            RSS 구독
          </a>
          <ThemeToggle />
        </div>
      </SidebarShell>
    </aside>
  );
}
