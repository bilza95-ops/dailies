// ==UserScript==
// @name         Dailies overlay
// @namespace    dailies.punchcard
// @version      1.3
// @description  A Dailies bar on every puzzle site: go home, punch it done, jump to the next one.
// @author       you
// @run-at       document-idle
// @noframes
// @updateURL    https://bilza95-ops.github.io/dailies/dailies-overlay.user.js
// @downloadURL  https://bilza95-ops.github.io/dailies/dailies-overlay.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM.getValue
// @grant        GM.setValue
// @match        https://bilza95-ops.github.io/dailies/*
// @match        *://www.parseword.com/*
// @match        *://parseword.com/*
// @match        *://www.minutecryptic.com/*
// @match        *://minutecryptic.com/*
// @match        *://octordle.com/*
// @match        *://www.octordle.com/*
// @match        *://www.britannica.com/games/*
// @match        *://britannica.com/games/*
// @match        *://www.merriam-webster.com/games/octordle/*
// @match        *://merriam-webster.com/games/octordle/*
// @match        *://micro.nerdlegame.com/*
// @match        *://mini.nerdlegame.com/*
// @match        *://midi.nerdlegame.com/*
// @match        *://travle.earth/*
// @match        *://www.travle.earth/*
// @match        *://qntm.org/*
// @match        *://wafflegame.net/*
// @match        *://www.wafflegame.net/*
// @match        *://fubargames.se/*
// @match        *://crosswordle.com/*
// @match        *://www.crosswordle.com/*
// @match        *://semantle.com/*
// @match        *://www.semantle.com/*
// @match        *://hunch.game/*
// @match        *://tilbo.fun/*
// @match        *://cluesbysam.com/*
// @match        *://www.cluesbysam.com/*
// @match        *://spectra.quest/*
// @match        *://nerdlegame.com/*
// @match        *://www.nerdlegame.com/*
// @match        *://framed.wtf/*
// @match        *://bandle.app/*
// @match        *://www.bandle.app/*
// @match        *://imois.in/*
// @match        *://timeguessr.com/*
// @match        *://www.timeguessr.com/*
// @match        *://costcodle.com/*
// @match        *://www.costcodle.com/*
// ==/UserScript==

(function () {
  "use strict";

  /* ---- CHANGE THIS if your Pages URL is different ---- */
  var HOME = "https://bilza95-ops.github.io/dailies/";

  var KEY = "dailies.v1";
  var HIDE_KEY = "dailies.barHidden";

  function host(re) { return function (l) { return re.test(l.hostname); }; }
  var oct = /(^|\.)(merriam-webster\.com|britannica\.com|octordle\.com)$/;
  var xw  = /(^|\.)crosswordle\.com$/;
  var sem = /(^|\.)semantle\.com$/;

  var GAMES = [
    { id: "parseword",     n: "Parseword",          u: "https://www.parseword.com",     test: host(/(^|\.)parseword\.com$/) },
    { id: "minutecryptic", n: "Minute Cryptic",     u: "https://www.minutecryptic.com", test: host(/(^|\.)minutecryptic\.com$/) },
    { id: "octordle-chill",   n: "Octordle Chill",   u: "https://www.merriam-webster.com/games/octordle/daily-chill",
      test: function (l) { return oct.test(l.hostname) && /daily-chill/.test(l.pathname); } },
    { id: "octordle-extreme", n: "Octordle Extreme", u: "https://www.merriam-webster.com/games/octordle/daily-extreme",
      test: function (l) { return oct.test(l.hostname) && /daily-extreme/.test(l.pathname); } },
    { id: "octordle-rescue",  n: "Octordle Rescue",  u: "https://www.merriam-webster.com/games/octordle/daily-rescue",
      test: function (l) { return oct.test(l.hostname) && /daily-rescue/.test(l.pathname); } },
    { id: "octordle-classic", n: "Octordle Classic", u: "https://www.merriam-webster.com/games/octordle/daily",
      test: function (l) { return oct.test(l.hostname) && /octordle/i.test(l.pathname + l.hostname); } },
    { id: "absurdle",      n: "Absurdle",           u: "https://qntm.org/files/absurdle/absurdle.html",
      test: function (l) { return /(^|\.)qntm\.org$/.test(l.hostname) && /absurdle/i.test(l.pathname); } },
    { id: "waffle",        n: "Waffle",             u: "https://wafflegame.net",        test: host(/(^|\.)wafflegame\.net$/) },
    { id: "squardle",      n: "Squardle",           u: "https://fubargames.se/squardle/",
      test: function (l) { return /(^|\.)fubargames\.se$/.test(l.hostname) && /squardle/i.test(l.pathname); } },
    { id: "crosswordle-9", n: "Crosswordle 9\u00d79", u: "https://crosswordle.com/daily9x9",
      test: function (l) { return xw.test(l.hostname) && /9x9/i.test(l.pathname); } },
    { id: "crosswordle-7", n: "Crosswordle 7\u00d77", u: "https://crosswordle.com/", test: host(xw) },
    { id: "semantle-junior", n: "Semantle Junior",  u: "https://semantle.com/junior",
      test: function (l) { return sem.test(l.hostname) && /junior/i.test(l.pathname); } },
    { id: "semantle",      n: "Semantle",           u: "https://semantle.com",          test: host(sem) },
    { id: "hunch",         n: "Hunch",              u: "https://hunch.game",            test: host(/(^|\.)hunch\.game$/) },
    { id: "tilbo",         n: "Tilbo",              u: "https://tilbo.fun",             test: host(/(^|\.)tilbo\.fun$/) },
    { id: "cluesbysam",    n: "Clues By Sam",       u: "https://cluesbysam.com",        test: host(/(^|\.)cluesbysam\.com$/) },
    { id: "spectra",       n: "Spectra",            u: "https://spectra.quest",         test: host(/(^|\.)spectra\.quest$/) },
    { id: "nerdle-micro",  n: "Nerdle Micro",       u: "https://micro.nerdlegame.com/", test: host(/^micro\.nerdlegame\.com$/) },
    { id: "nerdle-mini",   n: "Nerdle Mini",        u: "https://mini.nerdlegame.com/",  test: host(/^mini\.nerdlegame\.com$/) },
    { id: "nerdle-midi",   n: "Nerdle Midi",        u: "https://midi.nerdlegame.com/",  test: host(/^midi\.nerdlegame\.com$/) },
    { id: "nerdle-classic",n: "Nerdle Classic",     u: "https://nerdlegame.com/",       test: host(/^(www\.)?nerdlegame\.com$/) },
    { id: "framed",        n: "Framed",             u: "https://framed.wtf",            test: host(/(^|\.)framed\.wtf$/) },
    { id: "bandle",        n: "Bandle",             u: "https://bandle.app",            test: host(/(^|\.)bandle\.app$/) },
    { id: "travle",        n: "Travle",             u: "https://travle.earth",
      test: function (l) { return /(^|\.)travle\.earth$/.test(l.hostname) ||
        (/(^|\.)imois\.in$/.test(l.hostname) && /travle/i.test(l.pathname)); } },
    { id: "timeguessr",    n: "TimeGuessr",         u: "https://timeguessr.com",        test: host(/(^|\.)timeguessr\.com$/) },
    { id: "costcodle",     n: "Costcodle",          u: "https://costcodle.com",         test: host(/(^|\.)costcodle\.com$/) }
  ];
  var IDS = GAMES.map(function (g) { return g.id; });

  /* ---------- shared store (script-scoped, so it crosses origins) ---------- */
  function getVal(k, d) {
    if (typeof GM_getValue === "function") return Promise.resolve(GM_getValue(k, d));
    if (typeof GM !== "undefined" && GM.getValue) return GM.getValue(k, d);
    return Promise.resolve(d);
  }
  function setVal(k, v) {
    if (typeof GM_setValue === "function") { GM_setValue(k, v); return Promise.resolve(); }
    if (typeof GM !== "undefined" && GM.setValue) return GM.setValue(k, v);
    return Promise.resolve();
  }

  function blank() {
    var a = {}, b = {};
    IDS.forEach(function (id) { a[id] = []; b[id] = []; });
    return { v: 2, updatedAt: 0, done: a, miss: b };
  }
  function clean(v) {
    if (!Array.isArray(v)) return [];
    return v.filter(function (d) {
      return typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);
    }).sort();
  }
  function tidy(raw) {
    var out = blank(), ds = (raw && raw.done) || {}, ms = (raw && raw.miss) || {};
    out.updatedAt = (raw && raw.updatedAt) || 0;
    IDS.forEach(function (id) {
      out.done[id] = clean(ds[id]);
      var solved = out.done[id];
      out.miss[id] = clean(ms[id]).filter(function (d) { return solved.indexOf(d) === -1; });
    });
    return out;
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" +
           String(d.getDate()).padStart(2, "0");
  }
  function dayBack(n) {
    var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - n);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" +
           String(d.getDate()).padStart(2, "0");
  }
  function runLength(id) {
    var set = Object.create(null);
    (state.done[id] || []).forEach(function (d) { set[d] = 1; });
    (state.miss[id] || []).forEach(function (d) { set[d] = 1; });
    var i = set[today()] ? 0 : (set[dayBack(1)] ? 1 : null);
    if (i === null) return 0;
    var n = 0;
    while (set[dayBack(i)]) { n++; i++; }
    return n;
  }

  /* ---------- on the Dailies page: bridge the two stores ---------- */
  if (location.href.indexOf(HOME.replace(/\/$/, "")) === 0) {
    (function bridge() {
      var lastPushed = 0;

      function pageState() {
        try {
          var raw = localStorage.getItem(KEY);
          return raw ? tidy(JSON.parse(raw)) : null;
        } catch (e) { return null; }
      }

      getVal(KEY, null).then(function (shared) {
        var s = shared ? tidy(shared) : null;
        var p = pageState();
        if (s && (!p || s.updatedAt > p.updatedAt)) {
          try {
            localStorage.setItem(KEY, JSON.stringify(s));
            if (!sessionStorage.getItem("dailies.bridged")) {
              sessionStorage.setItem("dailies.bridged", "1");
              location.reload();
              return;
            }
          } catch (e) {}
        }
        if (p) lastPushed = p.updatedAt;
        if (p && (!s || p.updatedAt > s.updatedAt)) setVal(KEY, p);
      });

      setInterval(function () {
        var p = pageState();
        if (p && p.updatedAt > lastPushed) { lastPushed = p.updatedAt; setVal(KEY, p); }
      }, 1500);
    })();
    return;
  }

  /* ---------- which puzzle is this? ---------- */
  var game = null;
  for (var i = 0; i < GAMES.length; i++) {
    var g = GAMES[i];
    if (g.test(location)) { game = g; break; }
  }
  if (!game) return;

  /* ---------- the bar ---------- */
  var host = document.createElement("div");
  host.id = "dailies-bar-host";
  host.style.cssText = "all:initial;position:fixed;z-index:2147483647;";
  var root = host.attachShadow({ mode: "open" });

  root.innerHTML =
    '<style>' +
    ':host{all:initial}' +
    '*{box-sizing:border-box;margin:0;padding:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.bar{position:fixed;left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));' +
      'max-width:440px;margin:0 auto;display:flex;align-items:stretch;gap:0;height:46px;' +
      'background:#243A6B;color:#F1F2ED;border-radius:9px;overflow:hidden;' +
      'box-shadow:0 6px 22px rgba(0,0,0,.34);font-size:14px}' +
    '.bar.hidden{display:none}' +
    '.b{background:transparent;border:0;color:inherit;font:inherit;cursor:pointer;display:flex;' +
      'align-items:center;justify-content:center;flex:0 0 auto;width:46px}' +
    '.b:active{background:rgba(255,255,255,.14)}' +
    '.home{font-weight:800;font-size:17px;letter-spacing:.02em;border-right:1px solid rgba(255,255,255,.18)}' +
    '.mid{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;padding:0 11px;gap:1px}' +
    '.nm{font-weight:600;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.15}' +
    '.sub{font-size:11px;color:#A9B6D8;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.sub .run{color:#FF5BA3;font-weight:600}' +
    '.fail{border-left:1px solid rgba(255,255,255,.18);width:42px}' +
    '.fail svg{width:22px;height:22px}' +
    '.fail.on{color:#FF5BA3}' +
    '.fail .x1,.fail .x2{stroke-dasharray:11;stroke-dashoffset:11;transition:stroke-dashoffset .25s ease}' +
    '.fail.on .x1,.fail.on .x2{stroke-dashoffset:0}' +
    '.tick{border-left:1px solid rgba(255,255,255,.18)}' +
    '.tick svg{width:23px;height:23px}' +
    '.tick.on{color:#2ECC8B}' +
    '.tick .ck{stroke-dasharray:22;stroke-dashoffset:22;transition:stroke-dashoffset .25s ease}' +
    '.tick.on .ck{stroke-dashoffset:0}' +
    '.next{border-left:1px solid rgba(255,255,255,.18);font-size:19px;font-weight:700}' +
    '.next[disabled]{opacity:.32}' +
    '.x{width:30px;font-size:15px;color:#8FA0CC;border-left:1px solid rgba(255,255,255,.18)}' +
    '.badge{position:fixed;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));' +
      'width:40px;height:40px;border-radius:50%;background:#243A6B;color:#F1F2ED;border:0;' +
      'font-weight:800;font-size:16px;cursor:pointer;display:none;align-items:center;' +
      'justify-content:center;box-shadow:0 5px 16px rgba(0,0,0,.34)}' +
    '.badge.show{display:flex}' +
    '@media (prefers-reduced-motion:reduce){*{transition:none!important}}' +
    '</style>' +
    '<div class="bar" id="bar">' +
      '<button class="b home" id="home" title="Back to Dailies">D</button>' +
      '<div class="mid"><div class="nm" id="nm"></div><div class="sub" id="sub"></div></div>' +
      '<button class="b fail" id="fail" title="Missed it">' +
        '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" ' +
        'stroke-width="1.7"/><path class="x1" d="M8.5 8.5l7 7" stroke="currentColor" stroke-width="2.2" ' +
        'stroke-linecap="round"/><path class="x2" d="M15.5 8.5l-7 7" stroke="currentColor" ' +
        'stroke-width="2.2" stroke-linecap="round"/></svg></button>' +
      '<button class="b tick" id="tick" title="Solved it">' +
        '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" ' +
        'stroke-width="1.7"/><path class="ck" d="M7.5 12.4l3 3 6-6.4" stroke="currentColor" ' +
        'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<button class="b next" id="next" title="Next puzzle">&rarr;</button>' +
      '<button class="b x" id="x" title="Hide">&times;</button>' +
    '</div>' +
    '<button class="badge" id="badge" title="Show Dailies">D</button>';

  (document.body || document.documentElement).appendChild(host);

  var $ = function (id) { return root.getElementById(id); };
  var barEl = $("bar"), badgeEl = $("badge"), nmEl = $("nm"), subEl = $("sub"),
      tickEl = $("tick"), failEl = $("fail"), nextEl = $("next");

  var state = blank(), nextGame = null;

  function paint() {
    var on = (state.done[game.id] || []).indexOf(today()) !== -1;
    var bad = (state.miss[game.id] || []).indexOf(today()) !== -1;
    var count = 0;
    IDS.forEach(function (id) { if ((state.done[id] || []).indexOf(today()) !== -1) count++; });

    nextGame = null;
    for (var k = 0; k < GAMES.length; k++) {
      var c = GAMES[k];
      if (c.id === game.id) continue;
      if ((state.done[c.id] || []).indexOf(today()) === -1 &&
          (state.miss[c.id] || []).indexOf(today()) === -1) { nextGame = c; break; }
    }

    nmEl.textContent = game.n;
    var run = runLength(game.id);
    subEl.innerHTML = count + " of " + GAMES.length + " solved" +
      (run ? ' &middot; <span class="run">' + run + "-day run</span>" : "");
    tickEl.classList.toggle("on", on);
    failEl.classList.toggle("on", bad);
    tickEl.setAttribute("aria-pressed", on ? "true" : "false");
    failEl.setAttribute("aria-pressed", bad ? "true" : "false");
    nextEl.disabled = !nextGame;
    nextEl.title = nextGame ? "Next: " + nextGame.n : "Card complete";
  }

  function commit() {
    state.updatedAt = Date.now();
    setVal(KEY, state);
  }

  $("home").addEventListener("click", function () { location.href = HOME; });
  function mark(kind) {
    var mine = state[kind][game.id],
        other = state[kind === "done" ? "miss" : "done"][game.id],
        i = mine.indexOf(today());
    if (i === -1) {
      mine.push(today()); mine.sort();
      var j = other.indexOf(today());
      if (j !== -1) other.splice(j, 1);
      if (navigator.vibrate) try { navigator.vibrate(12); } catch (e) {}
    } else { mine.splice(i, 1); }
    commit(); paint();
  }
  tickEl.addEventListener("click", function () { mark("done"); });
  failEl.addEventListener("click", function () { mark("miss"); });
  nextEl.addEventListener("click", function () { if (nextGame) location.href = nextGame.u; });
  $("x").addEventListener("click", function () {
    barEl.classList.add("hidden"); badgeEl.classList.add("show"); setVal(HIDE_KEY, true);
  });
  badgeEl.addEventListener("click", function () {
    barEl.classList.remove("hidden"); badgeEl.classList.remove("show"); setVal(HIDE_KEY, false);
  });

  Promise.all([getVal(KEY, null), getVal(HIDE_KEY, false)]).then(function (r) {
    state = r[0] ? tidy(r[0]) : blank();
    if (r[1]) { barEl.classList.add("hidden"); badgeEl.classList.add("show"); }
    paint();
  });

  /* pick up punches made in another tab */
  setInterval(function () {
    getVal(KEY, null).then(function (s) {
      if (!s) return;
      var t = tidy(s);
      if (t.updatedAt > state.updatedAt) { state = t; paint(); }
    });
  }, 4000);
})();
