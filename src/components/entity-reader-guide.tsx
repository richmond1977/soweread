import Link from "next/link";
import { readerGuideSources, type ReaderGuide } from "@/data/entity-reader-guides";
import { readerGuideSourcesEn } from "@/data/entity-reader-guides-en";
import type { GrowthLocale } from "@/lib/growth/locale";
import styles from "./entity-reader-guide.module.css";

const LABELS = {
  zh: {
    order: "這份指南的閱讀順序",
    basis: "依據：",
    questions: "常見問題",
    sources: "本指南引用來源",
    retrieved: "擷取：",
    more: "繼續閱讀",
  },
  en: {
    order: "Sections of this guide",
    basis: "Based on: ",
    questions: "Common questions",
    sources: "Sources cited in this guide",
    retrieved: "Retrieved ",
    more: "Keep reading",
  },
} as const;

export function EntityReaderGuide({ guide, locale = "zh" }: { guide: ReaderGuide; locale?: GrowthLocale }) {
  const labels = LABELS[locale];
  const sources = readerGuideSources
    .filter((source) => guide.sections.some((section) => section.sourceIds.includes(source.id)))
    .map((source) => ({ ...source, ...(locale === "en" ? readerGuideSourcesEn[source.id] : undefined) }));
  const sourceTitle = (id: string) => sources.find((source) => source.id === id)?.title;
  return (
    <section className={styles.guide} aria-labelledby="reader-guide-title">
      <h2 id="reader-guide-title">{guide.title}</h2>
      <p>{guide.introduction}</p>
      <nav aria-label={labels.order}>
        <ol>{guide.sections.map((section) => <li key={section.id}><a href={`#guide-${section.id}`}>{section.title}</a></li>)}</ol>
      </nav>
      {guide.sections.map((section) => (
        <section key={section.id} aria-labelledby={`guide-${section.id}`}>
          <h3 id={`guide-${section.id}`}>{section.title}</h3>
          {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {section.steps ? <ol>{section.steps.map((step) => <li key={step}>{step}</li>)}</ol> : null}
          {section.table ? (
            <div className={styles.tableScroll} role="region" aria-label={section.table.caption} tabIndex={0}>
              <table>
                <caption>{section.table.caption}</caption>
                <thead><tr>{section.table.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
                <tbody>{section.table.rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th scope="row" key={index}>{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          ) : null}
          {section.sourceIds.length ? <p className={styles.citation}>{labels.basis}{section.sourceIds.map((id) => <a key={id} href={`#guide-source-${id}`}>{sourceTitle(id)}</a>)}</p> : null}
        </section>
      ))}
      <section aria-labelledby="guide-questions">
        <h3 id="guide-questions">{labels.questions}</h3>
        <dl>{guide.questions.map((item) => <div key={item.question}><dt><strong>{item.question}</strong></dt><dd>{item.answer}</dd></div>)}</dl>
      </section>
      <section aria-labelledby="guide-sources">
        <h3 id="guide-sources">{labels.sources}</h3>
        <ul>{sources.map((source) => <li id={`guide-source-${source.id}`} key={source.id}><a href={source.url} rel="noopener">{source.title}</a><br /><span className={styles.citation}>{source.publisher} · {source.version} · {labels.retrieved}{source.retrievedAt}</span></li>)}</ul>
      </section>
      <nav aria-label={labels.more}><h3>{labels.more}</h3><ul>{guide.links.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul></nav>
    </section>
  );
}
