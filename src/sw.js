// ----- CONFIG -----
const STATIC_CACHE  = "static-v2";    // bumpa quando cambi asset
const RUNTIME_CACHE = "runtime-v1";
const OFFLINE_URL   = "/offline.html";

// Precache: SOLO asset statici (non .php). Togli quelli che non esistono.
const PRECACHE_ASSETS = [
  // Fallback
  "/offline.html",

  // CSS
  "/account.css",
  "/account_page.css",
  "/add_sw_trans.css",
  "/add_transaction.css",
  "/cash_page.css",
  "/categories.css",
  "/create_goal.css",
  "/create_sw.css",
  "/edit_goal.css",
  "/goals.css",
  "/goals_history.css",
  "/homepage.css",
  "/insights.css",
  "/login.css",
  "/notification.css",
  "/privacy.css",
  "/settings.css",
  "/shared_page.css",
  "/sharedWallet.css",
  "/signup.css",
  "/terms.css",
  "/wallet_page.css",

  // JS
  "/account.js",
  "/account_page.js",
  "/add_sw_trans.js",
  "/add_transaction.js",
  "/cash_page.js",
  "/categories.js",
  "/create_goal.js",
  "/create_sw.js",
  "/edit_goal.js",
  "/goals.js",
  "/goals_history.js",
  "/homepage.js",
  "/insights.js",
  "/login.js",
  "/notification.js",
  "/settings.js",
  "/shared_page.js",
  "/sharedWallet.js",
  "/signup.js",
  "/terms.js",
  "/wallet_page.js",

  // Icone
  "/images/icons/icon-192.png",
  "/images/icons/icon-512.png",
  "/images/icons/maskable-512.png",
  "/icons8-goal-96.png"
];

// ----- INSTALL -----
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    // addAll fallisce se un asset 404: aggiungo in modo resiliente
    await Promise.allSettled(PRECACHE_ASSETS.map(async (url) => {
      try { await cache.add(url); } catch (e) { /* ignora missing */ }
    }));
    self.skipWaiting();
  })());
});

// ----- ACTIVATE -----
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // opzionale: abilita navigation preload se supportato
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch {}
    }
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
          .map(k => caches.delete(k))
    );
    self.clients.claim();
  })());
});

// Utility: decide se è navigazione HTML
const isNavigationRequest = (req) =>
  req.mode === "navigate" || req.headers.get("accept")?.includes("text/html");

// ----- FETCH -----
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo GET
  if (req.method !== "GET") return;

  // Esclusioni
  if (
    url.pathname.startsWith("/vendor/") ||
    url.pathname.startsWith("/uploads/") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/auth") ||
    url.pathname.startsWith("/auth_adapter") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/login")
  ) {
    return; // lascia passare al network
  }

  // Pagine HTML/PHP -> network-first con fallback cache/offline
  if (isNavigationRequest(req)) {
    event.respondWith((async () => {
      try {
        // prova navigation preload se disponibile
        const preload = event.preloadResponse ? await event.preloadResponse : null;
        if (preload) {
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(req, preload.clone());
          return preload;
        }
        const fresh = await fetch(req, { cache: "no-store" });
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        const cached = await caches.match(req, { ignoreSearch: false });
        return cached || caches.match(OFFLINE_URL);
      }
    })());
    return;
  }

  // Asset statici -> cache-first con SWR
  if (/\.(?:css|js|png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|eot)$/i.test(url.pathname)) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) {
        // aggiorna in background
        event.waitUntil((async () => {
          try {
            const res = await fetch(req);
            const cache = await caches.open(STATIC_CACHE);
            await cache.put(req, res.clone());
          } catch {}
        })());
        return cached;
      }
      const res = await fetch(req);
      const cache = await caches.open(STATIC_CACHE);
      cache.put(req, res.clone());
      return res;
    })());
    return;
  }

  // Default: passa al network
});
