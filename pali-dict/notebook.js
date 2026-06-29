/* ============================================================
   Notebook module — Favorites / Notes / History / Export-Import
   ------------------------------------------------------------
   โมดูลแยกอิสระ: ไม่แตะ logic การค้น/normalize/render ของหน้าหลัก
   - อ่านข้อมูลจากการ์ดที่หน้าหลักสร้าง (.hw/.content/...) ผ่าน MutationObserver
   - เก็บข้อมูลใน localStorage (มี Export/Import กันหาย)
   - จุดเชื่อมกับหน้าหลัก: #main (การ์ดผลค้น), #q (ช่องค้น), .tools (แถบปุ่ม)
   ห่อด้วย IIFE เพื่อไม่ชนตัวแปร top-level ของสคริปต์หลัก ($ , q , main ...)
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => (s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- storage layer ---------- */
  const K = { fav: 'pali_fav', notes: 'pali_notes', hist: 'pali_hist' };
  const load = (k, def) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  let favs = load(K.fav, []);     // [{id, hw, roman, content, eng, source, ts}]
  let notes = load(K.notes, {});  // { id: "ข้อความโน้ต" }
  let hist = load(K.hist, []);    // ["คำค้น", ...] ใหม่สุดอยู่หน้า

  const idOf = (hw, content) => hw + '¦' + (content || '').slice(0, 40);
  const favIndex = id => favs.findIndex(f => f.id === id);

  /* ---------- อ่านข้อมูลจากการ์ด ---------- */
  function cardData(card) {
    const hwEl = card.querySelector('.hw');
    let hw = '', roman = '';
    if (hwEl) {
      const r = hwEl.querySelector('.roman');
      roman = r ? r.textContent.trim() : '';
      const clone = hwEl.cloneNode(true);
      const rc = clone.querySelector('.roman'); if (rc) rc.remove();
      hw = clone.textContent.trim();
    }
    const content = ((card.querySelector('.content') || {}).textContent || '').trim();
    let eng = ((card.querySelector('.eng') || {}).textContent || '').replace(/^[^\p{L}]+/u, '').trim();
    let source = ((card.querySelector('.src') || {}).textContent || '').replace(/^[^\p{L}]+/u, '').trim();
    return { hw, roman, content, eng, source };
  }

  /* ---------- แทรกปุ่มลงการ์ด ---------- */
  function decorate(card) {
    if (card.__nb) return;
    card.__nb = true;
    const d = cardData(card);
    const id = idOf(d.hw, d.content);

    const tools = document.createElement('div');
    tools.className = 'card-tools';
    const star = document.createElement('button');
    star.className = 'cbtn star'; star.title = 'บันทึกคำนี้'; star.setAttribute('aria-label', 'บันทึกคำนี้');
    const noteBtn = document.createElement('button');
    noteBtn.className = 'cbtn note'; noteBtn.title = 'โน้ตส่วนตัว'; noteBtn.setAttribute('aria-label', 'โน้ตส่วนตัว');
    noteBtn.textContent = '📝';
    tools.appendChild(star); tools.appendChild(noteBtn);
    card.appendChild(tools);

    const refreshStar = () => {
      const on = favIndex(id) >= 0;
      star.textContent = on ? '★' : '☆';
      star.classList.toggle('on', on);
    };
    refreshStar();
    noteBtn.classList.toggle('on', !!notes[id]);

    star.addEventListener('click', () => {
      const i = favIndex(id);
      if (i >= 0) favs.splice(i, 1);
      else favs.unshift(Object.assign({ id, ts: Date.now() }, d));
      save(K.fav, favs); refreshStar();
    });
    noteBtn.addEventListener('click', () => toggleNoteEditor(card, id, noteBtn));

    renderSavedNote(card, id);
  }

  function renderSavedNote(card, id) {
    const old = card.querySelector('.note-saved'); if (old) old.remove();
    if (notes[id] && !card.querySelector('.card-note')) {
      const v = document.createElement('div');
      v.className = 'note-saved'; v.textContent = notes[id];
      card.appendChild(v);
    }
  }

  function toggleNoteEditor(card, id, noteBtn) {
    const open = card.querySelector('.card-note');
    if (open) { open.remove(); renderSavedNote(card, id); return; }
    const saved = card.querySelector('.note-saved'); if (saved) saved.remove();

    const box = document.createElement('div');
    box.className = 'card-note';
    box.innerHTML = '<div class="nlbl">📝 โน้ตของฉัน (บันทึกอัตโนมัติ)</div>' +
      '<textarea placeholder="พิมพ์คำแปล/ตัวอย่าง/ที่มาของคุณ…"></textarea>';
    const ta = box.querySelector('textarea');
    ta.value = notes[id] || '';
    ta.addEventListener('input', () => {
      if (ta.value.trim()) notes[id] = ta.value;
      else delete notes[id];
      save(K.notes, notes);
      if (noteBtn) noteBtn.classList.toggle('on', !!notes[id]);
    });
    card.appendChild(box);
    ta.focus();
  }

  /* ---------- เฝ้าดูการ์ดที่หน้าหลักสร้าง ---------- */
  const mainEl = $('#main');
  const scan = () => { if (mainEl) mainEl.querySelectorAll('.card').forEach(decorate); };
  if (mainEl) {
    new MutationObserver(scan).observe(mainEl, { childList: true });
    scan();
  }
  // อัปเดตสถานะดาว/โน้ตบนการ์ดที่แสดงอยู่ (เรียกหลัง import/ลบ)
  function rescan() {
    if (!mainEl) return;
    mainEl.querySelectorAll('.card').forEach(c => {
      c.__nb = false;
      c.querySelectorAll('.card-tools, .card-note, .note-saved').forEach(e => e.remove());
      decorate(c);
    });
  }

  /* ---------- ประวัติการค้น ---------- */
  const qEl = $('#q');
  function pushHist(term) {
    term = (term || '').trim();
    if (term.length < 2) return;
    // ยุบการพิมพ์ต่อเนื่อง: ถ้าคำก่อนหน้าเป็นต้น/ส่วนหนึ่งของคำใหม่ ให้แทนที่
    if (hist[0] && (term.startsWith(hist[0]) || hist[0].startsWith(term))) hist.shift();
    hist = hist.filter(x => x !== term);
    hist.unshift(term);
    if (hist.length > 40) hist.length = 40;
    save(K.hist, hist);
  }
  if (qEl) {
    let t = null;
    qEl.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => pushHist(qEl.value), 1200); });
  }
  function go(term) {
    if (!qEl) return;
    qEl.value = term; qEl.focus();
    qEl.dispatchEvent(new Event('input'));   // ให้สคริปต์หลักค้นเอง
    closePanel();
  }

  /* ---------- panel "สมุดคำศัพท์" ---------- */
  let panel = null, curTab = 'fav';

  function buildPanel() {
    panel = document.createElement('div');
    panel.className = 'modal hidden';
    panel.id = 'nb-modal';
    panel.innerHTML =
      '<div class="modal-card">' +
        '<button class="modal-close" aria-label="ปิด">×</button>' +
        '<h2>📓 สมุดคำศัพท์</h2>' +
        '<div class="nb-tabs">' +
          '<div class="nb-tab active" data-tab="fav">⭐ คำที่บันทึก (<span id="nb-favn">0</span>)</div>' +
          '<div class="nb-tab" data-tab="hist">🕘 ค้นล่าสุด</div>' +
        '</div>' +
        '<div id="nb-pane-fav"></div>' +
        '<div id="nb-pane-hist" class="hidden"><div class="nb-hist" id="nb-histwrap"></div></div>' +
        '<div class="nb-actions">' +
          '<button id="nb-export">💾 สำรอง (Export)</button>' +
          '<button id="nb-import">📥 นำเข้า (Import)</button>' +
          '<button id="nb-clearhist">🗑️ ล้างประวัติ</button>' +
        '</div>' +
        '<input type="file" id="nb-file" accept="application/json,.json" style="display:none">' +
      '</div>';
    document.body.appendChild(panel);

    panel.querySelector('.modal-close').addEventListener('click', closePanel);
    panel.addEventListener('click', e => { if (e.target === panel) closePanel(); });

    panel.querySelectorAll('.nb-tab').forEach(tab =>
      tab.addEventListener('click', () => switchTab(tab.dataset.tab)));

    // favorites: คลิกรายการ = ค้นคำนั้น, คลิก × = ลบ
    panel.querySelector('#nb-pane-fav').addEventListener('click', e => {
      const item = e.target.closest('.nb-item'); if (!item) return;
      const i = +item.dataset.i;
      if (e.target.classList.contains('nb-x')) {
        favs.splice(i, 1); save(K.fav, favs); renderFav(); rescan();
      } else {
        go(favs[i].hw);
      }
    });
    // history chips
    panel.querySelector('#nb-histwrap').addEventListener('click', e => {
      const chip = e.target.closest('.chip'); if (chip) go(chip.dataset.h);
    });

    panel.querySelector('#nb-export').addEventListener('click', doExport);
    panel.querySelector('#nb-import').addEventListener('click', () => panel.querySelector('#nb-file').click());
    panel.querySelector('#nb-file').addEventListener('change', e => { if (e.target.files[0]) doImport(e.target.files[0]); e.target.value = ''; });
    panel.querySelector('#nb-clearhist').addEventListener('click', () => {
      if (confirm('ล้างประวัติการค้นทั้งหมด?')) { hist = []; save(K.hist, hist); renderHist(); }
    });
  }

  function switchTab(name) {
    curTab = name;
    panel.querySelectorAll('.nb-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    panel.querySelector('#nb-pane-fav').classList.toggle('hidden', name !== 'fav');
    panel.querySelector('#nb-pane-hist').classList.toggle('hidden', name !== 'hist');
  }

  function renderFav() {
    const pane = panel.querySelector('#nb-pane-fav');
    panel.querySelector('#nb-favn').textContent = favs.length;
    if (!favs.length) {
      pane.innerHTML = '<div class="nb-empty">ยังไม่มีคำที่บันทึก<br>กดดาว ☆ บนการ์ดเพื่อบันทึกไว้อ่านภายหลัง</div>';
      return;
    }
    pane.innerHTML = favs.map((f, i) =>
      '<div class="nb-item" data-i="' + i + '">' +
        '<button class="nb-x" title="ลบ">×</button>' +
        '<div class="nb-hw">' + esc(f.hw) + (f.roman ? ' <span class="nb-roman">' + esc(f.roman) + '</span>' : '') + '</div>' +
        '<div class="nb-c">' + esc((f.content || '').slice(0, 160)) + ((f.content || '').length > 160 ? '…' : '') + '</div>' +
        (notes[f.id] ? '<div class="nb-note">📝 ' + esc(notes[f.id]) + '</div>' : '') +
      '</div>').join('');
  }

  function renderHist() {
    const wrap = panel.querySelector('#nb-histwrap');
    if (!hist.length) { wrap.innerHTML = '<div class="nb-empty">ยังไม่มีประวัติการค้น</div>'; return; }
    wrap.innerHTML = hist.map(h => '<span class="chip" data-h="' + esc(h) + '">' + esc(h) + '</span>').join('');
  }

  function renderAll() { renderFav(); renderHist(); }

  function openPanel() {
    if (!panel) buildPanel();
    renderAll(); switchTab(curTab);
    panel.classList.remove('hidden');
  }
  function closePanel() { if (panel) panel.classList.add('hidden'); }

  /* ---------- Export / Import ---------- */
  function doExport() {
    const data = { app: 'pali-dict-notebook', version: 1, exportedAt: new Date().toISOString(), favs, notes, hist };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pali-notebook-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function doImport(file) {
    const r = new FileReader();
    r.onload = () => {
      let d;
      try { d = JSON.parse(r.result); } catch (e) { alert('ไฟล์ไม่ถูกต้อง (อ่าน JSON ไม่ได้)'); return; }
      if (!d || (!d.favs && !d.notes && !d.hist)) { alert('ไฟล์นี้ไม่ใช่ไฟล์สำรองของสมุดคำศัพท์'); return; }
      // รวมข้อมูล (merge) ไม่ทับของเดิม
      if (Array.isArray(d.favs)) {
        const ids = new Set(favs.map(f => f.id));
        d.favs.forEach(f => { if (f && f.id && !ids.has(f.id)) { favs.push(f); ids.add(f.id); } });
      }
      if (d.notes && typeof d.notes === 'object') {
        for (const k in d.notes) if (!notes[k]) notes[k] = d.notes[k];
      }
      if (Array.isArray(d.hist)) {
        const s = new Set(hist);
        d.hist.forEach(h => { if (typeof h === 'string' && !s.has(h)) { hist.push(h); s.add(h); } });
      }
      save(K.fav, favs); save(K.notes, notes); save(K.hist, hist);
      renderAll(); rescan();
      alert('นำเข้าข้อมูลสำเร็จ ✓');
    };
    r.readAsText(file);
  }

  /* ---------- ปุ่มเปิด panel + คีย์ลัด ---------- */
  function addToolbarButton() {
    const tools = $('.tools');
    if (!tools) return;
    const btn = document.createElement('button');
    btn.className = 'ctrlbtn';
    btn.id = 'notebook-open';
    btn.title = 'สมุดคำศัพท์ (บันทึก/ประวัติ)';
    btn.setAttribute('aria-label', 'สมุดคำศัพท์');
    btn.textContent = '📓';
    tools.insertBefore(btn, tools.firstChild);
    btn.addEventListener('click', openPanel);
  }
  addToolbarButton();

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel && !panel.classList.contains('hidden')) closePanel();
  });
})();
