import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Define protected paths
    const protectedPaths = ['/scan', '/dashboard', '/profile'];
    const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

    // Check for auth token in cookies (preferred) or we can't easily check localStorage in middleware.
    // SINCE we implemented localStorage-based auth in the client components, middleware (server-side) 
    // cannot see localStorage using standard methods. 
    // Standard pattern: Store token in Cookie as well or use a Client Wrapper.

    // Pivot: Since user's current "token" is in localStorage (from previous steps), 
    // Middleware won't work unless we move to Cookies.
    // To keep it "copy-paste ready" and simple without rewriting backend auth to set-cookies:
    // We will simple logic: 
    // 1. We will NOT use Edge Middleware for localStorage auth.
    // 2. We will use a Client-Side AuthGuard component layout.

    // However, for "Complete" auth, Cookies are better.
    // Let's stick to Client-Side protection for the MVP speed unless user asks for Cookies.

    return NextResponse.next();
}

// See AuthGuard component proposal below instead.
