import React, { useState } from "react";
import {
  Globe,
  Search,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Layers,
  Send,
  RefreshCw,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { performGoogleSearchGrounding, GoogleGroundingResult } from "../../services/api";

export const GoogleGroundingTool: React.FC = () => {
  const { language, setActiveTab, createConversation, addMessageToActiveConversation } = useApp();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GoogleGroundingResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setResult(null);

    const res = await performGoogleSearchGrounding(query, language);
    setResult(res);
    setLoading(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToChat = (text: string, title: string) => {
    createConversation(title.slice(0, 28));
    addMessageToActiveConversation({
      role: "assistant",
      content: text,
      mode: "agency-loop",
    });
    setActiveTab("chat");
  };

  const suggestedQueries = [
    { om: "Odeeffannoo tapha kubbaa miilaa dhihoo kana", en: "Latest Champions League fixtures and form" },
    { om: "Dandeettii fi teeknolojii AI haarawa 2026", en: "Latest multimodal AI breakthroughs 2026" },
    { om: "Garaagarummaa odds fi carraa (probability)", en: "How betting market margins impact probability" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">
            {language === "om"
              ? "Google Search Grounding (Ragaa Qabatamaa Ammayyaa)"
              : "Google Grounded Web Intelligence"}
          </h3>
        </div>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 font-mono">
          <ShieldCheck className="w-3 h-3" />
          Gemini 3.7 + Google Search
        </span>
      </div>

      {/* Suggested Quick Queries */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {suggestedQueries.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setQuery(item[language])}
            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300 whitespace-nowrap transition-colors"
          >
            + {item[language]}
          </button>
        ))}
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === "om"
                ? "Waa'ee maaliitiif ragaa intarneetii qabatamaa barbaaddu?..."
                : "Ask any real-time, verified question grounded by Google Search..."
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        </div>

        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40 transition-all active:scale-[0.98]"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{language === "om" ? "Intarneetii Qoraa Jira..." : "Grounding via Google Search..."}</span>
            </>
          ) : (
            <>
              <Globe className="w-3.5 h-3.5" />
              <span>{language === "om" ? "Google'n Qori & Ragaa Fidi" : "Query Google Grounded Engine"}</span>
            </>
          )}
        </button>
      </form>

      {/* Grounded Result Display */}
      {result && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
                {language === "om" ? "Deebii Qabatamaa" : "Grounded Intelligence"}
              </span>
              <h4 className="text-xs font-bold text-white line-clamp-1">{result.query}</h4>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleCopy(result.text)}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-white text-[10px] flex items-center gap-1 transition-colors"
                title="Copy text"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
              <button
                type="button"
                onClick={() => handleSendToChat(result.text, result.query)}
                className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-[10px] flex items-center gap-1 transition-colors"
                title="Open in Chat"
              >
                <Send className="w-3 h-3" />
                <span className="hidden sm:inline">{language === "om" ? "Gara Chaatiitti" : "To Chat"}</span>
              </button>
            </div>
          </div>

          {/* Search Queries Used */}
          {result.searchQueries && result.searchQueries.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Search className="w-3 h-3 text-emerald-400" />
                {language === "om" ? "Jechoonni Barbaacha Google:" : "Google Search Queries Executed:"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.searchQueries.map((sq, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-mono"
                  >
                    "{sq}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Answer Text */}
          <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            {result.text}
          </div>

          {/* Verified Web Citations / Sources */}
          {result.sources && result.sources.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <ExternalLink className="w-3 h-3 text-emerald-400" />
                {language === "om" ? "Maddawwan Qabatamaa (Citations):" : "Verified Grounding Sources & Citations:"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 rounded-lg flex items-center justify-between gap-2 group transition-all"
                  >
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-medium text-slate-200 group-hover:text-emerald-300 truncate">
                        {src.title || src.url}
                      </p>
                      <p className="text-[9px] text-slate-500 truncate font-mono">{src.url}</p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
