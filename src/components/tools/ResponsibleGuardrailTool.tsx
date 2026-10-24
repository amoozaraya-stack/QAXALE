import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Send,
  Lock,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export const ResponsibleGuardrailTool: React.FC = () => {
  const { language, setActiveTab, createConversation, addMessageToActiveConversation } = useApp();

  // Active view: Sunk-Cost / Loss Escalation, Multi-Risk Friction, Self-Check, Focus Limits
  const [activeTab, setActiveTabLocal] = useState<"chase" | "multi" | "screener" | "limits">("chase");

  // 1. Loss-Chasing (Martingale Escalation) state
  const [initialLoss, setInitialLoss] = useState(100);
  const [chaseSteps, setChaseSteps] = useState(6);

  // 2. Multi-Risk Friction Decay state
  const [stagesCount, setStagesCount] = useState(5);
  const [singleStageMargin, setSingleStageMargin] = useState(6); // 6% single-stage friction/margin

  // 3. Self-Check screener answers
  const [screenerAnswers, setScreenerAnswers] = useState<Record<number, boolean>>({});

  // 4. Session Limit & Cool-off Timer
  const [cooloffMinutes, setCooloffMinutes] = useState(30);
  const [cooloffActiveUntil, setCooloffActiveUntil] = useState<number | null>(null);
  const [dailyLossLimit, setDailyLossLimit] = useState<number>(500);
  const [limitSaved, setLimitSaved] = useState(false);

  useEffect(() => {
    try {
      const storedCooloff = localStorage.getItem("qaxale_cooloff_until");
      if (storedCooloff) {
        const val = parseInt(storedCooloff, 10);
        if (val > Date.now()) setCooloffActiveUntil(val);
      }
      const storedLimit = localStorage.getItem("qaxale_daily_loss_limit");
      if (storedLimit) setDailyLossLimit(parseInt(storedLimit, 10));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const startCooloff = () => {
    const until = Date.now() + cooloffMinutes * 60 * 1000;
    setCooloffActiveUntil(until);
    try {
      localStorage.setItem("qaxale_cooloff_until", until.toString());
    } catch {}
  };

  const cancelCooloff = () => {
    setCooloffActiveUntil(null);
    try {
      localStorage.removeItem("qaxale_cooloff_until");
    } catch {}
  };

  const saveDailyLimit = () => {
    try {
      localStorage.setItem("qaxale_daily_loss_limit", dailyLossLimit.toString());
      setLimitSaved(true);
      setTimeout(() => setLimitSaved(false), 2000);
    } catch {}
  };

  // Calculations for Escalation / Sunk Cost
  const chaseSequence = Array.from({ length: chaseSteps }, (_, idx) => {
    const step = idx + 1;
    const requiredCommitment = initialLoss * Math.pow(2, idx);
    const cumulativeRisk = initialLoss * (Math.pow(2, step) - 1);
    const probabilityOfConsecutiveFailures = Math.pow(0.5, step) * 100;
    return {
      step,
      requiredCommitment,
      cumulativeRisk,
      probabilityOfConsecutiveFailures: parseFloat(probabilityOfConsecutiveFailures.toFixed(2)),
    };
  });

  // Calculations for Multi-Stage Risk Friction
  const compoundFriction = (1 - Math.pow(1 - singleStageMargin / 100, stagesCount)) * 100;
  const fairEquityRetained = 100 - compoundFriction;

  // Screener risk score
  const answeredCount = Object.keys(screenerAnswers).length;
  const yesCount = Object.values(screenerAnswers).filter(Boolean).length;
  const riskCategory =
    yesCount >= 3 ? "critical" : yesCount >= 1 ? "caution" : answeredCount === 4 ? "safe" : "untested";

  const questions = [
    {
      id: 1,
      om: "Kasaaraa dhihoo mudate dafanii deebisuuf jecha qabeenya dabalataa balaa keessa galchitanii beektuu?",
      en: "Have you ever escalated resource commitments right away to quickly recover recent losses?",
    },
    {
      id: 2,
      om: "Maallaqa jireenya guyyaa guyyaaf (nyaata, kiree, mana) barbaachisu murtoo balaa qabu keessa galchitanii beektuu?",
      en: "Have you committed funds designated for essential living expenses (rent, food, bills) into high-risk outcomes?",
    },
    {
      id: 3,
      om: "Waa'ee balaa qabeenyaa yaaduun hirriiba, xiyyeeffannoo hojii ykn maatii keessan irratti dhiibbaa uumee beekaa?",
      en: "Has anxiety about financial risk or outcomes affected your sleep, work focus, or relationships?",
    },
    {
      id: 4,
      om: "Kasaaraa qabeenyaa mudate maatii ykn hiriyoota keessan jalaa dhoksitee beektuu?",
      en: "Have you felt the urge to conceal the extent of financial drawdowns or losses from loved ones?",
    },
  ];

  const handleSendToChat = () => {
    const prompt = `Can you provide objective guidance on decision psychology, the sunk cost fallacy, and emotional loss-chasing in risk management?
- Evaluating an escalating doubling strategy starting with ${initialLoss} currency units.
- It requires risking ${chaseSequence[chaseSequence.length - 1]?.cumulativeRisk.toLocaleString()} after only ${chaseSteps} steps just to recover the initial ${initialLoss}!
- Multi-stage compounded friction across ${stagesCount} uncertain stages extracts ${compoundFriction.toFixed(1)}% of statistical equity.

Please explain in ${language === "om" ? "Afaan Oromoo" : "English"} how individuals can cultivate disciplined decision frameworks, set firm stop-loss boundaries, and resist emotional cognitive biases.`;

    createConversation("Decision Risk & Bias Analysis");
    addMessageToActiveConversation({
      role: "assistant",
      content:
        language === "om"
          ? "Baga nagaan dhuftan. Qaxaleen herrega murtoo saayinsawaa, hubannoo balaa fi qulqullina sammuu eeguu irratti xiyyeeffata. Kasaaraa duukaa bu'uun balaa baankiraptsii uuma."
          : "Welcome. QAXALE emphasizes disciplined probabilistic decision theory, emotional bias mitigation, and firm capital guardrails. Escalating commitments to recover sunk costs mathematically compounds ruin.",
      mode: "agency-loop",
    });
    setActiveTab("chat");
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{language === "om" ? "Saayinsii Balaa & Hubannoo Murtoo" : "Decision Bias & Risk Guardrail"}</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 font-mono px-2 py-0.5 rounded-full">
                Decision Science
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {language === "om"
                ? "Balaa kasaaraa duukaa bu'uu (sunk-cost) fi kuufama balaa shallagi."
                : "Proof against sunk-cost escalation, compound probability decay, and emotional biases."}
            </p>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto no-scrollbar">
        {[
          { id: "chase", label: language === "om" ? "Kasaaraa Duukaa Bu'uu" : "Sunk Cost Escalation" },
          { id: "multi", label: language === "om" ? "Kuufama Balaa" : "Multi-Risk Decay" },
          { id: "screener", label: language === "om" ? "Qormaata Ofii" : "Discipline Screener" },
          { id: "limits", label: language === "om" ? "Dhaaba & Qorannoo" : "Stop-Loss & Cool-Off" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTabLocal(tab.id as any)}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-rose-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* VIEW 1: SUNK COST ESCALATION REALITY */}
      {activeTab === "chase" && (
        <div className="space-y-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">
                {language === "om" ? "Kasaaraa Jalqabaa Deebifamuu Barbaadamu" : "Initial Lost Capital to Recover"}
              </span>
              <span className="font-mono text-rose-400 font-bold">{initialLoss.toLocaleString()} ETB / $</span>
            </div>
            <input
              type="range"
              min="50"
              max="2000"
              step="50"
              value={initialLoss}
              onChange={(e) => setInitialLoss(Number(e.target.value))}
              className="w-full accent-rose-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-300 font-semibold">
                {language === "om" ? "Marsaalee Dachaa Dabaluu (Double-Down Cycles)" : "Consecutive Double-Down Steps"}
              </span>
              <span className="font-mono text-amber-400 font-bold">{chaseSteps} cycles</span>
            </div>
            <input
              type="range"
              min="3"
              max="9"
              step="1"
              value={chaseSteps}
              onChange={(e) => setChaseSteps(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
            />
          </div>

          {/* Exponential Explosion Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                {language === "om" ? "Qabeenya Balaaf Saaxilamu (Exponential Capital Required)" : "Exponential Exposure Table"}
              </span>
              <span className="text-[11px] text-rose-400 font-mono font-bold">
                {language === "om" ? "Waliigala Balaaf:" : "Total At Risk:"}{" "}
                {chaseSequence[chaseSequence.length - 1]?.cumulativeRisk.toLocaleString()}
              </span>
            </div>

            <div className="divide-y divide-slate-900">
              {chaseSequence.map((item) => (
                <div key={item.step} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-900/40">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold">
                      {item.step}
                    </span>
                    <div>
                      <div className="text-slate-200 font-medium">
                        {language === "om" ? "Qabeenya Marsaa Kanaa:" : "Current Round Exposure:"}{" "}
                        <span className="font-mono text-rose-300 font-bold">{item.requiredCommitment.toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {language === "om" ? "Carraa kasaaraa itti-fufaa:" : "Probability of consecutive failures:"}{" "}
                        {item.probabilityOfConsecutiveFailures}%
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">{language === "om" ? "Waliigala Qabeenyaa" : "Cumulative Risk"}</div>
                    <div className="font-mono font-bold text-amber-400 text-xs">
                      {item.cumulativeRisk.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning Banner */}
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>{language === "om" ? "Dhaabbadhaa: Sobaa Kasaaraa Duukaa Bu'uu (Sunk Cost Trap)" : "The Sunk Cost Fallacy & Ruin Trap"}</span>
            </div>
            <p className="text-[11px] text-rose-200 leading-relaxed">
              {language === "om"
                ? `Kasaaraa jalqabaa ${initialLoss} deebisuuf qofa, marsaa ${chaseSteps}ffaa irratti qabeenya ${chaseSequence[chaseSequence.length - 1]?.cumulativeRisk.toLocaleString()} balaa keessa galchuun herregaan baankiraptsii uuma.`
                : `To attempt to recover just your initial ${initialLoss}, by cycle ${chaseSteps} you must risk an astonishing ${chaseSequence[chaseSequence.length - 1]?.cumulativeRisk.toLocaleString()}! Capital exhaustion and volatility clustering guarantee mathematical ruin.`}
            </p>
          </div>
        </div>
      )}

      {/* VIEW 2: MULTI-RISK FRICTION DECAY */}
      {activeTab === "multi" && (
        <div className="space-y-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">
                {language === "om" ? "Baay'ina Haalawwan Walxaxaa (Multi-Risk Conditions)" : "Number of Compounded Conditions"}
              </span>
              <span className="font-mono text-cyan-400 font-bold">{stagesCount} conditions</span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              step="1"
              value={stagesCount}
              onChange={(e) => setStagesCount(Number(e.target.value))}
              className="w-full accent-cyan-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-300 font-semibold">
                {language === "om" ? "Dhibbantaa Kasaaraa Tokkoon Tokkoo (Stage Margin Friction)" : "Single Stage Friction / Margin"}
              </span>
              <span className="font-mono text-amber-400 font-bold">{singleStageMargin}%</span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              step="0.5"
              value={singleStageMargin}
              onChange={(e) => setSingleStageMargin(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-rose-400">
                {language === "om" ? "Kasaaraa Walitti-Kuufame (Compound Friction)" : "Compounded Friction Decay"}
              </span>
              <div className="text-xl font-black font-mono text-rose-300 mt-1">
                {compoundFriction.toFixed(1)}%
              </div>
              <span className="text-[10px] text-rose-200/80">
                {language === "om" ? "Dhabama faayidaa walxaxummaa irraa" : "Lost to compounded friction"}
              </span>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {language === "om" ? "Qulqullina Hafe (Preserved Equity)" : "Preserved Expected Value"}
              </span>
              <div className="text-xl font-black font-mono text-white mt-1">
                {fairEquityRetained.toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-400">
                {language === "om" ? "Faayidaa dhugaa hafe" : "Actual statistical equity remaining"}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1.5">
            <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>{language === "om" ? "Maaliif Haalawwan Hedduu Walitti Qabuun Balaadha?" : "The Mathematics of Multi-Variable Risk"}</span>
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {language === "om"
                ? `Haalawwan ${stagesCount} walitti qabuun carraa milkaa'inaa dachaan gadi buusa. Kasaaraan marsaa tokkoo ${singleStageMargin}% yoo ta'e, haalawwan ${stagesCount} irratti qabeenya keessaa ${compoundFriction.toFixed(1)}% dhabama!`
                : `Every additional uncertain condition dramatically reduces independent joint probability while multiplying system friction. Combining ${stagesCount} uncertain stages extracts ${compoundFriction.toFixed(1)}% of your statistical expected value. In decision theory and portfolio management, evaluating single independent events is overwhelmingly superior.`}
            </p>
          </div>
        </div>
      )}

      {/* VIEW 3: SELF-CHECK SCREENER */}
      {activeTab === "screener" && (
        <div className="space-y-3">
          <div className="space-y-2">
            {questions.map((q) => (
              <div key={q.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                <p className="text-slate-200 font-medium leading-snug">{q[language]}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setScreenerAnswers((prev) => ({ ...prev, [q.id]: true }))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${
                      screenerAnswers[q.id] === true
                        ? "bg-rose-600 text-white border-rose-500"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === "om" ? "Eeyyee (Yes)" : "Yes"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScreenerAnswers((prev) => ({ ...prev, [q.id]: false }))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${
                      screenerAnswers[q.id] === false
                        ? "bg-emerald-600 text-white border-emerald-500"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{language === "om" ? "Lakki (No)" : "No"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Screener Assessment Outcome */}
          {answeredCount > 0 && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                riskCategory === "critical"
                  ? "bg-rose-500/15 border-rose-500 text-rose-200"
                  : riskCategory === "caution"
                  ? "bg-amber-500/15 border-amber-500 text-amber-200"
                  : "bg-emerald-500/15 border-emerald-500 text-emerald-200"
              }`}
            >
              <div className="font-bold text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  {riskCategory === "critical"
                    ? language === "om" ? "Balaan Murtoo Mul'ateera" : "High Risk Exposure Identified"
                    : riskCategory === "caution"
                    ? language === "om" ? "Of-Eeggannoo Barbaachisa" : "Caution: Moderate Cognitive Bias"
                    : language === "om" ? "Amalli Keessan Qulqulluudha" : "Disciplined & Objective Decision-Making"}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {riskCategory === "critical"
                  ? language === "om"
                    ? "Hubachiisa: Mallattoolee kasaaraa duukaa bu'uu fi dhiibbaa miiraa qabaachuu keessan mul'isa. Boqonnaa fudhadhaa, daangaa qabeenyaa eegaa."
                    : "Warning: Indicators of emotional loss-chasing and cognitive bias were reported. Step back, enforce hard budget caps, and take an extended mental break."
                  : language === "om"
                  ? "Itti-gaafatamummaan murteessuu fi daangaa maallaqaa ofii beekuun bu'uura milkaa'inaati."
                  : "Maintain strict budget limits and cold probabilistic logic. Never let short-term emotions drive capital allocation."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: LOCAL COOL-OFF LIMITS & TIMER */}
      {activeTab === "limits" && (
        <div className="space-y-3">
          {/* Active Cooloff Banner */}
          {cooloffActiveUntil && cooloffActiveUntil > Date.now() ? (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Lock className="w-4 h-4" />
                  <span>{language === "om" ? "Boqonnaan Hojiirra Jira (Active Cool-Off)" : "Cool-Off Mode Active"}</span>
                </div>
                <button
                  type="button"
                  onClick={cancelCooloff}
                  className="text-[10px] text-slate-400 hover:text-rose-400 underline"
                >
                  {language === "om" ? "Haqi" : "Cancel"}
                </button>
              </div>
              <p className="text-[11px] text-emerald-200">
                {language === "om"
                  ? "Sammuu boqochiisuuf boqonnaa fudhattan. Daangaan kun qulqullina sammuu keessanii eega."
                  : "You are currently in a focus cool-down window. Take time away from statistical models and screens."}
              </p>
            </div>
          ) : (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-400" />
                  {language === "om" ? "Boqonnaa Sammuu (Mental Focus Cool-Off)" : "Enforce a Session Timeout"}
                </span>
                <span className="font-mono text-rose-400 font-bold">{cooloffMinutes} mins</span>
              </div>
              <input
                type="range"
                min="15"
                max="180"
                step="15"
                value={cooloffMinutes}
                onChange={(e) => setCooloffMinutes(Number(e.target.value))}
                className="w-full accent-rose-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
              />
              <button
                type="button"
                onClick={startCooloff}
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-colors"
              >
                {language === "om" ? "Boqonnaa Jalqabi" : "Lock In Cool-Off Window"}
              </button>
            </div>
          )}

          {/* Daily Max Loss Limit */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold">
                {language === "om" ? "Daangaa Kasaaraa Guyyaa (Daily Max Stop-Loss)" : "Personal Daily Stop-Loss Cap"}
              </span>
              <span className="font-mono text-amber-400 font-bold">{dailyLossLimit} ETB / $</span>
            </div>
            <input
              type="number"
              value={dailyLossLimit}
              onChange={(e) => setDailyLossLimit(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={saveDailyLimit}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs flex items-center justify-center gap-1 transition-colors"
            >
              {limitSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : null}
              <span>
                {limitSaved
                  ? (language === "om" ? "Daangaan Olkaayameera!" : "Saved to Local Storage!")
                  : (language === "om" ? "Daangaa Olkaawi" : "Save Personal Daily Limit")}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Action to Chat for Advice */}
      <button
        type="button"
        onClick={handleSendToChat}
        className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
      >
        <Send className="w-3.5 h-3.5 text-rose-400" />
        <span>
          {language === "om"
            ? "Gorsa Saayinsii Murtoo QAXALE AI Waliin Mari'adhu"
            : "Consult QAXALE AI on Decision Bias & Capital Guardrails"}
        </span>
      </button>
    </div>
  );
};
