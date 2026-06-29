/* โมดูล: ส่งคำแนะนำพัฒนาแอพ — ห่อ IIFE กันชน global, ไม่แตะ logic หลัก
   เว็บบน Netlify: POST แบบ AJAX เข้า Netlify Forms (ผู้ใช้ไม่ต้องเปิดหน้าเมล)
   ที่อื่น/ออฟไลน์/เซิร์ฟเวอร์ local: fallback เปิด mailto ให้ */
(function(){
  'use strict';
  var MAIL = 'chetphanu.sut@gmail.com';
  var APP = 'StarDict';
  var DEF_SUBJECT = 'คำแนะนำในการพัฒนาแอพ ' + APP;

  function el(html){ var t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstChild; }

  var modal = el(
    '<div class="fb-modal fb-hidden" id="fb-modal" role="dialog" aria-modal="true" aria-label="ส่งคำแนะนำ">'+
    '<div class="fb-card">'+
      '<button class="fb-close" id="fb-close" aria-label="ปิด">×</button>'+
      '<h2>💬 ส่งคำแนะนำ</h2>'+
      '<p class="fb-lead">มีอะไรอยากให้ปรับปรุง/เพิ่มเติม บอกได้เลย ขอบคุณที่ช่วยให้แอพดีขึ้น</p>'+
      '<form id="fb-form" novalidate>'+
        '<div class="fb-field"><label for="fb-subject">หัวข้อ</label>'+
          '<input type="text" id="fb-subject" name="subject" placeholder="(เว้นว่างได้)"></div>'+
        '<div class="fb-field"><label for="fb-message">คำแนะนำในการพัฒนา <span class="fb-req">*</span></label>'+
          '<textarea id="fb-message" name="message" required placeholder="พิมพ์คำแนะนำที่นี่…"></textarea></div>'+
        '<div class="fb-field"><label for="fb-sender">ชื่อผู้ส่ง</label>'+
          '<input type="text" id="fb-sender" name="sender" placeholder="(ไม่ใส่ก็ได้)"></div>'+
        '<div class="fb-field"><label for="fb-contact">ติดต่อกลับได้ที่</label>'+
          '<input type="text" id="fb-contact" name="contact" placeholder="อีเมล/เบอร์/Line (ไม่ใส่ก็ได้)"></div>'+
        '<div class="fb-actions"><button type="submit" class="fb-send" id="fb-send">ส่ง</button></div>'+
        '<p class="fb-status" id="fb-status" aria-live="polite"></p>'+
        '<p class="fb-note">คำแนะนำจะถูกส่งถึงผู้จัดทำโดยตรง ไม่เปิดเผยต่อสาธารณะ</p>'+
      '</form>'+
    '</div></div>'
  );
  document.body.appendChild(modal);

  var $ = function(s){ return modal.querySelector(s); };
  var statusEl = $('#fb-status'), sendBtn = $('#fb-send'), form = $('#fb-form');

  function open(){ modal.classList.remove('fb-hidden'); setTimeout(function(){ $('#fb-message').focus(); },50); }
  function close(){ modal.classList.add('fb-hidden'); }
  function setStatus(msg, cls){ statusEl.textContent=msg||''; statusEl.className='fb-status'+(cls?' '+cls:''); }

  $('#fb-close').addEventListener('click', close);
  modal.addEventListener('click', function(e){ if(e.target===modal) close(); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && !modal.classList.contains('fb-hidden')) close(); });

  function vals(){
    return {
      subject: $('#fb-subject').value.trim(),
      message: $('#fb-message').value.trim(),
      sender:  $('#fb-sender').value.trim(),
      contact: $('#fb-contact').value.trim()
    };
  }

  function mailtoFallback(v){
    var subj = v.subject || DEF_SUBJECT;
    var body = v.message +
      (v.sender  ? '\n\n— ผู้ส่ง: ' + v.sender : '') +
      (v.contact ? '\nติดต่อกลับ: ' + v.contact : '');
    window.location.href = 'mailto:' + MAIL +
      '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body);
    setStatus('กำลังเปิดโปรแกรมอีเมลให้ส่ง…', 'ok');
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var v = vals();
    if(!v.message){ setStatus('กรุณากรอกคำแนะนำก่อนส่ง', 'err'); $('#fb-message').focus(); return; }
    sendBtn.disabled = true; setStatus('กำลังส่ง…');

    // Netlify Forms: POST แบบ urlencoded เข้า '/' (รวม form-name=feedback)
    var data = new URLSearchParams();
    data.append('form-name', 'feedback');
    data.append('subject', v.subject || DEF_SUBJECT);
    data.append('message', v.message);
    data.append('sender',  v.sender);
    data.append('contact', v.contact);

    fetch('/', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:data.toString() })
      .then(function(r){
        if(r.ok){
          setStatus('ส่งเรียบร้อย ขอบคุณมากครับ 🙏', 'ok');
          form.reset();
          setTimeout(close, 1600);
        } else { throw new Error('http ' + r.status); }
      })
      .catch(function(){ mailtoFallback(v); })   // local server / offline / no Netlify → เปิดเมลแทน
      .finally(function(){ sendBtn.disabled = false; });
  });

  // ปุ่มเปิดบนแถบ .tools (index.html เพิ่ม id="fb-open")
  var btn = document.getElementById('fb-open');
  if(btn) btn.addEventListener('click', open);
})();
