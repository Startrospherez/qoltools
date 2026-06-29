/* ============================================================
   hub module — คลิก badge ประเภทคำ → หน้ารวมคำทั้งหมดที่เป็นประเภทนั้น
   ------------------------------------------------------------
   - ใช้ window.PALI_POS_INDEX (สร้างโดย build_tags.py): { tagid: {label,meaning,cat,members:[[headword,search_key],...]} }
   - คลิก .gtag (ที่ glossary.js สร้าง) → เปิด overlay
   - ค้นคำในกลุ่มได้ (กรองด้วย search_key — รองรับพิมพ์ไทยปกติทั้งที่ headword เก็บ PUA)
   - คลิกคำ → เด้งไปค้นคำนั้นในแอพหลัก (set #q + dispatch input ; ทำงานได้ทั้ง 2 เวอร์ชัน)
   ห่อ IIFE, ใช้คลาส .ghub-hidden ของตัวเอง (ไม่พึ่ง global .hidden → 2 เวอร์ชันไฟล์เหมือนกัน)
   ============================================================ */
(function () {
  'use strict';

  var INDEX = window.PALI_POS_INDEX || {};
  var CAP = 400;   // จำกัดจำนวนที่ render ต่อครั้ง (กันหน่วงเวลามีสมาชิกหลายพัน)

  var esc = function (s) {
    return (s || '').replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };

  /* normalize คำค้นในกลุ่ม: ใช้ normalize ของแอพหลักถ้ามี (web), ไม่งั้น fallback เบาๆ */
  function normQ(s) {
    if (typeof window.normalize === 'function') {
      try { return window.normalize(s); } catch (e) { /* fall through */ }
    }
    // ตัด space/จุด/พินทุ(0E3A)/การันต์(0E4C)/นิคหิต(0E4D) — ใช้ \u กันอักขระเพี้ยน
    return (s || '').toLowerCase().replace(/[\s.ฺ์ํ]/g, '');
  }

  /* ---------- สร้าง overlay (ครั้งเดียว) ---------- */
  var overlay = document.createElement('div');
  overlay.className = 'ghub-overlay ghub-hidden';
  overlay.id = 'pali-hub';
  overlay.innerHTML =
    '<div class="ghub-box" role="dialog" aria-modal="true">' +
      '<div class="ghub-head">' +
        '<div class="ghub-title"></div>' +
        '<button class="ghub-x" aria-label="ปิด">✕</button>' +
      '</div>' +
      '<div class="ghub-meaning"></div>' +
      '<input class="ghub-search" type="text" autocomplete="off" ' +
        'autocapitalize="off" autocorrect="off" placeholder="ค้นในกลุ่มนี้…">' +
      '<div class="ghub-count"></div>' +
      '<div class="ghub-list"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  var elTitle = overlay.querySelector('.ghub-title');
  var elMean = overlay.querySelector('.ghub-meaning');
  var elSearch = overlay.querySelector('.ghub-search');
  var elCount = overlay.querySelector('.ghub-count');
  var elList = overlay.querySelector('.ghub-list');

  var members = [];   // [[headword, search_key], ...] ของ tag ปัจจุบัน

  function renderList(filter) {
    var qn = normQ(filter);
    var rows = [], shown = 0, total = 0;
    for (var i = 0; i < members.length; i++) {
      var hw = members[i][0], sk = members[i][1] || '';
      if (qn && sk.indexOf(qn) === -1 && hw.indexOf(filter) === -1) continue;
      total++;
      if (shown < CAP) {
        rows.push('<button class="ghub-item" data-h="' + esc(hw) + '">' + esc(hw) + '</button>');
        shown++;
      }
    }
    elList.innerHTML = rows.join('') ||
      '<div class="ghub-empty">ไม่พบคำในกลุ่มนี้</div>';
    var more = total > shown ? ' (แสดง ' + shown + ' จาก ' + total + ')' : '';
    elCount.textContent = total + ' คำ' + more;
  }

  function open(tag) {
    var data = INDEX[tag];
    if (!data) return;
    members = data.members || [];
    elTitle.innerHTML = '<span class="gtag ' + cls(tag, data.cat) + '">' +
      esc(data.label) + '</span>';
    elMean.textContent = data.meaning || '';
    elSearch.value = '';
    renderList('');
    overlay.classList.remove('ghub-hidden');
    setTimeout(function () { elSearch.focus(); }, 30);
  }

  function close() { overlay.classList.add('ghub-hidden'); }

  /* คลาสสีให้ตรงกับ glossary (เพศแยกสี) */
  function cls(tag, cat) {
    if (tag === 'ปุํ') return 'g-m';
    if (tag === 'อิต') return 'g-f';
    if (tag === 'นปุ') return 'g-n';
    return cat === 'grammar' ? 'gram' : 'pos';
  }

  /* ---------- events ---------- */
  // คลิก badge → เปิด hub (ยกเว้น null-source: tagid ซ้ำกับภูมิพโลฯ จะโชว์คำผิดสำนัก)
  document.addEventListener('click', function (e) {
    var g = e.target.closest && e.target.closest('.gtag');
    if (g && g.getAttribute('data-tag') && g.getAttribute('data-dict') !== 'null') {
      e.preventDefault(); open(g.getAttribute('data-tag'));
    }
  });

  elSearch.addEventListener('input', function () { renderList(elSearch.value); });

  // คลิกคำในรายการ → ไปค้นคำนั้นในแอพหลัก
  elList.addEventListener('click', function (e) {
    var it = e.target.closest && e.target.closest('.ghub-item');
    if (!it) return;
    var hw = it.getAttribute('data-h');
    var q = document.getElementById('q');
    if (q) {
      q.value = hw;
      q.dispatchEvent(new Event('input', { bubbles: true }));
    }
    close();
  });

  overlay.querySelector('.ghub-x').addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.classList.contains('ghub-hidden')) close();
  });
})();
