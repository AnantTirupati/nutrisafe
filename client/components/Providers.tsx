"use client";
import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function Providers({ children }: { children: React.ReactNode }) {
    // NOTE: Replace with your actual Google Client ID
    const clientId = "253161207475-1bu9rbat08a0s13nojglmgs0dvqfkdhh.apps.googleusercontent.com";

    return (
        <GoogleOAuthProvider clientId={clientId}>
            {children}
        </GoogleOAuthProvider>
    );
}
