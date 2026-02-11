var path = require('path');
var fs = require('fs');
var express = require('express');
var multer = require('multer');

var app = express();
var DATA_DIR = path.join(__dirname, 'data');
var WORDS_FILE = path.join(DATA_DIR, 'words.json');
var IMAGES_DIR = path.join(DATA_DIR, 'images');

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readWords() {
  try {
    var raw = fs.readFileSync(WORDS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeWords(words) {
  fs.writeFileSync(WORDS_FILE, JSON.stringify(words, null, 2), 'utf8');
}

// Romaji syllable -> hiragana (for romaji-to-kana)
var ROMAJI_TO_HIRAGANA = {
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
  ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
  sa: 'さ', shi: 'し', su: 'す', se: 'せ', so: 'そ',
  ta: 'た', chi: 'ち', tsu: 'つ', te: 'て', to: 'と',
  na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
  ha: 'は', hi: 'ひ', fu: 'ふ', he: 'へ', ho: 'ほ',
  ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
  ya: 'や', yu: 'ゆ', yo: 'よ',
  ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
  wa: 'わ', wo: 'を', n: 'ん',
  ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
  za: 'ざ', ji: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
  da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
  ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
  pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ'
};

function romajiToHiragana(romaji) {
  var s = String(romaji).toLowerCase().trim().replace(/\s+/g, '');
  var out = '';
  var i = 0;
  var two = ['shi', 'chi', 'tsu', 'ji', 'fu', 'wo', 'di', 'du'];
  var one = Object.keys(ROMAJI_TO_HIRAGANA).filter(function (k) { return k.length === 1; });
  while (i < s.length) {
    var found = false;
    for (var t = 0; t < two.length; t++) {
      var key = two[t];
      if (s.substr(i, key.length) === key && ROMAJI_TO_HIRAGANA[key]) {
        out += ROMAJI_TO_HIRAGANA[key];
        i += key.length;
        found = true;
        break;
      }
    }
    if (found) continue;
    var sub2 = s.substr(i, 2);
    if (ROMAJI_TO_HIRAGANA[sub2]) {
      out += ROMAJI_TO_HIRAGANA[sub2];
      i += 2;
      continue;
    }
    var sub1 = s.substr(i, 1);
    if (ROMAJI_TO_HIRAGANA[sub1]) {
      out += ROMAJI_TO_HIRAGANA[sub1];
      i += 1;
      continue;
    }
    i += 1;
  }
  return out;
}

// --- Routes ---

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'game', 'index.html'));
});

app.get('/editor', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'editor', 'index.html'));
});

app.get('/api/words', function (req, res) {
  res.json(readWords());
});

app.post('/api/words', function (req, res) {
  var body = req.body || {};
  var words = readWords();
  var id = String(Date.now());
  var entry = {
    id: id,
    romaji: String(body.romaji || '').trim(),
    kana: String(body.kana || '').trim(),
    image: body.image || '',
    english: String(body.english || '').trim(),
    enabled: body.enabled !== false
  };
  words.push(entry);
  writeWords(words);
  res.status(201).json(entry);
});

app.put('/api/words/:id', function (req, res) {
  var words = readWords();
  var idx = words.findIndex(function (w) { return w.id === req.params.id; });
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  var body = req.body || {};
  if (body.romaji !== undefined) words[idx].romaji = String(body.romaji).trim();
  if (body.kana !== undefined) words[idx].kana = String(body.kana).trim();
  if (body.image !== undefined) words[idx].image = body.image;
  if (body.english !== undefined) words[idx].english = String(body.english).trim();
  if (body.enabled !== undefined) words[idx].enabled = !!body.enabled;
  writeWords(words);
  res.json(words[idx]);
});

app.delete('/api/words/:id', function (req, res) {
  var words = readWords().filter(function (w) { return w.id !== req.params.id; });
  writeWords(words);
  res.status(204).send();
});

app.get('/api/romaji-to-kana', function (req, res) {
  var q = (req.query.q || '').trim().toLowerCase();
  if (!q) return res.json([]);
  var kana = romajiToHiragana(q);
  res.json(kana ? [kana] : []);
});

var upload = multer({ dest: IMAGES_DIR });
app.post('/api/images', upload.single('image'), function (req, res) {
  if (!req.file) return res.status(400).json({ error: 'no file' });
  var ext = path.extname(req.file.originalname) || '.png';
  if (ext.indexOf('.') !== 0) ext = '.png';
  var safeName = req.file.filename + ext;
  var newPath = path.join(IMAGES_DIR, safeName);
  try {
    fs.renameSync(req.file.path, newPath);
  } catch (e) {
    fs.unlinkSync(req.file.path);
    return res.status(500).json({ error: 'save failed' });
  }
  var url = '/api/images/' + encodeURIComponent(safeName);
  res.json({ url: url, path: safeName });
});

app.get('/api/images/:filename', function (req, res) {
  var filename = path.basename(req.params.filename);
  if (!filename) return res.status(404).send('Not found');
  var file = path.join(IMAGES_DIR, filename);
  var rel = path.relative(IMAGES_DIR, file);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return res.status(404).send('Not found');
  if (!fs.existsSync(file)) return res.status(404).send('Not found');
  res.sendFile(path.resolve(file));
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log('Kana Shoot server at http://localhost:' + PORT);
  console.log('  Game:  /');
  console.log('  Editor: /editor');
});
