/* Merke-Funktion: merkt sich automatisch, wo man in einem Tarif aufgehoert hat.
   - In jeder Anleitung: speichert beim Blaettern, Verlassen und Wechseln der App den aktuellen Schritt.
     Beim naechsten Oeffnen erscheint unten "Kaldığın yer: Adım X" mit "Devam et".
     Zusaetzlich gibt es oben den Knopf "📌 Kaydet" zum manuellen Merken.
   - Auf der Startseite: Kasten "Kaldığın yerden devam et" + Abzeichen auf jeder Kachel.
   Einbinden: Startseite <script src="merke.js"></script>, Anleitung <script src="../merke.js"></script> */
(function () {
  var KEY = 'haekel-merke-v1';

  function load() {
    try { var d = JSON.parse(localStorage.getItem(KEY) || '{}'); d.pages = d.pages || {}; return d; }
    catch (e) { return { pages: {} }; }
  }
  function store(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function pathOf(u) { return new URL(u, location.href).pathname; }
  function when(t) {
    var d = new Date(t), n = new Date(), hm = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    var y = new Date(n); y.setDate(n.getDate() - 1);
    if (d.toDateString() === n.toDateString()) return 'bugün ' + hm;
    if (d.toDateString() === y.toDateString()) return 'dün ' + hm;
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }) + ' ' + hm;
  }
  function css(txt) { var s = document.createElement('style'); s.textContent = txt; document.head.appendChild(s); }

  window.MERKE = {
    get: function (url) { return load().pages[pathOf(url)] || null; },
    last: function () { var d = load(); return d.last && d.pages[d.last] ? d.pages[d.last] : null; },
    when: when
  };

  var cards = [].slice.call(document.querySelectorAll('section.card[id^="s"]'));
  if (!cards.length) return; // Startseite: nur MERKE-API bereitstellen

  /* ---------- Anleitung ---------- */
  var path = location.pathname, total = cards.length;
  var bar = document.querySelector('.appbar');
  var offset = function () { return (bar ? bar.offsetHeight : 0) + 14; };

  css('section.card{scroll-margin-top:80px}' +
    '.merkebtn{font-size:17px;font-weight:bold;border:0;border-radius:999px;background:#2b6fd6;color:#fff;padding:10px 12px;cursor:pointer;white-space:nowrap}' +
    '.appbar .sharebtn{font-size:17px;padding:10px 12px;white-space:nowrap}.appbar a.back{font-size:17px;white-space:nowrap}.appbar{padding:8px 10px;gap:6px}' +
    '.card.merkt .num{background:#d7e6fb}' +
    '.card.merkt .num span:first-child:after{content:"  📌 kaldığın yer"}' +
    '#merkeBox{position:fixed;left:10px;right:10px;bottom:12px;z-index:90;max-width:680px;margin:0 auto;background:#2b1d17;color:#fff;border-radius:16px;padding:14px 16px;box-shadow:0 6px 22px rgba(0,0,0,.35);font-size:19px;display:none}' +
    '#merkeBox .mt{font-weight:bold;font-size:20px;margin-bottom:10px}' +
    '#merkeBox .mr{display:flex;gap:8px}' +
    '#merkeBox button{flex:1;border:0;border-radius:12px;padding:13px 8px;font-size:19px;font-weight:bold;cursor:pointer}' +
    '#merkeBox .go{background:#25a244;color:#fff;flex:2}#merkeBox .no{background:#e6d7c8;color:#2b1d17}' +
    '@media print{#merkeBox,.merkebtn{display:none}}');

  function current() {
    var line = window.innerHeight * 0.35, cur = cards[0];
    for (var i = 0; i < cards.length; i++) { if (cards[i].getBoundingClientRect().top <= line) cur = cards[i]; else break; }
    return cur;
  }
  function info(card) {
    var h = card.querySelector('h3');
    return { step: parseInt(card.id.slice(1), 10), id: card.id, title: h ? h.textContent : '' };
  }
  function mark(card) {
    cards.forEach(function (c) { c.classList.toggle('merkt', c === card); });
  }

  var saved = load().pages[path] || null;
  var paused = false; // solange der Hinweis offen ist, nur Fortschritt nach vorne speichern

  function save(manual) {
    var c = current(), i = info(c);
    if (paused && saved && i.step < saved.step && !manual) return;
    var d = load();
    d.pages[path] = { url: path, step: i.step, id: i.id, title: i.title, total: total, page: document.title.split(' – ')[0], t: Date.now() };
    d.last = path;
    store(d); saved = d.pages[path]; mark(c);
    return i;
  }
  function jump(id) {
    var el = document.getElementById(id); if (!el) return;
    var go = function () { window.scrollTo(0, el.getBoundingClientRect().top + window.pageYOffset - offset()); };
    go(); mark(el);
    // Bilder laden noch -> Seite wird laenger; danach nochmal genau hinspringen
    var imgs = [].slice.call(document.images).map(function (im) { return im.decode ? im.decode().catch(function () {}) : null; });
    Promise.all(imgs).then(function () { go(); setTimeout(go, 250); });
  }

  // Knopf "📌 Kaydet" in der oberen Leiste
  if (bar) {
    var mb = document.createElement('button');
    mb.type = 'button'; mb.className = 'merkebtn'; mb.textContent = '📌 Kaydet';
    mb.onclick = function () {
      var i = save(true); hideBox();
      if (window.toast) toast('📌 Kaydedildi: Adım ' + i.step + ' – ' + i.title);
    };
    var share = bar.querySelector('.sharebtn');
    var grp = document.createElement('div'); grp.style.cssText = 'display:flex;gap:8px';
    bar.insertBefore(grp, share); grp.appendChild(mb); if (share) grp.appendChild(share);
  }

  // Hinweis "Kaldığın yer"
  var box = document.createElement('div'); box.id = 'merkeBox';
  document.body.appendChild(box);
  function hideBox() { box.style.display = 'none'; paused = false; }

  var hash = location.hash.slice(1);
  if (hash && document.getElementById(hash)) {
    // von der Startseite mit #sX geoeffnet -> direkt hinspringen
    setTimeout(function () { jump(hash); }, 60);
  } else if (saved && saved.step > 1) {
    paused = true;
    box.innerHTML = '<div class="mt"></div><div class="mr"><button class="go" type="button"></button><button class="no" type="button">Baştan</button></div>';
    box.querySelector('.mt').textContent = '📌 Kaldığın yer: Adım ' + saved.step + ' / ' + total + ' – ' + saved.title;
    box.querySelector('.go').textContent = '➡ Devam et';
    box.querySelector('.go').onclick = function () { hideBox(); jump(saved.id); };
    box.querySelector('.no').onclick = function () { hideBox(); window.scrollTo(0, 0); save(); };
    box.style.display = 'block';
    var sc = document.getElementById(saved.id); if (sc) mark(sc);
  }

  // automatisch speichern: beim Blaettern, beim Verlassen, beim Wechsel in eine andere App
  var tm;
  window.addEventListener('scroll', function () { clearTimeout(tm); tm = setTimeout(function () { save(); }, 700); }, { passive: true });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') save(); });
  window.addEventListener('pagehide', function () { save(); });
})();
