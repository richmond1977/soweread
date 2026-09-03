import test from "node:test";
import assert from "node:assert/strict";
import { authorizeSyncRequest, buildWordPressHash, reconcileWordPressPosts, type WpPost } from "./wordpress-sync-core.ts";

const remotePost: WpPost = {
  id: 123,
  slug: "healthy-food",
  link: "https://soweread.com/healthy-food",
  date_gmt: "2026-09-01T00:00:00",
  modified_gmt: "2026-09-02T00:00:00",
  title: { rendered: "Healthy Food" },
  excerpt: { rendered: "<p>Short excerpt</p>" },
  content: { rendered: "<p>Body</p>" },
};

test("authorizeSyncRequest accepts bearer secret and rejects mismatches", () => {
  assert.deepEqual(
    authorizeSyncRequest({
      authorizationHeader: "Bearer top-secret",
      querySecret: null,
      configuredSecret: "top-secret",
    }),
    { ok: true }
  );

  assert.deepEqual(
    authorizeSyncRequest({
      authorizationHeader: null,
      querySecret: "wrong",
      configuredSecret: "top-secret",
    }),
    { ok: false, status: 401, reason: "Unauthorized sync request." }
  );
});

test("buildWordPressHash changes when content changes", () => {
  const hashA = buildWordPressHash(remotePost);
  const hashB = buildWordPressHash({ ...remotePost, content: { rendered: "<p>Body updated</p>" } });

  assert.notEqual(hashA, hashB);
});

test("reconcileWordPressPosts keeps unchanged items idempotent and archives missing wordpress posts only", () => {
  const existing = [
    {
      id: "wp-123",
      externalSourceId: "123",
      sourceType: "wordpress",
      sourceModifiedAt: new Date("2026-09-02T00:00:00.000Z"),
      sourceHash: buildWordPressHash(remotePost),
      status: "published",
    },
    {
      id: "wp-999",
      externalSourceId: "999",
      sourceType: "wordpress",
      sourceModifiedAt: new Date("2026-08-20T00:00:00.000Z"),
      sourceHash: "stale",
      status: "published",
    },
    {
      id: "native-1",
      externalSourceId: null,
      sourceType: "native",
      sourceModifiedAt: null,
      sourceHash: null,
      status: "published",
    },
  ];

  const decision = reconcileWordPressPosts([remotePost], existing);

  assert.deepEqual(decision.unchangedIds, ["123"]);
  assert.deepEqual(decision.upsertIds, []);
  assert.deepEqual(decision.archiveIds, ["wp-999"]);
});
