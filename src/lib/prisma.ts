import "server-only";

import { PrismaClient } from "@prisma/client";
import { databaseUrlKeyForRole, type ResolvedSiteRole } from "./site-config";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaByUrl?: Map<string, PrismaClient>;
};

export function getPrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }

  return globalForPrisma.prisma;
}

/**
 * Growth and backup must never read each other's database. When both roles live
 * in one deployment the datasource is selected per role at runtime; a role with
 * no dedicated URL falls back to DATABASE_URL, which is only safe in the
 * single-role (two Vercel Projects) topology.
 */
export function getPrismaForRole(role: ResolvedSiteRole): PrismaClient {
  const key = databaseUrlKeyForRole(role);
  const url = process.env[key]?.trim() || process.env.DATABASE_URL?.trim();

  if (!url) {
    throw new Error(`No database URL configured for site role "${role}" (looked at ${key}).`);
  }

  if (!globalForPrisma.prismaByUrl) {
    globalForPrisma.prismaByUrl = new Map();
  }

  const cached = globalForPrisma.prismaByUrl.get(url);
  if (cached) return cached;

  const client = new PrismaClient({ datasourceUrl: url });
  globalForPrisma.prismaByUrl.set(url, client);
  return client;
}
