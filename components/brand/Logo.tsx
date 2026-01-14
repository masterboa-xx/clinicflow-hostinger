"use client";

import { clsx } from "clsx";
import { motion } from "framer-motion";

interface LogoProps {
    variant?: "full" | "icon";
    size?: "sm" | "md" | "lg";
    className?: string;
}

export const Logo = ({ variant = "full", size = "md", className }: LogoProps) => {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-10 h-10"
    };

    const textClasses = {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-3xl"
    };

    return (
        <div className={clsx("flex items-center gap-3", className)}>
            {/* Abstract Flow Icon - Subtle Rotation */}
            <motion.div
                className={clsx("relative flex items-center justify-center text-primary", sizeClasses[size])}
                animate={{ rotate: [0, 6, -6, 0] }}
                transition={{
                    duration: 12,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
            >
                <svg
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                >
                    <path
                        d="M6 16C6 10.4772 10.4772 6 16 6C18.5 6 20.8 6.9 22.5 8.5"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M26 16C26 21.5228 21.5228 26 16 26C13.5 26 11.2 25.1 9.5 23.5"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M16 11C13.2386 11 11 13.2386 11 16C11 18.7614 13.2386 21 16 21C18.7614 21 21 18.7614 21 16"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    />
                    <circle cx="22.5" cy="8.5" r="2" fill="currentColor" />
                    <circle cx="9.5" cy="23.5" r="2" fill="currentColor" />
                </svg>
            </motion.div>

            {/* Wordmark - Animated Gradient Text */}
            {variant === "full" && (
                <motion.span
                    className={clsx("font-bold tracking-tight", textClasses[size])}
                    style={{
                        backgroundImage: "linear-gradient(90deg, #0fb9b1, #1e90ff, #2ed573, #0fb9b1)",
                        backgroundSize: "300% 100%",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        color: "transparent"
                    }}
                    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                    transition={{
                        duration: 14,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                >
                    ClinicFlow
                </motion.span>
            )}
        </div>
    );
};
