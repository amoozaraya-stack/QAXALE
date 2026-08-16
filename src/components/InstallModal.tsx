import React, { useState } from "react";
import {
  Download,
  X,
  Smartphone,
  Share2,
  PlusSquare,
  CheckCircle2,
  Copy,
  Check,
  Globe,
  Sparkles,
  ExternalLink,
  MoreVertical,
  Laptop,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export const InstallModal: React.FC = () => {
  const {
    language,
    showInstallModal,
    setShowInstallModal,
    deferredPrompt,
    handleInstallApp,
    isAppInstalled,
  } = useApp();

  const [activePlatform, setActivePlatform] = useState<"android" | "ios" | "desktop">("android");
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!showInstallModal) return null;

  const currentUrl = window.location.href;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-sm">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400">
                <Download className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {language === "om" ? "QAXALE Fuula Duraatti Fe'i" : "Install QAXALE to Home Screen"}
              </h3>
              <p className="text-[11px] text-amber-400 font-medium">
                {language === "om" ? "Akka Appii Mobaayilaatti Hojjedhu" : "Fast, Offline-Ready & Native Feel"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowInstallModal(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Quick 1-Click Install Button if supported by browser */}
          {deferredPrompt && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {language === "om" ? "Fe'iinsa Saffisaa (1-Click)" : "Instant 1-Click Install"}
                </span>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                  PWA Ready
                </span>
              </div>
              <p className="text-slate-300">
                {language === "om"
                  ? "Qaxaleen battalumatti gara fuula duraa (Homescreen) bilbila keessaniitti fe'ama."
                  : "Tap the button below to immediately add QAXALE to your home screen or app drawer."}
              </p>
              <button
                onClick={handleInstallApp}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{language === "om" ? "Amma Fe'i (Install Now)" : "Install QAXALE App"}</span>
              </button>
            </div>
          )}

          {isAppInstalled && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3 text-emerald-300 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                {language === "om"
                  ? "Appichi duraan bilbila keessan irratti fe'ameera!"
                  : "QAXALE is already installed on your device homescreen!"}
              </span>
            </div>
          )}

          {/* Platform Tab Switcher */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {language === "om" ? "Qajeelfama Gosa Meeshaa:" : "Step-by-step Guide by Device:"}
            </span>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActivePlatform("android")}
                className={`py-1.5 rounded-lg text-center font-bold text-xs transition-all ${
                  activePlatform === "android"
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Android
              </button>
              <button
                onClick={() => setActivePlatform("ios")}
                className={`py-1.5 rounded-lg text-center font-bold text-xs transition-all ${
                  activePlatform === "ios"
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                iPhone / iPad
              </button>
              <button
                onClick={() => setActivePlatform("desktop")}
                className={`py-1.5 rounded-lg text-center font-bold text-xs transition-all ${
                  activePlatform === "desktop"
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Desktop
              </button>
            </div>
          </div>

          {/* Step Instructions per platform */}
          {activePlatform === "android" && (
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3.5 space-y-3">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>{language === "om" ? "Android (Chrome / Samsung / Edge)" : "Android Instructions"}</span>
              </h4>

              <ol className="space-y-2.5 text-slate-300 text-xs">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    {language === "om" ? (
                      <span>
                        Biroowzarii (Chrome) keessatti, mirga gubbaatti mallattoo <strong>qabxii sadii (⋮)</strong> tuqi.
                      </span>
                    ) : (
                      <span>
                        In Chrome or your browser, tap the <strong>three dots menu (⋮)</strong> at the top right.
                      </span>
                    )}
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    {language === "om" ? (
                      <span>
                        Tarree filannoo keessaa <strong>"Install app"</strong> ykn <strong>"Add to Home screen"</strong> (Gara Fuula Duraatti Dabali) filadhu.
                      </span>
                    ) : (
                      <span>
                        Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong> from the dropdown menu.
                      </span>
                    )}
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    {language === "om" ? (
                      <span>
                        <strong>"Install" / "Add"</strong> cuqaasi. Qaxaleen battalumatti akka appii qofaa bilbila keessan irratti banama!
                      </span>
                    ) : (
                      <span>
                        Confirm by tapping <strong>"Install"</strong>. QAXALE icon will appear on your phone home screen!
                      </span>
                    )}
                  </div>
                </li>
              </ol>
            </div>
          )}

          {activePlatform === "ios" && (
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3.5 space-y-3">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>{language === "om" ? "iPhone & iPad (Safari)" : "iOS Safari Instructions"}</span>
              </h4>

              <ol className="space-y-2.5 text-slate-300 text-xs">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    {language === "om" ? (
                      <span>
                        Safari keessatti, jala gubbaatti mallattoo <strong>Share (Qoodi / <Share2 className="w-3.5 h-3.5 inline text-amber-400" />)</strong> tuqi.
                      </span>
                    ) : (
                      <span>
                        In Safari, tap the <strong>Share button (<Share2 className="w-3.5 h-3.5 inline text-amber-400" />)</strong> at the bottom of the screen.
                      </span>
                    )}
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    {language === "om" ? (
                      <span>
                        Gadi siqii filannoo <strong>"Add to Home Screen" (<PlusSquare className="w-3.5 h-3.5 inline text-amber-400" />)</strong> filadhu.
                      </span>
                    ) : (
                      <span>
                        Scroll down the share sheet and tap <strong>"Add to Home Screen" (<PlusSquare className="w-3.5 h-3.5 inline text-amber-400" />)</strong>.
                      </span>
                    )}
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    {language === "om" ? (
                      <span>
                        Mirga gubbaatti <strong>"Add"</strong> cuqaasi. Asumaan mallattoo QAXALE argattu!
                      </span>
                    ) : (
                      <span>
                        Tap <strong>"Add"</strong> in the top right corner. The QAXALE app icon is now on your iPhone!
                      </span>
                    )}
                  </div>
                </li>
              </ol>
            </div>
          )}

          {activePlatform === "desktop" && (
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3.5 space-y-3">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-amber-400" />
                <span>{language === "om" ? "Kompiitara (Chrome / Edge / Brave)" : "Desktop Instructions"}</span>
              </h4>

              <p className="text-slate-300">
                {language === "om"
                  ? "Teessoo URL (Address bar) mirgaatti mallattoo Kompiitaraa ykn Fe'iinsaa (Install) cuqaasuudhaan akka sagantaa of-dandeessetti fe'aa."
                  : "Click the Install App icon located at the right side of your browser address bar to install QAXALE as a desktop app."}
              </p>
            </div>
          )}

          {/* Share & Copy Link Section */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {language === "om" ? "Liinkii Appichaa Waraabi:" : "Shareable App Link:"}
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-mono truncate focus:outline-none"
              />
              <button
                onClick={handleCopyUrl}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">{language === "om" ? "Waraabame" : "Copied"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{language === "om" ? "Waraabi" : "Copy"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={() => setShowInstallModal(false)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all active:scale-95 shadow-md"
          >
            {language === "om" ? "Tole / Galatoomaa" : "Got It / Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
