import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "outline";
    size?: "sm" | "md" | "lg" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={twMerge(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed",
                    // Variants
                    variant === "primary" &&
                    "bg-gradient-to-r from-primary-deep to-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]",
                    variant === "secondary" &&
                    "bg-surface text-ink hover:bg-surface-hover hover:text-primary shadow-sm border border-slate-200/50",
                    variant === "outline" &&
                    "border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary",
                    variant === "ghost" &&
                    "bg-transparent text-ink-light hover:text-primary hover:bg-primary/5",
                    // Sizes
                    size === "sm" && "text-sm px-4 py-2",
                    size === "md" && "text-base px-6 py-2.5",
                    size === "lg" && "text-lg px-8 py-3.5",
                    size === "icon" && "p-2",
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";
