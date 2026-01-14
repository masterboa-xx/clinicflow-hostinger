import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isPublicRoute =
                nextUrl.pathname === "/login" ||
                nextUrl.pathname === "/register" ||
                nextUrl.pathname === "/test-db";

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // Optional: Redirect authenticated users away from public auth pages
                // if (isPublicRoute) return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
