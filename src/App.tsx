import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { HomeView } from "./components/HomeView";
import { InterpretView } from "./components/InterpretView";
import { ChatView } from "./components/ChatView";
import { LearnView } from "./components/LearnView";
import { TranslateView } from "./components/TranslateView";
import { CodeView } from "./components/CodeView";
import { ToolsView } from "./components/ToolsView";
import { ProfileView } from "./components/ProfileView";
import { TechDictionaryModal } from "./components/TechDictionaryModal";
import { InstallModal } from "./components/InstallModal";
import { DataFlowInspectorModal } from "./components/DataFlowInspectorModal";

const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  const renderActiveTab = () => {
    switch (activeTab) {
      case "home":
        return <HomeView />;
      case "interpret":
        return <InterpretView />;
      case "chat":
        return <ChatView />;
      case "learn":
        return <LearnView />;
      case "translate":
        return <TranslateView />;
      case "code":
        return <CodeView />;
      case "tools":
        return <ToolsView />;
      case "profile":
        return <ProfileView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col items-center">
      {/* Mobile Shell Wrapper */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-slate-950 border-x border-slate-800/40 shadow-2xl relative">
        <Header />

        <main className="flex-1 px-3.5 sm:px-4 pt-3 pb-20">
          {renderActiveTab()}
        </main>

        <BottomNav />
        <TechDictionaryModal />
        <DataFlowInspectorModal />
        <InstallModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
