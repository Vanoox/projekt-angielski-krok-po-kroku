// Motyw jasny / ciemny (przycisk w pasku, eng-theme) i kolor paska stanu na telefonie.
import { $ } from "./ui.js";

// ---------- Motyw (jasny / ciemny) ----------
$("#themeBtn").addEventListener("click", () => {
  const dark = getComputedStyle(document.documentElement).colorScheme === "dark";
  const t = dark ? "light" : "dark";
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem("eng-theme", t); } catch (e) {}
  syncThemeColor();
});
// Kolor paska stanu na telefonie (i okna aplikacji) = kolor górnego paska w bieżącym motywie.
export function syncThemeColor() {
  const meta = document.querySelector('meta[name="theme-color"]');
  const c = getComputedStyle(document.documentElement).getPropertyValue("--surface").trim();
  if (meta && c) meta.setAttribute("content", c);
}
if (typeof window.matchMedia === "function") matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", syncThemeColor);
syncThemeColor();
