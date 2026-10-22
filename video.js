/* "Videoda göster" spielt das Video direkt in der Seite ab (kein Wechsel in die YouTube-App).
   Es startet an der richtigen Stelle und stoppt beim naechsten Schritt.
   Einbinden in der Anleitung: <script src="../video.js"></script> */
(function () {
  var links = [].slice.call(document.querySelectorAll('a.vl[href*="youtube.com/watch"], a.vl[href*="youtu.be/"]'));
  if (!links.length) return;

  function parse(href) {
    var u = new URL(href), id = u.searchParams.get('v') || u.pathname.split('/').pop();
    var t = u.searchParams.get('t') || '0';
    var m = String(t).match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?/), sec = 0;
    if (m) sec = (+(m[1] || 0)) * 3600 + (+(m[2] || 0)) * 60 + (+(m[3] || 0));
    return { id: id, t: sec };
  }
  var all = links.map(function (a) { return parse(a.href); });

  var s = document.createElement('style');
  s.textContent = '#vbox{position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:200;display:none;flex-direction:column;justify-content:center;padding:12px}' +
    '#vbox .vw{position:relative;width:100%;max-width:900px;margin:0 auto;aspect-ratio:16/9;background:#000;border-radius:12px;overflow:hidden}' +
    '#vbox iframe{position:absolute;inset:0;width:100%;height:100%;border:0}' +
    '#vbox .vr{display:flex;gap:10px;max-width:900px;width:100%;margin:14px auto 0}' +
    '#vbox button{flex:1;border:0;border-radius:12px;padding:15px 8px;font-size:20px;font-weight:bold;cursor:pointer}' +
    '#vbox .vagain{background:#2b6fd6;color:#fff}#vbox .vclose{background:#b4533c;color:#fff}' +
    '#vbox .vt{color:#fff;text-align:center;font-size:18px;margin:0 auto 10px;max-width:900px}';
  document.head.appendChild(s);

  var box = document.createElement('div'); box.id = 'vbox';
  box.innerHTML = '<div class="vt"></div><div class="vw"></div>' +
    '<div class="vr"><button class="vagain" type="button">↺ Tekrar</button><button class="vclose" type="button">✕ Kapat</button></div>';
  document.body.appendChild(box);
  var wrap = box.querySelector('.vw'), cur = null;

  function play() {
    var p = 'autoplay=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&start=' + cur.start + (cur.end ? '&end=' + cur.end : '');
    wrap.innerHTML = '<iframe allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen ' +
      'src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(cur.id) + '?' + p + '"></iframe>';
  }
  function close() { wrap.innerHTML = ''; box.style.display = 'none'; document.body.style.overflow = ''; }
  box.querySelector('.vagain').onclick = play;
  box.querySelector('.vclose').onclick = close;
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.style.display === 'flex') close(); });

  links.forEach(function (a, i) {
    a.removeAttribute('target');
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var v = all[i], end = 0;
      all.forEach(function (o) { if (o.id === v.id && o.t > v.t && (!end || o.t < end)) end = o.t; });
      cur = { id: v.id, start: v.t, end: end };
      var card = a.closest('.card'), h = card && card.querySelector('h3');
      box.querySelector('.vt').textContent = '▶ ' + (h ? h.textContent : 'Video');
      box.style.display = 'flex'; document.body.style.overflow = 'hidden';
      play();
    });
  });
})();
