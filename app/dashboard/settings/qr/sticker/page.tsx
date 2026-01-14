"use client";

import { useSearchParams } from "next/navigation";
import QRCode from "react-qr-code";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Printer } from "lucide-react";


import { Suspense } from "react";

function StickerContent() {
    const searchParams = useSearchParams();
    const name = searchParams.get("name") || "Clinic";
    const slug = searchParams.get("slug") || "";
    const lang = searchParams.get("lang") || "fr";

    const [url, setUrl] = useState("");

    useEffect(() => {
        if (slug) {
            setUrl(`${window.location.origin}/p/${slug}`);
        }
    }, [slug]);

    const dict = {
        fr: { scan: "Scannez-moi" },
        en: { scan: "Scan Me" },
        ar: { scan: "امسح الرمز" }
    };
    const t = dict[lang as keyof typeof dict] || dict.fr;
    const isRtl = lang === "ar";

    if (!slug) return <div>Missing Data</div>;

    return (
        <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-10 font-sans" dir={isRtl ? "rtl" : "ltr"}>
            {/* PRINT BUTTON */}
            <div className="fixed top-6 right-6 print:hidden z-50">
                <Button onClick={() => window.print()} size="sm" variant="outline" className="bg-white">
                    <Printer className="w-4 h-4 mr-2" />
                    Print Sticker
                </Button>
            </div>

            {/* STICKER CONTAINER (Example 10cm x 10cm or similar) */}
            <div className="w-[100mm] h-[100mm] bg-white flex flex-col items-center justify-center text-center p-6 border border-slate-300 shadow-sm print:border-0 print:shadow-none overflow-hidden relative rounded-xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-slate-900" />

                <h1 className="text-xl font-bold text-slate-900 mb-2 truncate w-full px-2">{name}</h1>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 bg-slate-100 px-3 py-1 rounded-full">{t.scan}</p>

                <div className="w-32 h-32 mb-4">
                    <QRCode
                        value={url}
                        size={128}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                    />
                </div>

                <p className="text-[10px] text-slate-400 font-mono" dir="ltr">
                    {url.replace(/^https?:\/\//, '')}
                </p>
            </div>
            <style jsx global>{`
                @media print {
                    @page { size: 100mm 100mm; margin: 0; }
                    body { background: white; display: flex; align-items: center; justify-content: center; height: 100vh; }
                }
            `}</style>
        </div>
    );
}

export default function PrintStickerPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StickerContent />
        </Suspense>
    );
}
