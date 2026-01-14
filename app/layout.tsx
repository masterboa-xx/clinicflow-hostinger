import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { clsx } from 'clsx';
import { LanguageProvider } from "@/components/providers/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ClinicFlow - Gestion de file d'attente en temps réel",
    description: "Optimisez le flux des patients, réduisez l'attente et libérez votre personnel avec ClinicFlow.",
};

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body className={clsx(inter.className, "antialiased bg-background text-foreground overflow-x-hidden")}>
                <LanguageProvider>
                    {children}
                </LanguageProvider>
                <Toaster />
            </body>
        </html>
    );
}
