"use client";

import { useActionState, useState, useEffect } from "react";
import { updateSettings, saveQuestions } from "@/app/actions/settings";
import { Button } from "@/components/ui/Button";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Copy, Save, ExternalLink, Plus, Trash, GripVertical, ArrowLeft, Printer, Share2, StickyNote } from "lucide-react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import clsx from "clsx";

// Component for Submit Button
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button disabled={pending} type="submit" className="w-full sm:w-auto">
            {pending ? (
                <>
                    <Save className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                </>
            ) : (
                <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </>
            )}
        </Button>
    );
}

// Questions Editor Component
function QuestionsEditor({ initialQuestions }: { initialQuestions: any[] }) {
    const [questions, setQuestions] = useState(initialQuestions);
    const [saving, setSaving] = useState(false);

    const addQuestion = () => {
        setQuestions([...questions, { text: "", type: "TEXT", required: false, options: [], id: crypto.randomUUID() }]);
    };

    const removeQuestion = (index: number) => {
        const newQ = [...questions];
        newQ.splice(index, 1);
        setQuestions(newQ);
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const newQ = [...questions];
        newQ[index] = { ...newQ[index], [field]: value };
        setQuestions(newQ);
    };

    const handleSave = async () => {
        setSaving(true);
        const res = await saveQuestions(questions);
        if (res.success) {
            toast.success("Questions saved");
        } else {
            toast.error(res.error || "Error saving");
        }
        setSaving(false);
    };

    return (
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold">Patient Questions</h2>
                    <p className="text-slate-500 text-sm">Define questions patients must answer.</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Questions"}
                </Button>
            </div>

            <div className="space-y-4">
                {questions.map((q, i) => (
                    <div key={q.id || i} className="flex gap-4 items-start p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="mt-3 text-slate-400 cursor-move">
                            <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="flex-1 space-y-3">
                            <input
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="Question text (e.g. Reason for visit?)"
                                value={q.text}
                                onChange={(e) => updateQuestion(i, "text", e.target.value)}
                            />
                            <div className="flex gap-4 items-center">
                                <select
                                    className="px-3 py-1.5 border rounded-lg text-sm bg-white"
                                    value={q.type}
                                    onChange={(e) => updateQuestion(i, "type", e.target.value)}
                                >
                                    <option value="TEXT">Text Answer</option>
                                    <option value="CHOICE">Multiple Choice (Comma separated)</option>
                                </select>
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={q.required}
                                        onChange={(e) => updateQuestion(i, "required", e.target.checked)}
                                    />
                                    Required
                                </label>
                            </div>
                            {q.type === "CHOICE" && (
                                <input
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                    placeholder="Options (comma separated: Yes, No, Maybe)"
                                    value={Array.isArray(q.options) ? q.options.join(", ") : (q.options || "")}
                                    onChange={(e) => updateQuestion(i, "options", e.target.value.split(",").map(s => s.trim()))}
                                />
                            )}
                        </div>
                        <button onClick={() => removeQuestion(i)} className="p-2 text-slate-400 hover:text-red-500">
                            <Trash className="w-5 h-5" />
                        </button>
                    </div>
                ))}

                <button
                    onClick={addQuestion}
                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Add Question
                </button>
            </div>
        </section>
    );
}

// Settings Client Component
export default function SettingsPage({ clinic }: { clinic: any }) {
    const [state, dispatch] = useActionState(updateSettings, null);

    const [patientLink, setPatientLink] = useState(`https://clinicflow.com/p/${clinic.slug}`);
    const [printLang, setPrintLang] = useState<"fr" | "en" | "ar">("fr");

    useEffect(() => {
        setPatientLink(`${window.location.origin}/p/${clinic.slug}`);
    }, [clinic.slug]);

    const handleCopy = () => {
        navigator.clipboard.writeText(patientLink);
        toast.success("Lien copié dans le presse-papier !");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <DashboardHeader clinicName={clinic.name} logo={clinic.logo} />
            <div className="flex-1 max-w-4xl mx-auto space-y-8 p-6 w-full">
                <div className="flex flex-col gap-2">
                    <Link href="/dashboard" className="inline-flex items-center text-sm text-slate-500 hover:text-primary mb-2 transition-colors font-medium">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-800">Clinic Settings</h1>
                    <p className="text-slate-500">Manage your clinic profile and patient queue settings.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* LEFT: FORM */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            Details
                        </h2>

                        <form action={dispatch} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Clinic Name
                                </label>
                                <input
                                    name="name"
                                    defaultValue={clinic.name}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Average Time per Patient (minutes)
                                </label>
                                <input
                                    name="avgTime"
                                    type="number"
                                    min="1"
                                    defaultValue={clinic.avgTime}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    required
                                />
                                <p className="text-xs text-slate-400 mt-1">
                                    Used to calculate estimated wait times for patients.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-50">
                                <SubmitButton />
                                {state?.error && <p className="text-red-500 text-sm mt-3">{state.error}</p>}
                                {state?.success && <p className="text-green-600 text-sm mt-3">{state.success}</p>}
                            </div>
                        </form>
                    </section>

                    {/* RIGHT: QR / LINK */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                        <h2 className="text-xl font-semibold mb-2">Patient Access</h2>
                        <p className="text-sm text-slate-500 mb-8">
                            Share this link or QR code with your patients.
                        </p>

                        <div className="bg-white p-4 rounded-xl border-2 border-slate-100 shadow-inner mb-6">
                            <div className="p-6 bg-slate-900 rounded-lg flex items-center justify-center">
                                <div className="text-center w-full flex flex-col items-center">
                                    <p className="text-xs font-mono mb-3 text-white/50 tracking-widest uppercase">SCAN ME</p>
                                    <div className="bg-white p-3 rounded-xl shadow-lg">
                                        <QRCode
                                            value={patientLink}
                                            size={128}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-3 mb-4">
                            <span className="text-xs text-slate-500 font-mono truncate flex-1 text-left">
                                {patientLink}
                            </span>
                            <button onClick={handleCopy} className="p-2 hover:bg-slate-200 rounded text-slate-600">
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>

                        <Button variant="outline" className="w-full" onClick={() => window.open(patientLink, '_blank')}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open Patient View
                        </Button>


                        <p className="mt-6 text-xs text-slate-400">
                            Public ID: <span className="font-mono">{clinic.slug}</span>
                        </p>
                    </section>

                    {/* TOOLS SECTION */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                        <h2 className="text-xl font-semibold mb-2 text-center">Tools & Sharing</h2>
                        <p className="text-sm text-slate-400 mb-6">Print posters or share your link.</p>

                        {/* Language Selector for Print */}
                        <div className="bg-slate-100 p-1 rounded-lg flex gap-1 mb-6">
                            {(["fr", "en", "ar"] as const).map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setPrintLang(lang)}
                                    className={clsx(
                                        "px-4 py-1.5 rounded-md text-sm font-bold uppercase transition-all",
                                        printLang === lang ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                            <Button
                                variant="outline"
                                className="h-auto py-4 flex flex-col gap-2 relative overflow-hidden group"
                                onClick={() => window.open(`/dashboard/settings/qr/print?slug=${clinic.slug}&name=${encodeURIComponent(clinic.name)}&logo=${encodeURIComponent(clinic.logo || "")}&lang=${printLang}`, '_blank')}
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary group-hover:w-full transition-all duration-300 opacity-10" />
                                <Printer className="w-6 h-6 text-slate-600" />
                                <span className="text-xs font-semibold">Print Poster (A4)</span>
                                <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-50 px-2 rounded">{printLang}</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto py-4 flex flex-col gap-2 relative overflow-hidden group"
                                onClick={() => window.open(`/dashboard/settings/qr/sticker?slug=${clinic.slug}&name=${encodeURIComponent(clinic.name)}&lang=${printLang}`, '_blank')}
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 group-hover:w-full transition-all duration-300 opacity-10" />
                                <StickyNote className="w-6 h-6 text-slate-600" />
                                <span className="text-xs font-semibold">Print Sticker</span>
                                <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-50 px-2 rounded">{printLang}</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto py-4 flex flex-col gap-2"
                                onClick={() => {
                                    const text = `Rejoignez la file d'attente chez ${clinic.name} en cliquant ici : ${patientLink}`;
                                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                }}
                            >
                                <Share2 className="w-6 h-6 text-green-600" />
                                <span className="text-xs font-semibold">WhatsApp</span>
                            </Button>
                        </div>
                        <p className="text-xs text-slate-400 mt-4 text-center bg-slate-50 p-2 rounded w-full">
                            ℹ️ <strong>Tip:</strong> Select language above, then print your poster.
                        </p>
                    </section>
                </div>

                {/* QUESTIONS EDITOR */}
                <QuestionsEditor initialQuestions={clinic.questions || []} />

                {/* TROUBLESHOOTING */}
                <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center border-l-4 border-l-red-500">
                    <h2 className="text-xl font-bold mb-2 text-red-600">Zone de Danger / Dépannage</h2>
                    <p className="text-sm text-slate-500 mb-6 text-center max-w-md">
                        Si votre compteur de tickets est bloqué (ex: A4 alors que la liste est vide), utilisez ce bouton pour tout remettre à zéro (A01).
                    </p>
                    <button
                        onClick={async () => {
                            if (confirm("Êtes-vous sûr de vouloir réinitialiser le compteur à A01 ? Cela annulera tous les tickets en cours.")) {
                                const { resetDailyCounter } = await import("@/app/actions/dashboard");
                                await resetDailyCounter();
                                toast.success("Compteur réinitialisé à A01 !");
                                window.location.reload();
                            }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
                    >
                        <Trash className="w-5 h-5" />
                        Réinitialiser le compteur à A01
                    </button>
                </section>
            </div>
        </div>
    );
}
