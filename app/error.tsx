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
            <p className="text-slate-500 max-w-md">
                We encountered an unexpected error. Our team has been notified.
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
