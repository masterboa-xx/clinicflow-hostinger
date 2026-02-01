"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/Button";
import { Download, Copy, ExternalLink, QrCode, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageContext";

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    slug: string;
    clinicName: string;
}

export function QRCodeModal({ isOpen, onClose, slug, clinicName }: QRCodeModalProps) {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/p/${slug}` : "";
    const { t } = useLanguage();

    const downloadQR = () => {
        const svg = document.getElementById("clinic-qr-code");
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);
                const pngFile = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.download = `${clinicName}-QR.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            };
            img.src = "data:image/svg+xml;base64," + btoa(svgData);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(url);
        toast.success(t("dashboard.qr.copied"));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 flex flex-col items-center text-center">
                            <h3 className="text-xl font-bold text-slate-800 mb-6">{t("dashboard.qr.join")}</h3>

                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 w-full flex justify-center">
                                <div style={{ height: "auto", margin: "0 auto", maxWidth: 200, width: "100%" }}>
                                    <QRCode
                                        size={256}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        value={url}
                                        viewBox={`0 0 256 256`}
                                        id="clinic-qr-code"
                                    />
                                </div>
                            </div>

                            <p className="font-bold text-slate-900 mb-1">{clinicName}</p>
                            <Link href={`/p/${slug}`} target="_blank" className="text-sm text-slate-500 hover:text-primary flex items-center justify-center gap-1 mb-6 break-all">
                                {url} <ExternalLink size={12} />
                            </Link>

                            <div className="grid grid-cols-2 gap-3 w-full">
                                <Button variant="outline" onClick={copyLink} className="gap-2">
                                    <Copy size={16} /> {t("dashboard.qr.copy")}
                                </Button>
                                <Button onClick={downloadQR} className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                                    <Download size={16} /> {t("dashboard.qr.image")}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
