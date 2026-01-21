"use client";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ContactDetailed } from "@/components/sections/ContactDetailed";

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-white">
            <Header />
            <div className="pt-20">
                <ContactDetailed />
            </div>
            <Footer />
        </main>
    );
}
