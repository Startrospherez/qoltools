/* ============================================================
   glossary module — ป้ายประเภทคำ (POS/ไวยากรณ์) + tooltip คำเต็ม
   ------------------------------------------------------------
   - ใช้ข้อมูลจาก window.PALI_ABBREV (สร้างโดย build_tags.py จาก abbreviations.tsv)
     ซึ่งดึงตัวย่อมาจาก "พจนานุกรม บาลี-ไทย-อังกฤษ ฉบับภูมิพโลภิกขุ" เท่านั้น
   - badge เฉพาะ token POS/ไวยากรณ์ "ในวงเล็บ" + เทียบเป๊ะ (ไม่ใช่ substring)
   - STRICT: ถ้าในวงเล็บมี token นอก whitelist แม้ตัวเดียว → ไม่แตะทั้งวงเล็บ
   - ลงเฉพาะการ์ดที่ .src = ฉบับภูมิพโลภิกขุ เท่านั้น (ข้อกำหนดผู้ใช้)
   - hover/focus badge → tooltip คำเต็ม ; คลิก → เปิด Hub (hub.js)
   - tag_norm() ต้องตรงกับ build_tags.py เป๊ะ — เทียบ PUA ด้วยเลข code point (กันอักขระเพี้ยน)
   โมดูลแยกอิสระ ห่อ IIFE เฝ้า #main ด้วย MutationObserver (ไม่แตะ render หลัก)
   ============================================================ */
(function () {
  'use strict';

  var ABBREV = window.PALI_ABBREV || {};
  var SRC_TAG = 'ภูมิพโลภิกขุ';
  var LS = 'pali_glossary';
  var on = localStorage.getItem(LS) !== '0';   // เปิดเป็นค่าเริ่มต้น

  /* ---- tag_norm: ต้องเหมือน build_tags.py เป๊ะ ----
     ตัด space/tab/. nbsp zwsp มาร์ค/combining ; เก็บนิคหิต U+0E4D เพื่อแยก ปุํ จาก ปุ
     PUA: F70F->ญ, F700/F701/F702->ฐ */
  var REMOVE = {};
  [0x20, 0x09, 0x2E, 0xA0, 0x200B, 0xB7, 0xB0, 0x2DA, 0x2013, 0x2014, 0x2019,
   0x2026, 0xF711, 0xF718, 0xF719, 0xF71C, 0x0E3A, 0x0E4C, 0x0E47, 0x0E48,
   0x0E49, 0x0E4A, 0x0E4B].forEach(function (c) { REMOVE[String.fromCharCode(c)] = 1; });

  function tagNorm(s) {
    if (!s) return '';
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var ch = s[i], o = s.charCodeAt(i);
      if (o === 0xF70F) { out += 'ญ'; continue; }
      if (o === 0xF700 || o === 0xF701 || o === 0xF702) { out += 'ฐ'; continue; }
      if (REMOVE[ch] || (o >= 0x0300 && o <= 0x036F) || (o >= 0x0640 && o <= 0x065F)) continue;
      out += ch;
    }
    return out.trim().toLowerCase();
  }

  var esc = function (s) {
    return (s || '').replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };

  var PAREN = /\(([^()]{1,60})\)/g;
  var SPLIT = /[,\s/;]+/;
  /* ราก √xxx : √ (U+221A) ตามด้วยอักขระจนถึง space/เครื่องหมาย (ครอบ PUA ในรากด้วย) */
  var ROOT = /√\s*[^\s,;()/.]+/g;

  /* ---- null-source dict (ตัวย่อแยกไฟล์ abbreviations-null.tsv) — anchored matching ----
     ภูมิพโลฯ ตัวย่อกระจายทั้งย่อหน้า ต้อง gate ในวงเล็บ ; null-source marker อยู่ "หัว content /
     หัวความหมาย" จึง match แบบ anchored (^ หรือหลัง \n + เลขข้อ ๑.๒.) ปลอดภัยแม้ token สั้น
     - คนละ dict/คนละไฟล์กับภูมิพโลฯ (กฎผู้ใช้: ตัวย่อแต่ละสำนักใช้กับสำนักตัวเอง) */
  var NABBR = window.PALI_ABBREV_NULL || {};
  var NSYMS = window.PALI_NULL_SYMS || [];        // [[raw_symbol, tagid], ...] เรียงยาว->สั้น
  var NPAREN_LEAD = /^(\s*)\(([^()]{1,40})\)/;     // ฟอร์แมต A: วงเล็บนำหน้า content
  var NULL_RE = null;                              // ฟอร์แมต B: ตัวย่อนำหน้าความหมาย
  (function () {
    var pats = [];
    for (var i = 0; i < NSYMS.length; i++) {
      var p = NSYMS[i][0].replace(/\s+/g, '')
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\./g, '\\.\\s*');
      if (p) pats.push(p);
    }
    if (pats.length) NULL_RE = new RegExp(
      '(^|\\n)([ \\t]*(?:[๑๒๓๔๕๖๗๘๙0-9]+[.)][ \\t]*)?)(' + pats.join('|') + ')', 'g');
  })();

  /* คลาสสีของ badge: เพศแยกสี (เทียบ tagid), นอกนั้นตาม cat */
  var T_PUM = 'ปุํ', T_IT = 'อิต', T_NPU = 'นปุํ';
  function clsFor(tag, cat) {
    if (tag === T_PUM) return 'g-m';
    if (tag === T_IT) return 'g-f';
    if (tag === T_NPU) return 'g-n';
    return cat === 'grammar' ? 'gram' : 'pos';
  }

  /* dict: '' = ภูมิพโลฯ (คลิก→Hub) ; 'null' = null-source (tooltip อย่างเดียว, ไม่เปิด Hub
     เพราะ tagid ซ้ำกับภูมิพโลฯ — กันคลิกแล้วโชว์คำผิดสำนัก ใน hub.js เช็ก data-dict) */
  function badgeHTML(def, dict, paren) {
    var lbl = paren ? '(' + def.label + ')' : def.label;   // paren: เก็บวงเล็บไว้ในปุ่ม (null format A)
    return '<span class="gtag ' + clsFor(def.tag, def.cat) + '" data-tag="' +
      esc(def.tag) + '"' + (dict ? ' data-dict="' + dict + '"' : '') +
      ' tabindex="0" role="button">' + esc(lbl) + '</span>';
  }

  function badge(tok) {
    var def = ABBREV[tagNorm(tok)];
    return def ? badgeHTML(def, '') : null;
  }

  /* null-source: วงเล็บนำหน้า (A) + ตัวย่อหัวความหมาย (B) — strict whitelist, anchored */
  function nullBadges(html) {
    var changed = false;
    html = html.replace(NPAREN_LEAD, function (m, sp, inner) {
      var toks = inner.split(SPLIT).filter(Boolean);
      if (!toks.length) return m;
      var defs = [], seen = {};
      for (var i = 0; i < toks.length; i++) {
        var d = NABBR[tagNorm(toks[i])];
        if (!d) return m;                          // token นอก whitelist → ไม่แตะทั้งวงเล็บ
        if (!seen[d.tag]) { seen[d.tag] = 1; defs.push(d); }
      }
      changed = true;
      return sp + defs.map(function (d) { return badgeHTML(d, 'null'); }).join(' ');
    });
    if (NULL_RE) html = html.replace(NULL_RE, function (m, pre, num, sym) {
      var d = NABBR[tagNorm(sym)];
      if (!d) return m;
      changed = true;
      return pre + num + badgeHTML(d, 'null');
    });
    return { html: html, changed: changed };
  }

  function processEl(el) {
    if (el.dataset.gloss) return;
    el.dataset.gloss = '1';
    var text = el.textContent;
    var changed = false;
    var html = esc(text);
    var card = el.closest ? el.closest('.card') : null;
    var src = card ? card.querySelector('.src') : null;
    // 1) badge POS/ไวยากรณ์ — แยกตามสำนัก (เลือก gate เดียว)
    if (src && src.textContent.indexOf(SRC_TAG) !== -1) {
      // ภูมิพโลฯ: badge เฉพาะ token ในวงเล็บ (strict ทุก token ต้องอยู่ใน whitelist)
      html = html.replace(PAREN, function (m, inner) {
        var toks = inner.split(SPLIT).filter(Boolean);
        if (!toks.length) return m;
        var parts = toks.map(badge);
        if (parts.indexOf(null) !== -1) return m;   // มี token นอก whitelist → ไม่แตะ
        changed = true;
        return '(' + parts.join(' ') + ')';
      });
    } else if (!src) {
      // null-source (ไม่มี .src): anchored badge (ปทานุกรมมี .src จึงไม่โดน — แยกสำนัก)
      var r = nullBadges(html);
      html = r.html;
      if (r.changed) changed = true;
    }
    // 2) ไฮไลต์ราก √xxx — ทุก source (√ scope=both) ; ไม่ชน badge เพราะ span badge ไม่มี √
    html = html.replace(ROOT, function (m) { changed = true; return '<span class="groot">' + m + '</span>'; });
    if (changed) {
      el.dataset.glossOrig = el.innerHTML;
      el.innerHTML = html;
    }
  }

  function restoreEl(el) {
    if (el.dataset.glossOrig !== undefined) {
      el.innerHTML = el.dataset.glossOrig;
      delete el.dataset.glossOrig;
    }
    delete el.dataset.gloss;
  }

  var mainEl = document.querySelector('#main');
  function scan() { if (on && mainEl) mainEl.querySelectorAll('.content').forEach(processEl); }
  if (mainEl) {
    new MutationObserver(scan).observe(mainEl, { childList: true });
    scan();
  }

  /* ---------- tooltip คำเต็ม (custom, รองรับ hover + focus) ---------- */
  var byTag = {}, byTagNull = {};
  for (var k in ABBREV) { if (!byTag[ABBREV[k].tag]) byTag[ABBREV[k].tag] = ABBREV[k]; }
  for (var kn in NABBR) { if (!byTagNull[NABBR[kn].tag]) byTagNull[NABBR[kn].tag] = NABBR[kn]; }

  var tip = document.createElement('div');
  tip.className = 'gloss-tip gloss-hidden';
  document.body.appendChild(tip);

  function showTip(el) {
    var isNull = el.getAttribute('data-dict') === 'null';
    var def = (isNull ? byTagNull : byTag)[el.getAttribute('data-tag')];
    if (!def) return;
    tip.innerHTML = '<b>' + esc(def.label) + '</b> — ' + esc(def.meaning) +
      (isNull ? '' : '<span class="gloss-hint">คลิกเพื่อดูคำทั้งหมด</span>');
    tip.classList.remove('gloss-hidden');
    var r = el.getBoundingClientRect();
    var tr = tip.getBoundingClientRect();
    var top = r.top - tr.height - 8;
    if (top < 4) top = r.bottom + 8;
    var left = r.left + r.width / 2 - tr.width / 2;
    left = Math.max(6, Math.min(left, window.innerWidth - tr.width - 6));
    tip.style.top = (top + window.scrollY) + 'px';
    tip.style.left = (left + window.scrollX) + 'px';
  }
  function hideTip() { tip.classList.add('gloss-hidden'); }

  document.addEventListener('mouseover', function (e) {
    var t = e.target.closest && e.target.closest('.gtag');
    if (t) showTip(t);
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest && e.target.closest('.gtag')) hideTip();
  });
  document.addEventListener('focusin', function (e) {
    var t = e.target.closest && e.target.closest('.gtag');
    if (t) showTip(t);
  });
  document.addEventListener('focusout', hideTip);
  window.addEventListener('scroll', hideTip, true);

  /* ---------- สวิตช์เปิด/ปิด ---------- */
  var btn;
  function setOn(v) {
    on = v;
    localStorage.setItem(LS, v ? '1' : '0');
    if (btn) btn.classList.toggle('on', on);
    if (!mainEl) return;
    if (v) scan();
    else { hideTip(); mainEl.querySelectorAll('.content').forEach(restoreEl); }
  }

  var tools = document.querySelector('.tools');
  if (tools) {
    btn = document.createElement('button');
    btn.className = 'ctrlbtn' + (on ? ' on' : '');
    btn.id = 'glossary-toggle';
    btn.title = 'ป้ายประเภทคำ';
    btn.setAttribute('aria-label', 'glossary');
    btn.textContent = '🏷️';
    tools.insertBefore(btn, document.querySelector('#about-open') || null);
    btn.addEventListener('click', function () { setOn(!on); });
  }
})();
