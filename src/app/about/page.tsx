import type { Metadata } from "next";
import { PageHeader } from "@/components/post-list";
import { site } from "@/lib/site";

// 소개: 데이터 의존 없는 순수 SSG
export const ensureStatic = "navigation";

export const metadata: Metadata = {
  title: "소개",
  description: `${site.author}의 블로그 소개`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="소개" />
      <div className="prose prose-zinc dark:prose-invert">
        <p>안녕하세요, {site.author}입니다. 이 블로그에는 개발하면서 배운 것들을 기록합니다.</p>
      </div>
    </div>
  );
}
