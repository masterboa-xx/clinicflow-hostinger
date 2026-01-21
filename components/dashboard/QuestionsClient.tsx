"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { addQuestion, deleteQuestion, updateTicketLanguage } from "@/app/actions/questions";
import { Loader2, Plus, Trash2, Globe, FileQuestion } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";

type Question = {
    id: string;
    text: string;
    type: string;
    options: any; // Using any for JSON simplicity
};

type QuestionsClientProps = {
    clinicSlug: string;
    initialQuestions: Question[];
    currentLanguage: string;
};

export default function QuestionsClient({ clinicSlug, initialQuestions, currentLanguage }: QuestionsClientProps) {
    const [isPending, startTransition] = useTransition();
    const [newQuestion, setNewQuestion] = useState("");
    const [isRequired, setIsRequired] = useState(false);
    const [language, setLanguage] = useState(currentLanguage || "ar");

    const handleAdd = async () => {
        if (!newQuestion.trim()) return;
        startTransition(async () => {
            const res = await addQuestion(clinicSlug, newQuestion, "TEXT", [], isRequired);
            if (res.success) {
                setNewQuestion("");
                setIsRequired(false);
                toast.success("Question ajoutée");
            } else {
                toast.error("Erreur");
            }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cette question ?")) return;
        startTransition(async () => {
            const res = await deleteQuestion(id);
            if (res.success) {
                toast.success("Question supprimée");
            } else {
                toast.error("Erreur");
            }
        });
    };



    return (
        <div className="space-y-8">
            {/* LANGUAGE SECTION */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Globe size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Langue du Ticket</h2>
                        <p className="text-slate-400 text-xs">Langue affichée aux patients lors de la prise de ticket.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex gap-4">
                        {[
                            { code: "ar", label: "Arabe (RTL)" },
                            { code: "fr", label: "Français (LTR)" },
                            { code: "en", label: "English (LTR)" }
                        ].map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                className={clsx(
                                    "px-6 py-3 rounded-xl border font-bold text-sm transition-all flex-1",
                                    language === lang.code
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200"
                                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button
                        onClick={() => {
                            startTransition(async () => {
                                const res = await updateTicketLanguage(clinicSlug, language);
                                if (res.success) {
                                    toast.success("Langue enregistrée avec succès ✅");
                                } else {
                                    toast.error("Erreur d'enregistrement ❌");
                                }
                            });
                        }}
                        disabled={isPending || language === currentLanguage}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 shadow-lg shadow-indigo-200"
                    >
                        {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                        Enregistrer la Langue
                    </Button>
                </div>
            </div>

            {/* QUESTIONS SECTION */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <FileQuestion size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Questions Personnalisées</h2>
                        <p className="text-slate-400 text-xs">Ajoutez des questions pour recueillir plus d'infos (ex: Motif, Assurance...)</p>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    {initialQuestions.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            Aucune question configurée
                        </div>
                    ) : (
                        initialQuestions.map((q) => (
                            <div key={q.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl group hover:border-indigo-100 transition-colors">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-700">{q.text}</span>
                                    {q.type === "CHOICE" && <span className="text-xs text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">Choix</span>}
                                    {(q as any).required && <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-bold">Obligatoire</span>}
                                </div>
                                <button
                                    onClick={() => handleDelete(q.id)}
                                    disabled={isPending}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                        <input
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            placeholder="Ex: Quel est le motif de votre visite ?"
                            className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        />
                        <Button
                            onClick={handleAdd}
                            disabled={isPending || !newQuestion.trim()}
                            className="rounded-xl bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200"
                        >
                            {isPending ? <Loader2 className="animate-spin" /> : <Plus />}
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 px-1">
                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={isRequired}
                                onChange={(e) => setIsRequired(e.target.checked)}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            Question obligatoire
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
