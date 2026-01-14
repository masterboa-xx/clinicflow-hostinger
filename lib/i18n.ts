export type Language = 'fr' | 'en' | 'ar';

export const translations = {
    fr: {
        hero: {
            headline: "Organisez les tours.\nEn temps réel.",
            subheadline: "Optimisez le flux des patients. Réduisez l’attente.",
            primaryCta: "Demander une démo",
            secondaryCta: "Voir la vidéo",
        },
        nav: {
            features: "Fonctionnalités",
            howItWorks: "Comment ça marche",
            pricing: "Tarifs",
            contact: "Contact",
            demo: "Demander une démo",
        },
        howItWorks: {
            title: "Comment ça marche",
            step1: { title: "Scannez le QR", desc: "Le patient s'enregistre à son arrivée." },
            step2: { title: "Prenez un tour", desc: "Le système attribue un numéro et une estimation." },
            step3: { title: "Arrivez au bon moment", desc: "Recevez une notification quand c'est votre tour." },
        },
        dashboard: {
            title: "Un tableau de bord intuitif.\nZéro formation requise.",
            subtitle: "Gérez votre file d'attente d'un simple clic. Informez vos patients en temps réel.",
            feature1: "Mise à jour en temps réel",
            feature2: "Notifications automatiques",
        },
        pricing: {
            title: "Tarifs",
            turn: {
                title: "Plan TURN",
                features: ["File d’attente en temps réel", "QR code illimité", "Patients en temps réel", "Notifications SMS"]
            },
            pro: {
                title: "Plan PRO",
                tag: "Bientôt disponible",
                features: ["Toutes les fonctionnalités TURN", "Statistiques avancées", "Multi-comptes", "Support prioritaire"]
            }
        },
        cta: {
            title: "Prêt à fluidifier votre clinique ?",
            button: "Demander une démo"
        },
        footer: {
            rights: "Tous droits réservés.",
            privacy: "Politique de confidentialité",
            legal: "Mentions légales",
            description: "ClinicFlow aide les cliniques modernes à améliorer l'expérience patient grâce à une technologie de file d'attente intelligente."
        },
        patient: {
            welcome: "Bienvenue",
            clinicName: "Clinique Dr. Tarik",
            takeTurn: "Prendre un ticket",
            instruction: "Prenez un ticket et suivez votre tour à distance.",
            ticketLabel: "Votre numéro",
            positionLabel: "personnes avant vous",
            waitLabel: "Temps estimé",
            min: "min",
            imminent: "Imminent",
            statusWaiting: "En attente",
            statusReady: "C'est votre tour !",
            refresh: "Actualiser",
            cancel: "Annuler mon tour",
            goToDesk: "Veuillez vous présenter à l'accueil."
        }
    },
    en: {
        hero: {
            headline: "Organize turns.\nIn real-time.",
            subheadline: "Optimize patient flow. Reduce waiting times.",
            primaryCta: "Request a Demo",
            secondaryCta: "Watch Video",
        },
        nav: {
            features: "Features",
            howItWorks: "How it works",
            pricing: "Pricing",
            contact: "Contact",
            demo: "Request a demo",
        },
        howItWorks: {
            title: "How it works",
            step1: { title: "Scan the QR", desc: "Patient checks in upon arrival." },
            step2: { title: "Take a number", desc: "System assigns a number and estimated time." },
            step3: { title: "Arrive on time", desc: "Receive a notification when it's your turn." },
        },
        dashboard: {
            title: "Intuitive Dashboard.\nNo training required.",
            subtitle: "Manage your queue with a single click. Notify patients in real-time.",
            feature1: "Real-time updates",
            feature2: "Automatic notifications",
        },
        pricing: {
            title: "Pricing",
            turn: {
                title: "TURN Plan",
                features: ["Real-time Queue", "Unlimited QR Codes", "Real-time Patients", "SMS Notifications"]
            },
            pro: {
                title: "PRO Plan",
                tag: "Coming Soon",
                features: ["All TURN features", "Advanced analytics", "Multi-accounts", "Priority support"]
            }
        },
        cta: {
            title: "Ready to streamline your clinic?",
            button: "Request a Demo"
        },
        footer: {
            rights: "All rights reserved.",
            privacy: "Privacy Policy",
            legal: "Legal Notice",
            description: "ClinicFlow helps modern clinics improve patient experience with smart queuing technology."
        },
        patient: {
            welcome: "Welcome",
            clinicName: "Dr. Tarik Clinic",
            takeTurn: "Get a Ticket",
            instruction: "Take a ticket to join the queue.",
            ticketLabel: "Your Ticket",
            positionLabel: "people ahead of you",
            waitLabel: "Est. wait time",
            min: "min",
            imminent: "Imminent",
            statusWaiting: "Waiting",
            statusReady: "It's your turn!",
            refresh: "Refresh",
            cancel: "Cancel Ticket",
            goToDesk: "Please proceed to the reception."
        }
    },
    ar: {
        hero: {
            headline: "نظّم الأدوار.\nفي الوقت الفعلي.",
            subheadline: "حسن تدفق المرضى. قلل وقت الانتظار.",
            primaryCta: "اطلب عرضاً تجريبياً",
            secondaryCta: "شاهد الفيديو",
        },
        nav: {
            features: "الميزات",
            howItWorks: "كيف يعمل",
            pricing: "الأسعار",
            contact: "اتصل بنا",
            demo: "طلب عرض توضيحي",
        },
        howItWorks: {
            title: "كيف يعمل",
            step1: { title: "مسح QR", desc: "يسجل المريض عند الوصول." },
            step2: { title: "خذ دوراً", desc: "يمنح النظام رقماً ووقتاً تقديرياً." },
            step3: { title: "احضر في الوقت المناسب", desc: "تلقى إشعاراً عندما يحين دورك." },
        },
        dashboard: {
            title: "لوحة تحكم بديهية.\nبدون تدريب مسبق.",
            subtitle: "أدر طابور الانتظار بنقرة واحدة. أخبر المرضى في الوقت الفعلي.",
            feature1: "تحديثات في الوقت الفعلي",
            feature2: "إشعارات تلقائية",
        },
        pricing: {
            title: "الأسعار",
            turn: {
                title: "خطة TURN",
                features: [
                    "طابور في الوقت الفعلي",
                    "رمز QR غير محدود",
                    "متابعة المرضى",
                    "إشعارات SMS"
                ],
            },
            pro: {
                title: "خطة PRO",
                tag: "قريباً",
                features: [
                    "ملف طبي رقمي",
                    "إدارة المواعيد",
                    "استشارات عن بعد",
                    "فواتير مبسطة"
                ]
            }
        },
        cta: {
            title: "مستعد لتحسين عيادتك؟",
            button: "اطلب عرضاً تجريبياً"
        },
        footer: {
            rights: "جميع الحقوق محفوظة.",
            privacy: "سياسة الخصوصية",
            legal: "إشعار قانوني",
            description: "تساعد ClinicFlow العيادات الحديثة على تحسين تجربة المريض باستخدام تقنية قائمة الانتظار الذكية."
        },
        patient: {
            welcome: "مرحباً",
            clinicName: "عيادة د. طارق",
            takeTurn: "حجز تذكرة",
            instruction: "احجز تذكرة للانضمام إلى قائمة الانتظار.",
            ticketLabel: "رقمك",
            positionLabel: "أشخاص قبلك",
            waitLabel: "وقت الانتظار",
            min: "دقيقة",
            imminent: "وشيك",
            statusWaiting: "في الانتظار",
            statusReady: "إنه دورك الآن!",
            refresh: "تحديث",
            cancel: "إلغاء الدور",
            goToDesk: "يرجى التوجه إلى مكتب الاستقبال."
        }
    }
};
