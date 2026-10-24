import React, { useState } from "react";
import {
  Calculator,
  Percent,
  TrendingUp,
  ShieldAlert,
  HelpCircle,
  ArrowRight,
  Send,
  Sparkles,
  BookOpen,
  Info,
  CheckCircle2,
  Scale,
  DollarSign,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export const OddsProbabilityTool: React.FC = () => {
  const { language, setActiveTab, createConversation, addMessageToActiveConversation, userMemory } = useApp();
  const isOm = language === "om";

  const [activeSubTab, setActiveSubTab] = useState<"converter" | "ev" | "markets">("converter");

  // Converter state
  const [decimalOdds, setDecimalOdds] = useState<number>(2.0);
  const [userEstimatedProb, setUserEstimatedProb] = useState<number>(55); // in %
  const [bankroll, setBankroll] = useState<number>(1000);

  // Computed Values
  const impliedProbability = decimalOdds > 1 ? (1 / decimalOdds) * 100 : 0;
  const fractionalOdds = (() => {
    if (decimalOdds <= 1) return "0/1";
    const net = decimalOdds - 1;
    // Simple common fractional approximations
    const common: [number, string][] = [
      [0.5, "1/2"],
      [0.25, "1/4"],
      [0.75, "3/4"],
      [1.0, "1/1"],
      [1.25, "5/4"],
      [1.5, "3/2"],
      [1.75, "7/4"],
      [2.0, "2/1"],
      [2.5, "5/2"],
      [3.0, "3/1"],
      [4.0, "4/1"],
      [5.0, "5/1"],
    ];
    const match = common.find(([val]) => Math.abs(val - net) < 0.08);
    if (match) return match[1];
    return `${net.toFixed(2)}/1`;
  })();

  const americanOdds = (() => {
    if (decimalOdds >= 2.0) {
      return `+${Math.round((decimalOdds - 1) * 100)}`;
    } else if (decimalOdds > 1.0) {
      return `-${Math.round(100 / (decimalOdds - 1))}`;
    }
    return "+0";
  })();

  // Expected Value calculation
  const pDec = userEstimatedProb / 100;
  const evPct = (pDec * decimalOdds - 1) * 100;
  const hasValue = evPct > 0;

  // Kelly Criterion
  const b = decimalOdds - 1;
  const q = 1 - pDec;
  const fullKelly = b > 0 ? (b * pDec - q) / b : 0;
  const fullKellyPct = Math.max(0, fullKelly * 100);
  const halfKellyPct = Math.max(0, fullKellyPct * 0.5);
  const userCap = userMemory.bankrollLimitPct || 2;
  const recommendedStakePct = Math.min(halfKellyPct, userCap);
  const recommendedStakeMoney = (bankroll * recommendedStakePct) / 100;

  // Market dictionary items
  const markets = [
    {
      id: "1x2",
      name: "1X2 (Match Result)",
      nameOm: "1X2 (Bu'aa Taphaa)",
      descEn: "1 = Home win, X = Draw, 2 = Away win. The most common standard 3-way market.",
      descOm: "1 = Mo'annaa Garee Manamaa, X = Qixa/Draw, 2 = Mo'annaa Garee Keessummaa.",
      rule: "P(1) + P(X) + P(2) = 100% (plus bookmaker margin)",
      tipOm: "Gareen lamaan qixxee yoo ta'an carraan qixaa (X) akka dabalu beeki.",
      tipEn: "Remember that in tournament knockout matches, 1X2 applies strictly to regular 90-minute time.",
    },
    {
      id: "dc",
      name: "Double Chance (1X, 12, X2)",
      nameOm: "Carraa Dachaa (Double Chance)",
      descEn: "Combines two possible outcomes in one selection to lower variance at the cost of lower odds.",
      descOm: "Bu'aawwan lama keessaa tokko yoo raawwatame mo'ata (fkn: 1X = Manamaan mo'ata ykn qixa).",
      rule: "Lower variance, lower payout ratio.",
      tipOm: "Balaa kasaaraa hir'isuuf akka gaariitti gargaara, garuu bu'aan isaa xiqqaadha.",
      tipEn: "Reduces drawdown risk significantly, ideal for conservative strategies.",
    },
    {
      id: "ou",
      name: "Over / Under (Goolii Ol / Gadi)",
      nameOm: "Over / Under (Goolii Ol / Gadi)",
      descEn: "Wager on whether total goals/points scored will be over or under a benchmark (e.g. 2.5 goals).",
      descOm: "Ida'amni goolii taphichaa lakkoofsa murtaa'e (fkn 2.5) ol ykn gadi ta'uu shallaguu.",
      rule: "Over 2.5 requires 3+ goals; Under 2.5 requires 0, 1, or 2 goals.",
      tipOm: "Seenaa goolii galchuu fi qulqullina eegumsaa (clean sheets) qoradhu.",
      tipEn: "Check defensive form and head-to-head match averages before estimating.",
    },
    {
      id: "btts",
      name: "Both Teams to Score (BTTS / GG)",
      nameOm: "Gareen Lamaan Ni Galchu (BTTS)",
      descEn: "Yes = both teams score at least 1 goal. No = at least one team scores zero.",
      descOm: "Eeyyee (Yes) = Gareen lachuu yoo xiqqaate goolii 1 ni galchu. Lakkii (No) = Gareen tokko 0 ta'a.",
      rule: "Independent of which team wins the match.",
      tipOm: "Gareewwan goolii baay'ee galchanii fi dafee gooliin itti galu irratti xiyyeeffata.",
      tipEn: "Best evaluated against both teams' attack and defensive injury lists.",
    },
    {
      id: "ah",
      name: "Asian Handicap (Garaagarummaa Goolii)",
      nameOm: "Asian Handicap (Garaagarummaa)",
      descEn: "Eliminates the draw by assigning a goal handicap (+/- 0.5, +/- 1.0, +/- 1.5) to teams.",
      descOm: "Qixa dhabamsiisuudhaan garee tokkoof duraan dursee goolii hir'isuu ykn dabalataan kennuu.",
      rule: "Eliminates 3-way variance into binary choice.",
      tipOm: "Gareewwan garaagarummaa dandeettii guddaa qaban madaaluuf faayidaa guddaa qaba.",
      tipEn: "Protects stakes on level handicaps (0.0 / Draw No Bet) with full push refund.",
    },
  ];

  const handleSendAnalysisToChat = () => {
    const analysisPrompt = isOm
      ? `QAXALE, shallaggii odds kana xiinxali:
- Odds: ${decimalOdds} (Implied Probability: %${impliedProbability.toFixed(1)})
- Tilmaama Carraa koo: %${userEstimatedProb}
- Expected Value (EV): ${evPct >= 0 ? "+" : ""}${evPct.toFixed(1)}%
- Half-Kelly Fraction: %${halfKellyPct.toFixed(2)}
- Qabeenya Ka'umsaa: $${bankroll}

Maaloo seera herregaa fi gorsa itti-gaafatamummaa irratti hundaa'ii xiinxala naaf kenni.`
      : `QAXALE, analyze this odds and probability setup:
- Odds: ${decimalOdds} (Implied Probability: ${impliedProbability.toFixed(1)}%)
- User Estimated Probability: ${userEstimatedProb}%
- Expected Value (EV): ${evPct >= 0 ? "+" : ""}${evPct.toFixed(1)}%
- Recommended Half-Kelly Capital Fraction: ${halfKellyPct.toFixed(2)}%
- Bankroll Capital: $${bankroll}

Provide a rigorous mathematical breakdown and responsible boundary advice based on my user profile.`;

    const convId = createConversation(isOm ? `Xiinxala Odds: ${decimalOdds}` : `Odds Analysis: ${decimalOdds}`);
    addMessageToActiveConversation({
      role: "user",
      content: analysisPrompt,
      mode: "agency-loop",
    });
    setActiveTab("chat");
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-indigo-950/40 border border-amber-500/30 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{isOm ? "Shallaggii Carraa & Odds" : "Odds & Probability Engine"}</span>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  V3 Model
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isOm
                  ? "Hubannoo dura, xiinxala herregaa fi murtoo itti-gaafatamummaan gaggeessuuf."
                  : "Understand first. Convert odds, calculate Expected Value (EV), and enforce capital preservation."}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setActiveSubTab("converter")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === "converter"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>{isOm ? "Jijjiirraa & Shallaggii" : "Converter & EV"}</span>
          </button>

          <button
            onClick={() => setActiveSubTab("ev")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === "ev"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isOm ? "Half-Kelly & Qabeenya" : "Half-Kelly Model"}</span>
          </button>

          <button
            onClick={() => setActiveSubTab("markets")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === "markets"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isOm ? "Gabaa Filannoo (Markets)" : "Markets Guide"}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Converter & EV */}
      {activeSubTab === "converter" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-amber-400" />
              <span>{isOm ? "Odds Gara Carraatti Jijjiiri" : "Odds to Probability Conversion"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Decimal Odds Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex justify-between">
                  <span>{isOm ? "Odds Desimaalii (Decimal Odds)" : "Decimal Odds"}</span>
                  <span className="text-amber-400 font-mono font-bold">{decimalOdds.toFixed(2)}</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="1.01"
                    max="50"
                    value={decimalOdds}
                    onChange={(e) => setDecimalOdds(Math.max(1.01, parseFloat(e.target.value) || 1.01))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* User Estimated Probability */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex justify-between">
                  <span>{isOm ? "Tilmaama Carraa Kee (%)" : "Your Estimated Probability (%)"}</span>
                  <span className="text-emerald-400 font-mono font-bold">{userEstimatedProb}%</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="95"
                  step="1"
                  value={userEstimatedProb}
                  onChange={(e) => setUserEstimatedProb(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-950 rounded-lg mt-3"
                />
              </div>
            </div>

            {/* Formats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase block font-medium">Implied Prob</span>
                <span className="text-sm font-bold text-amber-400 font-mono">
                  {impliedProbability.toFixed(1)}%
                </span>
                <span className="text-[9px] text-slate-500 block">1 / Odds</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase block font-medium">Fractional</span>
                <span className="text-sm font-bold text-slate-200 font-mono">{fractionalOdds}</span>
                <span className="text-[9px] text-slate-500 block">UK Standard</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase block font-medium">American</span>
                <span className="text-sm font-bold text-slate-200 font-mono">{americanOdds}</span>
                <span className="text-[9px] text-slate-500 block">Moneyline</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase block font-medium">Expected Value</span>
                <span
                  className={`text-sm font-bold font-mono ${
                    hasValue ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {evPct >= 0 ? "+" : ""}
                  {evPct.toFixed(1)}%
                </span>
                <span className="text-[9px] text-slate-500 block">{hasValue ? "Positive EV" : "Negative EV"}</span>
              </div>
            </div>
          </div>

          {/* Mathematical Educational Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>{isOm ? "Seera Bu'uuraa Herrega Carraa" : "Foundational Probability Principles"}</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-amber-300/90">
                Carraa Ta'uu (%) = (1 / Odds) × 100
                <br />
                Expected Value (EV) = (P_true × Odds) - 1
              </div>
              <p>
                {isOm
                  ? "Odds gabaan dhiyeessu yeroo hunda faayidaa (margin/vig) bookmaker qabata. Kanaafuu Ida'amni carraa bu'aawwan hunda dhibbeentaa %100 caala (fkn 105%)."
                  : "Bookmakers price in an intentional margin (overround). The sum of all implied market probabilities always exceeds 100% (e.g. 104-108%)."}
              </p>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  {isOm
                    ? "Hubadhu: Odds gabaa mirkaneessa miti. Taphni kamiyyuu bu'aa hin eegamne qabaachuu danda'a. Maallaqa jireenyaaf barbaachisu gonkumaa balaa irra hin buusin."
                    : "Crucial rule: Odds are never guarantees. Statistical variance is always active. Never risk capital required for essential living needs."}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Half-Kelly & Capital Allocation */}
      {activeSubTab === "ev" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>{isOm ? "Seera Qoodiinsa Qabeenyaa (Half-Kelly)" : "Half-Kelly Capital Allocation"}</span>
              </h3>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                Safe Fraction: {userCap}%
              </span>
            </div>

            <p className="text-xs text-slate-300">
              {isOm
                ? "Seerri Kelly Criterion qabeenya kee kasaaraa guutuu irraa eeguuf shallaggii herregaa faayidaa irra oolcha. QAXALE gorsa Half-Kelly (Kelly walakkaa) cimsee gorsa."
                : "The Kelly Criterion mathematically balances growth while guarding against the risk of ruin. QAXALE enforces conservative Half-Kelly limits."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  {isOm ? "Qabeenya Ka'umsaa Guutuu (Total Bankroll)" : "Total Bankroll Capital"}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-mono">$</span>
                  <input
                    type="number"
                    step="50"
                    min="10"
                    value={bankroll}
                    onChange={(e) => setBankroll(Math.max(10, parseFloat(e.target.value) || 10))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  {isOm ? "Daangaa Eegumsaa (User Profile Cap)" : "Memory Risk Policy Cap"}
                </label>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between text-slate-300">
                  <span>{userMemory.riskTolerance.toUpperCase()}</span>
                  <span className="font-mono text-amber-400 font-bold">{userCap}% Max Stake</span>
                </div>
              </div>
            </div>

            {/* Results Output */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{isOm ? "Full Kelly Shallagame:" : "Theoretical Full Kelly:"}</span>
                <span className="font-mono font-bold text-slate-200">{fullKellyPct.toFixed(2)}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{isOm ? "Half-Kelly Eegamaa:" : "Conservative Half-Kelly:"}</span>
                <span className="font-mono font-bold text-amber-400">{halfKellyPct.toFixed(2)}%</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  {isOm ? "Qoodiinsa Qaxalee Gorfamu:" : "Recommended Safe Allocation:"}
                </span>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    ${recommendedStakeMoney.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    ({recommendedStakePct.toFixed(2)}% of bankroll)
                  </span>
                </div>
              </div>
            </div>

            {/* Guardrail Notice */}
            <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {isOm
                  ? "Balaan kasaaraa (Risk of Ruin) yoo qoodiinsi kee %5 ol ta'e dachaan dabala. QAXALE keessatti qoodiinsi tokko %2.5 gadi ta'uu qaba."
                  : "Risk of ruin escalates exponentially when individual allocations exceed 5%. Staying under 2.5% preserves resilience through expected losing streaks."}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Markets Dictionary */}
      {activeSubTab === "markets" && (
        <div className="space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{isOm ? "Gabaa Filannoo fi Hiika Isaanii" : "Betting Market Terminology Guide"}</span>
            </h3>
            <p className="text-xs text-slate-300">
              {isOm
                ? "Jechoonni gabaa taphaa maaliif akka uumaman, akkamitti akka shallagaman, fi hubannoo bu'uuraa."
                : "Comprehensive breakdown of core sports market structures, mechanics, and cognitive interpretations."}
            </p>

            <div className="space-y-2.5 pt-1">
              {markets.map((m) => (
                <div key={m.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{isOm ? m.nameOm : m.name}</h4>
                    <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Standard
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{isOm ? m.descOm : m.descEn}</p>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono pt-1">
                    <span className="text-indigo-400">Formula:</span> {m.rule}
                  </div>
                  <div className="text-[11px] text-emerald-400/90 pt-0.5">
                    💡 <span className="text-slate-300">{isOm ? m.tipOm : m.tipEn}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Footer: Send to QAXALE Chat with Memory Context */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950/50 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isOm ? "QAXALE AI Waliin Xiinxali" : "Deep Analysis with QAXALE AI"}</span>
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isOm
              ? "Shallaggii kana gara AItti erguun deebii fi gorsa dabalataa profile kee irratti hundaa'e argadhu."
              : "Dispatch this exact calculation to QAXALE Chat personalized with your cognitive memory profile."}
          </p>
        </div>

        <button
          onClick={handleSendAnalysisToChat}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isOm ? "Gara Chaatitti Ergi" : "Analyze in Chat"}</span>
        </button>
      </div>
    </div>
  );
};
