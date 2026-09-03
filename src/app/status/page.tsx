import type { Metadata } from "next";
import { getBackupStatusSummary } from "@/lib/backup/status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Backup Status",
  robots: { index: false, follow: false },
};

export default async function StatusPage() {
  const status = await getBackupStatusSummary();

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "40px 20px", fontFamily: "monospace" }}>
      <h1>Backup Status</h1>
      <p>僅提供無敏感資訊的備援站狀態摘要。</p>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          padding: "20px",
          borderRadius: "12px",
          background: "#111827",
          color: "#f9fafb",
        }}
      >
        {JSON.stringify(status, null, 2)}
      </pre>
      <p>媒體完整鏡像目前仍為 deferred，本頁狀態不代表 disaster-complete。</p>
    </main>
  );
}
