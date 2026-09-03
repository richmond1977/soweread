import Script from "next/script";

interface GrowthAnalyticsProps {
  /** Must already be validated by parseMeasurementId. */
  measurementId: string;
}

/**
 * Google Analytics 4 for the growth site only.
 *
 * The backup deployment is a private mirror and the primary site runs on
 * WordPress, so neither loads this. Rendered via next/script so the tag does
 * not block first paint.
 */
export function GrowthAnalytics({ measurementId }: GrowthAnalyticsProps) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-gtag-init" strategy="afterInteractive">
        {[
          "window.dataLayer = window.dataLayer || [];",
          "function gtag(){dataLayer.push(arguments);}",
          "gtag('js', new Date());",
          `gtag('config', '${measurementId}');`,
        ].join("\n")}
      </Script>
    </>
  );
}
