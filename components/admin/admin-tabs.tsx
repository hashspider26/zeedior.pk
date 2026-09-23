"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart3, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminTabs({ sessionName }: { sessionName: string }) {
    const pathname = usePathname();

    const tabs = [
        {
            name: "Overview",
            href: "/admin/dashboard",
            icon: LayoutDashboard,
            active: pathname === "/admin/dashboard"
        },
        {
            name: "Banners",
            href: "/admin/dashboard/banners",
            icon: ImageIcon,
            active: pathname === "/admin/dashboard/banners"
        },
        {
            name: "Analytics",
            href: "/admin/dashboard/analytics",
            icon: BarChart3,
            active: pathname === "/admin/dashboard/analytics"
        }
    ];

    return (
        <div className="bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30">
            <div className="mx-auto max-w-5xl px-3 sm:px-6">
                <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
                    <div className="flex items-center gap-2 sm:gap-6 h-full overflow-hidden flex-1 min-w-0">
                        <Link href="/" className="flex items-center gap-1.5 text-zinc-400 hover:text-primary transition-colors pr-3 sm:pr-4 border-r border-zinc-100 dark:border-zinc-800 shrink-0">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider hidden md:inline">Exit</span>
                        </Link>

                        <nav className="flex items-center gap-1 h-full overflow-x-auto hide-scrollbar whitespace-nowrap">
                            {tabs.map((tab) => (
                                <Link
                                    key={tab.href}
                                    href={tab.href}
                                    className={cn(
                                        "flex items-center gap-2 px-3 sm:px-4 h-full border-b-2 transition-all font-bold text-xs sm:text-sm shrink-0 whitespace-nowrap",
                                        tab.active
                                            ? "border-primary text-primary"
                                            : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                    )}
                                >
                                    <tab.icon className="h-4 w-4 shrink-0" />
                                    <span>{tab.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Admin Portal</span>
                            <span className="text-[10px] text-zinc-400 font-medium">{sessionName}</span>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
