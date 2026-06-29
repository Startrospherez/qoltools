/* shared.js — Study Tools Hub
 * Cross-tool glue, framework-free. Loaded by every tool page.
 * Responsibilities (Phase 1):
 *   1. Apply the global theme (hub_theme) on load.
 *   2. Keep tool <-> hub theme in sync (tool's own dark toggle writes back).
 *   3. Inject a "back to hub" link, adapting to each tool's nav.
 * Knows nothing about any individual tool's internals.
 */
(function () {
  "use strict";

  var THEME_KEY = "hub_theme"; // "sepia" | "light"(=White) | "dark"

  // The element that carries theme classes. Tools paint their canvas inside a
  // #bd wrapper and toggle theme classes on it; fall back to <body>.
  function themeEl() { return document.getElementById("bd") || document.body; }

  // --- Theme model -------------------------------------------------------
  // Three mutually-exclusive base states: sepia (default) / white / dark.
  // sepia = no class (the tool's baked cream :root); white = .white; dark =
  // .dark. Shader (.shader) and the 🎨 tone (.hl-mode) are independent overlays
  // and are preserved across base-theme changes.
  function setBaseTheme(state) {
    var el = themeEl();
    el.classList.remove("dark", "white");
    if (state === "dark") el.classList.add("dark");
    else if (state === "white") el.classList.add("white");
    try {
      localStorage.setItem(
        THEME_KEY,
        state === "dark" ? "dark" : (state === "white" ? "light" : "sepia")
      );
    } catch (e) {}
  }
  function getBaseTheme() {
    var el = themeEl();
    return el.classList.contains("dark")
      ? "dark"
      : (el.classList.contains("white") ? "white" : "sepia");
  }
  window.setBaseTheme = setBaseTheme;
  window.getBaseTheme = getBaseTheme;
  // Sepia is default-on; toggling it off drops to White. Sepia/Dark are
  // mutually exclusive (setBaseTheme clears the other).
  window.toggleSepia = function () {
    setBaseTheme(getBaseTheme() === "sepia" ? "white" : "sepia");
  };
  window.toggleDark = function () {
    setBaseTheme(getBaseTheme() === "dark" ? "white" : "dark");
  };

  // --- 1. Apply global theme on load -------------------------------------
  function applyTheme() {
    var t = null;
    try { t = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (t === "dark") setBaseTheme("dark");
    else if (t === "light") setBaseTheme("white");
    else setBaseTheme("sepia"); // "sepia" or unset → Sepia is the default
  }

  // --- 2. Sync the tool's base theme back to the global key --------------
  function watchTheme() {
    var obs = new MutationObserver(function () {
      try {
        var s = getBaseTheme();
        localStorage.setItem(
          THEME_KEY,
          s === "dark" ? "dark" : (s === "white" ? "light" : "sepia")
        );
      } catch (e) {}
    });
    obs.observe(themeEl(), { attributes: true, attributeFilter: ["class"] });
  }

  // --- 3. Inject "back to hub" link --------------------------------------
  // Floating pill, fixed at the bottom-left on every tool (consistent place,
  // never clipped by the top toolbar).
  function injectHubLink() {
    if (document.getElementById("hub-back-link")) return;
    var a = document.createElement("a");
    a.id = "hub-back-link";
    a.href = "../index.html";
    a.textContent = "← Hub";
    a.title = "Back to Study Tools Hub";
    // bottom-right, sitting just ABOVE the tool's info (i) button.
    a.style.cssText =
      "position:fixed;right:14px;bottom:62px;z-index:99999;" +
      "display:inline-flex;align-items:center;gap:4px;" +
      "padding:7px 14px;border-radius:999px;font-weight:600;font-size:14px;" +
      "text-decoration:none;color:#fff;background:#5b8def;" +
      "box-shadow:0 2px 8px rgba(0,0,0,.25);opacity:.92;";
    a.onmouseenter = function () { a.style.opacity = "1"; };
    a.onmouseleave = function () { a.style.opacity = ".92"; };
    document.body.appendChild(a);
    placeHubAboveInfo(a);
    window.addEventListener("resize", function () { placeHubAboveInfo(a); });
  }

  // Sit the Hub pill just above the tool's info (i) button, whatever its height.
  function placeHubAboveInfo(a) {
    var info = document.getElementById("about-btn");
    if (!info) return; // keep default bottom:62px
    var r = info.getBoundingClientRect();
    if (r.height === 0) return;
    a.style.bottom = Math.round(window.innerHeight - r.top + 8) + "px";
  }

  // Show the hub link as early as possible.
  function early() {
    injectHubLink();
  }

  // Apply theme AFTER the tool's own (sometimes async) init settles, then start
  // watching — so the tool's init churn isn't recorded as a theme change.
  function late() {
    setTimeout(function () {
      applyTheme();
      watchTheme();
    }, 150);
  }

  // --- 4. PNG export: one button, ask opaque/transparent ------------------
  // Each tool exposes window.doExportClick (crop) + window.doExportDblClick
  // (full screen) + reads window.__pngTransparent. We keep the click=crop /
  // dblclick=full gesture, but a single "📸 PNG" button now first asks the
  // background (ทึบ/ใส) via a small popup, then runs the matching export.
  var _pngTimer = null;

  function runPng(full, transparent) {
    window.__pngTransparent = transparent;
    if (full) { if (window.doExportDblClick) window.doExportDblClick(); }
    else { if (window.doExportClick) window.doExportClick(); }
  }

  function askPngBg(cb) {
    if (document.getElementById("png-bg-ask")) return; // already open
    var ov = document.createElement("div");
    ov.id = "png-bg-ask";
    ov.style.cssText =
      "position:fixed;inset:0;z-index:2147483646;display:flex;" +
      "align-items:center;justify-content:center;background:rgba(0,0,0,.45);";
    var card = document.createElement("div");
    card.style.cssText =
      "background:var(--tb,#fff);color:var(--fg,#222);border:1px solid var(--bc,#ccc);" +
      "border-radius:10px;padding:18px 20px;min-width:240px;text-align:center;" +
      "box-shadow:0 6px 24px rgba(0,0,0,.3);font-family:sans-serif;";
    card.innerHTML =
      '<div style="font-weight:700;margin-bottom:14px;font-size:15px;">บันทึก PNG — เลือกพื้นหลัง</div>' +
      '<div style="display:flex;gap:10px;justify-content:center;">' +
      '<button data-png="opaque" style="flex:1;padding:10px;border-radius:8px;cursor:pointer;border:1px solid var(--bc,#bbb);background:#fff;color:#000;font-size:14px;font-weight:600;">⬛ ทึบ</button>' +
      '<button data-png="clear"  style="flex:1;padding:10px;border-radius:8px;cursor:pointer;border:1px solid var(--bc,#bbb);background:#fff;color:#000;font-size:14px;font-weight:600;">▦ ใส</button>' +
      "</div>" +
      '<button data-png="cancel" style="margin-top:12px;background:transparent;border:none;color:var(--fg,#666);cursor:pointer;font-size:13px;text-decoration:underline;">ยกเลิก</button>';
    ov.appendChild(card);
    function close() { if (ov.parentNode) ov.parentNode.removeChild(ov); }
    ov.addEventListener("click", function (e) {
      var pick = e.target.getAttribute && e.target.getAttribute("data-png");
      if (e.target === ov || pick === "cancel") return close();
      if (pick === "opaque") { close(); cb(false); }
      else if (pick === "clear") { close(); cb(true); }
    });
    document.body.appendChild(ov);
  }

  // Click waits briefly so a double-click can cancel it and route to full.
  window.pngBtnClick = function () {
    clearTimeout(_pngTimer);
    _pngTimer = setTimeout(function () {
      askPngBg(function (tr) { runPng(false, tr); });
    }, 230);
  };
  window.pngBtnDbl = function () {
    clearTimeout(_pngTimer);
    askPngBg(function (tr) { runPng(true, tr); });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", early);
  } else {
    early();
  }
  if (document.readyState === "complete") {
    late();
  } else {
    window.addEventListener("load", late);
  }
})();
