"use client";

import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { DashboardPreview } from "@/components/sections/DashboardPreview";
import { Pricing } from "@/components/sections/Pricing";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
    return (
        <main className="min-h-screen bg-background selection:bg-primary/20">
            <Header />
            <Hero />
            <HowItWorks />
            <DashboardPreview />
            <Pricing />
            <FinalCTA />
            <Footer />
        </main>
    );
}
