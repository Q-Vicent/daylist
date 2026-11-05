const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const elements=new Map();
function element(){return {textContent:'',innerHTML:'',className:'',value:'',hidden:false,classList:{toggle(){},add(){},remove(){}},setAttribute(){},addEventListener(){},scrollIntoView(){},showModal(){},close(){},elements:{deadline:{}},getBoundingClientRect(){return {left:0,top:0,right:500,bottom:500}}}}
const context={console,Date,Intl,URL,Set,JSON,Number,String,Array,Object,Math,crypto:require('node:crypto').webcrypto,localStorage:{getItem(){return null},setItem(){}},document:{querySelector(s){if(!elements.has(s))elements.set(s,element());return elements.get(s)},querySelectorAll(){return []},addEventListener(){}},setInterval(){},setTimeout(){},clearTimeout(){},matchMedia(){return {matches:true}}};
vm.createContext(context);vm.runInContext(fs.readFileSync('app.js','utf8'),context);
vm.runInContext(`
 const check=(value,message)=>{if(!value)throw new Error(message)};
 check(remaining({deadline:'2026-11-04T00:00:00+08:00'},new Date('2026-11-03T00:00:00+08:00').getTime())===1,'one day');
 check(remaining({deadline:'2026-11-03T00:01:00+08:00'},new Date('2026-11-03T00:00:00+08:00').getTime())===1,'less than one day');
 check(remaining({deadline:'2026-11-03T00:00:00+08:00'},new Date('2026-11-03T00:00:00+08:00').getTime())===-1,'expired at deadline');
 const transfer=SEED.find(e=>e.id==='transfer-register');
 check(currentMilestone(transfer,new Date('2026-11-25T00:00:00+08:00').getTime()).label.includes('笔试'),'advance to written exam');
 check(currentMilestone(transfer,new Date('2026-11-27T00:00:00+08:00').getTime()).label.includes('面试'),'advance to interview');
 check(safeURL('javascript:alert(1)')==='','unsafe link');
 check(escapeHTML('<script>')==='&lt;script&gt;','html escaping');
 state.category='语言考试';check(visibleEvents().length===2,'category filtering');
 state.category='全部活动';state.query='六级';check(visibleEvents().length===1,'search');
 state.query='';
 state.sort='importance';check(visibleEvents()[0].importance===3,'importance ranking');
 saved.add('cet6');state.nav='saved';check(visibleEvents().length===1,'saved filter');
 state.view='table';render();check(document.querySelector('#results').innerHTML.includes('<table>'),'table render');
 state.nav='all';state.view='cards';render();check(document.querySelector('#results').innerHTML.includes('event-card'),'card render');
`,context);
assert.equal(elements.get('#total').textContent,7);
console.log('Passed: countdown boundaries, expired state, URL validation, escaping, filters, ranking, saved activities, card/table rendering.');
