(function () {
  'use strict';

  // ——— Kana → romaji (one reading per character) ———
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
    'わ': 'wa', 'を': 'wo', 'ん': 'n'
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
    'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n'
  };

  var pool = [];
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
  var SETTINGS_KEY = 'kanaShoot_settings';
  var CUSTOM_KEY = 'kanaShoot_customChars';

  function saveSettings() {
    try {
      var o = {
        characters: document.getElementById('opt-characters').value,
        mode: document.getElementById('opt-mode').value,
        interval: document.getElementById('opt-interval').value,
        fallspeed: document.getElementById('opt-fallspeed').value,
        lives: document.getElementById('opt-lives').value
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(o));
    } catch (e) {}
  }

  function loadSettings() {
    try {
      var raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      var o = JSON.parse(raw);
      var sel = document.getElementById('opt-characters');
      if (o.characters && [].slice.call(sel.options).some(function (opt) { return opt.value === o.characters; })) {
        sel.value = o.characters;
      }
      var modeSel = document.getElementById('opt-mode');
      if (o.mode) modeSel.value = o.mode;
      var intervalIn = document.getElementById('opt-interval');
      if (o.interval != null) intervalIn.value = o.interval;
      var fallSel = document.getElementById('opt-fallspeed');
      if (o.fallspeed && [].slice.call(fallSel.options).some(function (opt) { return opt.value === o.fallspeed; })) {
        fallSel.value = o.fallspeed;
      }
      var livesIn = document.getElementById('opt-lives');
      if (o.lives != null) livesIn.value = Math.max(1, Math.min(20, parseInt(o.lives, 10) || 3));
      var btn = document.getElementById('btn-custom-chars');
      if (sel.value === 'custom') btn.classList.remove('hidden');
      document.getElementById('zen-label').style.visibility = modeSel.value === 'zen' ? 'visible' : 'hidden';
    } catch (e) {}
  }

  function saveCustomChars() {
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(customPool));
    } catch (e) {}
  }

  function loadCustomChars() {
    try {
      var raw = localStorage.getItem(CUSTOM_KEY);
      if (!raw) return;
      var arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length > 0) {
        customPool = arr;
      }
    } catch (e) {}
  }

  function applyCustomPoolToModal() {
    var checkboxes = document.querySelectorAll('#custom-modal input[type="checkbox"]');
    if (customPool.length === 0) {
      checkboxes.forEach(function (cb) { cb.checked = true; });
    } else {
      checkboxes.forEach(function (cb) {
        cb.checked = customPool.some(function (p) {
          return p.char === cb.dataset.char && p.romaji === cb.dataset.romaji;
        });
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
    var count = 12;
    for (var i = 0; i < count; i++) {
      var p = document.createElement('span');
      p.className = 'particle';
      var angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      var dist = 25 + Math.random() * 35;
      var px = Math.cos(angle) * dist;
      var py = Math.sin(angle) * dist;
      p.style.left = (centerX - 4) + 'px';
      p.style.top = (centerY - 4) + 'px';
      p.style.setProperty('--px', px + 'px');
      p.style.setProperty('--py', py + 'px');
      container.appendChild(p);
      setTimeout(function (el) {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 520, p);
    }
  }

  function normalizeRomaji(s) {
    return String(s).toLowerCase().trim().replace(/\s+/g, '');
  }

  function spawn() {
    if (pool.length === 0) return;
    var item = pool[Math.floor(Math.random() * pool.length)];
    var el = document.createElement('span');
    el.className = 'symbol';
    el.textContent = item.char;
    el.dataset.romaji = item.romaji;
    var areaWidth = playArea.offsetWidth;
    var left = 24 + Math.random() * (areaWidth - 72);
    el.style.left = left + 'px';
    el.style.top = '0px';
    symbolsEl.appendChild(el);
    symbols.push({ el: el, char: item.char, romaji: item.romaji, top: 0 });
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

  function gameOver() {
    if (!gameRunning) return;
    gameRunning = false;
    if (spawnTimer) {
      clearTimeout(spawnTimer);
      spawnTimer = null;
    }
    if (animationId != null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over').classList.remove('hidden');
  }

  function getNextSpawnDelay() {
    var mode = document.getElementById('opt-mode').value;
    if (mode === 'zen') return spawnInterval;
    var elapsed = (Date.now() - rampingStart) / 1000;
    var step = Math.floor(elapsed / 10);
    var delay = Math.max(400, baseInterval - step * 80);
    return delay;
  }

  function scheduleSpawn() {
    if (spawnTimer) clearTimeout(spawnTimer);
    var delay = getNextSpawnDelay();
    spawnTimer = setTimeout(function () {
      spawn();
      scheduleSpawn();
    }, delay);
  }

  function fire(romaji) {
    if (!gameRunning) return;
    var r = normalizeRomaji(romaji);
    if (!r) return;
    inputEl.value = '';
    inputEl.focus();

    var target = null;
    for (var i = 0; i < symbols.length; i++) {
      if (symbols[i].romaji === r) {
        target = symbols[i];
        break;
      }
    }

    var proj = document.createElement('span');
    proj.className = 'projectile';
    proj.textContent = r;
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
    var chars = document.getElementById('opt-characters').value;
    if (chars === 'custom') {
      customPool = getCustomSelected();
      if (customPool.length === 0) {
        alert('Select at least one character. Open "Select characters…" and check the ones you want.');
        return;
      }
      saveCustomChars();
    }
    saveSettings();
    var mode = document.getElementById('opt-mode').value;
    var intervalSec = parseFloat(document.getElementById('opt-interval').value) || 1;
    baseInterval = Math.max(400, intervalSec * 1000);
    spawnInterval = baseInterval;
    rampingStart = Date.now();
    FALL_SPEED = parseFloat(document.getElementById('opt-fallspeed').value) || 0.45;
    lives = parseInt(document.getElementById('opt-lives').value, 10) || 3;
    lives = Math.max(1, Math.min(20, lives));

    pool = buildPool(chars);
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
    inputEl.focus();
    scheduleSpawn();
    tick();
  }

  function init() {
    playArea = document.getElementById('play-area');
    symbolsEl = document.getElementById('symbols');
    projectilesEl = document.getElementById('projectiles');
    inputEl = document.getElementById('input');
    scoreEl = document.getElementById('score');
    livesEl = document.getElementById('lives-display');
    multiplierEl = document.getElementById('multiplier');

    loadCustomChars();
    buildCustomModal();
    loadSettings();

    document.getElementById('btn-start').addEventListener('click', startGame);
    document.getElementById('opt-characters').addEventListener('change', function () {
      var btn = document.getElementById('btn-custom-chars');
      if (this.value === 'custom') {
        btn.classList.remove('hidden');
      } else {
        btn.classList.add('hidden');
      }
      saveSettings();
    });
    document.getElementById('btn-custom-chars').addEventListener('click', function () {
      applyCustomPoolToModal();
      document.getElementById('custom-modal').classList.remove('hidden');
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
      document.querySelectorAll('#custom-modal input[type="checkbox"]').forEach(function (cb) {
        cb.checked = true;
      });
    });
    document.getElementById('custom-deselect-all').addEventListener('click', function () {
      document.querySelectorAll('#custom-modal input[type="checkbox"]').forEach(function (cb) {
        cb.checked = false;
      });
    });
    document.getElementById('opt-mode').addEventListener('change', function () {
      document.getElementById('zen-label').style.visibility =
        this.value === 'zen' ? 'visible' : 'hidden';
      saveSettings();
    });
    document.getElementById('opt-interval').addEventListener('change', saveSettings);
    document.getElementById('opt-interval').addEventListener('input', saveSettings);
    document.getElementById('opt-fallspeed').addEventListener('change', saveSettings);
    document.getElementById('opt-lives').addEventListener('change', saveSettings);
    document.getElementById('opt-lives').addEventListener('input', saveSettings);

    inputEl.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      fire(inputEl.value);
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
      symbols = [];
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
