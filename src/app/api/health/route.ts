import { NextResponse } from "next/server";
import { getRequestSiteConfig } from "@/lib/request-site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await getRequestSiteConfig();

  return NextResponse.json(
    {
      ok: config.siteRole !== "unresolved" && config.issues.length === 0,
      role: config.siteRole,
      roleResolution: config.roleResolution,
      mode: config.backupMode,
      redirect: config.shouldRedirectInProxy,
      serve: config.shouldServeBackupContent,
      growthContent: config.canServeGrowthContent,
      mirrorContent: config.canServeMirrorContent,
      indexable: config.indexable,
      canonicalBaseUrl: config.canonicalBaseUrl,
      databaseUrlKey: config.databaseUrlKey,
      configIssues: config.issues.length,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    }
  );
}
