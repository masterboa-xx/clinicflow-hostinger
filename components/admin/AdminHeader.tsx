"use client";

import { Bell, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Assuming Badge exists, if not will fix
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Assuming Avatar exists
import { LanguageSwitcher } from "./LanguageSwitcher";

export function AdminHeader() {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8 sticky top-0 z-40">
            <LanguageSwitcher />
        </header>
    );
}
