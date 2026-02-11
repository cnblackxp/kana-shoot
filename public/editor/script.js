(function () {
  'use strict';

  var words = [];
  var editingId = null;

  function getEl(id) {
    return document.getElementById(id);
  }

  function loadWords() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/words');
    xhr.onload = function () {
      try {
        words = JSON.parse(xhr.responseText);
      } catch (e) {
        words = [];
      }
      renderList();
    };
    xhr.onerror = function () { words = []; renderList(); };
    xhr.send();
  }

  function getSearchFilter() {
    var q = (getEl('word-search').value || '').trim().toLowerCase();
    return q;
  }

  function renderList() {
    var ul = getEl('word-list');
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
    getEl('word-count').textContent = q ? list.length + ' / ' + words.length : list.length;
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
        var xhr = new XMLHttpRequest();
        xhr.open('PUT', '/api/words/' + id);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function () {
          var w = words.find(function (x) { return x.id === id; });
          if (w) w.enabled = cb.checked;
        };
        xhr.onerror = function () { cb.checked = !cb.checked; };
        xhr.send(JSON.stringify({ enabled: cb.checked }));
      });
    });
    ul.querySelectorAll('.edit-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { startEdit(btn.dataset.id); });
    });
    ul.querySelectorAll('.delete-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { deleteWord(btn.dataset.id); });
    });
  }

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function lookupKana() {
    var romaji = getEl('romaji').value.trim().toLowerCase();
    if (!romaji) return;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/romaji-to-kana?q=' + encodeURIComponent(romaji));
    xhr.onload = function () {
      try {
        var options = JSON.parse(xhr.responseText);
        var sel = getEl('kana-options');
        sel.innerHTML = '';
        if (options.length > 0) {
          options.forEach(function (k) {
            var opt = document.createElement('option');
            opt.value = k;
            opt.textContent = k;
            sel.appendChild(opt);
          });
          getEl('kana-manual').value = options[0];
        } else {
          getEl('kana-manual').value = '';
        }
      } catch (e) {
        getEl('kana-manual').value = '';
      }
    };
    xhr.onerror = function () { getEl('kana-manual').value = ''; };
    xhr.send();
  }

  function uploadImage(file, cb) {
    if (!file) { if (cb) cb(''); return; }
    var form = new FormData();
    form.append('image', file);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/images');
    xhr.onload = function () {
      try {
        var data = JSON.parse(xhr.responseText);
        if (cb) cb(data.url || '');
      } catch (e) {
        if (cb) cb('');
      }
    };
    xhr.onerror = function () { if (cb) cb(''); };
    xhr.send(form);
  }

  function saveWord() {
    var romaji = getEl('romaji').value.trim();
    var kanaSel = getEl('kana-options');
    var kanaManual = getEl('kana-manual').value.trim();
    var kana = kanaManual || (kanaSel.options[kanaSel.selectedIndex] && kanaSel.options[kanaSel.selectedIndex].value) || '';
    var english = getEl('english').value.trim();
    var imageUrl = getEl('image-url').value.trim();

    if (!romaji || !kana) {
      alert('Romaji and kana are required.');
      return;
    }

    var enabled = getEl('word-enabled').checked;
    var payload = { romaji: romaji, kana: kana, english: english, image: imageUrl, enabled: enabled };

    if (editingId) {
      var xhr = new XMLHttpRequest();
      xhr.open('PUT', '/api/words/' + editingId);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function () {
        cancelEdit();
        loadWords();
        clearForm();
      };
      xhr.onerror = function () { alert('Failed to update.'); };
      xhr.send(JSON.stringify(payload));
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/words');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function () {
        loadWords();
        clearForm();
      };
      xhr.onerror = function () { alert('Failed to save.'); };
      xhr.send(JSON.stringify(payload));
    }
  }

  function clearForm() {
    getEl('romaji').value = '';
    getEl('kana-options').innerHTML = '';
    getEl('kana-manual').value = '';
    getEl('english').value = '';
    getEl('image-url').value = '';
    getEl('image-file').value = '';
    getEl('image-preview').innerHTML = '';
    getEl('word-enabled').checked = true;
  }

  function startEdit(id) {
    var w = words.find(function (x) { return x.id === id; });
    if (!w) return;
    editingId = id;
    getEl('romaji').value = w.romaji || '';
    getEl('kana-manual').value = w.kana || '';
    getEl('english').value = w.english || '';
    getEl('word-enabled').checked = w.enabled !== false;
    getEl('image-url').value = w.image || '';
    getEl('image-file').value = '';
    var prev = getEl('image-preview');
    prev.innerHTML = '';
    if (w.image) {
      var img = document.createElement('img');
      img.src = w.image;
      img.alt = w.kana;
      prev.appendChild(img);
    }
    getEl('kana-options').innerHTML = '';
    var opt = document.createElement('option');
    opt.value = w.kana;
    opt.textContent = w.kana;
    getEl('kana-options').appendChild(opt);
    getEl('btn-cancel-edit').classList.remove('hidden');
  }

  function cancelEdit() {
    editingId = null;
    getEl('btn-cancel-edit').classList.add('hidden');
    clearForm();
  }

  function deleteWord(id) {
    if (!confirm('Delete this word?')) return;
    var xhr = new XMLHttpRequest();
    xhr.open('DELETE', '/api/words/' + id);
    xhr.onload = function () {
      loadWords();
      if (editingId === id) cancelEdit();
    };
    xhr.onerror = function () { alert('Failed to delete.'); };
    xhr.send();
  }

  getEl('btn-lookup').addEventListener('click', lookupKana);

  getEl('romaji').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); lookupKana(); }
  });

  function setImageFromUrl(url) {
    getEl('image-url').value = url;
    var prev = getEl('image-preview');
    prev.innerHTML = '';
    if (url) {
      var img = document.createElement('img');
      img.src = url;
      img.alt = 'preview';
      prev.appendChild(img);
    }
  }

  getEl('image-file').addEventListener('change', function () {
    var file = this.files[0];
    if (!file) return;
    uploadImage(file, function (url) {
      setImageFromUrl(url);
    });
  });

  function handlePaste(e) {
    var items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== 0) continue;
      var blob = items[i].getAsFile();
      if (!blob) continue;
      e.preventDefault();
      var file = blob.name ? blob : new File([blob], 'pasted.png', { type: blob.type || 'image/png' });
      uploadImage(file, function (url) {
        if (url) setImageFromUrl(url);
      });
      return;
    }
  }

  document.addEventListener('paste', handlePaste);

  getEl('paste-zone').addEventListener('click', function () {
    this.focus();
  });

  getEl('btn-save').addEventListener('click', function () {
    var file = getEl('image-file').files[0];
    if (file && !getEl('image-url').value) {
      uploadImage(file, function (url) {
        getEl('image-url').value = url;
        saveWord();
      });
    } else {
      saveWord();
    }
  });

  getEl('btn-cancel-edit').addEventListener('click', cancelEdit);

  getEl('word-search').addEventListener('input', renderList);
  getEl('word-search').addEventListener('change', renderList);

  loadWords();
})();
