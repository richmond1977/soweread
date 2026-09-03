import test from "node:test";
import assert from "node:assert/strict";
import { parseMeasurementId } from "./analytics.ts";

test("a well-formed GA4 measurement ID is accepted", () => {
  assert.equal(parseMeasurementId("G-FSYTV0011X"), "G-FSYTV0011X");
  assert.equal(parseMeasurementId("  G-FSYTV0011X  "), "G-FSYTV0011X");
});

test("a missing measurement ID disables analytics rather than rendering a broken tag", () => {
  assert.equal(parseMeasurementId(undefined), null);
  assert.equal(parseMeasurementId(null), null);
  assert.equal(parseMeasurementId(""), null);
  assert.equal(parseMeasurementId("   "), null);
});

test("a malformed measurement ID is rejected instead of being interpolated", () => {
  for (const value of [
    "UA-12345-6",
    "FSYTV0011X",
    "G-",
    "G-abc",
    "G-FSY TV0011X",
    "G-FSYTV0011X'); alert(1);//",
    "G-FSYTV0011X</script>",
    "G-TOOLONGMEASUREMENTIDVALUE123",
  ]) {
    assert.equal(parseMeasurementId(value), null, value);
  }
});
