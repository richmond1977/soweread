import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

/**
 * ESLint 9 flat config。
 *
 * 這個 repo 原本沒有任何 ESLint 設定檔，所以 `npm run lint` 一直是失敗的
 * （ESLint 9 起不再讀 .eslintrc.*）。Next 16 也已移除 `next lint`，因此
 * lint 指令改為直接呼叫 eslint。
 *
 * 規則沿用 Next 官方的 core-web-vitals 與 typescript 預設，不自行加碼——
 * 既有程式碼是照這套慣例寫的，另訂一套只會製造雜訊。
 */
const config = [
  {
    ignores: [
      ".next/**",
      ".vercel/**",
      "node_modules/**",
      "out/**",
      "dist/**",
      "public/**",
      // 主站內容快照與匯出資料，不是原始碼。
      "data/**",
      "prisma/wordpress-posts.json",
      // Next 產生的型別宣告，內容由框架控制。
      "next-env.d.ts",
      // 設計稿階段留下的獨立檔案，不屬於應用程式。
      "design-canvas.jsx",
    ],
  },

  ...nextCoreWebVitals,
  ...nextTypeScript,

  {
    // 維運腳本以純 Node 執行，不受 Next 的瀏覽器端假設約束。
    files: ["scripts/**/*.mjs", "prisma/**/*.mjs"],
    rules: {
      // 這些腳本的輸出就是給操作者看的執行紀錄。
      "no-console": "off",
    },
  },
];

export default config;
