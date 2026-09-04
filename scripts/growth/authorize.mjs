#!/usr/bin/env node
// 一次性 OAuth 授權腳本：用你自己的 Google 帳號換取 refresh token
// 執行：node --env-file=.env.local scripts/growth/authorize.mjs
//
// 需要 .env.local 內含：
//   GOOGLE_OAUTH_CLIENT_ID
//   GOOGLE_OAUTH_CLIENT_SECRET
//
// 流程：啟動本機 loopback server → 開瀏覽器跳 Google 同意畫面 →
//       擷取授權碼 → 換取 refresh token → 印出來讓你手動貼進 .env.local。
// 零外部依賴，只用 Node 內建模組。
//
// Port 說明：下面 `server.listen(0, ...)` 的 0 是請 OS 配一個當下閒置的
// ephemeral port，來源端就是這樣寫，這裡刻意保留不改成固定值。SOWEREAD 這邊
// `.claude/launch.json` 裡 growth 預覽站用的是 3100（見 dev-growth.mjs），
// 但這支腳本只在 Richmond 手動跑 `npm run growth:auth` 的當下短暫存活、跑完
// 就關閉，動態配 port 已經保證不會跟 3100 或任何其他正在監聽的服務衝突——
// 改成寫死的固定 port 反而是退步，因為那個固定值有可能未來被別的服務用掉。
// 這也是 Google loopback OAuth（RFC 8252）建議的做法：Desktop 類型的 OAuth
// client 本來就允許 redirect URI 是 127.0.0.1 上任意 port，不需要在 Google
// Cloud Console 預先登記固定 port。

import './lib/env.mjs';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('缺少 GOOGLE_OAUTH_CLIENT_ID 或 GOOGLE_OAUTH_CLIENT_SECRET。');
  console.error('請確認以 node --env-file=.env.local 執行，且 .env.local 內有這兩個變數。');
  process.exit(1);
}

// 唯讀範圍：GSC + GA4
const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
].join(' ');

const STATE = randomBytes(16).toString('hex');

// 開啟預設瀏覽器（跨平台）
function openBrowser(url) {
  const platform = process.platform;
  if (platform === 'win32') {
    // 不能用 cmd start：URL 內的 & 會被 cmd 當成指令分隔符而截斷網址。
    // rundll32 直接把整串當單一參數處理，不經 shell 解析。
    spawn('rundll32', ['url.dll,FileProtocolHandler', url], { stdio: 'ignore', detached: true });
  } else if (platform === 'darwin') {
    spawn('open', [url], { stdio: 'ignore', detached: true });
  } else {
    spawn('xdg-open', [url], { stdio: 'ignore', detached: true });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname !== '/') {
    res.writeHead(404);
    res.end();
    return;
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const err = url.searchParams.get('error');

  if (err) {
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h1>授權失敗</h1><p>${err}</p><p>可關閉此分頁。</p>`);
    console.error('\n授權被拒絕或失敗：', err);
    server.close();
    process.exit(1);
  }

  if (state !== STATE) {
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>state 不符，可能遭 CSRF，已中止。</h1>');
    console.error('\nstate 不符，中止。');
    server.close();
    process.exit(1);
  }

  const port = server.address().port;
  const redirectUri = `http://localhost:${port}`;

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const data = await tokenRes.json();

    if (!tokenRes.ok || !data.refresh_token) {
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>換取 token 失敗</h1><p>詳見終端機輸出。可關閉此分頁。</p>');
      console.error('\n換取 token 失敗：', JSON.stringify(data, null, 2));
      if (!data.refresh_token) {
        console.error('\n沒拿到 refresh_token。若非首次授權，請到 Google 帳戶的');
        console.error('「安全性 → 第三方應用程式存取」撤銷此 app 後重跑，或此腳本已強制 prompt=consent。');
      }
      server.close();
      process.exit(1);
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>授權成功 ✅</h1><p>refresh token 已印在終端機，請關閉此分頁回到終端機。</p>');

    console.log('\n授權成功。請把下面這行加進 .env.local：\n');
    console.log('GOOGLE_OAUTH_REFRESH_TOKEN=' + data.refresh_token);
    console.log('\n（此 token 長期有效，除非你手動撤銷。切勿提交進 git。）');

    server.close();
    process.exit(0);
  } catch (e) {
    res.writeHead(500);
    res.end('error');
    console.error('\n交換 token 時發生例外：', e);
    server.close();
    process.exit(1);
  }
});

// 綁 0 讓 OS 配一個空閒埠（見檔頭「Port 說明」）
server.listen(0, '127.0.0.1', () => {
  const port = server.address().port;
  const redirectUri = `http://localhost:${port}`;

  const authUrl =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: SCOPES,
      access_type: 'offline', // 要 refresh token
      prompt: 'consent', // 強制回傳 refresh token
      state: STATE,
    }).toString();

  console.log('即將開啟瀏覽器進行 Google 授權…');
  console.log('若瀏覽器沒自動開啟，請手動複製下列網址到瀏覽器：\n');
  console.log(authUrl + '\n');
  openBrowser(authUrl);
});
