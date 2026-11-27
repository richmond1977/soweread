import assert from "node:assert/strict";
import { test } from "node:test";

import { decodeXmlText, parseFeedItems } from "./build-primary-article-index.mjs";

test("decodeXmlText decodes named and numeric entities and CDATA", () => {
  assert.equal(decodeXmlText("Taiwan&apos;s &amp; &quot;eggs&quot; &lt;3"), `Taiwan's & "eggs" <3`);
  assert.equal(decodeXmlText("&#39;&#x2014;"), "'—");
  assert.equal(decodeXmlText("<![CDATA[A & B]]>"), "A & B");
});

test("parseFeedItems reads title, link and the UTC date of pubDate", () => {
  const xml = `<rss><channel><title>潤讀</title>
    <item><title>Taiwan&apos;s Onions</title><link>https://soweread.com/en/onion/</link>
      <description>…</description><pubDate>Fri, 27 Nov 2026 12:46:49 GMT</pubDate></item>
    <item><title>香草莢全攻略</title><link>https://soweread.com/vanilla-bean-guide/</link>
      <pubDate>Tue, 17 Nov 2026 00:30:00 GMT</pubDate></item>
  </channel></rss>`;
  assert.deepEqual(parseFeedItems(xml), [
    { title: "Taiwan's Onions", link: "https://soweread.com/en/onion/", datePublished: "2026-11-27" },
    { title: "香草莢全攻略", link: "https://soweread.com/vanilla-bean-guide/", datePublished: "2026-11-17" },
  ]);
});

test("parseFeedItems rejects an item without a pubDate", () => {
  assert.throws(() => parseFeedItems("<item><title>x</title><link>https://soweread.com/x/</link></item>"));
});
