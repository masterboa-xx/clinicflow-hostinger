"use client";

import { useState, useTransition, useEffect } from "react";
import { Copy, Printer, Share2, Download, Eye, EyeOff, Activity, CheckCircle, ShieldCheck } from "lucide-react";
import QRCode from "react-qr-code";
import QRCodeGenerator from "qrcode"; // New library for generation
import { jsPDF } from "jspdf"; // PDF generator
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { logout } from "@/app/actions/auth";
import clsx from "clsx";
import Link from "next/link";

export default function SettingsPage({ clinic }: { clinic: any }) {
    const [patientLink, setPatientLink] = useState("");

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPatientLink(`${window.location.origin}/p/${clinic.slug}`);
        }
    }, [clinic.slug]);

    // Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // UI Toggles
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [isPending, startTransition] = useTransition();
    const [printLang, setPrintLang] = useState<"fr" | "en" | "ar">("fr");

    // Derived strength
    const getStrength = (pass: string) => {
        if (!pass) return 0;
        let score = 0;
        if (pass.length > 5) score++;
        if (pass.length > 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        return score; // 0-4
    };
    const strength = getStrength(newPassword);

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Mot de passe mis à jour avec succès !", {
                icon: <CheckCircle className="text-emerald-500" size={20} />,
                className: "bg-emerald-50 border-emerald-100 text-emerald-800"
            });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        });
    };

    const handleDownloadQR = async () => {
        if (!patientLink) return;

        try {
            toast.loading("Génération du PDF...");

            // 1. Generate High-Res QR Code Image
            const qrDataUrl = await QRCodeGenerator.toDataURL(patientLink, {
                width: 1000,
                margin: 1,
                color: { dark: '#000000', light: '#FFFFFF' }
            });

            // 2. Initialize PDF (A4 Portrait)
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            const width = doc.internal.pageSize.getWidth();
            const height = doc.internal.pageSize.getHeight();

            // 3. Add Content

            // Header: Clinic Name
            doc.setFont("helvetica", "bold");
            doc.setFontSize(28);
            doc.setTextColor(30, 41, 59); // slate-800
            doc.text(clinic.name, width / 2, 40, { align: "center" });

            // Subtitle
            doc.setFont("helvetica", "normal");
            doc.setFontSize(14);
            doc.setTextColor(100, 116, 139); // slate-500
            doc.text("Scannez pour prendre un ticket", width / 2, 50, { align: "center" });

            // QR Code Image (Centered)
            const qrSize = 120;
            const qrX = (width - qrSize) / 2;
            const qrY = 70;
            doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

            // Instructions / Call to Action
            doc.setFontSize(16);
            doc.setTextColor(30, 41, 59);
            doc.text("Prenez votre ticket ou rendez-vous en ligne", width / 2, qrY + qrSize + 20, { align: "center" });

            // Link URL (clickable look)
            doc.setFontSize(12);
            doc.setTextColor(79, 70, 229); // indigo-600
            doc.text(patientLink, width / 2, qrY + qrSize + 30, { align: "center" });

            // Footer
            doc.setFontSize(10);
            doc.setTextColor(148, 163, 184); // slate-400
            doc.text("Propulsé par ClinicFlow", width / 2, height - 20, { align: "center" });

            // 4. Save
            doc.save(`affiche-qrcode-${clinic.slug}.pdf`);

            toast.dismiss();
            toast.success("PDF téléchargé !");

        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de la génération du PDF");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col min-h-screen">

                {/* --- HEADER --- */}
                <header className="h-16 bg-white flex items-center justify-between px-8 sticky top-0 z-30 border-b border-slate-50/50 backdrop-blur-xl bg-white/80">
                    <div className="flex items-center gap-3">
                        <Activity className="text-emerald-500" size={24} />
                        <h1 className="font-bold text-xl text-slate-800">ClinicFlow</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm border border-indigo-100">
                            Dr
                        </div>
                        <button
                            onClick={() => logout()}
                            className="text-sm font-medium text-slate-500 hover:text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            Déconnexion
                        </button>
                    </div>
                </header>

                <main className="p-8 max-w-[1600px] mx-auto w-full">
                    <h1 className="text-3xl font-bold text-slate-900 mb-8">Paramètres</h1>

                    <div className="grid lg:grid-cols-2 gap-8">

                        {/* CARD 1: ACCOUNT SECURITY */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-1">Sécurité du compte</h2>
                                <p className="text-slate-500 text-sm">Gérez l'accès à votre compte en toute sécurité</p>
                            </div>

                            <form onSubmit={handleUpdatePassword} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="relative">
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Mot de passe actuel</label>
                                        <div className="relative">
                                            <input
                                                type={showCurrent ? "text" : "password"}
                                                value={currentPassword}
                                                onChange={e => setCurrentPassword(e.target.value)}
                                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                                placeholder="••••••••"
                                            />
                                            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Nouveau mot de passe</label>
                                        <div className="relative">
                                            <input
                                                type={showNew ? "text" : "password"}
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)}
                                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                                placeholder="••••••••"
                                            />
                                            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Strength Indicator */}
                                    <div className="space-y-2">
                                        <div className="flex gap-2 h-1.5">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className={clsx(
                                                        "flex-1 rounded-full transition-all duration-300",
                                                        strength >= i
                                                            ? (strength < 2 ? "bg-red-500" : strength < 4 ? "bg-yellow-500" : "bg-emerald-500")
                                                            : "bg-slate-100"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <div className={clsx("flex items-center gap-1.5 text-xs font-bold transition-colors",
                                            !newPassword ? "text-slate-300" :
                                                strength < 2 ? "text-red-500" : strength < 4 ? "text-yellow-600" : "text-emerald-600"
                                        )}>
                                            Securité : {
                                                !newPassword ? "Vide" :
                                                    strength < 2 ? "Faible" : strength < 4 ? "Moyen" : "Fort"
                                            }
                                            {strength >= 4 && <CheckCircle size={12} className="fill-emerald-600 text-white" />}
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Confirmer le nouveau mot de passe</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirm ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                                placeholder="••••••••"
                                            />
                                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full py-6 rounded-xl text-md font-bold bg-gradient-to-r from-emerald-400 to-blue-500 hover:from-emerald-500 hover:to-blue-600 shadow-lg shadow-emerald-200 border-0"
                                    disabled={isPending}
                                >
                                    {isPending ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                                </Button>
                            </form>
                        </div>

                        {/* CARD 2: QR CODE */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col">
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-1">QR Code pour les patients</h2>
                                <p className="text-slate-500 text-sm">Les patients scannent ce code pour prendre un ticket ou un rendez-vous</p>
                            </div>

                            <div className="flex-1 flex flex-col items-center">
                                {/* Badge scan */}
                                <div className="bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100 mb-6">
                                    <span className="text-xs font-bold text-slate-600">Scan pour prendre un ticket</span>
                                </div>

                                {/* QR Wrapper */}
                                <div className="p-4 bg-white rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 mb-8">
                                    <QRCode
                                        id="clinic-qr"
                                        value={patientLink}
                                        size={200}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox={`0 0 256 256`}
                                    />
                                </div>

                                {/* Link Display */}
                                <div className="w-full max-w-sm mb-4 relative group">
                                    <input
                                        readOnly
                                        value={patientLink}
                                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        onClick={(e) => e.currentTarget.select()}
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(patientLink);
                                            toast.success("Lien copié !");
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Copier le lien"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>

                                {/* Actions */}
                                <div className="w-full space-y-3 max-w-sm">
                                    <button
                                        onClick={() => window.open(`/dashboard/settings/qr/print?slug=${clinic.slug}&name=${encodeURIComponent(clinic.name)}&logo=${encodeURIComponent(clinic.logo || "")}&lang=${printLang}`, '_blank')}
                                        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors text-sm font-bold text-slate-700 shadow-sm"
                                    >
                                        <Printer size={18} className="text-slate-400" />
                                        Imprimer QR code
                                    </button>
                                    <button
                                        onClick={() => {
                                            const text = `Rejoignez la file d'attente chez ${clinic.name} en cliquant ici : ${patientLink}`;
                                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                        }}
                                        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors text-sm font-bold text-slate-700 shadow-sm"
                                    >
                                        <Share2 size={18} className="text-slate-400" />
                                        Partager via WhatsApp
                                    </button>
                                </div>

                                {/* Language Selector for Print */}
                                <div className="mt-6 flex flex-col items-center gap-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Langue de l'affiche</span>
                                    <div className="flex items-center p-1 bg-slate-50 border border-slate-200 rounded-lg">
                                        <button
                                            onClick={() => setPrintLang("fr")}
                                            className={clsx("px-3 py-1.5 rounded-md text-xs font-bold transition-all", printLang === "fr" ? "bg-white text-emerald-600 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-700")}
                                        >
                                            Français
                                        </button>
                                        <button
                                            onClick={() => setPrintLang("ar")}
                                            className={clsx("px-3 py-1.5 rounded-md text-xs font-bold transition-all", printLang === "ar" ? "bg-white text-emerald-600 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-700")}
                                        >
                                            العربية
                                        </button>
                                        <button
                                            onClick={() => setPrintLang("en")}
                                            className={clsx("px-3 py-1.5 rounded-md text-xs font-bold transition-all", printLang === "en" ? "bg-white text-emerald-600 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-700")}
                                        >
                                            English
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
