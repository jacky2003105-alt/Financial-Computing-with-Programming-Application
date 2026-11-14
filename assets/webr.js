/* 課程筆記網站｜在網頁上執行 R（webR）。v5（2026/11/14）
   只有 tools/webr_check.py 驗證過「單獨就能跑」的區塊才有「▶ 執行」按鈕。
   R 在瀏覽器裡執行（WebAssembly），第一次要下載約 20 MB，之後同一頁再執行就很快。需要網路。 */
window.NotesWebR = (function () {
  'use strict';
  var URL = 'https://webr.r-wasm.org/latest/webr.mjs';
  var ready = null, webR = null, shelter = null, queue = Promise.resolve();
  function init(status) {
    if (ready) return ready;
    status('正在下載並啟動 R（第一次約需 10～30 秒）…');
    ready = import(URL).then(function (m) {
      webR = new m.WebR();
      return webR.init();
    }).then(function () { return new webR.Shelter(); })
      .then(function (s) { shelter = s; return true; })
      .catch(function (e) { ready = null; throw e; });
    return ready;
  }
  function run(code, box, status) {
    queue = queue.then(function () {
      return init(status).then(function () {
        status('執行中…');
        return shelter.captureR(code, {
          withAutoprint: true, captureStreams: true, captureConditions: false,
          captureGraphics: { width: 640, height: 420 }
        });
      }).then(function (res) {
        box.innerHTML = '';
        var lines = res.output.filter(function (o) { return o.type === 'stdout' || o.type === 'stderr'; })
          .map(function (o) { return (o.type === 'stderr' ? '! ' : '') + o.data; });
        if (lines.length) {
          var pre = document.createElement('pre'); pre.className = 'out webr-out'; pre.setAttribute('data-title', '網頁執行結果');
          var c = document.createElement('code'); c.textContent = lines.join('\n'); pre.appendChild(c); box.appendChild(pre);
        }
        (res.images || []).forEach(function (img) {
          var cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; cv.className = 'webr-plot';
          cv.getContext('2d').drawImage(img, 0, 0); box.appendChild(cv);
        });
        if (!lines.length && !(res.images || []).length) box.innerHTML = '<p class="webr-note">執行完成，這段程式沒有輸出。</p>';
        status('');
        return shelter.purge();
      }).catch(function (e) {
        box.innerHTML = '';
        var pre = document.createElement('pre'); pre.className = 'out err webr-out'; pre.setAttribute('data-title', '網頁執行結果');
        var c = document.createElement('code'); c.textContent = 'Error: ' + (e && e.message ? e.message : e); pre.appendChild(c); box.appendChild(pre);
        status(navigator.onLine === false ? '目前沒有網路，無法載入 R。' : '');
        if (shelter) return shelter.purge();
      });
    });
    return queue;
  }
  return { run: run };
})();
