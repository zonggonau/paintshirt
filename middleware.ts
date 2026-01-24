import NextAuth from "next-auth";
import { authConfig } from "./src/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
    // Matched routes will be protected by NextAuth
    matcher: [
        "/dashboard",
        "/dashboard/:path*",
        "/api/dashboard/:path*"
    ]
};
