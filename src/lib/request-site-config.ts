import "server-only";

import { headers } from "next/headers";
import { getSiteConfig, type SiteConfig } from "./site-config";

/**
 * Resolve the site config for the current request.
 *
 * With `SITE_ROLE_RESOLUTION=env` (two separate Vercel Projects) the role is
 * fixed by env vars and no dynamic API is touched, so pages stay statically
 * renderable exactly as before.
 *
 * With `SITE_ROLE_RESOLUTION=host` (one Vercel Project serving both the growth
 * and the backup domain) the role has to come from the request `Host` header,
 * which opts the caller into dynamic rendering.
 */
export async function getRequestSiteConfig(): Promise<SiteConfig> {
  if (process.env.SITE_ROLE_RESOLUTION !== "host") {
    return getSiteConfig();
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  return getSiteConfig(process.env, { host });
}
