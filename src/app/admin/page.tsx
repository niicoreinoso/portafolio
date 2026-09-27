import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getStats } from "@/lib/analytics";
import { getGitHubUser, getRepos } from "@/lib/github";
import { getSettings, readDB } from "@/lib/store";
import { geminiConfigured, publicChatEnabled } from "@/lib/gemini";
import Dashboard from "@/components/admin/Dashboard";

export const metadata: Metadata = { title: "Panel", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const RANGES = [7, 30, 90] as const;

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");

  const { range } = await searchParams;
  const days = RANGES.find((r) => String(r) === range) ?? 30;

  const [stats, repos, user, db, settings] = await Promise.all([getStats(days), getRepos(), getGitHubUser(), readDB(), getSettings()]);

  return (
    <Dashboard
      stats={stats}
      repos={repos}
      user={user}
      messages={db.messages}
      settings={settings}
      ranges={[...RANGES]}
      gemini={geminiConfigured()}
      chatAvailable={publicChatEnabled()}
      model={process.env.GEMINI_MODEL || "gemini-flash-latest"}
    />
  );
}
