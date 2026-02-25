'use client';

import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider
            refetchInterval={5 * 60} // Refetch every 5 minutes to keep it alive
            refetchOnWindowFocus={true} // Re-validate when app comes to foreground
        >
            {children}
        </SessionProvider>
    );
}
