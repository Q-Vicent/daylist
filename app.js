const CATEGORIES={
  '语言考试':{color:'#8e7cb7',background:'#eee8f9',icon:'Aa'},
  '学科竞赛':{color:'#b28452',background:'#faf0df',icon:'✧'},
  '学业考试':{color:'#6b8a55',background:'#eaf1df',icon:'▤'},
  '校园活动':{color:'#628e9a',background:'#e5f0f2',icon:'✳'}
};
const SEED=[
 {id:'math',title:'全国大学生数学竞赛初赛',category:'学科竞赛',deadline:'2026-11-14T09:00:00+08:00',description:'11月14日 09:00—11:30',importance:3,popularity:0,url:'https://www.cmathc.org.cn/tzgg/545.html',sample:true,label:'11月14日 09:00 开考'},
 {id:'cet4',title:'大学英语四级笔试',category:'语言考试',deadline:'2026-12-12T09:00:00+08:00',description:'12月12日笔试，具体时间以准考证为准',importance:3,popularity:0,url:'https://cet.neea.cn/html1/report/2609/1-1.htm',sample:true,label:'12月12日笔试 · 具体时间待确认'},
 {id:'cet6',title:'大学英语六级笔试',category:'语言考试',deadline:'2026-12-12T15:00:00+08:00',description:'12月12日笔试，具体时间以准考证为准',importance:3,popularity:0,url:'https://cet.neea.cn/html1/report/2609/1-1.htm',sample:true,label:'12月12日笔试 · 具体时间待确认'},
 {id:'transfer-register',title:'转专业报名',category:'校园活动',deadline:'2026-11-24T23:59:59+08:00',description:'报名时间：11月14日—11月24日',importance:3,popularity:0,url:'',sample:true,label:'11月14日—11月24日 · 截止时间待确认'},
 {id:'transfer-written',title:'转专业笔试',category:'学业考试',deadline:'2026-11-26T23:59:59+08:00',description:'预计11月26日左右，具体以学校通知为准',importance:3,popularity:0,url:'',sample:true,label:'11月26日左右 · 待确认'},
 {id:'transfer-interview',title:'转专业面试',category:'学业考试',deadline:'2026-11-29T23:59:59+08:00',description:'预计11月29日左右，具体以学校通知为准',importance:3,popularity:0,url:'',sample:true,label:'11月29日左右 · 待确认'},
 {id:'finals-week',title:'期末周',category:'学业考试',deadline:'2027-01-11T00:00:00+08:00',description:'1月11日—1月20日，倒计时至期末周开始',importance:3,popularity:0,url:'',sample:true,label:'1月11日—1月20日 · 倒计时至开始'},
 {id:'holiday',title:'放假',category:'校园活动',deadline:'2027-01-20T00:00:00+08:00',description:'1月20日放假',importance:2,popularity:0,url:'',sample:true,label:'1月20日 · 具体时间待确认'}
];
const $=s=>document.querySelector(s);
const state={category:'全部活动',nav:'all',view:'cards',sort:'recommended',query:''};
function readStore(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
let custom=readStore('daylist-events',[]);if(!Array.isArray(custom))custom=[];
custom=custom.filter(e=>e&&typeof e.title==='string'&&CATEGORIES[e.category]&&Number.isFinite(new Date(e.deadline).getTime()));
let savedData=readStore('daylist-saved',[]);let saved=new Set(Array.isArray(savedData)?savedData:[]);
let storageWarning=false;
function persist(){try{localStorage.setItem('daylist-events',JSON.stringify(custom));localStorage.setItem('daylist-saved',JSON.stringify([...saved]))}catch{storageWarning=true;toast('浏览器存储不可用，当前更改仅在本次打开时保留')}}
function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function safeURL(value){try{const u=new URL(value);return /^https?:$/.test(u.protocol)?u.href:''}catch{return ''}}
function remaining(event,now=Date.now()){const ms=new Date(event.deadline).getTime()-now;return ms<=0?-1:Math.ceil(ms/86400000)}
function allEvents(){return [...SEED,...custom]}
function dateLabel(e){return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(e.deadline))}
function importanceLabel(e){return ['','一般关注','比较重要','非常重要'][e.importance]||'一般关注'}
function visibleEvents(){return allEvents().filter(e=>(state.category==='全部活动'||e.category===state.category)&&(state.nav!=='saved'||saved.has(e.id))&&(state.nav!=='soon'||(remaining(e)>=0&&remaining(e)<=7))&&(`${e.title} ${e.description} ${e.category}`).toLowerCase().includes(state.query.toLowerCase())).sort((a,b)=>{
 const da=remaining(a),db=remaining(b);if((da<0)!==(db<0))return da<0?1:-1;
 if(state.sort==='days')return new Date(a.deadline)-new Date(b.deadline);
 if(state.sort==='importance')return b.importance-a.importance||new Date(a.deadline)-new Date(b.deadline);
 if(state.sort==='popularity')return b.popularity-a.popularity||new Date(a.deadline)-new Date(b.deadline);
 return b.importance-a.importance||new Date(a.deadline)-new Date(b.deadline);
 })}
function followButton(e){return `<button class="follow ${saved.has(e.id)?'saved':''}" data-save="${escapeHTML(e.id)}" aria-label="${saved.has(e.id)?'取消关注':'关注'}${escapeHTML(e.title)}" aria-pressed="${saved.has(e.id)}" title="${saved.has(e.id)?'取消关注':'关注活动'}">${saved.has(e.id)?'♥':'♡'}</button>`}
function categoryBadge(e){const c=CATEGORIES[e.category];return `<span class="category" style="color:${c.color};background:${c.background}">${c.icon} &nbsp;${e.category}</span>`}
function eventLink(e){const url=safeURL(e.url);return url?`<a class="table-link" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">活动链接 <span>↗</span></a>`:'<span title="可在添加活动时填写链接">链接待补充</span>'}
function card(e){const d=remaining(e);return `<article class="event-card"><div class="card-top">${categoryBadge(e)}${followButton(e)}</div><h3>${escapeHTML(e.title)}</h3><p class="description">${escapeHTML(e.description||'每一天，离目标更近一点。')}</p><div class="countdown ${d>=0&&d<=7?'urgent':''} ${d<0?'expired':''}">${d<0?'<strong>已截止</strong>':`<span class="prefix">还有</span><strong>${String(d).padStart(2,'0')}</strong><span class="unit">天</span>`}</div><div class="card-date"><span>${escapeHTML(e.label||dateLabel(e)+" 截止")}</span><span class="importance">${e.importance===3?'✦ ':''}${importanceLabel(e)}</span></div><div class="card-footer"><span>${e.sample?'日程安排':'我的活动'+` <button class="delete" data-delete="${escapeHTML(e.id)}" title="删除活动">删除</button>`}</span>${eventLink(e)}</div></article>`}
function table(events){return `<div class="table-wrap"><table><thead><tr><th>排行</th><th>活动</th><th>分类</th><th>剩余时间</th><th>重要程度</th><th>链接</th><th>关注</th></tr></thead><tbody>${events.map((e,i)=>`<tr><td><span class="rank ${i<3?'top':''}">${String(i+1).padStart(2,'0')}</span></td><td class="title-cell"><strong>${escapeHTML(e.title)}</strong><span class="table-description">${escapeHTML(e.label||dateLabel(e)+" 截止")}</span>${!e.sample?` <button class="delete" data-delete="${escapeHTML(e.id)}">删除</button>`:''}</td><td>${categoryBadge(e)}</td><td class="days-cell">${remaining(e)<0?'<small>已截止</small>':remaining(e)+'<small>天</small>'}</td><td>${importanceLabel(e)}</td><td>${eventLink(e)}</td><td>${followButton(e)}</td></tr>`).join('')}</tbody></table></div>`}
function render(){const events=visibleEvents(),all=allEvents(),active=all.filter(e=>remaining(e)>=0);$('#total').textContent=active.length;$('#week-total').textContent=active.filter(e=>remaining(e)<=7).length;$('#follow-total').textContent=saved.size;$('#saved-count').textContent=saved.size;
 const nearest=active.slice().sort((a,b)=>new Date(a.deadline)-new Date(b.deadline))[0];$('#hero-days').textContent=nearest?String(remaining(nearest)).padStart(2,'0'):'—';
 $('#results').className=state.view==='cards'?'cards':'';$('#results').innerHTML=state.view==='cards'?events.map(card).join(''):events.length?table(events):'';$('#empty').hidden=events.length>0;
 $('#filters').innerHTML=['全部活动',...Object.keys(CATEGORIES)].map(c=>`<button data-category="${c}" class="${state.category===c?'active':''}">${c}</button>`).join('');
 document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===state.nav));$('#page-title').textContent=state.nav==='saved'?'我的关注':state.nav==='soon'?'即将截止':'活动广场';$('#list-title').innerHTML=(state.nav==='saved'?'为你关注的目标，留一点时间':state.nav==='soon'?'就在这一周，抓住最后的时间':'发现你的下一个目标')+' <span>↙</span>';
 $('#cards-view').classList.toggle('selected',state.view==='cards');$('#table-view').classList.toggle('selected',state.view==='table');$('#cards-view').setAttribute('aria-pressed',state.view==='cards');$('#table-view').setAttribute('aria-pressed',state.view==='table');
 $('#today').textContent=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(new Date());
}
let toastTimer;function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2800)}
$('#side-categories').innerHTML=Object.entries(CATEGORIES).map(([name,c])=>`<button class="side-cat" data-category="${name}"><span class="dot" style="background:${c.color}"></span>${name}</button>`).join('');
document.addEventListener('click',event=>{
 const cat=event.target.closest('[data-category]');if(cat){state.category=cat.dataset.category;render()}
 const nav=event.target.closest('[data-nav]');if(nav){state.nav=nav.dataset.nav;state.category='全部活动';render()}
 const save=event.target.closest('[data-save]');if(save){const id=save.dataset.save;if(saved.has(id)){saved.delete(id);toast('已取消关注')}else{saved.add(id);toast('已加入我的关注')}persist();render()}
 const del=event.target.closest('[data-delete]');if(del&&confirm('删除这个活动？')){custom=custom.filter(e=>e.id!==del.dataset.delete);saved.delete(del.dataset.delete);persist();render();toast(storageWarning?'活动已删除，本次更改未持久保存':'活动已删除')}
});
$('#cards-view').onclick=()=>{state.view='cards';render()};$('#table-view').onclick=()=>{state.view='table';render()};$('#sort').onchange=e=>{state.sort=e.target.value;render()};$('#search').oninput=e=>{state.query=e.target.value.trim();render()};
$('#focus-button').onclick=()=>{state.nav='all';state.category='全部活动';state.query='';state.sort='days';$('#search').value='';$('#sort').value='days';render();$('#activities').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})};
$('#add').onclick=()=>{const t=new Date(Date.now()+7*86400000);const local=new Date(t.getTime()-t.getTimezoneOffset()*60000).toISOString().slice(0,16);$('#event-form').elements.deadline.value=local;$('#dialog').showModal()};$('#close').onclick=()=>$('#dialog').close();$('#dialog').addEventListener('click',e=>{if(e.target===$('#dialog')){const r=$('#dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#dialog').close()}});
$('#event-form').onsubmit=e=>{e.preventDefault();const data=new FormData(e.target),date=new Date(data.get('deadline')),title=data.get('title').trim(),url=data.get('url').trim();if(!title){toast('请填写活动名称');return}if(!Number.isFinite(date.getTime())){toast('请选择有效的时间');return}if(url&&!safeURL(url)){toast('请填写 http 或 https 活动链接');return}const id='local-'+crypto.randomUUID();custom.push({id,title,category:data.get('category'),importance:Number(data.get('importance')),deadline:date.toISOString(),url:safeURL(url),description:data.get('description').trim(),popularity:0,sample:false});saved.add(id);persist();state.nav='saved';state.category='全部活动';state.query='';$('#search').value='';e.target.reset();$('#dialog').close();render();toast(storageWarning?'已添加，当前更改仅在本次打开时保留':'已添加活动，一起期待这一天')};
render();setInterval(render,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
