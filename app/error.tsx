"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-center px-4">
            <h2 className="text-2xl font-bold text-slate-800">Something went wrong!</h2>
            <div className="text-red-500 bg-red-50 p-4 rounded text-left max-w-2xl overflow-auto text-sm font-mono border border-red-200">
                <p className="font-bold mb-2">Error Details (Debug Mode):</p>
                <p>{error.message}</p>
                {error.digest && <p className="mt-1 text-xs text-red-400">Digest: {error.digest}</p>}
                {/* Stack trace only shown in dev, but message is critical */}
            </div>
            <p className="text-slate-500 max-w-md">
                Please take a screenshot of this error and send it for support.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()}>Try again</Button>
                <Button variant="outline" onClick={() => window.location.href = "/"}>
                    Go Home
                </Button>
            </div>
        </div>
    );
}
