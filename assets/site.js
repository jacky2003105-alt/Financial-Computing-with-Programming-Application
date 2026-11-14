(function(){'use strict';
/* 商業分析：R｜課程筆記：單元切換、程式碼複製、Concept Check 解答按鈕（規則 14.4）、
   閱讀輔助功能（規則 14.12：記住位置、全站搜尋、不熟標記、本頁大綱）。localStorage 一律包 try/catch。 */
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){return null}}
var PAGE=document.body.getAttribute('data-page')||'index';
var sel=document.getElementById('unitSelect');
/* 課程／作業切換：記住各自最後看的頁面 */
var MODE=document.body.getAttribute('data-mode')||'course';
if(PAGE!=='index')ls('cf:last:'+MODE,PAGE+'.html');
[].forEach.call(document.querySelectorAll('.mode a'),function(a){var m=a.getAttribute('data-mode'),last=ls('cf:last:'+m);if(last&&m!==MODE)a.href=last;});
if(sel)sel.addEventListener('change',function(){location.href=sel.value;});

/* 數學 */
if(window.renderMathInElement)renderMathInElement(document.body,{delimiters:[{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false}],throwOnError:false});

/* 複製程式碼 */
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.copy');if(!b)return;
 var src=b.parentNode.querySelector('.ptext, pre'),t=src.innerText.trim(),lab=b.getAttribute('data-l')||b.textContent;b.setAttribute('data-l',lab);
 function done(){b.textContent='已複製';setTimeout(function(){b.textContent=lab},1200);}
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,function(){});
 else{var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done();}catch(e){}ta.remove();}});

/* 頁首工具列 */
var bar=document.querySelector('.topbar .pickers');
var tools=document.createElement('div');tools.className='rd-tools';tools.style.display='flex';tools.style.gap='6px';
tools.innerHTML='<button type="button" class="rd-search-btn">搜尋</button>'+
 (document.querySelector('.q')?'<label class="rd-weakonly"><input type="checkbox" id="rdWeakOnly">只看不熟</label>':'')+
 (document.querySelector('.sec')?'<button type="button" class="rd-outline-btn" aria-expanded="false">本頁大綱</button>':'')+
 (document.querySelector('.q')?'<button type="button" class="toggle-all">隱藏全部解答</button>':'');
bar.appendChild(tools);

/* 解答按鈕 */
var qs=[].slice.call(document.querySelectorAll('.q'));
if(qs.length){var fl=document.createElement('button');fl.type='button';fl.className='rd-float toggle-all';fl.textContent='隱藏全部解答';document.body.appendChild(fl);}
var alls=[].slice.call(document.querySelectorAll('.toggle-all'));
function setQ(q,open){var b=q.querySelector('.toggle'),s=q.querySelector('.sol');s.hidden=!open;b.setAttribute('aria-expanded',open);b.textContent=open?'隱藏解答':'顯示解答';}
function anyOpen(){return qs.some(function(q){return !q.querySelector('.sol').hidden;});}
function sync(){var t=anyOpen()?'隱藏全部解答':'顯示全部解答';alls.forEach(function(b){b.textContent=t;});}
qs.forEach(function(q){q.querySelector('.toggle').onclick=function(){setQ(q,q.querySelector('.sol').hidden);sync();};});
alls.forEach(function(b){b.onclick=function(){var o=!anyOpen();qs.forEach(function(q){setQ(q,o);});sync();};});
window.addEventListener('beforeprint',function(){qs.forEach(function(q){setQ(q,true);});sync();});

/* 不熟標記 */
var weak={};try{(JSON.parse(ls('cf:weak')||'[]')).forEach(function(k){weak[k]=1});}catch(e){}
function marks(){[].forEach.call(document.querySelectorAll('.sec'),function(s){s.classList.toggle('rd-has-weak',!!s.querySelector('.q.rd-has-weak'));});}
qs.forEach(function(q){var key=PAGE+'#'+q.id;var b=document.createElement('button');b.type='button';b.className='rd-weak';
 b.setAttribute('aria-pressed',weak[key]?'true':'false');b.textContent=weak[key]?'★ 不熟':'☆ 標記不熟';
 q.insertBefore(b,q.firstChild);q.classList.toggle('rd-has-weak',!!weak[key]);
 b.onclick=function(){var on=b.getAttribute('aria-pressed')!=='true';if(on)weak[key]=1;else delete weak[key];
  b.setAttribute('aria-pressed',on?'true':'false');b.textContent=on?'★ 不熟':'☆ 標記不熟';q.classList.toggle('rd-has-weak',on);
  ls('cf:weak',JSON.stringify(Object.keys(weak)));marks();weakView();};});
marks();
var wo=document.getElementById('rdWeakOnly');
function weakView(){var on=wo&&wo.checked;document.body.classList.toggle('rd-weak-only',!!on);
 [].forEach.call(document.querySelectorAll('.rd-weak-empty'),function(x){x.remove()});
 if(on){var n=document.querySelectorAll('.q.rd-has-weak').length;var d=document.createElement('p');d.className='rd-weak-empty';
  d.textContent=n?('這一章標記不熟的題目：'+n+' 題。取消勾選「只看不熟」回到完整內容。'):'這一章還沒有標記不熟的題目。';
  var h=document.querySelector('.ch-head');h.parentNode.insertBefore(d,h.nextSibling);}}
if(wo)wo.addEventListener('change',weakView);

/* 本頁大綱（按了才出現） */
var secs=[].slice.call(document.querySelectorAll('.sec')),links=[];
var obtn=tools.querySelector('.rd-outline-btn');
if(obtn){var ol=document.createElement('nav');ol.className='rd-outline';ol.hidden=true;
 ol.innerHTML='<h4>本頁大綱</h4><ol></ol>';document.body.appendChild(ol);var list=ol.querySelector('ol');
 secs.forEach(function(s){var a=document.createElement('a');a.href='#'+s.id;a.textContent=s.querySelector('h2').textContent.replace(/^(\d+\.\d+)/,'$1 ');
  var li=document.createElement('li');li.appendChild(a);list.appendChild(li);links.push([a,s]);});
 function close(){obtn.setAttribute('aria-expanded','false');ol.hidden=true;}
 obtn.onclick=function(){var o=ol.hidden;ol.hidden=!o;obtn.setAttribute('aria-expanded',String(o));spy();};
 ol.addEventListener('click',function(e){if(e.target.closest('a'))close();});
 document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});}
function current(){var best=null;for(var i=0;i<links.length;i++){if(links[i][1].getBoundingClientRect().top<=170)best=links[i];else break;}return best||links[0];}
function spy(){if(!links.length)return;var c=current();links.forEach(function(l){l[0].classList.toggle('on',l===c);});}

/* 記住讀到哪裡（存頁面＋最近的節或題目） */
var timer=null;
window.addEventListener('scroll',function(){spy();clearTimeout(timer);timer=setTimeout(function(){
 var cand=[].slice.call(document.querySelectorAll('.sec, .q, .sec h3[id]')),best=null;
 for(var i=0;i<cand.length;i++){var t=cand[i].getBoundingClientRect().top;if(t<=170)best=cand[i];}
 var lab=best?(best.closest('.sec')?best.closest('.sec').getAttribute('data-label'):''):'';
 ls('cf:pos',JSON.stringify({p:PAGE,a:best?best.id:'',t:(document.querySelector('.ch-head h1')||{}).textContent||'',l:lab}));},800);},{passive:true});
(function(){var pos=null;try{pos=JSON.parse(ls('cf:pos')||'null');}catch(e){}if(!pos)return;
 if(pos.p===PAGE){if(!location.hash&&pos.a&&document.getElementById(pos.a))location.hash=pos.a;return;}
 if(PAGE==='index'&&pos.p&&pos.p!=='index'){var w=document.querySelector('.wrap'),d=document.createElement('p');d.className='rd-resume';
  d.innerHTML='上次讀到：<a href="'+pos.p+'.html'+(pos.a?'#'+pos.a:'')+'">'+(pos.t||pos.p)+(pos.l?'・'+pos.l:'')+' →</a>';
  w.insertBefore(d,w.firstChild.nextSibling);}})();

/* 全站搜尋（索引在 assets/search.js，離線可用） */
var box=document.createElement('div');box.className='rd-search';box.hidden=true;
box.innerHTML='<div class="rd-bar"><input type="search" placeholder="搜尋所有章節：例如 filter、for 迴圈、glm" aria-label="搜尋關鍵字"><button type="button" class="rd-close">關閉</button></div><p class="rd-count"></p><ol></ol>';
document.body.appendChild(box);var inp=box.querySelector('input'),res=box.querySelector('ol'),cnt=box.querySelector('.rd-count');
function esc(s){return s.replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]});}
function run(){var q=inp.value.trim();res.innerHTML='';if(!q){cnt.textContent='';return;}var lq=q.toLowerCase();
 var hits=(window.SEARCH||[]).filter(function(x){return (x.t+' '+x.x).toLowerCase().indexOf(lq)>=0;});
 cnt.textContent=hits.length?('找到 '+hits.length+' 處'+(hits.length>80?'，只列前 80 處':'')):'找不到符合的內容。';
 hits.slice(0,80).forEach(function(x){var i=x.x.toLowerCase().indexOf(lq),a=Math.max(0,i-40);
  var sn=i<0?esc(x.x.slice(0,90)):esc(x.x.slice(a,i))+'<mark>'+esc(x.x.substr(i,q.length))+'</mark>'+esc(x.x.slice(i+q.length,i+q.length+60));
  var li=document.createElement('li');li.innerHTML='<a href="'+x.p+(x.a?'#'+x.a:'')+'"><span class="rd-where">'+esc(x.t)+'</span><span class="rd-snip">'+(a?'…':'')+sn+'…</span></a>';res.appendChild(li);});}
var st;inp.addEventListener('input',function(){clearTimeout(st);st=setTimeout(run,160);});
tools.querySelector('.rd-search-btn').onclick=function(){box.hidden=false;inp.focus();inp.select();};
box.querySelector('.rd-close').onclick=function(){box.hidden=true;};
document.addEventListener('keydown',function(e){if(e.key==='Escape')box.hidden=true;});
res.addEventListener('click',function(){box.hidden=true;if(wo&&wo.checked){wo.checked=false;weakView();}});
sync();
})();
