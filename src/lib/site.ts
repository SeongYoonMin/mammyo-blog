export const site = {
  name: "My Dev Blog",
  description: "개발하면서 배운 것들을 기록하는 블로그",
  author: "Your Name",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "ko_KR",
};

export function absoluteUrl(path: string) {
  return `${site.url}${path}`;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeZone: "Asia/Seoul",
  }).format(date);
}
