import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
    trustHost: true,
    providers: [
        Credentials({
            // Providers will be handled in auth.ts because they need DB access
            // but we need to declare them here for middleware compatibility if needed
            // or just leave them empty if we handle everything in auth.ts
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isDashboard = nextUrl.pathname.startsWith("/dashboard");

            if (isDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            }
            return true;
        },
    },
} satisfies NextAuthConfig;
