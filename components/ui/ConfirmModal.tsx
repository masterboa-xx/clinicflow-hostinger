"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import clsx from "clsx";

type ConfirmModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
    icon?: React.ReactNode;
};

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirmer",
    cancelText = "Annuler",
    variant = "default",
    icon
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={clsx(
                                        "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                                        variant === "destructive" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
                                    )}>
                                        {icon || <AlertCircle size={24} />}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
                                        <div className="text-slate-500 text-sm leading-relaxed">
                                            {description}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer / Actions */}
                            <div className="bg-slate-50 p-4 flex items-center justify-end gap-3 border-t border-slate-100">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors"
                                >
                                    {cancelText}
                                </button>
                                <Button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={clsx(
                                        "rounded-xl shadow-lg hover:shadow-xl transition-all",
                                        variant === "destructive" ? "bg-red-500 hover:bg-red-600 shadow-red-200" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
                                    )}
                                >
                                    {confirmText}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
