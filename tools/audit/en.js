// extract English strings per lesson with location
const fs=require('fs');
const all=JSON.parse(fs.readFileSync(__dirname+'/all.json'));
const strip=s=>String(s||'').replace(/<br\s*\/?>/gi,' ').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
const isPl=s=>/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(s);
function ex(o){
  const L=o.lesson,P=o.practice||{},out=[];
  const add=(where,s)=>{s=strip(s);if(s)out.push({where,s})};
  L.sections.forEach((s,si)=>{
    const w='sec'+si+':'+s.type;
    if(s.type==='examples')s.items.forEach(it=>add(w,it.en));
    if(s.type==='formula')s.rows.forEach(r=>add(w,r.example));
    if(s.type==='mistakes')s.items.forEach(it=>add(w,it.right));
    if(s.type==='compare')s.items.forEach(it=>(it.examples||[]).forEach(e=>add(w,typeof e==='string'?e:e.en)));
  });
  const task=(w,t)=>{
    if(t.type==='choice'){const a=t.options?.[t.answer];if(isPl(t.q)||!/_{2,}/.test(t.q))add(w,a);else add(w,String(t.q).replace(/_{2,}/,a??'___'));}
    else if(t.type==='gap'){let q=String(t.q).replace(/\([^)]*\)/g,'');let k=0;q=q.replace(/_{2,}/g,()=>{const a=t.answers[k++];return Array.isArray(a)?a[0]:(k===1&&!Array.isArray(t.answers[0])?t.answers[0]:'')});add(w,q);}
    else if(t.type==='write'||t.type==='order'){add(w,String(t.answers?.[0]||'').replace(/\{([^|}]*)[^}]*\}/g,'$1').replace(/\(([^)]*)\)/g,'$1'));if(!isPl(t.q))add(w+':q',t.q);}
  };
  (L.exercises||[]).forEach((t,i)=>task('exercise'+i,t));
  (P.practice||[]).forEach((set,si)=>set.items.forEach((t,i)=>task('practice'+si+'.'+i,t)));
  (P.test||[]).forEach((t,i)=>task('test'+i,t));
  return out;
}
module.exports={all,ex,strip};
