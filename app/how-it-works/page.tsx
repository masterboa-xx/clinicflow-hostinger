"use client";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HowItWorksDetailed } from "@/components/sections/HowItWorksDetailed";

export default function HowItWorksPage() {
    return (
        <main className="min-h-screen bg-white">
            <Header />
            <div className="pt-20"> {/* Add padding top to account for fixed header */}
                <HowItWorksDetailed />
            </div>
            <Footer />
        </main>
    );
}
