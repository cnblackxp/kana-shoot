(function () {
  'use strict';

  var HIRAGANA = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'を': 'wo', 'ん': 'n',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po'
  };
  var KATAKANA = {
    'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
    'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
    'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
    'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
    'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
    'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
    'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
    'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
    'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
    'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n',
    'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
    'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
    'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
    'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
    'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po'
  };

  var DAKUTEN = { 'が': 1, 'ぎ': 1, 'ぐ': 1, 'げ': 1, 'ご': 1, 'ざ': 1, 'じ': 1, 'ず': 1, 'ぜ': 1, 'ぞ': 1, 'だ': 1, 'ぢ': 1, 'づ': 1, 'で': 1, 'ど': 1, 'ば': 1, 'び': 1, 'ぶ': 1, 'べ': 1, 'ぼ': 1, 'ガ': 1, 'ギ': 1, 'グ': 1, 'ゲ': 1, 'ゴ': 1, 'ザ': 1, 'ジ': 1, 'ズ': 1, 'ゼ': 1, 'ゾ': 1, 'ダ': 1, 'ヂ': 1, 'ヅ': 1, 'デ': 1, 'ド': 1, 'バ': 1, 'ビ': 1, 'ブ': 1, 'ベ': 1, 'ボ': 1 };
  var HANDAKUTEN = { 'ぱ': 1, 'ぴ': 1, 'ぷ': 1, 'ぺ': 1, 'ぽ': 1, 'パ': 1, 'ピ': 1, 'プ': 1, 'ペ': 1, 'ポ': 1 };

  var ROMAJI_TO_KANA = {};
  var TWO_CHAR_ROMAJI = [];
  (function () {
    var seen = {};
    for (var k in HIRAGANA) {
      var r = HIRAGANA[k];
      if (!seen[r]) { ROMAJI_TO_KANA[r] = k; seen[r] = true; }
      if (r.length === 2 && TWO_CHAR_ROMAJI.indexOf(r) === -1) TWO_CHAR_ROMAJI.push(r);
    }
  })();

  var pool = [];
  var cmsWords = [];
  var symbols = [];
  var score = 0;
  var streak = 0;
  var multiplier = 1;
  var spawnTimer = null;
  var spawnInterval = 1000;
  var baseInterval = 1000;
  var rampingStart = 0;
  var playArea = null;
  var symbolsEl = null;
  var projectilesEl = null;
  var inputEl = null;
  var scoreEl = null;
  var livesEl = null;
  var multiplierEl = null;
  var MULTIPLIER_STEP = 3;
  var MAX_MULTIPLIER = 5;
  var PROJECTILE_MS = 220;
  var FALL_SPEED = 0.45;
  var SYMBOL_HEIGHT = 48;
  var gameRunning = false;
  var animationId = null;
  var customPool = [];
  var lives = 3;
  var gameMode = 'single';
  var wordMin = 2;
  var wordMax = 5;
  var SETTINGS_KEY = 'kanaShoot_settings';
  var CUSTOM_KEY = 'kanaShoot_customChars';
  var PROFILES_KEY = 'kanaShoot_characterProfiles';
  var STATS_KEY = 'kanaShoot_romajiStats';
  var kanaPreviewTimer = null;
  var sessionStats = {};
  var sessionSnapshot = null;

  var storedStats = {};
  var profileList = [];

  function saveSettings() {
    try {
      var o = {
        modeType: document.getElementById('opt-mode-type').value,
        characters: document.getElementById('opt-characters').value,
        wordMin: document.getElementById('opt-word-min').value,
        wordMax: document.getElementById('opt-word-max').value,
        spawn: document.getElementById('opt-spawn').value,
        interval: document.getElementById('opt-interval').value,
        fallspeed: document.getElementById('opt-fallspeed').value,
        lives: document.getElementById('opt-lives').value,
        showKanaTyping: document.getElementById('opt-show-kana-typing').checked
      };
      var smartScript = document.getElementById('opt-smart-script');
      if (smartScript) o.smartScript = smartScript.value;
      if (window.KanaDB) window.KanaDB.settings.put(o).catch(function () {});
    } catch (e) {}
  }

  function loadSettingsFromStore(o) {
    if (!o) return;
    try {
      var modeSel = document.getElementById('opt-mode-type');
      if (o.modeType) modeSel.value = o.modeType;
      toggleModeOptions();
      var sel = document.getElementById('opt-characters');
      if (o.characters && [].slice.call(sel.options).some(function (opt) { return opt.value === o.characters; })) sel.value = o.characters;
      var wMin = document.getElementById('opt-word-min');
      var wMax = document.getElementById('opt-word-max');
      if (o.wordMin != null) wMin.value = Math.max(1, Math.min(6, parseInt(o.wordMin, 10) || 2));
      if (o.wordMax != null) wMax.value = Math.max(1, Math.min(6, parseInt(o.wordMax, 10) || 5));
      var spawnSel = document.getElementById('opt-spawn');
      if (o.spawn) spawnSel.value = o.spawn;
      document.getElementById('opt-interval').value = o.interval != null ? o.interval : 1;
      var fallSel = document.getElementById('opt-fallspeed');
      if (o.fallspeed && [].slice.call(fallSel.options).some(function (opt) { return opt.value === o.fallspeed; })) fallSel.value = o.fallspeed;
      document.getElementById('opt-lives').value = o.lives != null ? Math.max(1, Math.min(20, parseInt(o.lives, 10) || 3)) : 3;
      var kanaTypingCb = document.getElementById('opt-show-kana-typing');
      if (kanaTypingCb && o.showKanaTyping != null) kanaTypingCb.checked = !!o.showKanaTyping;
      var smartScriptEl = document.getElementById('opt-smart-script');
      if (smartScriptEl && o.smartScript && [].slice.call(smartScriptEl.options).some(function (opt) { return opt.value === o.smartScript; })) smartScriptEl.value = o.smartScript;
      var btn = document.getElementById('btn-custom-chars');
      if (sel && sel.value === 'custom') btn.classList.remove('hidden');
      document.getElementById('zen-label').style.visibility = spawnSel.value === 'zen' ? 'visible' : 'hidden';
    } catch (e) {}
  }

  function toggleModeOptions() {
    var mode = document.getElementById('opt-mode-type').value;
    var letterOpts = document.getElementById('letter-options');
    letterOpts.classList.toggle('hidden', mode === 'words' || mode === 'images' || mode === 'english' || mode === 'kana-to-english');
    var wrap = document.getElementById('word-length-wrap');
    wrap.classList.toggle('hidden', mode !== 'random' && mode !== 'smart');
    var charSetWrap = document.getElementById('character-set-wrap');
    var smartWrap = document.getElementById('smart-chars-wrap');
    if (charSetWrap) charSetWrap.classList.toggle('hidden', mode === 'smart');
    if (smartWrap) smartWrap.classList.toggle('hidden', mode !== 'smart');
  }

  function saveCustomChars() {
    if (window.KanaDB) window.KanaDB.customChars.put(customPool).catch(function () {});
  }

  function loadCustomChars() {
    if (!window.KanaDB) return Promise.resolve();
    return window.KanaDB.customChars.get().then(function (arr) {
      if (Array.isArray(arr) && arr.length > 0) customPool = arr;
    });
  }

  function getNextDefaultNameFromList(profiles) {
    var n = 1;
    for (var i = 0; i < (profiles || []).length; i++) {
      var m = /^Set (\d+)$/i.exec(profiles[i].name);
      if (m) n = Math.max(n, parseInt(m[1], 10) + 1);
    }
    return 'Set ' + n;
  }

  function refreshProfileDropdown() {
    var sel = document.getElementById('custom-profile-list');
    if (!sel) return;
    var selected = sel.value;
    sel.innerHTML = '';
    var opt0 = document.createElement('option');
    opt0.value = '';
    opt0.textContent = '— Select profile —';
    sel.appendChild(opt0);
    (profileList || []).forEach(function (p) {
      var opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      sel.appendChild(opt);
    });
    if (selected) sel.value = selected;
  }

  function applyProfileToModal(chars) {
    var checkboxes = document.querySelectorAll('#custom-modal input[type="checkbox"]');
    checkboxes.forEach(function (cb) {
      cb.checked = chars.some(function (p) { return p.char === cb.dataset.char && p.romaji === cb.dataset.romaji; });
    });
  }

  function applyCustomPoolToModal() {
    var checkboxes = document.querySelectorAll('#custom-modal input[type="checkbox"]');
    if (customPool.length === 0) {
      checkboxes.forEach(function (cb) { cb.checked = true; });
    } else {
      checkboxes.forEach(function (cb) {
        cb.checked = customPool.some(function (p) { return p.char === cb.dataset.char && p.romaji === cb.dataset.romaji; });
      });
    }
  }

  function buildPool(mode) {
    if (mode === 'custom') {
      return customPool.length > 0 ? customPool.slice() : buildPool('both');
    }
    var arr = [];
    if (mode === 'hiragana') {
      Object.keys(HIRAGANA).forEach(function (k) { arr.push({ char: k, romaji: HIRAGANA[k] }); });
    } else if (mode === 'katakana') {
      Object.keys(KATAKANA).forEach(function (k) { arr.push({ char: k, romaji: KATAKANA[k] }); });
    } else {
      Object.keys(HIRAGANA).forEach(function (k) { arr.push({ char: k, romaji: HIRAGANA[k] }); });
      Object.keys(KATAKANA).forEach(function (k) { arr.push({ char: k, romaji: KATAKANA[k] }); });
    }
    return arr;
  }

  function makeRandomWord(charPool, minLen, maxLen) {
    var len = minLen + Math.floor(Math.random() * (maxLen - minLen + 1));
    var displayChar = '';
    var romaji = '';
    for (var i = 0; i < len; i++) {
      var c = charPool[Math.floor(Math.random() * charPool.length)];
      displayChar += c.char;
      romaji += c.romaji;
    }
    return { displayChar: displayChar, romaji: romaji };
  }

  function pickWeightedKana(charPool, stats) {
    if (charPool.length === 0) return null;
    var total = 0;
    var weights = charPool.map(function (c) {
      var count = (stats && stats[c.char]) || 0;
      var w = 1 / (count + 1);
      total += w;
      return w;
    });
    var r = Math.random() * total;
    for (var i = 0; i < charPool.length; i++) {
      r -= weights[i];
      if (r <= 0) return charPool[i];
    }
    return charPool[charPool.length - 1];
  }

  function makeSmartWord(charPool, minLen, maxLen, stats) {
    if (charPool.length === 0) return null;
    var len = minLen + Math.floor(Math.random() * (maxLen - minLen + 1));
    var displayChar = '';
    var romaji = '';
    for (var i = 0; i < len; i++) {
      var c = pickWeightedKana(charPool, stats);
      if (!c) break;
      displayChar += c.char;
      romaji += c.romaji;
    }
    return displayChar ? { displayChar: displayChar, romaji: romaji } : null;
  }

  function buildPoolFromStats(scriptFilter) {
    var stored = getStoredStats();
    var pool = [];
    Object.keys(stored).forEach(function (kana) {
      if (scriptFilter === 'hiragana' && !HIRAGANA[kana]) return;
      if (scriptFilter === 'katakana' && !KATAKANA[kana]) return;
      var romaji = getRomajiForKana(kana);
      if (romaji) pool.push({ char: kana, romaji: romaji });
    });
    return pool;
  }

  function buildCustomModal() {
    var hEl = document.getElementById('custom-hiragana');
    var kEl = document.getElementById('custom-katakana');
    hEl.innerHTML = '';
    kEl.innerHTML = '';
    Object.keys(HIRAGANA).forEach(function (k) {
      var label = document.createElement('label');
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.dataset.char = k;
      cb.dataset.romaji = HIRAGANA[k];
      if (DAKUTEN[k]) cb.dataset.dakuten = '1';
      if (HANDAKUTEN[k]) cb.dataset.handakuten = '1';
      var span = document.createElement('span');
      span.className = 'custom-char';
      span.textContent = k;
      label.appendChild(cb);
      label.appendChild(span);
      label.appendChild(document.createTextNode(' ' + HIRAGANA[k]));
      hEl.appendChild(label);
    });
    Object.keys(KATAKANA).forEach(function (k) {
      var label = document.createElement('label');
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.dataset.char = k;
      cb.dataset.romaji = KATAKANA[k];
      if (DAKUTEN[k]) cb.dataset.dakuten = '1';
      if (HANDAKUTEN[k]) cb.dataset.handakuten = '1';
      var span = document.createElement('span');
      span.className = 'custom-char';
      span.textContent = k;
      label.appendChild(cb);
      label.appendChild(span);
      label.appendChild(document.createTextNode(' ' + KATAKANA[k]));
      kEl.appendChild(label);
    });
    applyCustomPoolToModal();
  }

  function getCustomSelected() {
    var arr = [];
    document.querySelectorAll('#custom-modal input[type="checkbox"]:checked').forEach(function (cb) {
      arr.push({ char: cb.dataset.char, romaji: cb.dataset.romaji });
    });
    return arr;
  }

  function spawnHitParticles(centerX, centerY) {
    var container = document.getElementById('particles');
    if (!container) return;
    for (var i = 0; i < 12; i++) {
      var p = document.createElement('span');
      p.className = 'particle';
      var angle = (i / 12) * Math.PI * 2 + Math.random() * 0.5;
      var dist = 25 + Math.random() * 35;
      var px = Math.cos(angle) * dist;
      var py = Math.sin(angle) * dist;
      p.style.left = (centerX - 4) + 'px';
      p.style.top = (centerY - 4) + 'px';
      p.style.setProperty('--px', px + 'px');
      p.style.setProperty('--py', py + 'px');
      container.appendChild(p);
      setTimeout(function (el) { if (el.parentNode) el.parentNode.removeChild(el); }, 520, p);
    }
  }

  function normalizeRomaji(s) {
    return String(s).toLowerCase().trim().replace(/\s+/g, '');
  }

  function normalizeEnglish(s) {
    return String(s).toLowerCase().trim().replace(/\s+/g, ' ');
  }

  function parseEnglishList(str) {
    if (!str || !String(str).trim()) return [];
    return String(str).split(',').map(function (s) { return normalizeEnglish(s); }).filter(Boolean);
  }

  function splitRomajiToSyllables(romaji) {
    var s = String(romaji).toLowerCase().trim().replace(/\s+/g, '');
    var out = [];
    var i = 0;
    while (i < s.length) {
      var found = false;
      for (var t = 0; t < TWO_CHAR_ROMAJI.length; t++) {
        var two = TWO_CHAR_ROMAJI[t];
        if (s.substr(i, two.length) === two) {
          out.push(two);
          i += two.length;
          found = true;
          break;
        }
      }
      if (found) continue;
      var one = s.substr(i, 1);
      if (ROMAJI_TO_KANA[one]) {
        out.push(one);
        i += 1;
      } else {
        i += 1;
      }
    }
    return out;
  }

  function getStoredStats() {
    return storedStats;
  }

  function saveStoredStats(stats) {
    storedStats = stats || {};
    if (window.KanaDB) window.KanaDB.stats.put(storedStats).catch(function () {});
  }

  function getRomajiForKana(kanaChar) {
    return HIRAGANA[kanaChar] || KATAKANA[kanaChar] || '';
  }

  function recordKanaHit(kanaStr) {
    if (gameMode === 'kana-to-english' || !kanaStr) return;
    var chars = Array.from(String(kanaStr));
    var stored = getStoredStats();
    chars.forEach(function (ch) {
      if (!ch) return;
      sessionStats[ch] = (sessionStats[ch] || 0) + 1;
      stored[ch] = (stored[ch] || 0) + 1;
    });
    saveStoredStats(stored);
    updateRomajiSidebar();
  }

  function statDisplayLabel(key) {
    var romaji = getRomajiForKana(key);
    if (romaji) return key + ' (' + romaji + ')';
    if (ROMAJI_TO_KANA[key]) return key + ' (' + ROMAJI_TO_KANA[key] + ')';
    return key;
  }

  function updateRomajiSidebar() {
    var sidebar = document.getElementById('romaji-sidebar');
    var listEl = document.getElementById('romaji-sidebar-list');
    if (!sidebar || !listEl) return;
    if (gameMode === 'kana-to-english') {
      sidebar.classList.add('hidden');
      return;
    }
    sidebar.classList.remove('hidden');
    var entries = Object.keys(sessionStats).map(function (k) {
      return { key: k, count: sessionStats[k] };
    });
    entries.sort(function (a, b) { return b.count - a.count; });
    listEl.innerHTML = '';
    entries.forEach(function (e) {
      var row = document.createElement('div');
      row.className = 'romaji-sidebar-row';
      row.innerHTML = '<span class="romaji-kana">' + statDisplayLabel(e.key) + '</span> <span class="romaji-count">' + e.count + '</span>';
      listEl.appendChild(row);
    });
  }

  function spawn() {
    if (gameMode === 'single' || gameMode === 'random' || gameMode === 'smart') {
      if (pool.length === 0) return;
    } else {
      if (cmsWords.length === 0) return;
    }

    var el = document.createElement('span');
    var areaWidth = playArea.offsetWidth;
    var left = 24 + Math.random() * (areaWidth - 72);
    el.style.left = left + 'px';
    el.style.top = '0px';

    if (gameMode === 'single') {
      var single = pool[Math.floor(Math.random() * pool.length)];
      el.className = 'symbol';
      el.textContent = single.char;
      el.dataset.romaji = single.romaji;
      symbolsEl.appendChild(el);
      symbols.push({ el: el, romaji: single.romaji, kana: single.char, top: 0 });
    } else if (gameMode === 'random') {
      var item = makeRandomWord(pool, wordMin, wordMax);
      el.className = 'symbol word';
      el.textContent = item.displayChar;
      el.dataset.romaji = item.romaji;
      symbolsEl.appendChild(el);
      symbols.push({ el: el, romaji: item.romaji, kana: item.displayChar, top: 0 });
    } else if (gameMode === 'smart') {
      var stats = getStoredStats();
      var smartItem = makeSmartWord(pool, wordMin, wordMax, stats);
      if (!smartItem) return;
      el.className = 'symbol word';
      el.textContent = smartItem.displayChar;
      el.dataset.romaji = smartItem.romaji;
      symbolsEl.appendChild(el);
      symbols.push({ el: el, romaji: smartItem.romaji, kana: smartItem.displayChar, top: 0 });
    } else {
      var entry = cmsWords[Math.floor(Math.random() * cmsWords.length)];
      var romaji = entry.romaji;
      if (gameMode === 'words') {
        el.className = 'symbol word';
        el.textContent = entry.kana;
        el.dataset.romaji = romaji;
        symbolsEl.appendChild(el);
        symbols.push({ el: el, romaji: romaji, kana: entry.kana, top: 0 });
      } else if (gameMode === 'images' && entry.image) {
        el.className = 'symbol image-target';
        var img = document.createElement('img');
        img.src = entry.image;
        img.alt = entry.kana;
        el.appendChild(img);
        el.dataset.romaji = romaji;
        symbolsEl.appendChild(el);
        symbols.push({ el: el, romaji: romaji, kana: entry.kana, top: 0 });
      } else if (gameMode === 'english' && entry.english) {
        var meanings = parseEnglishList(entry.english);
        if (meanings.length === 0) return;
        var displayedMeaning = meanings[Math.floor(Math.random() * meanings.length)];
        var validRomajis = [];
        cmsWords.forEach(function (w) {
          if (parseEnglishList(w.english).indexOf(displayedMeaning) !== -1) {
            var rj = normalizeRomaji(w.romaji);
            if (rj && validRomajis.indexOf(rj) === -1) validRomajis.push(rj);
          }
        });
        el.className = 'symbol english-target';
        el.textContent = displayedMeaning;
        symbolsEl.appendChild(el);
        symbols.push({ el: el, validRomajis: validRomajis, displayedMeaning: displayedMeaning, kana: entry.kana, top: 0 });
      } else if (gameMode === 'kana-to-english' && entry.kana && entry.english) {
        var answerList = parseEnglishList(entry.english);
        if (answerList.length === 0) return;
        el.className = 'symbol word';
        el.textContent = entry.kana;
        symbolsEl.appendChild(el);
        symbols.push({ el: el, answerList: answerList, kana: entry.kana, top: 0 });
      }
    }
  }

  function tick() {
    if (!gameRunning) return;
    var areaH = playArea.offsetHeight;
    for (var i = symbols.length - 1; i >= 0; i--) {
      var s = symbols[i];
      if (!s.el.parentNode) continue;
      s.top += FALL_SPEED;
      s.el.style.top = s.top + 'px';
      if (s.top >= areaH - SYMBOL_HEIGHT) {
        if (s.el.parentNode) s.el.parentNode.removeChild(s.el);
        symbols.splice(i, 1);
        lives -= 1;
        if (livesEl) livesEl.textContent = lives;
        if (lives <= 0) {
          gameOver();
          return;
        }
      }
    }
    animationId = requestAnimationFrame(tick);
  }

  function saveSession() {
    if (!sessionSnapshot || !window.KanaDB) return;
    var record = {
      id: 's' + Date.now(),
      endedAt: sessionSnapshot.endedAt || Date.now(),
      score: score,
      gameMode: sessionSnapshot.gameMode,
      characterSet: sessionSnapshot.characterSet,
      spawn: sessionSnapshot.spawn,
      interval: sessionSnapshot.interval,
      fallSpeed: sessionSnapshot.fallSpeed,
      lives: sessionSnapshot.lives,
      wordMin: sessionSnapshot.wordMin,
      wordMax: sessionSnapshot.wordMax,
      smartScript: sessionSnapshot.smartScript
    };
    window.KanaDB.sessions.add(record).catch(function () {});
    sessionSnapshot = null;
  }

  function gameOver() {
    if (!gameRunning) return;
    if (sessionSnapshot) sessionSnapshot.endedAt = Date.now();
    saveSession();
    gameRunning = false;
    if (spawnTimer) { clearTimeout(spawnTimer); spawnTimer = null; }
    if (animationId != null) { cancelAnimationFrame(animationId); animationId = null; }
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over').classList.remove('hidden');
  }

  function quitGame() {
    if (sessionSnapshot) sessionSnapshot.endedAt = Date.now();
    saveSession();
    gameRunning = false;
    if (spawnTimer) { clearTimeout(spawnTimer); spawnTimer = null; }
    if (animationId != null) { cancelAnimationFrame(animationId); animationId = null; }
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    while (symbolsEl.firstChild) symbolsEl.firstChild.remove();
    while (projectilesEl.firstChild) projectilesEl.firstChild.remove();
    var particlesEl = document.getElementById('particles');
    if (particlesEl) particlesEl.innerHTML = '';
    symbols = [];
  }

  function getNextSpawnDelay() {
    var spawnMode = document.getElementById('opt-spawn').value;
    if (spawnMode === 'zen') return spawnInterval;
    var elapsed = (Date.now() - rampingStart) / 1000;
    var step = Math.floor(elapsed / 10);
    return Math.max(400, baseInterval - step * 80);
  }

  function scheduleSpawn() {
    if (spawnTimer) clearTimeout(spawnTimer);
    spawnTimer = setTimeout(function () {
      spawn();
      scheduleSpawn();
    }, getNextSpawnDelay());
  }

  function showKanaOnProjectile() {
    return gameMode === 'words' || gameMode === 'images' || gameMode === 'english';
  }

  function fire(romaji) {
    if (!gameRunning) return;
    var inputVal = inputEl.value;
    var r;
    var target = null;
    if (gameMode === 'kana-to-english') {
      r = normalizeEnglish(inputVal);
      if (!r) return;
      for (var i = 0; i < symbols.length; i++) {
        if (symbols[i].answerList && symbols[i].answerList.indexOf(r) !== -1) {
          target = symbols[i];
          break;
        }
      }
    } else if (gameMode === 'english') {
      r = normalizeRomaji(inputVal);
      if (!r) return;
      for (var i = 0; i < symbols.length; i++) {
        if (symbols[i].validRomajis && symbols[i].validRomajis.indexOf(r) !== -1) {
          target = symbols[i];
          break;
        }
      }
    } else {
      r = normalizeRomaji(romaji);
      if (!r) return;
      for (var i = 0; i < symbols.length; i++) {
        if (symbols[i].romaji === r) {
          target = symbols[i];
          break;
        }
      }
    }
    inputEl.value = '';
    var kanaPrev = document.getElementById('kana-preview');
    if (kanaPrev) {
      if (gameMode === 'kana-to-english') kanaPrev.textContent = 'Type the English meaning';
      else kanaPrev.textContent = '';
    }
    inputEl.focus();

    var proj = document.createElement('span');
    proj.className = 'projectile';
    if (target) {
      if (gameMode === 'kana-to-english') {
        proj.textContent = r;
      } else {
        proj.textContent = showKanaOnProjectile() ? target.kana : r;
      }
    } else {
      proj.textContent = gameMode === 'kana-to-english' ? r : r;
      proj.classList.add('wrong');
    }
    projectilesEl.appendChild(proj);

    var rect = playArea.getBoundingClientRect();
    var startX = rect.width / 2 - 24;
    var startY = rect.height - 36;
    proj.style.left = startX + 'px';
    proj.style.top = startY + 'px';

    var endX, endY;
    if (target && target.el.parentNode) {
      var tr = target.el.getBoundingClientRect();
      var pr = playArea.getBoundingClientRect();
      endX = tr.left - pr.left + (tr.width / 2) - 24;
      endY = tr.top - pr.top + (tr.height / 2) - 12;
    } else {
      endX = startX;
      endY = -40;
    }

    requestAnimationFrame(function () {
      proj.classList.add('moving');
      proj.style.left = endX + 'px';
      proj.style.top = endY + 'px';
    });

    setTimeout(function () {
      if (target && target.el.parentNode) {
        var tr = target.el.getBoundingClientRect();
        var pr = playArea.getBoundingClientRect();
        var cx = tr.left - pr.left + tr.width / 2;
        var cy = tr.top - pr.top + tr.height / 2;
        spawnHitParticles(cx, cy);
        target.el.classList.add('hit');
        score += 1 * multiplier;
        streak += 1;
        recordKanaHit(target.kana);
        if (streak >= MULTIPLIER_STEP && multiplier < MAX_MULTIPLIER) {
          multiplier += 1;
          streak = 0;
        }
        scoreEl.textContent = score;
        multiplierEl.textContent = multiplier + '×';
        setTimeout(function () {
          if (target.el.parentNode) target.el.parentNode.removeChild(target.el);
          var idx = symbols.indexOf(target);
          if (idx > -1) symbols.splice(idx, 1);
        }, 460);
      } else {
        streak = 0;
        multiplier = 1;
        multiplierEl.textContent = '1×';
      }
      if (proj.parentNode) proj.parentNode.removeChild(proj);
    }, PROJECTILE_MS);
  }

  function startGame() {
    gameMode = document.getElementById('opt-mode-type').value;

    if (gameMode === 'single' || gameMode === 'random') {
      var chars = document.getElementById('opt-characters').value;
      if (chars === 'custom') {
        customPool = getCustomSelected();
        if (customPool.length === 0) {
          alert('Select at least one character. Open "Select characters…" and check the ones you want.');
          return;
        }
        saveCustomChars();
      }
      var wMinIn = document.getElementById('opt-word-min');
      var wMaxIn = document.getElementById('opt-word-max');
      wordMin = Math.max(1, Math.min(6, parseInt(wMinIn.value, 10) || 2));
      wordMax = Math.max(1, Math.min(6, parseInt(wMaxIn.value, 10) || 5));
      if (wordMin > wordMax) wordMax = wordMin;
      pool = buildPool(chars);
    } else if (gameMode === 'smart') {
      var wMinIn = document.getElementById('opt-word-min');
      var wMaxIn = document.getElementById('opt-word-max');
      wordMin = Math.max(1, Math.min(6, parseInt(wMinIn.value, 10) || 2));
      wordMax = Math.max(1, Math.min(6, parseInt(wMaxIn.value, 10) || 5));
      if (wordMin > wordMax) wordMax = wordMin;
      var smartScript = document.getElementById('opt-smart-script');
      var scriptVal = smartScript ? smartScript.value : 'both';
      pool = buildPoolFromStats(scriptVal);
      if (pool.length === 0) {
        alert('No stats yet for this script. Play other modes first to build character stats, or try Both.');
        return;
      }
    } else {
      if (cmsWords.length === 0) {
        alert('No words in the list for this mode. Add entries in the Editor (Editor tab).');
        return;
      }
    }

    inputEl.placeholder = gameMode === 'kana-to-english' ? 'type meaning in English…' : 'type romaji…';

    saveSettings();

    var spawnMode = document.getElementById('opt-spawn').value;
    var intervalSec = parseFloat(document.getElementById('opt-interval').value) || 1;
    baseInterval = Math.max(400, intervalSec * 1000);
    spawnInterval = baseInterval;
    rampingStart = Date.now();
    FALL_SPEED = parseFloat(document.getElementById('opt-fallspeed').value) || 0.45;
    lives = parseInt(document.getElementById('opt-lives').value, 10) || 3;
    lives = Math.max(1, Math.min(20, lives));

    symbols = [];
    score = 0;
    streak = 0;
    multiplier = 1;
    scoreEl.textContent = '0';
    if (livesEl) livesEl.textContent = lives;
    multiplierEl.textContent = '1×';

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
    gameRunning = true;
    var kanaPrev = document.getElementById('kana-preview');
    var kanaTypingCb = document.getElementById('opt-show-kana-typing');
    if (kanaPrev) {
      if (gameMode === 'kana-to-english') {
        kanaPrev.classList.remove('hidden');
        kanaPrev.textContent = 'Type the English meaning';
      } else if (kanaTypingCb && kanaTypingCb.checked) {
        kanaPrev.classList.remove('hidden');
        kanaPrev.textContent = '';
      } else {
        kanaPrev.classList.add('hidden');
        kanaPrev.textContent = '';
      }
    }
    sessionStats = {};
    sessionSnapshot = {
      gameMode: gameMode,
      characterSet: document.getElementById('opt-characters').value,
      spawn: document.getElementById('opt-spawn').value,
      interval: parseFloat(document.getElementById('opt-interval').value) || 1,
      fallSpeed: FALL_SPEED,
      lives: lives,
      wordMin: wordMin,
      wordMax: wordMax,
      smartScript: gameMode === 'smart' && document.getElementById('opt-smart-script') ? document.getElementById('opt-smart-script').value : null
    };
    updateRomajiSidebar();
    inputEl.focus();
    scheduleSpawn();
    tick();
  }

  function loadCmsWords(cb) {
    var mode = document.getElementById('opt-mode-type').value;
    if (mode !== 'words' && mode !== 'images' && mode !== 'english' && mode !== 'kana-to-english' && mode !== 'smart') {
      if (cb) cb();
      return;
    }
    if (mode === 'smart') {
      if (cb) cb();
      return;
    }
    if (!window.KanaDB) { cmsWords = []; if (cb) cb(); return; }
    window.KanaDB.words.getAll().then(function (list) {
      var enabledOnly = (list || []).filter(function (w) { return w.enabled !== false; });
      if (mode === 'words') {
        cmsWords = enabledOnly.filter(function (w) { return w.kana; });
      } else if (mode === 'images') {
        cmsWords = enabledOnly.filter(function (w) { return w.kana && w.image && String(w.image).trim() !== ''; });
      } else if (mode === 'english' || mode === 'kana-to-english') {
        cmsWords = enabledOnly.filter(function (w) { return w.kana && w.english && parseEnglishList(w.english).length > 0; });
      } else {
        cmsWords = [];
      }
      if (cb) cb();
    }).catch(function () { cmsWords = []; if (cb) cb(); });
  }

  function init() {
    playArea = document.getElementById('play-area');
    symbolsEl = document.getElementById('symbols');
    projectilesEl = document.getElementById('projectiles');
    inputEl = document.getElementById('input');
    scoreEl = document.getElementById('score');
    livesEl = document.getElementById('lives-display');
    multiplierEl = document.getElementById('multiplier');

    var ready = window.KanaDB
      ? window.KanaDB.open().then(function () { return window.KanaDB.migrateFromLocalStorage(); })
      : Promise.resolve();
    ready.then(function () {
      return loadCustomChars();
    }).then(function () {
      buildCustomModal();
      return window.KanaDB ? window.KanaDB.settings.get() : null;
    }).then(function (o) {
      loadSettingsFromStore(o);
      return window.KanaDB ? window.KanaDB.stats.get() : null;
    }).then(function (s) {
      if (s && typeof s === 'object') storedStats = s;
      attachListeners();
    }).catch(function () {
      attachListeners();
    });
  }

  function attachListeners() {

    document.getElementById('opt-mode-type').addEventListener('change', function () {
      toggleModeOptions();
      saveSettings();
    });

    document.getElementById('btn-start').addEventListener('click', function () {
      loadCmsWords(function () { startGame(); });
    });

    document.getElementById('btn-quit').addEventListener('click', quitGame);

  function renderSessionsModalList() {
    var listEl = document.getElementById('sessions-modal-list');
    var filterMode = document.getElementById('sessions-filter-mode');
    var sortOrder = document.getElementById('sessions-sort');
    if (!listEl || !window.KanaDB) return;
    window.KanaDB.sessions.getAll().then(function (sessions) {
      var list = sessions || [];
      if (filterMode && filterMode.value !== 'all') {
        list = list.filter(function (s) { return s.gameMode === filterMode.value; });
      }
      var sort = sortOrder ? sortOrder.value : 'newest';
      list.sort(function (a, b) {
        if (sort === 'oldest') return (a.endedAt || 0) - (b.endedAt || 0);
        if (sort === 'newest') return (b.endedAt || 0) - (a.endedAt || 0);
        if (sort === 'score-desc') return (b.score || 0) - (a.score || 0);
        if (sort === 'score-asc') return (a.score || 0) - (b.score || 0);
        return (b.endedAt || 0) - (a.endedAt || 0);
      });
      listEl.innerHTML = '';
      if (list.length === 0) {
        listEl.innerHTML = '<p class="modal-hint">No sessions yet. Quit or finish a game to record one.</p>';
        return;
      }
      var modeLabels = { single: 'Single', random: 'Random', smart: 'Smart', words: 'Words', images: 'Images', english: 'English', 'kana-to-english': 'Kana→En' };
      list.forEach(function (s) {
        var row = document.createElement('div');
        row.className = 'session-row';
        var date = new Date(s.endedAt || 0);
        var dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        row.innerHTML = '<span class="session-date">' + dateStr + '</span><span class="session-mode">' + (modeLabels[s.gameMode] || s.gameMode) + ' · ' + (s.characterSet || '') + (s.spawn === 'zen' ? ' · Zen ' + s.interval + 's' : ' · Ramp') + '</span><span class="session-score">' + (s.score || 0) + '</span>';
        listEl.appendChild(row);
      });
    });
  }

  function renderStatsModalList() {
    var listEl = document.getElementById('stats-modal-list');
    var filterScript = document.getElementById('stats-filter-script');
    var sortOrder = document.getElementById('stats-sort');
    if (!listEl) return;
    var stored = getStoredStats();
    var entries = Object.keys(stored).map(function (k) {
      return { key: k, count: stored[k] };
    });
    if (filterScript && filterScript.value === 'hiragana') {
      entries = entries.filter(function (e) { return HIRAGANA[e.key]; });
    } else if (filterScript && filterScript.value === 'katakana') {
      entries = entries.filter(function (e) { return KATAKANA[e.key]; });
    }
    entries.sort(function (a, b) {
      return sortOrder && sortOrder.value === 'lowest' ? a.count - b.count : b.count - a.count;
    });
    listEl.innerHTML = '';
    if (entries.length === 0) {
      listEl.innerHTML = '<p class="modal-hint">No data yet. Correctly type romaji in game to build stats.</p>';
    } else {
      entries.forEach(function (e) {
        var row = document.createElement('div');
        row.className = 'romaji-sidebar-row' + (e.count < 10 ? ' stat-need-practice' : '');
        row.innerHTML = '<span class="romaji-kana">' + statDisplayLabel(e.key) + '</span> <span class="romaji-count">' + e.count + '</span>';
        listEl.appendChild(row);
      });
    }
  }

    document.getElementById('btn-stats').addEventListener('click', function () {
      var modal = document.getElementById('stats-modal');
      if (!modal) return;
      renderStatsModalList();
      modal.classList.remove('hidden');
    });

    document.getElementById('stats-filter-script').addEventListener('change', renderStatsModalList);
    document.getElementById('stats-sort').addEventListener('change', renderStatsModalList);

    document.getElementById('btn-smart-chars').addEventListener('click', function () {
      var modal = document.getElementById('smart-info-modal');
      var listEl = document.getElementById('smart-info-list');
      if (!modal || !listEl) return;
      var smartScript = document.getElementById('opt-smart-script');
      var scriptVal = smartScript ? smartScript.value : 'both';
      var stored = getStoredStats();
      var entries = Object.keys(stored).map(function (k) {
        return { key: k, count: stored[k] };
      }).filter(function (e) {
        if (!getRomajiForKana(e.key)) return false;
        if (scriptVal === 'hiragana' && !HIRAGANA[e.key]) return false;
        if (scriptVal === 'katakana' && !KATAKANA[e.key]) return false;
        return true;
      });
      entries.sort(function (a, b) { return a.count - b.count; });
      listEl.innerHTML = '';
      if (entries.length === 0) {
        listEl.innerHTML = '<p class="modal-hint">No stats yet. Play other modes to build character stats; Smart mode will then use those characters.</p>';
      } else {
        entries.forEach(function (e) {
          var row = document.createElement('div');
          row.className = 'romaji-sidebar-row' + (e.count < 10 ? ' stat-need-practice' : '');
          row.innerHTML = '<span class="romaji-kana">' + statDisplayLabel(e.key) + '</span> <span class="romaji-count">' + e.count + '</span>';
          listEl.appendChild(row);
        });
      }
      modal.classList.remove('hidden');
    });
    document.getElementById('smart-info-close').addEventListener('click', function () {
      document.getElementById('smart-info-modal').classList.add('hidden');
    });
    document.querySelector('.smart-info-backdrop').addEventListener('click', function () {
      document.getElementById('smart-info-modal').classList.add('hidden');
    });

    document.getElementById('stats-modal-close').addEventListener('click', function () {
      document.getElementById('stats-modal').classList.add('hidden');
    });
    document.querySelector('.stats-modal-backdrop').addEventListener('click', function () {
      document.getElementById('stats-modal').classList.add('hidden');
    });

    document.getElementById('btn-sessions').addEventListener('click', function () {
      renderSessionsModalList();
      document.getElementById('sessions-modal').classList.remove('hidden');
    });
    document.getElementById('sessions-modal-close').addEventListener('click', function () {
      document.getElementById('sessions-modal').classList.add('hidden');
    });
    document.querySelector('.sessions-modal-backdrop').addEventListener('click', function () {
      document.getElementById('sessions-modal').classList.add('hidden');
    });
    document.getElementById('sessions-filter-mode').addEventListener('change', renderSessionsModalList);
    document.getElementById('sessions-sort').addEventListener('change', renderSessionsModalList);

    document.getElementById('opt-characters').addEventListener('change', function () {
      var btn = document.getElementById('btn-custom-chars');
      if (this.value === 'custom') btn.classList.remove('hidden');
      else btn.classList.add('hidden');
      saveSettings();
    });
    document.getElementById('btn-custom-chars').addEventListener('click', function () {
      applyCustomPoolToModal();
      if (window.KanaDB) {
        window.KanaDB.profiles.getAll().then(function (list) {
          profileList = list || [];
          refreshProfileDropdown();
          document.getElementById('custom-modal').classList.remove('hidden');
        });
      } else {
        refreshProfileDropdown();
        document.getElementById('custom-modal').classList.remove('hidden');
      }
    });
    document.getElementById('custom-done').addEventListener('click', function () {
      customPool = getCustomSelected();
      saveCustomChars();
      document.getElementById('custom-modal').classList.add('hidden');
    });
    document.querySelector('.modal-backdrop').addEventListener('click', function () {
      document.getElementById('custom-modal').classList.add('hidden');
    });
    document.getElementById('custom-select-all').addEventListener('click', function () {
      document.querySelectorAll('#custom-modal input[type="checkbox"]').forEach(function (cb) { cb.checked = true; });
    });
    document.getElementById('custom-deselect-all').addEventListener('click', function () {
      document.querySelectorAll('#custom-modal input[type="checkbox"]').forEach(function (cb) { cb.checked = false; });
    });
    document.getElementById('custom-select-hiragana').addEventListener('click', function () {
      document.querySelectorAll('#custom-hiragana input[type="checkbox"]').forEach(function (cb) { cb.checked = true; });
    });
    document.getElementById('custom-deselect-hiragana').addEventListener('click', function () {
      document.querySelectorAll('#custom-hiragana input[type="checkbox"]').forEach(function (cb) { cb.checked = false; });
    });
    document.getElementById('custom-select-katakana').addEventListener('click', function () {
      document.querySelectorAll('#custom-katakana input[type="checkbox"]').forEach(function (cb) { cb.checked = true; });
    });
    document.getElementById('custom-deselect-katakana').addEventListener('click', function () {
      document.querySelectorAll('#custom-katakana input[type="checkbox"]').forEach(function (cb) { cb.checked = false; });
    });
    document.getElementById('custom-select-dakuten').addEventListener('click', function () {
      document.querySelectorAll('#custom-modal input[type="checkbox"][data-dakuten="1"]').forEach(function (cb) { cb.checked = true; });
    });
    document.getElementById('custom-deselect-dakuten').addEventListener('click', function () {
      document.querySelectorAll('#custom-modal input[type="checkbox"][data-dakuten="1"]').forEach(function (cb) { cb.checked = false; });
    });
    document.getElementById('custom-select-handakuten').addEventListener('click', function () {
      document.querySelectorAll('#custom-modal input[type="checkbox"][data-handakuten="1"]').forEach(function (cb) { cb.checked = true; });
    });
    document.getElementById('custom-deselect-handakuten').addEventListener('click', function () {
      document.querySelectorAll('#custom-modal input[type="checkbox"][data-handakuten="1"]').forEach(function (cb) { cb.checked = false; });
    });
    document.getElementById('custom-profile-load').addEventListener('click', function () {
      var sel = document.getElementById('custom-profile-list');
      var id = sel && sel.value;
      if (!id) return;
      var p = (profileList || []).filter(function (x) { return x.id === id; })[0];
      if (p && p.chars) applyProfileToModal(p.chars);
    });
    document.getElementById('custom-profile-save').addEventListener('click', function () {
      var chars = getCustomSelected();
      if (chars.length === 0) return;
      var name = getNextDefaultNameFromList(profileList);
      var id = 'p' + Date.now();
      var profile = { id: id, name: name, chars: chars };
      if (!window.KanaDB) return;
      window.KanaDB.profiles.put(profile).then(function () {
        return window.KanaDB.profiles.getAll();
      }).then(function (list) {
        profileList = list || [];
        refreshProfileDropdown();
        document.getElementById('custom-profile-list').value = id;
      });
    });
    document.getElementById('custom-profile-rename').addEventListener('click', function () {
      var sel = document.getElementById('custom-profile-list');
      var id = sel && sel.value;
      if (!id) return;
      var p = (profileList || []).filter(function (x) { return x.id === id; })[0];
      if (!p) return;
      var newName = window.prompt('Profile name:', p.name);
      if (newName == null || String(newName).trim() === '') return;
      p.name = String(newName).trim();
      if (!window.KanaDB) return;
      window.KanaDB.profiles.put(p).then(function () {
        return window.KanaDB.profiles.getAll();
      }).then(function (list) {
        profileList = list || [];
        refreshProfileDropdown();
        sel.value = id;
      });
    });
    document.getElementById('custom-profile-delete').addEventListener('click', function () {
      var sel = document.getElementById('custom-profile-list');
      var id = sel && sel.value;
      if (!id) return;
      if (!window.KanaDB) return;
      window.KanaDB.profiles.delete(id).then(function () {
        return window.KanaDB.profiles.getAll();
      }).then(function (list) {
        profileList = list || [];
        refreshProfileDropdown();
      });
    });

    document.getElementById('btn-export').addEventListener('click', function () {
      document.getElementById('export-modal').classList.remove('hidden');
    });
    document.getElementById('export-modal-close').addEventListener('click', function () {
      document.getElementById('export-modal').classList.add('hidden');
    });
    document.querySelector('.export-modal-backdrop').addEventListener('click', function () {
      document.getElementById('export-modal').classList.add('hidden');
    });
    document.getElementById('export-download').addEventListener('click', function () {
      if (!window.KanaDB) return;
      var payload = { version: 1, exportedAt: Date.now() };
      var add = function (key, p) { payload[key] = p; };
      var done = function () {
        var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'kana-shoot-export-' + Date.now() + '.json';
        a.click();
        URL.revokeObjectURL(a.href);
        document.getElementById('export-modal').classList.add('hidden');
      };
      var next = [];
      if (document.getElementById('export-words').checked) next.push(window.KanaDB.words.getAll().then(add.bind(null, 'words')));
      if (document.getElementById('export-sessions').checked) next.push(window.KanaDB.sessions.getAll().then(add.bind(null, 'sessions')));
      if (document.getElementById('export-stats').checked) next.push(window.KanaDB.stats.get().then(add.bind(null, 'stats')));
      if (document.getElementById('export-profiles').checked) next.push(window.KanaDB.profiles.getAll().then(add.bind(null, 'profiles')));
      if (document.getElementById('export-settings').checked) next.push(window.KanaDB.settings.get().then(add.bind(null, 'settings')));
      if (document.getElementById('export-customChars').checked) next.push(window.KanaDB.customChars.get().then(add.bind(null, 'customChars')));
      Promise.all(next).then(done).catch(done);
    });

    document.getElementById('btn-import').addEventListener('click', function () {
      document.getElementById('import-modal').classList.remove('hidden');
      document.getElementById('import-file').value = '';
      document.getElementById('import-options').classList.add('hidden');
      document.getElementById('import-do').classList.add('hidden');
    });
    document.getElementById('import-modal-close').addEventListener('click', function () {
      document.getElementById('import-modal').classList.add('hidden');
    });
    document.querySelector('.import-modal-backdrop').addEventListener('click', function () {
      document.getElementById('import-modal').classList.add('hidden');
    });
    document.getElementById('import-file').addEventListener('change', function () {
      var file = this.files[0];
      var opts = document.getElementById('import-options');
      var btn = document.getElementById('import-do');
      if (!file) { opts.classList.add('hidden'); btn.classList.add('hidden'); return; }
      var fr = new FileReader();
      fr.onload = function () {
        try {
          var data = JSON.parse(fr.result);
          opts.classList.remove('hidden');
          ['words', 'sessions', 'stats', 'profiles', 'settings', 'customChars'].forEach(function (k) {
            var cb = document.getElementById('import-' + k);
            if (cb) { cb.checked = !!data[k]; cb.disabled = !data[k]; }
          });
          btn.classList.remove('hidden');
          btn.dataset.importPayload = fr.result;
        } catch (e) {
          alert('Invalid JSON file.');
        }
      };
      fr.readAsText(file);
    });
    document.getElementById('import-do').addEventListener('click', function () {
      var raw = this.dataset.importPayload;
      if (!raw || !window.KanaDB) return;
      try {
        var data = JSON.parse(raw);
        var replace = document.querySelector('input[name="import-mode"]:checked').value === 'replace';
        var run = [];
        if (document.getElementById('import-words').checked && data.words && Array.isArray(data.words)) {
          var validWords = data.words.filter(function (w) { return w && w.id != null && String(w.romaji).trim() && String(w.kana).trim(); });
          if (replace) {
            run.push(window.KanaDB.words.getAll().then(function (existing) {
              return Promise.all(existing.map(function (w) { return window.KanaDB.words.delete(w.id); }));
            }).then(function () {
              return Promise.all(validWords.map(function (w) { return window.KanaDB.words.put(w); }));
            }));
          } else {
            run.push(Promise.all(validWords.map(function (w) { return window.KanaDB.words.put(w); })));
          }
        }
        if (document.getElementById('import-sessions').checked && data.sessions && Array.isArray(data.sessions)) {
          if (replace) {
            run.push(window.KanaDB.sessions.getAll().then(function (existing) {
              return Promise.all(existing.map(function (s) { return window.KanaDB.sessions.delete(s.id); }));
            }).then(function () {
              return Promise.all(data.sessions.map(function (s) { return window.KanaDB.sessions.add(s); }));
            }));
          } else {
            run.push(Promise.all(data.sessions.map(function (s) { return window.KanaDB.sessions.add(s); })));
          }
        }
        if (document.getElementById('import-stats').checked && data.stats && typeof data.stats === 'object') {
          if (replace) run.push(window.KanaDB.stats.put(data.stats));
          else run.push(window.KanaDB.stats.get().then(function (cur) {
            var merged = Object.assign({}, cur || {});
            Object.keys(data.stats).forEach(function (k) { merged[k] = (merged[k] || 0) + (data.stats[k] || 0); });
            return window.KanaDB.stats.put(merged);
          }));
        }
        if (document.getElementById('import-profiles').checked && data.profiles && Array.isArray(data.profiles)) {
          if (replace) {
            run.push(window.KanaDB.profiles.getAll().then(function (existing) {
              return Promise.all(existing.map(function (p) { return window.KanaDB.profiles.delete(p.id); }));
            }).then(function () {
              return Promise.all(data.profiles.map(function (p) { return window.KanaDB.profiles.put(p); }));
            }));
          } else {
            run.push(Promise.all(data.profiles.map(function (p) { return window.KanaDB.profiles.put(p); })));
          }
        }
        if (document.getElementById('import-settings').checked && data.settings) {
          run.push(window.KanaDB.settings.put(data.settings).then(function () { loadSettingsFromStore(data.settings); }));
        }
        if (document.getElementById('import-customChars').checked && data.customChars && Array.isArray(data.customChars)) {
          run.push(window.KanaDB.customChars.put(data.customChars).then(function () { customPool = data.customChars; }));
        }
        Promise.all(run).then(function () {
          document.getElementById('import-modal').classList.add('hidden');
          if (document.getElementById('import-customChars').checked) { customPool = data.customChars || []; applyCustomPoolToModal(); }
          var refresh = [];
          if (document.getElementById('import-stats').checked) refresh.push(window.KanaDB.stats.get().then(function (s) { storedStats = s || {}; }));
          if (document.getElementById('import-profiles').checked) refresh.push(window.KanaDB.profiles.getAll().then(function (l) { profileList = l || []; }));
          return Promise.all(refresh);
        }).then(function () { alert('Import done.'); }).catch(function (e) { alert('Import failed: ' + (e && e.message)); });
      } catch (e) { alert('Invalid data: ' + (e && e.message)); }
    });

    document.getElementById('opt-spawn').addEventListener('change', function () {
      document.getElementById('zen-label').style.visibility = this.value === 'zen' ? 'visible' : 'hidden';
      saveSettings();
    });
    document.getElementById('opt-interval').addEventListener('change', saveSettings);
    document.getElementById('opt-interval').addEventListener('input', saveSettings);
    document.getElementById('opt-fallspeed').addEventListener('change', saveSettings);
    document.getElementById('opt-lives').addEventListener('change', saveSettings);
    document.getElementById('opt-lives').addEventListener('input', saveSettings);
    document.getElementById('opt-word-min').addEventListener('change', saveSettings);
    document.getElementById('opt-word-min').addEventListener('input', saveSettings);
    document.getElementById('opt-word-max').addEventListener('change', saveSettings);
    document.getElementById('opt-word-max').addEventListener('input', saveSettings);
    document.getElementById('opt-show-kana-typing').addEventListener('change', saveSettings);

    inputEl.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      fire(inputEl.value);
    });

    inputEl.addEventListener('input', function () {
      if (gameMode === 'kana-to-english') return;
      var kanaPrev = document.getElementById('kana-preview');
      var cb = document.getElementById('opt-show-kana-typing');
      if (!kanaPrev || !cb || !cb.checked) {
        if (kanaPrev) kanaPrev.classList.add('hidden');
        return;
      }
      kanaPrev.classList.remove('hidden');
      var val = inputEl.value.trim().toLowerCase();
      if (!val) {
        kanaPrev.textContent = '';
        return;
      }
      if (kanaPreviewTimer) clearTimeout(kanaPreviewTimer);
      kanaPreviewTimer = setTimeout(function () {
        kanaPreviewTimer = null;
        var kana = (typeof window.romajiToHiragana === 'function') ? window.romajiToHiragana(val) : '';
        kanaPrev.textContent = kana || '';
      }, 120);
    });

    inputEl.addEventListener('blur', function () {
      if (document.getElementById('game-screen').classList.contains('hidden')) return;
      setTimeout(function () { inputEl.focus(); }, 0);
    });

    document.getElementById('btn-again').addEventListener('click', function () {
      document.getElementById('game-over').classList.add('hidden');
      document.getElementById('game-screen').classList.add('hidden');
      document.getElementById('start-screen').classList.remove('hidden');
      while (symbolsEl.firstChild) symbolsEl.firstChild.remove();
      while (projectilesEl.firstChild) projectilesEl.firstChild.remove();
      var particlesEl = document.getElementById('particles');
      if (particlesEl) particlesEl.innerHTML = '';
      symbols = [];
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
