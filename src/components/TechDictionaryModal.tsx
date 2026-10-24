import React, { useState } from "react";
import { X, Search, Bookmark, BookmarkCheck, BookOpen, Volume2, Sparkles } from "lucide-react";
import { TECH_DICTIONARY } from "../data/dictionaryData";
import { useApp } from "../context/AppContext";
import { lookupDictionaryTerm } from "../services/api";

export const TechDictionaryModal: React.FC = () => {
  const { showDictionaryModal, setShowDictionaryModal, language, progress, toggleBookmark } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [aiLookupResult, setAiLookupResult] = useState<any | null>(null);
  const [isSearchingAi, setIsSearchingAi] = useState(false);

  if (!showDictionaryModal) return null;

  const categories = ["All", "AI", "Programming", "CS", "Data", "Internet", "General Tech"];

  const filteredTerms = TECH_DICTIONARY.filter((item) => {
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.termOromo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.termEnglish.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definitionOromo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCustomAiSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsSearchingAi(true);
    setAiLookupResult(null);
    try {
      const res = await lookupDictionaryTerm(searchTerm);
      if (res) {
        setAiLookupResult(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {language === "om" ? "Kuusaa Jechoota Teeknolojii" : "Tech Dictionary (Afaan Oromoo)"}
              </h2>
              <p className="text-xs text-slate-400">
                {language === "om"
                  ? "Jechoota saayinsii & kompiitaraa Afaan Oromootiin"
                  : "Modern technical & AI terminology in Afaan Oromoo"}
              </p>
            </div>
          </div>
          <button
            id="close-dict-modal-btn"
            onClick={() => setShowDictionaryModal(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="dict-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                language === "om"
                  ? "Jecha barbaadi (fkn: AI, Algorizimii, Loop...)"
                  : "Search terms (e.g., AI, Algorithm, Database...)"
              }
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-24 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={handleCustomAiSearch}
                disabled={isSearchingAi}
                className="absolute right-1.5 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-all flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>{isSearchingAi ? "..." : "AI Ibsa"}</span>
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex gap-1.5 overflow-x-auto mt-3 pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-amber-400 text-slate-950 font-bold"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-800/60">
          {/* AI Custom Lookup Card if active */}
          {aiLookupResult && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 mb-3 text-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> QAXALE AI Ibsa
                </span>
                <span className="text-xs text-slate-400">{aiLookupResult.partOfSpeech || "Jecha"}</span>
              </div>
              <h3 className="text-base font-bold text-white">{aiLookupResult.oromooTerm || aiLookupResult.term}</h3>
              <p className="text-xs text-amber-200/80 mb-2 font-mono">{aiLookupResult.englishTerm}</p>
              <p className="text-xs text-slate-300 leading-relaxed mb-2">{aiLookupResult.definitionOromo}</p>
              {aiLookupResult.exampleOromo && (
                <div className="p-2 rounded-lg bg-slate-950/60 text-xs text-slate-300 italic border border-slate-800">
                  "{aiLookupResult.exampleOromo}"
                </div>
              )}
            </div>
          )}

          {filteredTerms.length === 0 && !aiLookupResult && (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-400">
                {language === "om" ? "Jechi kun kuusaa keessatti hin argamne." : "No terms matched your query."}
              </p>
              {searchTerm && (
                <button
                  onClick={handleCustomAiSearch}
                  className="mt-3 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md hover:bg-amber-400"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Qaxale AI'n Ibsi ("{searchTerm}")</span>
                </button>
              )}
            </div>
          )}

          {filteredTerms.map((item) => {
            const isBookmarked = progress.bookmarkedTerms.includes(item.id);
            return (
              <div key={item.id} className="pt-3 first:pt-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{item.termOromo}</span>
                      <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                    </h3>
                    <p className="text-xs text-amber-400/90 font-medium font-mono">{item.termEnglish}</p>
                  </div>
                  <button
                    onClick={() => toggleBookmark(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  {language === "om" ? item.definitionOromo : item.definitionEnglish}
                </p>

                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-300">
                  <span className="text-amber-400 font-semibold mr-1">
                    {language === "om" ? "Fakkeenya:" : "Example:"}
                  </span>
                  <span>{language === "om" ? item.exampleSentenceOromo : item.exampleSentenceEnglish}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
