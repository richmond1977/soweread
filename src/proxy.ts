import { NextRequest, NextResponse } from "next/server";
import {
  isGrowthOnlyPath,
  isPrimaryHostLoop,
  isPrimaryOnlyPath,
  mapPrimaryRedirectPath,
  shouldBypassBackupProxy,
} from "./lib/backup/url-mapping";
import { getSiteConfig, normalizeHostHeader } from "./lib/site-config";

const SESSION_COOKIE = "swr_session";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login" || pathname.startsWith("/api/auth/")) {
      return NextResponse.next();
    }

    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }

  if (shouldBypassBackupProxy(pathname)) {
    return NextResponse.next();
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const config = getSiteConfig(process.env, { host });

  // An unknown host means the deployment cannot tell which site it is serving.
  // Refuse to serve content rather than guess and risk exposing the mirror.
  if (config.siteRole === "unresolved") {
    return new NextResponse("This host is not configured for this deployment.", {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  // A Vercel project answers on several `*.vercel.app` aliases at once, all
  // serving the same deployment. Send every non-canonical alias to the
  // canonical growth host so the growth site cannot duplicate itself.
  if (config.enforceCanonicalHost && config.canonicalHost) {
    const requestHost = normalizeHostHeader(host);
    if (requestHost && requestHost !== config.canonicalHost) {
      return NextResponse.redirect(new URL(`${pathname}${search}`, config.canonicalBaseUrl), 308);
    }
  }

  // Each role owns a disjoint slice of the URL space. Serving the other role's
  // tree would either duplicate soweread.com on the growth domain or expose
  // growth drafts from the mirror deployment.
  if (config.isGrowth && isPrimaryOnlyPath(pathname)) {
    return notFound();
  }
  if (!config.isGrowth && isGrowthOnlyPath(pathname)) {
    return notFound();
  }

  // Belt and braces alongside the per-page meta robots tag: a role that must
  // not be indexed gets the header on every response, whatever renders it.
  if (!config.indexable) {
    const response = config.shouldRedirectInProxy
      ? redirectToPrimary(request, config, pathname, search)
      : NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, follow");
    return response;
  }

  // Growth and primary never perform a site-wide redirect: they have to own
  // their own indexable content (plan §11).
  return NextResponse.next();
}

function notFound() {
  return new NextResponse("Not found", {
    status: 404,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, follow" },
  });
}

function redirectToPrimary(
  request: NextRequest,
  config: ReturnType<typeof getSiteConfig>,
  pathname: string,
  search: string
) {
  if (isPrimaryHostLoop(request.url, config.primarySiteUrl)) {
    return NextResponse.next();
  }

  const mappedPath = mapPrimaryRedirectPath(pathname, search);
  if (mappedPath === null) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(mappedPath, config.primarySiteUrl), 307);
}

export const config = {
  matcher: ["/:path*"],
};
