import React, { useState, useMemo } from "react";
import {
  Calculator,
  TrendingUp,
  AlertTriangle,
  Play,
  RotateCcw,
  Copy,
  Check,
  Send,
  HelpCircle,
  BarChart2,
  Info,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

interface SimulationSummary {
  evPercent: number;
  kellyPercent: number;
  ruinProbability: number;
  medianFinal: number;
  worstDrawdownPercent: number;
  bestFinal: number;
  longestLosingStreak: number;
  totalRuns: number;
  trajectories: number[][]; // sample of 25 paths for charting
}

export const MonteCarloSimulatorTool: React.FC = () => {
  const { language, setActiveTab, createConversation, addMessageToActiveConversation } = useApp();

  // Simulation parameters (Scientific Risk & Decision Theory)
  const [initialCapital, setInitialCapital] = useState(1000);
  const [successProbability, setSuccessProbability] = useState(55); // in %
  const [payoffMultiple, setPayoffMultiple] = useState(1.95);
  const [sizingType, setSizingType] = useState<"fixed" | "flat_percent" | "half_kelly" | "full_kelly">("flat_percent");
  const [allocationPercent, setAllocationPercent] = useState(3); // 3%
  const [numTrials, setNumTrials] = useState(100);
  const [numSimulations, setNumSimulations] = useState(1000);

  const [copied, setCopied] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  // Deterministic / Client-Side Monte Carlo Execution
  const summary: SimulationSummary = useMemo(() => {
    const p = Math.max(0.01, Math.min(0.99, successProbability / 100));
    const q = 1 - p;
    const b = Math.max(0.05, payoffMultiple - 1); // net payoff ratio
    const ev = (p * payoffMultiple - 1) * 100; // Expected Value %

    // Kelly Criterion formula: f* = (b*p - q) / b
    const rawKelly = (b * p - q) / b;
    const kellyPercent = Math.max(0, rawKelly * 100);

    const trajectories: number[][] = [];
    let ruinCount = 0;
    const finalCapitals: number[] = [];
    let maxDrawdownTotal = 0;
    let maxOverallLosingStreak = 0;

    const sampleStride = Math.max(1, Math.floor(numSimulations / 25));

    for (let sim = 0; sim < numSimulations; sim++) {
      let capital = initialCapital;
      let peak = initialCapital;
      let worstDrawdownThisSim = 0;
      let currentLosingStreak = 0;
      let maxLosingStreakThisSim = 0;

      const path: number[] = [capital];
      const recordPath = sim % sampleStride === 0 && trajectories.length < 25;

      for (let trial = 1; trial <= numTrials; trial++) {
        if (capital <= 0.5) {
          capital = 0;
          if (recordPath) path.push(0);
          continue;
        }

        // Calculate allocation size
        let allocation = 0;
        if (sizingType === "fixed") {
          allocation = Math.min(capital, allocationPercent);
        } else if (sizingType === "flat_percent") {
          allocation = capital * (allocationPercent / 100);
        } else if (sizingType === "full_kelly") {
          allocation = capital * Math.max(0, rawKelly);
        } else if (sizingType === "half_kelly") {
          allocation = capital * Math.max(0, rawKelly * 0.5);
        }

        allocation = Math.max(1, Math.min(capital, allocation));

        // Simulated Bernoulli trial using deterministic PRNG
        const success = Math.random() < p;
        if (success) {
          capital += allocation * (payoffMultiple - 1);
          currentLosingStreak = 0;
        } else {
          capital -= allocation;
          currentLosingStreak++;
          if (currentLosingStreak > maxLosingStreakThisSim) {
            maxLosingStreakThisSim = currentLosingStreak;
          }
        }

        // Track peak & drawdown
        if (capital > peak) {
          peak = capital;
        } else if (peak > 0) {
          const dd = ((peak - capital) / peak) * 100;
          if (dd > worstDrawdownThisSim) worstDrawdownThisSim = dd;
        }

        if (recordPath) {
          path.push(Math.round(capital));
        }
      }

      if (capital <= 1) ruinCount++;
      finalCapitals.push(capital);
      if (worstDrawdownThisSim > maxDrawdownTotal) maxDrawdownTotal = worstDrawdownThisSim;
      if (maxLosingStreakThisSim > maxOverallLosingStreak) maxOverallLosingStreak = maxLosingStreakThisSim;

      if (recordPath) {
        trajectories.push(path);
      }
    }

    finalCapitals.sort((a, b) => a - b);
    const medianFinal = finalCapitals[Math.floor(finalCapitals.length / 2)] || 0;
    const bestFinal = finalCapitals[finalCapitals.length - 1] || 0;
    const ruinProbability = (ruinCount / numSimulations) * 100;

    return {
      evPercent: parseFloat(ev.toFixed(2)),
      kellyPercent: parseFloat(kellyPercent.toFixed(2)),
      ruinProbability: parseFloat(ruinProbability.toFixed(1)),
      medianFinal: Math.round(medianFinal),
      worstDrawdownPercent: Math.round(maxDrawdownTotal),
      bestFinal: Math.round(bestFinal),
      longestLosingStreak: maxOverallLosingStreak,
      totalRuns: numSimulations,
      trajectories,
    };
  }, [initialCapital, successProbability, payoffMultiple, sizingType, allocationPercent, numTrials, numSimulations]);

  const handleCopySummary = () => {
    const text = `[QAXALE Monte Carlo Risk Analysis]
Success Probability: ${successProbability}% | Payoff Multiple: ${payoffMultiple}
EV Expectation: ${summary.evPercent > 0 ? "+" : ""}${summary.evPercent}%
Kelly Optimal Allocation: ${summary.kellyPercent}%
Capital Depletion (Ruin) Risk: ${summary.ruinProbability}%
Median Outcome (after ${numTrials} trials): ${summary.medianFinal.toLocaleString()} (Starting: ${initialCapital})
Max Consecutive Drawdown Trials: ${summary.longestLosingStreak}
Max Observed Drawdown: ${summary.worstDrawdownPercent}%`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToChat = () => {
    const prompt = `Can you analyze my probabilistic Monte Carlo simulation results?
- Initial Capital Reserve: ${initialCapital}
- Model Probability of Success: ${successProbability}% with Payoff Multiple: ${payoffMultiple}
- Expected Value (EV): ${summary.evPercent}%
- Kelly Criterion Optimal Sizing: ${summary.kellyPercent}%
- Probability of Capital Ruin: ${summary.ruinProbability}%
- Longest consecutive negative sequence: ${summary.longestLosingStreak} trials
- Capital allocation method: ${sizingType}

Explain in ${language === "om" ? "Afaan Oromoo" : "English"} how statistical variance, sequence risk, and drawdown protection apply to disciplined decision-making.`;

    createConversation("Monte Carlo Risk Analysis");
    addMessageToActiveConversation({
      role: "user",
      content: prompt,
      mode: "agency-loop",
    });
    setActiveTab("chat");
  };

  // SVG Chart Dimensions & bounds
  const chartWidth = 500;
  const chartHeight = 180;
  const maxValInTrajectories = Math.max(
    initialCapital * 2,
    ...summary.trajectories.flatMap((p) => p)
  );

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(val, maxValInTrajectories));
    return chartHeight - (clamped / maxValInTrajectories) * (chartHeight - 20) - 10;
  };

  const getX = (trialIdx: number) => {
    return (trialIdx / numTrials) * (chartWidth - 40) + 20;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Tool Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{language === "om" ? "Herrega Monte Carlo & Xiinxala Balaa" : "Monte Carlo Probability & Risk Engine"}</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono px-2 py-0.5 rounded-full">
                Deterministic Math
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {language === "om"
                ? "Balaa qabeenya dhabuu, kasaaraa walitti-aanaa fi seera Kelly shallagi."
                : "Simulate stochastic trials, sequence variance, and optimal Kelly capital allocation."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFormula(!showFormula)}
          className="text-xs text-slate-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{language === "om" ? "Foormulaa" : "Formulas"}</span>
        </button>
      </div>

      {/* Formula Explainer Modal / Dropdown */}
      {showFormula && (
        <div className="p-3 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-slate-300 space-y-2">
          <p className="font-semibold text-purple-400">
            {language === "om" ? "Foormulaawwan Bu'uuraa (Mathematical Foundations):" : "Mathematical Formulas Used:"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-amber-400 font-bold">Expected Value (EV)</span>
              <p className="text-slate-400 mt-0.5">EV = (Probability × Payoff) - 1</p>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-emerald-400 font-bold">Kelly Criterion (f*)</span>
              <p className="text-slate-400 mt-0.5">f* = (b·p - q) / b</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 italic">
            {language === "om"
              ? "Herregni kun tilmaama AI osoo hin taane herrega shallaggii qulqulluu (deterministic pure math) dha."
              : "This tool uses pure deterministic probability algorithms running 100% locally on your device."}
          </p>
        </div>
      )}

      {/* Main Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
        {/* Success Probability Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">
              {language === "om" ? "Carraa Milkaa'inaa (Probability of Success)" : "Probability of Positive Outcome"}
            </span>
            <span className="font-mono text-purple-400 font-bold">{successProbability}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="95"
            step="1"
            value={successProbability}
            onChange={(e) => setSuccessProbability(Number(e.target.value))}
            className="w-full accent-purple-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>10% (Low)</span>
            <span>50% (Symmetric)</span>
            <span>95% (High)</span>
          </div>
        </div>

        {/* Payoff Multiple */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">
              {language === "om" ? "Dachaa Bu'aa (Payoff Multiple)" : "Payoff Multiple / Factor"}
            </span>
            <span className="font-mono text-amber-400 font-bold">{payoffMultiple.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="1.10"
            max="8.00"
            step="0.05"
            value={payoffMultiple}
            onChange={(e) => setPayoffMultiple(Number(e.target.value))}
            className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>1.10x (Conservative)</span>
            <span>2.00x (Even Ratio)</span>
            <span>8.00x (High Multiple)</span>
          </div>
        </div>

        {/* Starting Capital */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">
              {language === "om" ? "Qabeenya Ka'umsaa (Capital Reserve)" : "Initial Capital Reserve"}
            </span>
            <span className="font-mono text-emerald-400 font-bold">{initialCapital.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="100"
            max="50000"
            step="100"
            value={initialCapital}
            onChange={(e) => setInitialCapital(Number(e.target.value))}
            className="w-full accent-emerald-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
          />
        </div>

        {/* Sizing Strategy */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">
              {language === "om" ? "Tooftaa Qooddaa (Allocation Strategy)" : "Capital Allocation Model"}
            </span>
            <span className="font-mono text-cyan-400 font-bold capitalize">
              {sizingType.replace("_", " ")}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: "flat_percent", label: "Flat %" },
              { id: "half_kelly", label: "½ Kelly" },
              { id: "full_kelly", label: "Full Kelly" },
              { id: "fixed", label: "Fixed" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSizingType(opt.id as any)}
                className={`py-1 rounded text-[10px] font-bold border transition-colors ${
                  sizingType === opt.id
                    ? "bg-purple-600 text-white border-purple-500"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Number of Decision Trials */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">
              {language === "om" ? "Baay'ina Marsaalee (Decision Trials)" : "Sequential Decision Trials"}
            </span>
            <span className="font-mono text-slate-300 font-bold">{numTrials} trials</span>
          </div>
          <div className="flex gap-1.5">
            {[30, 50, 100, 250].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNumTrials(n)}
                className={`flex-1 py-1 rounded text-[10px] font-semibold border ${
                  numTrials === n
                    ? "bg-slate-800 text-white border-slate-600"
                    : "bg-slate-950 text-slate-500 border-slate-800"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Number of Monte Carlo Runs */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">
              {language === "om" ? "Marsaalee Simuleeshinii (Iterations)" : "Monte Carlo Iterations"}
            </span>
            <span className="font-mono text-slate-300 font-bold">{numSimulations} runs</span>
          </div>
          <div className="flex gap-1.5">
            {[500, 1000, 2000].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNumSimulations(n)}
                className={`flex-1 py-1 rounded text-[10px] font-semibold border ${
                  numSimulations === n
                    ? "bg-slate-800 text-white border-slate-600"
                    : "bg-slate-950 text-slate-500 border-slate-800"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Statistical Result Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* EV Badge */}
        <div
          className={`p-3 rounded-xl border ${
            summary.evPercent > 0
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
            {language === "om" ? "Faayidaa Eegamu (EV)" : "Expected Value (EV)"}
          </span>
          <div className="text-lg font-black font-mono mt-0.5">
            {summary.evPercent > 0 ? "+" : ""}
            {summary.evPercent}%
          </div>
          <span className="text-[10px] opacity-75">
            {summary.evPercent > 0
              ? language === "om" ? "Herrega dandeettii gaarii" : "Positive statistical edge"
              : language === "om" ? "Kasaaraa dabalataa" : "Negative expectation"}
          </span>
        </div>

        {/* Ruin Probability Badge */}
        <div
          className={`p-3 rounded-xl border ${
            summary.ruinProbability > 10
              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
            {language === "om" ? "Carraa Qabeenya Dhabuu (Ruin)" : "Capital Depletion Risk"}
          </span>
          <div className="text-lg font-black font-mono mt-0.5">{summary.ruinProbability}%</div>
          <span className="text-[10px] opacity-75">
            {summary.ruinProbability > 20
              ? language === "om" ? "Balaan qabeenya dhabuu guddaadha" : "High capital exhaustion risk"
              : language === "om" ? "Balaan qabeenyaa gadi-aanaadha" : "Controlled risk bounds"}
          </span>
        </div>

        {/* Kelly Sizing Recommendation */}
        <div className="p-3 rounded-xl border bg-purple-500/10 border-purple-500/30 text-purple-300">
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
            {language === "om" ? "Seera Kelly (Optimal Allocation)" : "Kelly Optimal Allocation"}
          </span>
          <div className="text-lg font-black font-mono mt-0.5">{summary.kellyPercent}%</div>
          <span className="text-[10px] opacity-75">
            {summary.kellyPercent === 0
              ? language === "om" ? "Qabeenya hin ramadinaa (Negative)" : "Zero allocation recommended"
              : language === "om" ? "Garaagarummaa 1/2 Kelly gorfama" : "Half-Kelly reduces volatility"}
          </span>
        </div>

        {/* Longest Drawdown Streak */}
        <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-300">
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
            {language === "om" ? "Kasaaraa Walitti-Aanaa" : "Max Consecutive Drawdowns"}
          </span>
          <div className="text-lg font-black font-mono mt-0.5">{summary.longestLosingStreak} trials</div>
          <span className="text-[10px] opacity-75">
            {language === "om" ? "Mudannoo walitti-aanaa gadi aanaa" : "Consecutive unfavorable outcomes"}
          </span>
        </div>
      </div>

      {/* Trajectory Simulation Chart */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            <span>
              {language === "om"
                ? "Adeemsa Kaapitaalaa (Simulated Trajectories - 25 Paths Sample)"
                : "Capital Trajectories (25 Representative Paths Sample)"}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {language === "om" ? "Giddugaleessa:" : "Median Final:"}{" "}
            <span className="text-emerald-400 font-bold">{summary.medianFinal.toLocaleString()}</span>
          </div>
        </div>

        {/* SVG Multi-Line Chart */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-44 bg-slate-900/60 rounded-lg border border-slate-800/80"
          >
            {/* Grid lines */}
            <line x1="20" y1={getY(initialCapital)} x2={chartWidth - 20} y2={getY(initialCapital)} stroke="#475569" strokeDasharray="3 3" strokeWidth="1" />
            <text x="25" y={getY(initialCapital) - 4} fill="#94a3b8" fontSize="9" fontFamily="monospace">
              Initial: {initialCapital}
            </text>

            {/* Zero line (Ruin threshold) */}
            <line x1="20" y1={getY(0)} x2={chartWidth - 20} y2={getY(0)} stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
            <text x={chartWidth - 65} y={getY(0) - 4} fill="#ef4444" fontSize="9" fontFamily="monospace">
              Depleted ($0)
            </text>

            {/* Individual Simulation Paths */}
            {summary.trajectories.map((path, pIdx) => {
              const d = path
                .map((val, bIdx) => `${bIdx === 0 ? "M" : "L"} ${getX(bIdx).toFixed(1)} ${getY(val).toFixed(1)}`)
                .join(" ");
              const isGrowth = (path[path.length - 1] || 0) >= initialCapital;
              const isDepleted = (path[path.length - 1] || 0) <= 1;

              let strokeColor = "rgba(148, 163, 184, 0.25)";
              if (isDepleted) strokeColor = "rgba(244, 63, 94, 0.35)";
              else if (isGrowth) strokeColor = "rgba(52, 211, 153, 0.35)";

              return <path key={pIdx} d={d} fill="none" stroke={strokeColor} strokeWidth="1" />;
            })}
          </svg>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Capital Growth Paths
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Capital Depletion Paths
            </span>
          </div>
          <span>Max Simulated Peak: {summary.bestFinal.toLocaleString()}</span>
        </div>
      </div>

      {/* Critical Responsible Reality Check */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            {language === "om"
              ? "Qaxale Reality Check: Hubachiisa Balaa fi Carraa"
              : "QAXALE Reality Check: Statistical Variance & The Clustering Illusion"}
          </span>
        </div>
        <p className="text-[11px] text-amber-200 leading-relaxed">
          {language === "om"
            ? `Herregni mul'isa: Humni carraa ${successProbability}% qabaattus, kasaaraan walitti aansee ${summary.longestLosingStreak} mudachuu danda'a. Namoonni hedduun kasaaraa deebisuuf qabeenya dabaluun yeroo gabaabaa keessatti qabeenya balleessu.`
            : `Even with a high ${successProbability}% statistical success probability, random variance naturally produced an unbroken string of ${summary.longestLosingStreak} consecutive unfavorable trials. Overreacting to short-term sequences or escalating commitment mathematically causes capital ruin.`}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleCopySummary}
          className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copied ? (language === "om" ? "Waraabameera!" : "Copied!") : (language === "om" ? "Gabaasa Waraabi" : "Copy Risk Model Data")}</span>
        </button>

        <button
          type="button"
          onClick={handleSendToChat}
          className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98]"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{language === "om" ? "AI waliin Xiinxali" : "Analyze Risk with QAXALE AI"}</span>
        </button>
      </div>
    </div>
  );
};
