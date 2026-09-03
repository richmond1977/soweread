import test from "node:test";
import assert from "node:assert/strict";
import { getPostEditRestriction } from "./post-edit-guard.ts";

test("getPostEditRestriction fail-closes wordpress mirror edits", () => {
  assert.equal(getPostEditRestriction("wordpress"), "WordPress 同步文章為唯讀鏡像，請在主站編輯後再同步。");
  assert.equal(getPostEditRestriction("native"), null);
  assert.equal(getPostEditRestriction(undefined), null);
});
