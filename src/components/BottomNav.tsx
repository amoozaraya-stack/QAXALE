import React from "react";
import { Home, MessageSquare, Layers, GraduationCap, Languages, Terminal, Wrench } from "lucide-react";
import { useApp } from "../context/AppContext";
import { NavTab } from "../types";

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, language } = useApp();

  const navItems: Array<{
    id: NavTab;
    label: { om: string; en: string };
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: "home",
      label: { om: "Dura", en: "Home" },
      icon: Home,
    },
    {
      id: "interpret",
      label: { om: "Hiika", en: "Interpret" },
      icon: Layers,
    },
    {
      id: "chat",
      label: { om: "AI Chat", en: "AI Chat" },
      icon: MessageSquare,
    },
    {
      id: "tools",
      label: { om: "Meeshaa", en: "Tools" },
      icon: Wrench,
    },
    {
      id: "learn",
      label: { om: "Baradhu", en: "Learn" },
      icon: GraduationCap,
    },
    {
      id: "translate",
      label: { om: "Afaan", en: "Translate" },
      icon: Languages,
    },
    {
      id: "code",
      label: { om: "Koodii", en: "Code" },
      icon: Terminal,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-7 items-center px-1 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 min-h-[46px] active:scale-95 ${
                isActive
                  ? "text-amber-400 bg-amber-500/10 font-bold"
                  : "text-slate-400 hover:text-slate-200 font-medium"
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform ${isActive ? "scale-110" : ""}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
                )}
              </div>
              <span className="text-[8.5px] sm:text-[9px] mt-1 tracking-tight leading-none truncate max-w-full">
                {item.label[language]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
