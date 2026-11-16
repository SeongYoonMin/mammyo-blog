import { login } from "../actions";

// SSR: searchParams(에러 표시)를 요청마다 읽음
export const instant = false;

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { error } = await searchParams;
  return (
    <form action={login} className="mx-auto max-w-sm space-y-4 py-10">
      <h1 className="text-xl font-bold">관리자 로그인</h1>
      {error && <p className="text-sm text-red-600">비밀번호가 올바르지 않습니다.</p>}
      <input
        type="password"
        name="password"
        required
        autoFocus
        placeholder="비밀번호"
        className="w-full rounded border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
      />
      <button className="w-full rounded bg-zinc-900 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900">
        로그인
      </button>
    </form>
  );
}
