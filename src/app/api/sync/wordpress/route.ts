import { NextRequest, NextResponse } from "next/server";
import { syncWordPressPosts } from "@/lib/backup/wordpress-sync";
import { authorizeSyncRequest } from "@/lib/backup/wordpress-sync-core";
import { getBackupSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

async function handle(request: NextRequest) {
  // A growth-only deployment has no mirror to sync. `vercel.json` is shared by
  // every project, so answer the daily cron with an explicit skip before the
  // authorization check — otherwise a project with no CRON_SECRET reports a
  // failing cron every day and hides real sync failures.
  const config = getBackupSiteConfig();
  if (!config.isBackup && !config.isPrimary) {
    return NextResponse.json(
      {
        ok: true,
        skipped: true,
        role: config.siteRole,
        message: `WordPress sync does not apply to the "${config.siteRole}" role; nothing was written.`,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
      }
    );
  }

  const auth = authorizeSyncRequest({
    authorizationHeader: request.headers.get("authorization"),
    querySecret: request.nextUrl.searchParams.get("secret"),
    configuredSecret: process.env.CRON_SECRET,
  });

  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.reason },
      {
        status: auth.status,
        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow",
        },
      }
    );
  }

  const result = await syncWordPressPosts();
  return NextResponse.json(result, {
    status: result.status,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
