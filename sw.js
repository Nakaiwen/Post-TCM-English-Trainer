/* 後中醫英文單字練習器 — Service Worker
 * 提供離線使用能力：
 *  - App shell（index.html、圖示、manifest）預先快取
 *  - HTML 文件採「網路優先、離線退回快取」（線上時自動拿到最新版）
 *  - Google Fonts 採「快取優先」執行期快取（第一次上線載入後即可離線使用）
 *  - 其他同源靜態檔採「快取優先」
 *
 * 改版方式：每次更新 index.html 後，把下面的 CACHE_VERSION 數字 +1，
 * 重新部署即可讓使用者下次開啟時自動更新。
 */

const CACHE_VERSION = "v2";
const APP_CACHE  = `houyi-app-${CACHE_VERSION}`;
const FONT_CACHE = `houyi-fonts-${CACHE_VERSION}`;

// App shell：用相對路徑，子目錄部署也能用
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png",
  "./favicon-32.png"
];

// ---- Install：逐一快取 app shell（單一檔失敗不會讓整個安裝失敗）----
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(APP_CACHE);
    await Promise.all(APP_SHELL.map(async (url) => {
      try {
        await cache.add(new Request(url, { cache: "reload" }));
      } catch (e) {
        // 某些主機 './' 可能不存在，略過即可
      }
    }));
    self.skipWaiting();
  })());
});

// ---- Activate：清掉舊版快取 ----
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k !== APP_CACHE && k !== FONT_CACHE)
          .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

// ---- Fetch ----
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // 1) Google Fonts（CSS + 字型檔）：快取優先，背景更新
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(staleWhileRevalidate(req, FONT_CACHE));
    return;
  }

  // 2) HTML 文件導覽：網路優先，離線退回快取的 index.html
  if (req.mode === "navigate" ||
      (req.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(networkFirstHtml(req));
    return;
  }

  // 3) 其他同源資源：快取優先
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req, APP_CACHE));
    return;
  }

  // 4) 其餘：直接走網路，失敗則嘗試快取
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});

// ---- 策略函式 ----
async function networkFirstHtml(req) {
  const cache = await caches.open(APP_CACHE);
  try {
    const fresh = await fetch(req);
    cache.put("./index.html", fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await cache.match(req) ||
                   await cache.match("./index.html") ||
                   await cache.match("./");
    if (cached) return cached;
    return new Response("離線中，且尚未快取此頁。請先在連線狀態下開啟一次。", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.status === 200) cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    return cached || Response.error();
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const fetching = fetch(req).then((res) => {
    if (res && res.status === 200) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return cached || (await fetching) || Response.error();
}
