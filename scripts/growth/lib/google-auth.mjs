// 共用 Google OAuth 認證：用 refresh token 換取短期 access token。
// 所有取數腳本 import 這支，不重複實作。零外部依賴。
//
// 原樣移植自來源專案（見 docs/growth-weekly-report-migration.md 第 3
// 節），因為這支是純 OAuth 邏輯，跟專案語意無關，兩邊行為要一致。本檔不 import
// env 載入器——它只讀 process.env，由呼叫端（authorize.mjs / smoke-test.mjs 等
// 入口腳本）先 import ./env.mjs 把 .env.local 灌進 process.env。
//
// 需要環境變數（由 --env-file=.env.local 或 GitHub Secrets 提供）：
//   GOOGLE_OAUTH_CLIENT_ID
//   GOOGLE_OAUTH_CLIENT_SECRET
//   GOOGLE_OAUTH_REFRESH_TOKEN

let cached = null; // { token, expiresAt }

export async function getAccessToken() {
  // 提前 60 秒視為過期，避免邊界
  if (cached && Date.now() < cached.expiresAt - 60_000) {
    return cached.token;
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      '缺少 GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_OAUTH_REFRESH_TOKEN。' +
        '請以 node --env-file=.env.local 執行，或確認 GitHub Secrets 已設定。'
    );
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error('換取 access token 失敗：' + JSON.stringify(data));
  }

  cached = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return cached.token;
}

// 帶認證的 GET，回傳解析後的 JSON；非 2xx 直接丟錯。
export async function googleGet(url) {
  const token = await getAccessToken();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`GET ${url} 失敗 (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

// 帶認證的 POST（JSON body），回傳解析後的 JSON；非 2xx 直接丟錯。
export async function googlePost(url, body) {
  const token = await getAccessToken();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`POST ${url} 失敗 (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}
