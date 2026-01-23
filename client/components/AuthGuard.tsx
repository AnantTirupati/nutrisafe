"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Public paths that don't need auth
        const publicPaths = ['/', '/auth/login', '/auth/register'];

        if (publicPaths.includes(pathname)) {
            setAuthorized(true);
            return;
        }

        // Check token
        const token = localStorage.getItem('token');

        if (!token) {
            // Redirect to login
            router.push('/auth/login');
        } else {
            setAuthorized(true);
        }
    }, [pathname, router]);

    // Show nothing while checking (or a spinner) to prevent flash of protected content
    if (!authorized) {
        // Allow public pages to render immediately if we know they are public
        const publicPaths = ['/', '/auth/login', '/auth/register'];
        if (publicPaths.includes(pathname)) return <>{children}</>;
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading Auth...</div>;
    }

    return <>{children}</>;
}
