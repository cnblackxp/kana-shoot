(function () {
  'use strict';

  var DB_NAME = 'kanaShoot_db';
  var DB_VERSION = 1;
  var LEGACY_KEYS = {
    settings: 'kanaShoot_settings',
    customChars: 'kanaShoot_customChars',
    profiles: 'kanaShoot_characterProfiles',
    stats: 'kanaShoot_romajiStats'
  };

  var db = null;

  function open() {
    return new Promise(function (resolve, reject) {
      if (db) return resolve(db);
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = function () { reject(req.error); };
      req.onsuccess = function () { db = req.result; resolve(db); };
      req.onupgradeneeded = function (e) {
        var database = e.target.result;
        if (!database.objectStoreNames.contains('words')) {
          database.createObjectStore('words', { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains('settings')) {
          database.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!database.objectStoreNames.contains('customChars')) {
          database.createObjectStore('customChars', { keyPath: 'key' });
        }
        if (!database.objectStoreNames.contains('profiles')) {
          database.createObjectStore('profiles', { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains('stats')) {
          database.createObjectStore('stats', { keyPath: 'key' });
        }
        if (!database.objectStoreNames.contains('sessions')) {
          database.createObjectStore('sessions', { keyPath: 'id' });
        }
      };
    });
  }

  function getStore(storeName, mode) {
    mode = mode || 'readonly';
    return db.transaction(storeName, mode).objectStore(storeName);
  }

  var words = {
    getAll: function () {
      return open().then(function () {
        return new Promise(function (resolve, reject) {
          var store = getStore('words');
          var req = store.getAll();
          req.onsuccess = function () { resolve(req.result || []); };
          req.onerror = function () { reject(req.error); };
        });
      });
    },
    get: function (id) {
      return open().then(function () {
        return new Promise(function (resolve, reject) {
          var req = getStore('words').get(id);
          req.onsuccess = function () { resolve(req.result); };
          req.onerror = function () { reject(req.error); };
        });
      });
    },
    put: function (word) {
      return open().then(function () {
        return new Promise(function (resolve, reject) {
          var w = {
            id: word.id || String(Date.now()),
            romaji: String(word.romaji || '').trim(),
            kana: String(word.kana || '').trim(),
            image: word.image != null ? String(word.image) : '',
            english: String(word.english || '').trim(),
            enabled: word.enabled !== false
          };
          var req = getStore('words', 'readwrite').put(w);
          req.onsuccess = function () { resolve(w); };
          req.onerror = function () { reject(req.error); };
        });
      });
    },
    delete: function (id) {
      return open().then(function () {
        return new Promise(function (resolve, reject) {
          var req = getStore('words', 'readwrite').delete(id);
          req.onsuccess = function () { resolve(); };
          req.onerror = function () { reject(req.error); };
        });
      });
    }
  };

  function getOne(storeName, keyPath, keyValue) {
    return open().then(function () {
      return new Promise(function (resolve, reject) {
        var req = getStore(storeName).get(keyValue);
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function putOne(storeName, keyPath, keyValue, value) {
    return open().then(function () {
      return new Promise(function (resolve, reject) {
        var record = typeof value === 'object' && value !== null && keyPath in value
          ? value
          : (function () { var o = {}; o[keyPath] = keyValue; o.value = value; return o; })();
        if (!record[keyPath]) record[keyPath] = keyValue;
        var req = getStore(storeName, 'readwrite').put(record);
        req.onsuccess = function () { resolve(record); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  var settings = {
    get: function () {
      return getOne('settings', 'key', 'main').then(function (r) { return r ? r.value : null; });
    },
    put: function (value) {
      return putOne('settings', 'key', 'main', value);
    }
  };

  var customChars = {
    get: function () {
      return getOne('customChars', 'key', 'current').then(function (r) { return (r && r.value) ? r.value : null; });
    },
    put: function (value) {
      return putOne('customChars', 'key', 'current', value);
    }
  };

  var profiles = {
    getAll: function () {
      return open().then(function () {
        return new Promise(function (resolve, reject) {
          var req = getStore('profiles').getAll();
          req.onsuccess = function () { resolve(req.result || []); };
          req.onerror = function () { reject(req.error); };
        });
      });
    },
    get: function (id) {
      return getOne('profiles', 'id', id);
    },
    put: function (profile) {
      return open().then(function () {
        return new Promise(function (resolve, reject) {
          var req = getStore('profiles', 'readwrite').put(profile);
          req.onsuccess = function () { resolve(profile); };
          req.onerror = function () { reject(req.error); };
        });
      });
    },
    delete: function (id) {
      return open().then(function () {
        return new Promise(function (resolve, reject) {
          var req = getStore('profiles', 'readwrite').delete(id);
          req.onsuccess = function () { resolve(); };
          req.onerror = function () { reject(req.error); };
        });
      });
    }
  };

  var stats = {
    get: function () {
      return getOne('stats', 'key', 'romajiStats').then(function (r) { return (r && r.value) ? r.value : {}; });
    },
    put: function (value) {
      return putOne('stats', 'key', 'romajiStats', value);
    }
  };

  var sessions = {
    getAll: function () {
      return open().then(function () {
        return new Promise(function (resolve, reject) {
          var req = getStore('sessions').getAll();
          req.onsuccess = function () { resolve(req.result || []); };
          req.onerror = function () { reject(req.error); };
        });
      });
    },
    add: function (session) {
      return open().then(function () {
        return new Promise(function (resolve, reject) {
          var s = Object.assign({ id: session.id || 's' + Date.now() }, session);
          var req = getStore('sessions', 'readwrite').put(s);
          req.onsuccess = function () { resolve(s); };
          req.onerror = function () { reject(req.error); };
        });
      });
    },
    delete: function (id) {
      return open().then(function () {
        return new Promise(function (resolve, reject) {
          var req = getStore('sessions', 'readwrite').delete(id);
          req.onsuccess = function () { resolve(); };
          req.onerror = function () { reject(req.error); };
        });
      });
    }
  };

  function migrateFromLocalStorage() {
    return open().then(function () {
      return settings.get().then(function (existing) {
        if (existing) return Promise.resolve();
        try {
          var raw = localStorage.getItem(LEGACY_KEYS.settings);
          if (raw) {
            var o = JSON.parse(raw);
            return settings.put(o);
          }
        } catch (e) {}
        return Promise.resolve();
      });
    }).then(function () {
      return customChars.get().then(function (existing) {
        if (existing && existing.length > 0) return Promise.resolve();
        try {
          var raw = localStorage.getItem(LEGACY_KEYS.customChars);
          if (raw) {
            var arr = JSON.parse(raw);
            if (Array.isArray(arr) && arr.length > 0) return customChars.put(arr);
          }
        } catch (e) {}
        return Promise.resolve();
      });
    }).then(function () {
      return profiles.getAll().then(function (existing) {
        if (existing && existing.length > 0) return Promise.resolve();
        try {
          var raw = localStorage.getItem(LEGACY_KEYS.profiles);
          if (raw) {
            var arr = JSON.parse(raw);
            if (Array.isArray(arr) && arr.length > 0) {
              return open().then(function () {
                var store = getStore('profiles', 'readwrite');
                return Promise.all(arr.map(function (p) {
                  return new Promise(function (res, rej) {
                    var req = store.put(p);
                    req.onsuccess = function () { res(); };
                    req.onerror = function () { rej(req.error); };
                  });
                }));
              });
            }
          }
        } catch (e) {}
        return Promise.resolve();
      });
    }).then(function () {
      return stats.get().then(function (existing) {
        if (existing && Object.keys(existing).length > 0) return Promise.resolve();
        try {
          var raw = localStorage.getItem(LEGACY_KEYS.stats);
          if (raw) {
            var o = JSON.parse(raw);
            if (o && typeof o === 'object') return stats.put(o);
          }
        } catch (e) {}
        return Promise.resolve();
      });
    });
  }

  window.KanaDB = {
    open: open,
    words: words,
    settings: settings,
    customChars: customChars,
    profiles: profiles,
    stats: stats,
    sessions: sessions,
    migrateFromLocalStorage: migrateFromLocalStorage
  };
})();
