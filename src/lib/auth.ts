import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

// 1인 블로그: GitHub 로그인 + DB 세션. ADMIN_EMAIL과 같은 계정만 관리자로 인정한다.
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const isAdminEmail = (email: string) => !!adminEmail && email.toLowerCase() === adminEmail;

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  databaseHooks: {
    // 관리자 외 계정은 가입(사용자 생성) 자체를 막는다.
    user: { create: { before: async (user) => isAdminEmail(user.email) } },
  },
  plugins: [nextCookies()], // Server Action에서 로그인/로그아웃 쿠키를 설정하기 위해 필요(마지막에 둘 것)
});

export async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  return !!session && isAdminEmail(session.user.email);
}

/** 관리자 페이지와 모든 Server Action 첫 줄에서 호출 */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
