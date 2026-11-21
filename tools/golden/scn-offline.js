(async () => {
  const ctl = (q) => fetch("/__t/ctl?" + q).then((r) => r.json());
  await ctl("offline=0&bump=0");
  const reg = await Promise.race([navigator.serviceWorker.ready, sleep(20000).then(() => null)]);
  log("sw ready", !!reg);
  for (let k = 0; k < 100 && !navigator.serviceWorker.controller; k++) await sleep(100);
  log("controlled", !!navigator.serviceWorker.controller);
  const keys = await caches.keys();
  log("caches", keys.map((k) => k.replace(/-[0-9a-f]{10}$/, "-V")));
  const shell = keys.find((k) => k.startsWith("eng-shell-"));
  const reqs = shell ? (await (await caches.open(shell)).keys()).map((r) => r.url.replace(location.origin, "").replace(/\?v=[0-9a-f]+/, "?v=H")) : [];
  log("shell entries", reqs);
  // Bez sieci: strona w ramce z pamięci podręcznej
  await ctl("offline=1");
  let netFail = false;
  try { await fetch("/manifest.webmanifest?x=" + Math.random(), { cache: "no-store" }); } catch (e) { netFail = true; }
  log("uncached fetch fails offline", netFail);
  try { const r = await fetch("/js/check.js"); log("module without ?v offline", r.status + " " + ((await r.text()).includes("export function expandAnswer"))); } catch (e) { log("module without ?v offline", "FAIL " + e); }
  const fr = document.createElement("iframe");
  fr.style.cssText = "width:400px;height:300px";
  fr.src = "./#/lesson/present-simple";
  document.body.appendChild(fr);
  let ok = false;
  for (let k = 0; k < 150; k++) { await sleep(100); try { if (fr.contentWindow.__ENG && fr.contentDocument.querySelector("#content article")) { ok = true; break; } } catch (e) {} }
  log("offline iframe app ran", ok);
  log("offline iframe title", ok ? fr.contentDocument.title : null);
  log("offline iframe scripts", ok ? [...fr.contentDocument.scripts].map((s) => (s.type || "classic") + ":" + (s.getAttribute("src") || "inline").replace(/\?v=[0-9a-f]+/, "?v=H")) : null);
  fr.remove();
  await ctl("offline=0&bump=1");
  await reg.update().catch((e) => log("update err", String(e)));
  let bar = null;
  for (let k = 0; k < 200 && !(bar = document.querySelector(".update-bar")); k++) await sleep(100);
  log("update bar", bar ? bar.textContent.replace(/\s+/g, " ").trim() : null);
  await ctl("offline=0&bump=0");
  return LOG;
})
