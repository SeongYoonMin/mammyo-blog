import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// GitHub OAuth 콜백 등 Better Auth 엔드포인트
export const { GET, POST } = toNextJsHandler(auth);
