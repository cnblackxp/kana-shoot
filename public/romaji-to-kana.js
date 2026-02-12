(function () {
  'use strict';

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

  window.romajiToHiragana = romajiToHiragana;
})();
