"use client";

import { useSearchParams } from "next/navigation";
import QRCode from "react-qr-code";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Printer } from "lucide-react";


import { Suspense } from "react";

function PrintContent() {
    const searchParams = useSearchParams();
    const name = searchParams.get("name") || "My Clinic";
    const slug = searchParams.get("slug") || "";
    const logo = searchParams.get("logo");
    const lang = searchParams.get("lang") || "fr";

    // ... (rest of logic) ...


    const [url, setUrl] = useState("");

    useEffect(() => {
        if (slug) {
            setUrl(`${window.location.origin}/p/${slug}`);
        }
    }, [slug]);

    const dict = {
        fr: {
            title: "Scanner pour s'inscrire",
            subtitle: "Scannez le code QR pour rejoindre la file d'attente",
            visit: "Ou visitez",
            powered: "Propulsé par"
        },
        en: {
            title: "Scan to Join",
            subtitle: "Scan the QR code to join the queue",
            visit: "Or visit",
            powered: "Powered by"
        },
        ar: {
            title: "امسح الرمز للتسجيل",
            subtitle: "امسح رمز الاستجابة السريعة للانضمام إلى قائمة الانتظار",
            visit: "أو قم بزيارة",
            powered: "مدعوم من"
        }
    };

    const t = dict[lang as keyof typeof dict] || dict.fr;
    const isRtl = lang === "ar";

    if (!slug) return <div>Missing Clinic Data</div>;

    return (
        <div className="bg-white min-h-screen flex flex-col items-center p-0 md:p-10 font-sans text-slate-900" dir={isRtl ? "rtl" : "ltr"}>
            {/* PRINT BUTTON - HIDDEN IN PRINT */}
            <div className="fixed top-6 right-6 print:hidden z-50">
                <Button onClick={() => window.print()} size="lg" className="shadow-xl">
                    <Printer className="w-5 h-5 mr-2" />
                    Print Poster
                </Button>
            </div>

            {/* A4 CONTAINER */}
            {/* Standard A4 is roughly 210mm x 297mm. We use approx aspect ratio or max-width */}
            <div className="w-full max-w-[210mm] min-h-[297mm] bg-white border border-slate-200 shadow-2xl print:shadow-none print:border-0 p-12 flex flex-col items-center text-center relative overflow-hidden">

                {/* DECORATIVE BACKGROUND SHAPES */}
                <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-primary to-teal-400 print:block" />

                {/* HEADER */}
                <div className="mb-16 mt-8">
                    {logo ? (
                        <img src={logo} alt={name} className="h-24 object-contain mx-auto mb-6" />
                    ) : (
                        <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl font-bold">{name[0]}</span>
                        </div>
                    )}
                    <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-2">
                        {name}
                    </h1>
                </div>

                {/* INSTRUCTIONS */}
                <div className="space-y-4 mb-16 max-w-lg mx-auto">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 print:bg-transparent print:border-0">
                        <h2 className="text-4xl font-bold text-slate-800 mb-2">{t.title}</h2>
                        <p className="text-slate-500 text-xl">{t.subtitle}</p>
                    </div>
                </div>

                {/* QR CODE */}
                <div className="mb-12 relative p-6 bg-white rounded-3xl border-4 border-slate-900 shadow-sm print:border-4 print:shadow-none">
                    <div className="absolute -top-3 -left-3 w-6 h-6 border-t-4 border-l-4 border-slate-900 rounded-tl-xl" />
                    <div className="absolute -top-3 -right-3 w-6 h-6 border-t-4 border-r-4 border-slate-900 rounded-tr-xl" />
                    <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-4 border-l-4 border-slate-900 rounded-bl-xl" />
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-4 border-r-4 border-slate-900 rounded-br-xl" />

                    <QRCode
                        value={url}
                        size={350}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                    />
                </div>

                {/* LINK */}
                <div className="mb-auto">
                    <p className="text-slate-400 font-mono mb-2 uppercase tracking-widest text-sm">{t.visit}</p>
                    <p className="text-2xl font-bold text-slate-800 bg-slate-100 px-6 py-2 rounded-full inline-block print:bg-transparent print:border print:border-slate-300" dir="ltr">
                        {url.replace(/^https?:\/\//, '')}
                    </p>
                </div>

                {/* FOOTER */}
                <div className="mt-16 text-center text-slate-400 pt-8 border-t border-slate-100 w-full">
                    <p className="flex items-center justify-center gap-2 text-sm font-medium">
                        {t.powered} <span className="font-bold text-slate-600">ClinicFlow.live</span>
                    </p>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 0; }
                    body { background: white; -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
}

export default function PrintPosterPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PrintContent />
        </Suspense>
    );
}
