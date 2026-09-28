import test from "node:test";
import assert from "node:assert/strict";
import { parseFaq } from "./faq.ts";

test("valid FAQ JSON parses into question/answer pairs", () => {
  assert.deepEqual(
    parseFaq(
      JSON.stringify([
        { question: "What is this?", answer: "A test." },
        { question: "Another?", answer: "Yes." },
      ])
    ),
    [
      { question: "What is this?", answer: "A test." },
      { question: "Another?", answer: "Yes." },
    ]
  );
});

test("malformed JSON falls back to an empty array", () => {
  assert.deepEqual(parseFaq("{not json"), []);
  assert.deepEqual(parseFaq(""), []);
});

test("a JSON value that is not an array falls back to an empty array", () => {
  assert.deepEqual(parseFaq(JSON.stringify({ question: "x", answer: "y" })), []);
  assert.deepEqual(parseFaq(JSON.stringify("just a string")), []);
});

test("entries missing a non-empty question or answer are dropped", () => {
  assert.deepEqual(
    parseFaq(
      JSON.stringify([
        { question: "Good?", answer: "Yes." },
        { question: "", answer: "Has no question." },
        { question: "Has no answer.", answer: "" },
        { question: "   ", answer: "Whitespace-only question." },
        { answer: "Missing question key." },
        { question: "Missing answer key." },
        null,
        "not an object",
      ])
    ),
    [{ question: "Good?", answer: "Yes." }]
  );
});

test("default value on the column parses to an empty array", () => {
  assert.deepEqual(parseFaq("[]"), []);
});
