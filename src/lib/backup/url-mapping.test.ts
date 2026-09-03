import test from "node:test";
import assert from "node:assert/strict";
import {
  isGrowthOnlyPath,
  isPrimaryHostLoop,
  isPrimaryOnlyPath,
  mapPrimaryRedirectPath,
  shouldBypassBackupProxy,
} from "./url-mapping.ts";

test("proxy bypasses health, sync, status, admin, and static assets", () => {
  assert.equal(shouldBypassBackupProxy("/status"), true);
  assert.equal(shouldBypassBackupProxy("/api/health"), true);
  assert.equal(shouldBypassBackupProxy("/api/sync/wordpress"), true);
  assert.equal(shouldBypassBackupProxy("/admin/posts"), true);
  assert.equal(shouldBypassBackupProxy("/assets/logo.png"), true);
  assert.equal(shouldBypassBackupProxy("/blog"), false);
});

test("mapPrimaryRedirectPath preserves deterministic shared routes", () => {
  assert.equal(mapPrimaryRedirectPath("/", ""), "/");
  assert.equal(mapPrimaryRedirectPath("/blog", "?page=2"), "/home/%E6%96%87%E7%AB%A0%E9%83%A8%E8%90%BDblog/?page=2");
  assert.equal(mapPrimaryRedirectPath("/story", ""), "/about/");
  assert.equal(mapPrimaryRedirectPath("/contact", "?from=footer"), "/home/contact/?from=footer");
  assert.equal(mapPrimaryRedirectPath("/privacy", ""), "/home/privacy-policy/");
  assert.equal(mapPrimaryRedirectPath("/categories/food-health", ""), "/category/food-health/");
  assert.equal(mapPrimaryRedirectPath("/unknown", "?x=1"), "/");
});

test("article routes are deferred to route layer and host loops are detected", () => {
  assert.equal(mapPrimaryRedirectPath("/blog/my-post", ""), null);
  assert.equal(isPrimaryHostLoop("https://soweread.com/blog", "https://soweread.com"), true);
  assert.equal(isPrimaryHostLoop("https://backup.example.com/blog", "https://soweread.com"), false);
});

test("primary-only paths are recognised so growth never serves the mirror tree", () => {
  for (const path of ["/blog", "/blog/some-post", "/categories/food", "/story", "/contact", "/privacy", "/rss.xml"]) {
    assert.equal(isPrimaryOnlyPath(path), true, path);
    assert.equal(isGrowthOnlyPath(path), false, path);
  }
});

test("growth-only paths are recognised so primary and backup never serve them", () => {
  for (const path of ["/topics", "/topics/food-labeling", "/entities/tfda", "/articles/reading-nutrition-labels"]) {
    assert.equal(isGrowthOnlyPath(path), true, path);
    assert.equal(isPrimaryOnlyPath(path), false, path);
  }
});

test("shared infrastructure paths belong to neither role", () => {
  for (const path of ["/", "/status", "/api/health", "/admin"]) {
    assert.equal(isPrimaryOnlyPath(path), false, path);
    assert.equal(isGrowthOnlyPath(path), false, path);
  }
});
