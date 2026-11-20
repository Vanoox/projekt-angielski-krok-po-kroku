const fs=require('fs');const {all,ex}=require('./en.js');const C=require('./det.js');
const order=JSON.parse(fs.readFileSync(require('path').resolve(__dirname,process.argv[2]||'proponowana-kolejnosc.json')));const B=Object.fromEntries(all.map(o=>[o.id,o]));
const intro=k=>k==='articles'&&order.includes('ARTICLES-BASIC')?'ARTICLES-BASIC':C[k][1];
const pos=Object.fromEntries(order.map((id,i)=>[id,i]));
let total=0;const per={};
for(const k in C){const ip=pos[intro(k)];if(ip==null){console.log('missing',k);continue}
 order.forEach((id,i)=>{if(i>=ip||!B[id])return;const n=ex(B[id]).filter(x=>C[k][0].test(x.s)).length;if(n){total+=n;(per[id]=per[id]||[]).push(k+':'+n)}})}
order.forEach((id,i)=>per[id]&&console.log(String(i+1).padStart(2),id.padEnd(30),per[id].join(' ')));
console.log('TOTAL',total);
