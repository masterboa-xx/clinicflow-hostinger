import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="light"
            richColors
            position="top-center"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-950 group-[.toaster]:border-slate-100 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl font-medium",
                    description: "group-[.toast]:text-slate-500",
                    actionButton:
                        "group-[.toast]:bg-slate-900 group-[.toast]:text-slate-50",
                    cancelButton:
                        "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500",
                },
                duration: 4000,
            }}
            {...props}
        />
    );
};

export { Toaster };
