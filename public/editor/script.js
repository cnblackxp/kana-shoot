(function () {
  'use strict';

  var words = [];
  var editingId = null;

  function getEl(id) {
    return document.getElementById(id);
  }

  function loadWords() {
    if (!window.KanaDB) { words = []; renderList(); return; }
    window.KanaDB.words.getAll().then(function (list) {
      words = list || [];
      renderList();
    }).catch(function () { words = []; renderList(); });
  }

  function getSearchFilter() {
    var el = getEl('word-search');
    return el ? (el.value || '').trim().toLowerCase() : '';
  }

  function renderList() {
    var ul = getEl('word-list');
    if (!ul) return;
    ul.innerHTML = '';
    var q = getSearchFilter();
    var list = q
      ? words.filter(function (w) {
          var r = (w.romaji || '').toLowerCase();
          var k = (w.kana || '').toLowerCase();
          var e = (w.english || '').toLowerCase();
          return r.indexOf(q) !== -1 || k.indexOf(q) !== -1 || e.indexOf(q) !== -1;
        })
      : words;
    var countEl = getEl('word-count');
    if (countEl) countEl.textContent = q ? list.length + ' / ' + words.length : list.length;
    list.forEach(function (w) {
      var li = document.createElement('li');
      var enabledCb = document.createElement('input');
      enabledCb.type = 'checkbox';
      enabledCb.checked = w.enabled !== false;
      enabledCb.className = 'word-enabled-cb';
      enabledCb.title = 'Use in game';
      enabledCb.dataset.id = w.id;
      li.appendChild(enabledCb);
      var textSpan = document.createElement('span');
      textSpan.className = 'text';
      textSpan.textContent = w.romaji || '';
      li.appendChild(textSpan);
      var kanaSpan = document.createElement('span');
      kanaSpan.className = 'kana-display';
      kanaSpan.textContent = w.kana || '';
      li.appendChild(kanaSpan);
      if (w.image && String(w.image).trim()) {
        var thumbWrap = document.createElement('span');
        thumbWrap.className = 'list-thumb';
        var thumbImg = document.createElement('img');
        thumbImg.src = w.image;
        thumbImg.alt = w.kana || '';
        thumbWrap.appendChild(thumbImg);
        li.appendChild(thumbWrap);
      }
      if (w.english) {
        var metaSpan = document.createElement('span');
        metaSpan.className = 'meta';
        metaSpan.textContent = w.english;
        li.appendChild(metaSpan);
      }
      var editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn-small edit-btn';
      editBtn.dataset.id = w.id;
      editBtn.textContent = 'Edit';
      li.appendChild(editBtn);
      var delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn-small danger delete-btn';
      delBtn.dataset.id = w.id;
      delBtn.textContent = 'Delete';
      li.appendChild(delBtn);
      ul.appendChild(li);
    });
    ul.querySelectorAll('.word-enabled-cb').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var id = cb.dataset.id;
        if (!window.KanaDB) return;
        window.KanaDB.words.get(id).then(function (w) {
          if (!w) return;
          w.enabled = cb.checked;
          return window.KanaDB.words.put(w);
        }).then(function () {
          var w = words.find(function (x) { return x.id === id; });
          if (w) w.enabled = cb.checked;
        }).catch(function () { cb.checked = !cb.checked; });
      });
    });
    ul.querySelectorAll('.edit-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { startEdit(btn.dataset.id); });
    });
    ul.querySelectorAll('.delete-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { deleteWord(btn.dataset.id); });
    });
  }

  function lookupKana() {
    var romaji = getEl('romaji') && getEl('romaji').value.trim().toLowerCase();
    if (!romaji) return;
    var kana = (typeof window.romajiToHiragana === 'function') ? window.romajiToHiragana(romaji) : '';
    var sel = getEl('kana-options');
    if (!sel) return;
    sel.innerHTML = '';
    if (kana) {
      var opt = document.createElement('option');
      opt.value = kana;
      opt.textContent = kana;
      sel.appendChild(opt);
      if (getEl('kana-manual')) getEl('kana-manual').value = kana;
    } else {
      if (getEl('kana-manual')) getEl('kana-manual').value = '';
    }
  }

  function saveWord() {
    var romaji = getEl('romaji') && getEl('romaji').value.trim();
    var kanaSel = getEl('kana-options');
    var kanaManual = getEl('kana-manual') && getEl('kana-manual').value.trim();
    var kana = kanaManual || (kanaSel && kanaSel.options[kanaSel.selectedIndex] && kanaSel.options[kanaSel.selectedIndex].value) || '';
    var english = getEl('english') ? getEl('english').value.trim() : '';
    var imageUrl = getEl('image-url') ? getEl('image-url').value.trim() : '';

    if (!romaji || !kana) {
      alert('Romaji and kana are required.');
      return;
    }

    if (!window.KanaDB) { alert('Storage not ready.'); return; }

    var payload = {
      id: editingId || String(Date.now()),
      romaji: romaji,
      kana: kana,
      english: english,
      image: imageUrl,
      enabled: getEl('word-enabled') ? getEl('word-enabled').checked : true
    };

    window.KanaDB.words.put(payload).then(function () {
      cancelEdit();
      loadWords();
      clearForm();
    }).catch(function () { alert('Failed to save.'); });
  }

  function clearForm() {
    if (getEl('romaji')) getEl('romaji').value = '';
    if (getEl('kana-options')) getEl('kana-options').innerHTML = '';
    if (getEl('kana-manual')) getEl('kana-manual').value = '';
    if (getEl('english')) getEl('english').value = '';
    if (getEl('image-url')) getEl('image-url').value = '';
    if (getEl('image-preview')) getEl('image-preview').innerHTML = '';
    if (getEl('word-enabled')) getEl('word-enabled').checked = true;
  }

  function startEdit(id) {
    var w = words.find(function (x) { return x.id === id; });
    if (!w) return;
    editingId = id;
    if (getEl('romaji')) getEl('romaji').value = w.romaji || '';
    if (getEl('kana-manual')) getEl('kana-manual').value = w.kana || '';
    if (getEl('english')) getEl('english').value = w.english || '';
    if (getEl('word-enabled')) getEl('word-enabled').checked = w.enabled !== false;
    if (getEl('image-url')) getEl('image-url').value = w.image || '';
    var prev = getEl('image-preview');
    if (prev) prev.innerHTML = '';
    if (w.image && prev) {
      var img = document.createElement('img');
      img.src = w.image;
      img.alt = w.kana;
      prev.appendChild(img);
    }
    var sel = getEl('kana-options');
    if (sel) {
      sel.innerHTML = '';
      var opt = document.createElement('option');
      opt.value = w.kana;
      opt.textContent = w.kana;
      sel.appendChild(opt);
    }
    if (getEl('btn-cancel-edit')) getEl('btn-cancel-edit').classList.remove('hidden');
  }

  function cancelEdit() {
    editingId = null;
    if (getEl('btn-cancel-edit')) getEl('btn-cancel-edit').classList.add('hidden');
    clearForm();
  }

  function deleteWord(id) {
    if (!confirm('Delete this word?')) return;
    if (!window.KanaDB) return;
    window.KanaDB.words.delete(id).then(function () {
      loadWords();
      if (editingId === id) cancelEdit();
    }).catch(function () { alert('Failed to delete.'); });
  }

  if (getEl('btn-lookup')) getEl('btn-lookup').addEventListener('click', lookupKana);

  if (getEl('romaji')) {
    getEl('romaji').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); lookupKana(); }
    });
  }

  if (getEl('btn-save')) getEl('btn-save').addEventListener('click', saveWord);
  if (getEl('btn-cancel-edit')) getEl('btn-cancel-edit').addEventListener('click', cancelEdit);
  if (getEl('word-search')) {
    getEl('word-search').addEventListener('input', renderList);
    getEl('word-search').addEventListener('change', renderList);
  }

  if (window.KanaDB) {
    window.KanaDB.open().then(function () { return window.KanaDB.migrateFromLocalStorage(); }).then(loadWords).catch(loadWords);
  } else {
    loadWords();
  }
})();
