import React, { useState } from "react";
import {
  ArrowLeftRight,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Volume2,
  BookOpen,
  Info,
  History,
  CornerDownRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { AppLanguage } from "../types";
import { translateText, TranslateApiResponse } from "../services/api";

export const TranslateView: React.FC = () => {
  const {
    language,
    translationHistory,
    addTranslationToHistory,
    clearTranslationHistory,
  } = useApp();

  const [sourceLang, setSourceLang] = useState<AppLanguage>("en");
  const [targetLang, setTargetLang] = useState<AppLanguage>("om");
  const [inputText, setInputText] = useState("");
  const [translationResult, setTranslationResult] = useState<TranslateApiResponse | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const samplePhrases = [
    {
      source: "Artificial intelligence is empowering young African innovators.",
      srcLang: "en" as const,
      tgtLang: "om" as const,
    },
    {
      source: "Barnoonni saayinsii kompiitaraa jireenya namaa fooyyessa.",
      srcLang: "om" as const,
      tgtLang: "en" as const,
    },
    {
      source: "How do I write a function in Python to analyze data?",
      srcLang: "en" as const,
      tgtLang: "om" as const,
    },
    {
      source: "Kuusaan daataa odeeffannoo amanamummaadhaan qabata.",
      srcLang: "om" as const,
      tgtLang: "en" as const,
    },
  ];

  const handleSwapLanguages = () => {
    const tempSrc = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempSrc);
    if (translationResult?.translatedText) {
      setInputText(translationResult.translatedText);
      setTranslationResult(null);
    }
  };

  const handleTranslate = async (textToUse?: string) => {
    const text = (textToUse || inputText).trim();
    if (!text || isTranslating) return;

    setIsTranslating(true);
    setTranslationResult(null);

    try {
      const res = await translateText(text, sourceLang, targetLang);
      setTranslationResult(res);

      addTranslationToHistory({
        sourceText: text,
        translatedText: res.translatedText,
        sourceLang,
        targetLang,
        keyVocabulary: res.keyVocabulary,
        culturalOrGrammarNotes: res.culturalOrGrammarNotes,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopyResult = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectSample = (sample: typeof samplePhrases[0]) => {
    setSourceLang(sample.srcLang);
    setTargetLang(sample.tgtLang);
    setInputText(sample.source);
    handleTranslate(sample.source);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-lg font-black text-white">
          {language === "om" ? "Hiika Afaan Oromoo ↔ English" : "Afaan Oromoo ↔ English Translator"}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {language === "om"
            ? "Hiika qulqulluu, jechoota teeknolojii fi yaada uumamaa"
            : "Contextual translation powered by Gemini AI with grammar nuances"}
        </p>
      </div>

      {/* Language Switcher Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-2">
        <div className="flex-1 text-center py-1 font-bold text-xs text-white">
          {sourceLang === "om" ? "Afaan Oromoo" : "English"}
        </div>

        <button
          id="swap-lang-btn"
          onClick={handleSwapLanguages}
          className="p-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 transition-all active:scale-95 shadow-sm"
          title="Swap Languages"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        <div className="flex-1 text-center py-1 font-bold text-xs text-amber-400">
          {targetLang === "om" ? "Afaan Oromoo" : "English"}
        </div>
      </div>

      {/* Input Box Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2 shadow-md">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            {sourceLang === "om" ? "Barruu Afaan Oromoo galchaa" : "Enter English text"}
          </span>
          {inputText && (
            <button
              onClick={() => setInputText("")}
              className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>{language === "om" ? "Qulqulleessi" : "Clear"}</span>
            </button>
          )}
        </div>

        <textarea
          id="translate-source-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={3}
          placeholder={
            sourceLang === "om"
              ? "Jecha, hima, ykn keeyyata asitti barreessaa..."
              : "Type or paste words, phrases, or sentences here..."
          }
          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none transition-colors"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-500">
            {inputText.length} {language === "om" ? "qubee" : "chars"}
          </span>

          <button
            id="translate-action-btn"
            onClick={() => handleTranslate()}
            disabled={!inputText.trim() || isTranslating}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              inputText.trim() && !isTranslating
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isTranslating
                ? (language === "om" ? "Hiikaa jira..." : "Translating...")
                : (language === "om" ? "Hiiki" : "Translate")}
            </span>
          </button>
        </div>
      </div>

      {/* Output / Result Box */}
      {translationResult && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 space-y-3 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {targetLang === "om" ? "Hiika Afaan Oromoo" : "English Translation"}
            </span>

            <button
              onClick={() => handleCopyResult(translationResult.translatedText)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{language === "om" ? "Waraabameera" : "Copied"}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{language === "om" ? "Waraabi" : "Copy"}</span>
                </>
              )}
            </button>
          </div>

          <div className="text-sm sm:text-base font-medium text-white leading-relaxed">
            {translationResult.translatedText}
          </div>

          {/* Alternative Translations */}
          {translationResult.alternativeTranslations &&
            translationResult.alternativeTranslations.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  {language === "om" ? "Filannoo Biraa:" : "Alternatives:"}
                </span>
                <div className="space-y-1">
                  {translationResult.alternativeTranslations.map((alt, idx) => (
                    <p key={idx} className="text-xs text-slate-300 italic flex items-center gap-1.5">
                      <CornerDownRight className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{alt}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}

          {/* Cultural / Grammar Notes */}
          {translationResult.culturalOrGrammarNotes && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{translationResult.culturalOrGrammarNotes}</span>
            </div>
          )}

          {/* Key Vocabulary Extraction */}
          {translationResult.keyVocabulary && translationResult.keyVocabulary.length > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-amber-400" />
                {language === "om" ? "Jechoota Ijoo (Key Vocabulary):" : "Key Vocabulary Breakdown:"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {translationResult.keyVocabulary.map((voc, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                  >
                    <span className="font-bold text-amber-300">{voc.term}: </span>
                    <span className="text-slate-300">{voc.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggested Quick Phrases */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {language === "om" ? "Fakkeenyota Qophaa'an" : "Quick Sample Phrases"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {samplePhrases.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(sp)}
              className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-left text-xs text-slate-300 hover:text-white transition-all active:scale-[0.99] flex items-center justify-between group"
            >
              <span className="truncate mr-2 font-medium">{sp.source}</span>
              <span className="text-[10px] text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0 font-bold">
                {sp.srcLang === "en" ? "EN→OM" : "OM→EN"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Translation History */}
      {translationHistory.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              <span>{language === "om" ? "Seenaa Hiikaa" : "Translation History"}</span>
            </h3>
            <button
              onClick={clearTranslationHistory}
              className="text-[11px] text-slate-400 hover:text-red-400"
            >
              {language === "om" ? "Haqi" : "Clear"}
            </button>
          </div>

          <div className="space-y-2">
            {translationHistory.slice(0, 5).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSourceLang(item.sourceLang);
                  setTargetLang(item.targetLang);
                  setInputText(item.sourceText);
                  setTranslationResult({
                    translatedText: item.translatedText,
                    keyVocabulary: item.keyVocabulary,
                    culturalOrGrammarNotes: item.culturalOrGrammarNotes,
                  });
                }}
                className="p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 text-xs text-slate-300 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span className="font-semibold uppercase text-amber-400/80">
                    {item.sourceLang === "om" ? "OM → EN" : "EN → OM"}
                  </span>
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-300 truncate">{item.sourceText}</p>
                <p className="text-white font-medium truncate mt-0.5">{item.translatedText}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
