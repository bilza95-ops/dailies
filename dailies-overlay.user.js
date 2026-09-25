// ==UserScript==
// @name         Dailies overlay
// @namespace    dailies.departures
// @version      2.0
// @description  A Dailies bar on every puzzle site: go home, log the result, catch the next departure.
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
// @match        *://www.merriam-webster.com/games/octordle/*
// @match        *://merriam-webster.com/games/octordle/*
// @match        *://www.britannica.com/games/*
// @match        *://octordle.com/*
// @match        *://www.octordle.com/*
// @match        *://qntm.org/*
// @match        *://wafflegame.net/*
// @match        *://www.wafflegame.net/*
// @match        *://fubargames.se/*
// @match        *://squaredle.app/*
// @match        *://crosswordle.com/*
// @match        *://www.crosswordle.com/*
// @match        *://semantle.com/*
// @match        *://www.semantle.com/*
// @match        *://fibble.xyz/*
// @match        *://www.polygonle.com/*
// @match        *://polygonle.com/*
// @match        *://fusele.netlify.app/*
// @match        *://betweenle.com/*
// @match        *://www.betweenle.com/*
// @match        *://hunch.game/*
// @match        *://tilbo.fun/*
// @match        *://www.linkedin.com/games/*
// @match        *://cluesbysam.com/*
// @match        *://www.cluesbysam.com/*
// @match        *://spectra.quest/*
// @match        *://parlorbox.com/*
// @match        *://www.zebrapuzzles.com/*
// @match        *://zebrapuzzles.com/*
// @match        *://www.netflix.com/tudum/puzzled/*
// @match        *://dailyakari.com/*
// @match        *://www.dailyakari.com/*
// @match        *://shikakuofthe.day/*
// @match        *://loopy.wtf/*
// @match        *://sumplete.com/*
// @match        *://www.sumplete.com/*
// @match        *://www.nonodaily.com/*
// @match        *://nonodaily.com/*
// @match        *://mineswifter.com/*
// @match        *://www.mineswifter.com/*
// @match        *://nerdlegame.com/*
// @match        *://www.nerdlegame.com/*
// @match        *://micro.nerdlegame.com/*
// @match        *://mini.nerdlegame.com/*
// @match        *://midi.nerdlegame.com/*
// @match        *://framed.wtf/*
// @match        *://bandle.app/*
// @match        *://www.bandle.app/*
// @match        *://travle.earth/*
// @match        *://www.travle.earth/*
// @match        *://imois.in/*
// @match        *://timeguessr.com/*
// @match        *://www.timeguessr.com/*
// @match        *://chronle.com/*
// @match        *://www.chronle.com/*
// @match        *://costcodle.com/*
// @match        *://www.costcodle.com/*
// ==/UserScript==

(function () {
  "use strict";

  /* ---- CHANGE THIS if your Pages URL differs ---- */
  var HOME = "https://bilza95-ops.github.io/dailies/";

  var KEY = "dailies.v1";
  var PREF_KEY = "dailies.barPrefs";
  /* sites whose own controls sit where the bar would */
  var PREF_DEFAULTS = {
    timeguessr: { hidden: true, pos: "top" },
    starstruck: { pos: "top" },
    "li-zip": { pos: "top" },
    loopy: { pos: "top" }
  };

  function h(re) { return function (l) { return re.test(l.hostname); }; }
  function hp(hre, pre) {
    return function (l) { return hre.test(l.hostname) && pre.test(l.pathname); };
  }
  var OCT = /(^|\.)(merriam-webster\.com|britannica\.com|octordle\.com)$/;
  var XW  = /(^|\.)crosswordle\.com$/;
  var SEM = /(^|\.)semantle\.com$/;
  var LI  = /(^|\.)linkedin\.com$/;
  var NFX = /(^|\.)netflix\.com$/;

  /* order matters: more specific matchers first within a site */
  var GAMES = [
    { id: "parseword",        n: "Parseword",        u: "https://www.parseword.com",     test: h(/(^|\.)parseword\.com$/) },
    { id: "minutecryptic",    n: "Minute Cryptic",   u: "https://www.minutecryptic.com", test: h(/(^|\.)minutecryptic\.com$/) },
    { id: "octordle-chill",   n: "Octordle Chill",   u: "https://www.merriam-webster.com/games/octordle/daily-chill",   test: hp(OCT, /daily-chill/) },
    { id: "octordle-extreme", n: "Octordle Extreme", u: "https://www.merriam-webster.com/games/octordle/daily-extreme", test: hp(OCT, /daily-extreme/) },
    { id: "octordle-rescue",  n: "Octordle Rescue",  u: "https://www.merriam-webster.com/games/octordle/daily-rescue",  test: hp(OCT, /daily-rescue/) },
    { id: "octordle-classic", n: "Octordle Classic", u: "https://www.merriam-webster.com/games/octordle/daily",
      test: function (l) { return OCT.test(l.hostname) && /octordle/i.test(l.pathname + l.hostname); } },
    { id: "absurdle",         n: "Absurdle",         u: "https://qntm.org/files/absurdle/absurdle.html", test: hp(/(^|\.)qntm\.org$/, /absurdle/i) },
    { id: "waffle",           n: "Waffle",           u: "https://wafflegame.net/daily",  test: h(/(^|\.)wafflegame\.net$/) },
    { id: "squardle",         n: "Squardle",         u: "https://fubargames.se/squardle/", test: hp(/(^|\.)fubargames\.se$/, /squardle/i) },
    { id: "squaredle",        n: "Squaredle",        u: "https://squaredle.app",         test: h(/(^|\.)squaredle\.app$/) },
    { id: "crosswordle-9",    n: "Crosswordle 9x9",  u: "https://crosswordle.com/daily9x9", test: hp(XW, /9x9/i) },
    { id: "crosswordle-7",    n: "Crosswordle 7x7",  u: "https://crosswordle.com/",      test: h(XW) },
    { id: "semantle-junior",  n: "Semantle Junior",  u: "https://semantle.com/junior",   test: hp(SEM, /junior/i) },
    { id: "semantle",         n: "Semantle",         u: "https://semantle.com",          test: h(SEM) },
    { id: "fibble",           n: "Fibble",           u: "https://fibble.xyz",            test: h(/(^|\.)fibble\.xyz$/) },
    { id: "polygonle",        n: "Polygonle",        u: "https://www.polygonle.com",     test: h(/(^|\.)polygonle\.com$/) },
    { id: "fusele",           n: "Fusele",           u: "https://fusele.netlify.app/?daily", test: h(/(^|\.)fusele\.netlify\.app$/) },
    { id: "betweenle",        n: "Betweenle",        u: "https://betweenle.com",         test: h(/(^|\.)betweenle\.com$/) },
    { id: "hunch",            n: "Hunch",            u: "https://hunch.game",            test: h(/(^|\.)hunch\.game$/) },
    { id: "tilbo",            n: "Tilbo",            u: "https://tilbo.fun",             test: h(/(^|\.)tilbo\.fun$/) },
    { id: "li-pinpoint",      n: "Pinpoint",         u: "https://www.linkedin.com/games/pinpoint",     test: hp(LI, /\/games\/pinpoint/) },
    { id: "li-crossclimb",    n: "Crossclimb",       u: "https://www.linkedin.com/games/crossclimb",   test: hp(LI, /\/games\/crossclimb/) },
    { id: "li-wend",          n: "Wend",             u: "https://www.linkedin.com/games/wend/",        test: hp(LI, /\/games\/wend/) },
    { id: "li-queens",        n: "Queens",           u: "https://www.linkedin.com/games/queens",       test: hp(LI, /\/games\/queens/) },
    { id: "li-tango",         n: "Tango",            u: "https://www.linkedin.com/games/tango",        test: hp(LI, /\/games\/tango/) },
    { id: "li-zip",           n: "Zip",              u: "https://www.linkedin.com/games/zip",          test: hp(LI, /\/games\/zip/) },
    { id: "li-minisudoku",    n: "Mini Sudoku",      u: "https://www.linkedin.com/games/mini-sudoku/", test: hp(LI, /\/games\/mini-sudoku/) },
    { id: "li-patches",       n: "Patches",          u: "https://www.linkedin.com/games/patches/",     test: hp(LI, /\/games\/patches/) },
    { id: "cluesbysam",       n: "Clues By Sam",     u: "https://cluesbysam.com",        test: h(/(^|\.)cluesbysam\.com$/) },
    { id: "spectra",          n: "Spectra",          u: "https://spectra.quest",         test: h(/(^|\.)spectra\.quest$/) },
    { id: "murdle-x",         n: "Parlorbox",        u: "https://parlorbox.com/",        test: h(/(^|\.)parlorbox\.com$/) },
    { id: "zebra",            n: "Zebra Puzzles",    u: "https://www.zebrapuzzles.com",  test: h(/(^|\.)zebrapuzzles\.com$/) },
    { id: "starstruck",       n: "Starstruck",       u: "https://www.netflix.com/tudum/puzzled/starstruck/daily", test: hp(NFX, /starstruck/i) },
    { id: "akari",            n: "Daily Akari",      u: "https://dailyakari.com",        test: h(/(^|\.)dailyakari\.com$/) },
    { id: "shikaku",          n: "Shikaku",          u: "https://shikakuofthe.day",      test: h(/(^|\.)shikakuofthe\.day$/) },
    { id: "loopy",            n: "Loopy",            u: "https://loopy.wtf",             test: h(/(^|\.)loopy\.wtf$/) },
    { id: "sumplete",         n: "Sumplete",         u: "https://sumplete.com/daily",    test: h(/(^|\.)sumplete\.com$/) },
    { id: "nonodaily",        n: "NonoDaily",        u: "https://www.nonodaily.com",     test: h(/(^|\.)nonodaily\.com$/) },
    { id: "mineswifter",      n: "Mineswifter",      u: "https://mineswifter.com",       test: h(/(^|\.)mineswifter\.com$/) },
    { id: "nerdle-micro",     n: "Nerdle Micro",     u: "https://micro.nerdlegame.com/", test: h(/^micro\.nerdlegame\.com$/) },
    { id: "nerdle-mini",      n: "Nerdle Mini",      u: "https://mini.nerdlegame.com/",  test: h(/^mini\.nerdlegame\.com$/) },
    { id: "nerdle-midi",      n: "Nerdle Midi",      u: "https://midi.nerdlegame.com/",  test: h(/^midi\.nerdlegame\.com$/) },
    { id: "nerdle-classic",   n: "Nerdle Classic",   u: "https://nerdlegame.com/",       test: h(/^(www\.)?nerdlegame\.com$/) },
    { id: "framed",           n: "Framed",           u: "https://framed.wtf",            test: h(/(^|\.)framed\.wtf$/) },
    { id: "bandle",           n: "Bandle",           u: "https://bandle.app",            test: h(/(^|\.)bandle\.app$/) },
    { id: "travle",           n: "Travle",           u: "https://travle.earth",
      test: function (l) { return /(^|\.)travle\.earth$/.test(l.hostname) ||
        (/(^|\.)imois\.in$/.test(l.hostname) && /travle/i.test(l.pathname)); } },
    { id: "timeguessr",       n: "TimeGuessr",       u: "https://timeguessr.com",        test: h(/(^|\.)timeguessr\.com$/) },
    { id: "chronle",          n: "Chronle",          u: "https://chronle.com",           test: h(/(^|\.)chronle\.com$/) },
    { id: "costcodle",        n: "Costcodle",        u: "https://costcodle.com",         test: h(/(^|\.)costcodle\.com$/) }
  ];
  var IDS = GAMES.map(function (g) { return g.id; });

  /* ---------- shared store, crosses origins ---------- */
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
        var s = shared ? tidy(shared) : null, p = pageState();
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
    if (GAMES[i].test(location)) { game = GAMES[i]; break; }
  }
  if (!game) return;

  var state = blank(), nextGame = null, prefs = {};

  /* ---------- the bar ---------- */
  var host = document.createElement("div");
  host.id = "dailies-bar-host";
  host.style.cssText = "all:initial;position:fixed;z-index:2147483647;";
  var root = host.attachShadow({ mode: "open" });

  root.innerHTML =
    '<style>' +
    ':host{all:initial}' +
    '*{box-sizing:border-box;margin:0;padding:0;' +
      'font-family:"Barlow Condensed","Arial Narrow",system-ui,sans-serif}' +
    '.bar{position:fixed;left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));' +
      'max-width:460px;margin:0 auto;display:flex;align-items:stretch;height:46px;' +
      'background:#0E1116;color:#E7EAEE;border:1px solid #252D38;border-radius:4px;' +
      'overflow:hidden;box-shadow:0 8px 26px rgba(0,0,0,.5)}' +
    '.bar.hidden{display:none}' +
    '.bar.top{top:calc(10px + env(safe-area-inset-top,0px));bottom:auto}' +
    '.b{background:transparent;border:0;color:inherit;font:inherit;cursor:pointer;' +
      'display:flex;align-items:center;justify-content:center;flex:0 0 auto;width:44px}' +
    '.b:active{background:rgba(255,176,32,.16)}' +
    '.home{font-weight:700;font-size:19px;color:#FFB020;letter-spacing:.04em;' +
      'border-right:1px solid #252D38}' +
    '.mid{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;' +
      'padding:0 10px;gap:1px}' +
    '.nm{font-weight:600;font-size:15px;letter-spacing:.04em;text-transform:uppercase;' +
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.1}' +
    '.st{font-family:"IBM Plex Mono",ui-monospace,Menlo,monospace;font-size:9.5px;' +
      'letter-spacing:.1em;color:#FFB020;white-space:pre;line-height:1.2}' +
    '.st.departed{color:#35D07F}' +
    '.st.cancelled{color:#FF5C63}' +
    '.st .run{color:#6C7684}' +
    '.no{border-left:1px solid #252D38;width:40px;color:#6C7684}' +
    '.no.on{color:#FF5C63}' +
    '.go{border-left:1px solid #252D38;color:#6C7684}' +
    '.go.on{color:#35D07F}' +
    '.b svg{width:20px;height:20px}' +
    '.next{border-left:1px solid #252D38;font-size:19px;font-weight:700;color:#FFB020}' +
    '.next[disabled]{opacity:.3}' +
    '.move,.x{width:28px;font-size:13px;color:#4E5763;border-left:1px solid #252D38}' +
    '.badge{position:fixed;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));' +
      'width:38px;height:38px;border-radius:4px;background:#0E1116;color:#FFB020;' +
      'border:1px solid #252D38;font-weight:700;font-size:17px;cursor:pointer;display:none;' +
      'align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(0,0,0,.5)}' +
    '.badge.show{display:flex}' +
    '.badge.top{top:calc(12px + env(safe-area-inset-top,0px));left:12px;right:auto;bottom:auto;' +
      'width:32px;height:32px;font-size:15px;opacity:.92}' +
    '</style>' +
    '<div class="bar" id="bar">' +
      '<button class="b home" id="home" title="Back to Dailies">D</button>' +
      '<div class="mid"><div class="nm" id="nm"></div><div class="st" id="st"></div></div>' +
      '<button class="b no" id="no" title="Missed it">' +
        '<svg viewBox="0 0 24 24" fill="none"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" ' +
        'stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/></svg></button>' +
      '<button class="b go" id="go" title="Solved it">' +
        '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" ' +
        'stroke="currentColor" stroke-width="2.3" stroke-linecap="round" ' +
        'stroke-linejoin="round"/></svg></button>' +
      '<button class="b next" id="nx" title="Next departure">&rarr;</button>' +
      '<button class="b move" id="move" title="Move">&#8597;</button>' +
      '<button class="b x" id="x" title="Hide">&times;</button>' +
    '</div>' +
    '<button class="badge" id="badge" title="Show Dailies">D</button>';

  (document.body || document.documentElement).appendChild(host);

  var $ = function (id) { return root.getElementById(id); };
  var barEl = $("bar"), badgeEl = $("badge"), nmEl = $("nm"), stEl = $("st"),
      goEl = $("go"), noEl = $("no"), nxEl = $("nx");

  function myPref() {
    var d = PREF_DEFAULTS[game.id] || {}, p = prefs[game.id] || {};
    return {
      hidden: p.hidden !== undefined ? p.hidden : (d.hidden || false),
      pos: p.pos || d.pos || "bottom"
    };
  }
  function setPref(patch) {
    var cur = myPref();
    prefs[game.id] = {
      hidden: patch.hidden !== undefined ? patch.hidden : cur.hidden,
      pos: patch.pos || cur.pos
    };
    setVal(PREF_KEY, prefs);
    applyPref();
  }
  function applyPref() {
    var p = myPref(), top = p.pos === "top";
    barEl.classList.toggle("top", top);
    badgeEl.classList.toggle("top", top);
    barEl.classList.toggle("hidden", p.hidden);
    badgeEl.classList.toggle("show", p.hidden);
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

  function paint() {
    var on  = (state.done[game.id] || []).indexOf(today()) !== -1;
    var bad = (state.miss[game.id] || []).indexOf(today()) !== -1;

    nextGame = null;
    for (var k = 0; k < GAMES.length; k++) {
      var c = GAMES[k];
      if (c.id === game.id) continue;
      if ((state.done[c.id] || []).indexOf(today()) === -1 &&
          (state.miss[c.id] || []).indexOf(today()) === -1) { nextGame = c; break; }
    }

    var dep = 0;
    IDS.forEach(function (id) { if ((state.done[id] || []).indexOf(today()) !== -1) dep++; });

    nmEl.textContent = game.n;
    var run = runLength(game.id);
    stEl.className = "st " + (on ? "departed" : bad ? "cancelled" : "");
    stEl.innerHTML = (on ? "DEPARTED" : bad ? "CANCELLED" : "ON TIME") +
      '<span class="run">  \u00b7  ' + dep + " AWAY" +
      (run ? "  \u00b7  " + run + "D RUN" : "") + "</span>";

    goEl.classList.toggle("on", on);
    noEl.classList.toggle("on", bad);
    goEl.setAttribute("aria-pressed", on ? "true" : "false");
    noEl.setAttribute("aria-pressed", bad ? "true" : "false");
    nxEl.disabled = !nextGame;
    nxEl.title = nextGame ? "Next: " + nextGame.n : "Board clear";
  }

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
    state.updatedAt = Date.now();
    setVal(KEY, state);
    paint();
  }

  $("home").addEventListener("click", function () { location.href = HOME; });
  goEl.addEventListener("click", function () { mark("done"); });
  noEl.addEventListener("click", function () { mark("miss"); });
  nxEl.addEventListener("click", function () { if (nextGame) location.href = nextGame.u; });
  $("move").addEventListener("click", function () {
    setPref({ pos: myPref().pos === "top" ? "bottom" : "top" });
  });
  $("x").addEventListener("click", function () { setPref({ hidden: true }); });
  badgeEl.addEventListener("click", function () { setPref({ hidden: false }); });

  Promise.all([getVal(KEY, null), getVal(PREF_KEY, null)]).then(function (r) {
    state = r[0] ? tidy(r[0]) : blank();
    prefs = (r[1] && typeof r[1] === "object") ? r[1] : {};
    applyPref();
    paint();
  });

  setInterval(function () {
    getVal(KEY, null).then(function (s) {
      if (!s) return;
      var t = tidy(s);
      if (t.updatedAt > state.updatedAt) { state = t; paint(); }
    });
  }, 4000);
})();
