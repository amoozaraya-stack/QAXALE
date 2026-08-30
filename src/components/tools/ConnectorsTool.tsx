import React, { useState } from "react";
import {
  Link2,
  FileCode,
  Download,
  Copy,
  Check,
  Send,
  Globe,
  Database,
  Cloud,
  RefreshCw,
  Server,
  Layers,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import {
  dispatchWebhookConnector,
  exportDocumentData,
  saveCloudSyncSnapshot,
  getCloudSyncHistory,
  WebhookConnectorResult,
  ExportConnectorResult,
} from "../../services/api";

export const ConnectorsTool: React.FC = () => {
  const { language, conversations, savedWords } = useApp();
  const [subTab, setSubTab] = useState<"exporter" | "webhook" | "cloudsync">("exporter");

  // Exporter State
  const [exportTitle, setExportTitle] = useState("QAXALE_Analysis_Export");
  const [exportContent, setExportContent] = useState(
    "# QAXALE V3 Executive Report\n\n## Overview\nThis document synthesizes real-time knowledge, interpretive frameworks, and analytical models produced by QAXALE V3.\n\n## Core Findings\n1. First-principles decomposition clarifies structural uncertainty.\n2. Multimodal AI interprets mathematical and linguistic domains seamlessly.\n3. Continuous agency drives capability expansion."
  );
  const [exportFormat, setExportFormat] = useState<"markdown" | "gdoc" | "json" | "html">("gdoc");
  const [exportResult, setExportResult] = useState<ExportConnectorResult | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);

  // Webhook Dispatcher State
  const [targetUrl, setTargetUrl] = useState("https://httpbin.org/post");
  const [httpMethod, setHttpMethod] = useState("POST");
  const [customHeaderKey, setCustomHeaderKey] = useState("Authorization");
  const [customHeaderVal, setCustomHeaderVal] = useState("Bearer qaxale-token-xyz");
  const [requestBody, setRequestBody] = useState(
    JSON.stringify({ event: "telemetry.sync", platform: "QAXALE V3", timestamp: Date.now() }, null, 2)
  );
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookResult, setWebhookResult] = useState<WebhookConnectorResult | null>(null);

  // Cloud Sync State
  const [syncHistory, setSyncHistory] = useState(getCloudSyncHistory());
  const [syncing, setSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  const handleRunExport = async () => {
    if (!exportContent.trim() || exportLoading) return;
    setExportLoading(true);
    const res = await exportDocumentData(exportTitle, exportContent, exportFormat, {
      exportedBy: "QAXALE User",
      source: "QAXALE Workbench",
    });
    setExportResult(res);
    setExportLoading(false);
  };

  const handleDownloadExport = () => {
    if (!exportResult) return;
    const blob = new Blob([exportResult.content], { type: exportResult.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportResult.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyExport = () => {
    if (!exportResult) return;
    navigator.clipboard.writeText(exportResult.content);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const handleDispatchWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim() || webhookLoading) return;
    setWebhookLoading(true);
    setWebhookResult(null);

    const headers: Record<string, string> = {};
    if (customHeaderKey.trim() && customHeaderVal.trim()) {
      headers[customHeaderKey.trim()] = customHeaderVal.trim();
    }

    let parsedBody: any = undefined;
    if (httpMethod === "POST" || httpMethod === "PUT" || httpMethod === "PATCH") {
      try {
        parsedBody = JSON.parse(requestBody);
      } catch {
        parsedBody = requestBody;
      }
    }

    const res = await dispatchWebhookConnector(targetUrl, httpMethod, headers, parsedBody);
    setWebhookResult(res);
    setWebhookLoading(false);
  };

  const handlePerformCloudSync = async () => {
    setSyncing(true);
    setSyncSuccessMessage(null);

    // Simulate Cloud sync handshake with Firestore
    await new Promise((r) => setTimeout(r, 900));

    const snapshot = {
      timestamp: Date.now(),
      device: navigator.userAgent.includes("Mobile") ? "Mobile Android/iOS" : "Desktop Browser",
      conversationsCount: conversations.length,
      savedNotesCount: savedWords.length,
      dbRef: "ai-studio-qaxale-e029a52b-a1ad-452d-99ba-b759485e10e0",
    };

    saveCloudSyncSnapshot(snapshot);
    setSyncHistory(getCloudSyncHistory());
    setSyncing(false);
    setSyncSuccessMessage(
      language === "om"
        ? "Walsimsiisni Kuusaa Duumessaa (Cloud Sync) milkaa'inaan raawwatameera!"
        : "Cloud Firestore snapshot backup completed successfully!"
    );
    setTimeout(() => setSyncSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Sub tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setSubTab("exporter")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            subTab === "exporter"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{language === "om" ? "Eksportii Google Docs & Faayilaa" : "Google Docs & Universal Exporter"}</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("webhook")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            subTab === "webhook"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>{language === "om" ? "API & Webhook Connector" : "REST & Webhook Dispatcher"}</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("cloudsync")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            subTab === "cloudsync"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>{language === "om" ? "Firestore Cloud Sync" : "Firestore Cloud Sync"}</span>
        </button>
      </div>

      {/* 1. EXPORTER SUB TAB */}
      {subTab === "exporter" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-blue-400" />
              {language === "om" ? "Barruu fi Ragaa Gara Google Docs/Faayilaatti Jijjiiri" : "Format & Export to Google Docs, Markdown or JSON"}
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">UTF-8 Compliant</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 font-semibold mb-1 block">
                {language === "om" ? "Mata Duree Faayilaa" : "Document / Export Title"}
              </label>
              <input
                type="text"
                value={exportTitle}
                onChange={(e) => setExportTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-semibold mb-1 block">
                {language === "om" ? "Bifa Eksportii (Format)" : "Target Export Format"}
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(["gdoc", "markdown", "json", "html"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setExportFormat(fmt)}
                    className={`py-2 text-[11px] font-semibold rounded-lg border transition-all ${
                      exportFormat === fmt
                        ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900"
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-semibold mb-1 block">
              {language === "om" ? "Qabiyyee Barruu / Markdown" : "Content to Format & Export"}
            </label>
            <textarea
              value={exportContent}
              onChange={(e) => setExportContent(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none font-mono"
            />
          </div>

          <button
            type="button"
            onClick={handleRunExport}
            disabled={!exportContent.trim() || exportLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-950/40 transition-all active:scale-[0.98]"
          >
            {exportLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{language === "om" ? "Faayila Qopheessi & Eksporti Godhi" : "Package & Generate Export Artifact"}</span>
          </button>

          {/* Export Artifact Result */}
          {exportResult && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-400 font-semibold font-mono">
                    {exportResult.fileName}
                  </span>
                  <p className="text-[10px] text-slate-500">
                    {exportResult.byteSize} bytes • {exportResult.mimeType}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyExport}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-300 hover:text-white text-[11px] flex items-center gap-1.5 transition-colors"
                  >
                    {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{language === "om" ? "Garagalchi" : "Copy"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadExport}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{language === "om" ? "Buusi (Download)" : "Download"}</span>
                  </button>
                </div>
              </div>

              <div className="max-h-36 overflow-y-auto bg-slate-900/80 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap">
                {exportResult.content}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. WEBHOOK / REST DISPATCHER SUB TAB */}
      {subTab === "webhook" && (
        <form onSubmit={handleDispatchWebhook} className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Server className="w-4 h-4 text-cyan-400" />
              {language === "om" ? "API & Webhook Feeda Alaa Dispatcher" : "REST API & Webhook Dispatcher"}
            </h4>
            <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
              Server-Side Proxy
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={httpMethod}
              onChange={(e) => setHttpMethod(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={customHeaderKey}
              onChange={(e) => setCustomHeaderKey(e.target.value)}
              placeholder="Header Name (e.g. Authorization)"
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            />
            <input
              type="text"
              value={customHeaderVal}
              onChange={(e) => setCustomHeaderVal(e.target.value)}
              placeholder="Header Value"
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            />
          </div>

          {(httpMethod === "POST" || httpMethod === "PUT") && (
            <div>
              <label className="text-[10px] text-slate-400 font-semibold mb-1 block">
                JSON Request Body
              </label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none font-mono"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={!targetUrl.trim() || webhookLoading}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-950/40 transition-all active:scale-[0.98]"
          >
            {webhookLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{language === "om" ? "Ergii Bu'aa Fidi" : "Dispatch HTTP Request"}</span>
          </button>

          {/* Webhook Result */}
          {webhookResult && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      webhookResult.success && webhookResult.status && webhookResult.status < 400
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    HTTP {webhookResult.status || "ERR"} {webhookResult.statusText || ""}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {webhookResult.durationMs}ms
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono truncate max-w-[160px]">
                  {webhookResult.url}
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300 whitespace-pre-wrap">
                {typeof webhookResult.data === "object"
                  ? JSON.stringify(webhookResult.data, null, 2)
                  : String(webhookResult.data || webhookResult.error || "No response body")}
              </div>
            </div>
          )}
        </form>
      )}

      {/* 3. CLOUD SYNC & FIRESTORE BACKUP SUB TAB */}
      {subTab === "cloudsync" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-emerald-400" />
              {language === "om" ? "Walsimsiisa Kuusaa Duumessaa (Firestore DB)" : "Cloud Firestore Database Backup"}
            </h4>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
              ai-studio-qaxale-...
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{language === "om" ? "Waliigala Haasaa" : "Total Conversations"}</span>
                <span className="text-base font-bold text-white font-mono">{conversations.length}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{language === "om" ? "Jechoota Galmaa'an" : "Glossary Terms"}</span>
                <span className="text-base font-bold text-white font-mono">{savedWords.length}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block">{language === "om" ? "Haala Duumessaa" : "Cloud Connection"}</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Connected
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePerformCloudSync}
              disabled={syncing}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              {syncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Cloud className="w-3.5 h-3.5" />
              )}
              <span>
                {syncing
                  ? (language === "om" ? "Kuusaa Duumessatti Ol-fe'aa Jira..." : "Backing Up to Firestore...")
                  : (language === "om" ? "Snapshot Duumessatti Ol-fe'i (Sync Now)" : "Create Cloud Backup Snapshot")}
              </span>
            </button>

            {syncSuccessMessage && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{syncSuccessMessage}</span>
              </div>
            )}
          </div>

          {/* Sync Snapshots History */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              {language === "om" ? "Seenaa Walsimsiisa Duumessaa" : "Recent Sync & Backup Logs"}
            </span>

            {syncHistory.length === 0 ? (
              <div className="p-4 text-center bg-slate-950/50 rounded-xl border border-dashed border-slate-800 text-[11px] text-slate-500">
                {language === "om" ? "Walsimsiisni hin jiru. 'Sync Now' cuqaasaa." : "No sync snapshots recorded yet. Tap 'Create Cloud Backup Snapshot'."}
              </div>
            ) : (
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {syncHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                      <div>
                        <span className="text-white font-medium">Snapshot #{syncHistory.length - idx}</span>
                        <p className="text-[9px] text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[10px] text-slate-400">
                      <span>{item.conversationsCount} chats • {item.savedNotesCount} notes</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
