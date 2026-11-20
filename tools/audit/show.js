// node tools/audit/show.js <lesson-id> <loc>...   loc: sec13 | practice4.4 | practice9 | test7 | exercise3 | vocab
const vm=require('vm'),fs=require('fs'),path=require('path');const R=path.join(__dirname,'../../data');
const [id,...locs]=process.argv.slice(2);const c={window:{}};vm.createContext(c);
vm.runInContext(fs.readFileSync(`${R}/lessons/${id}.js`,'utf8'),c);vm.runInContext(fs.readFileSync(`${R}/practice/${id}.js`,'utf8'),c);
const L=c.window.LESSONS[0],P=c.window.PRACTICE[id];
for(const l of locs){let m,o;
 if(m=l.match(/^sec(\d+)$/))o=L.sections[+m[1]];
 else if(m=l.match(/^practice(\d+)\.(\d+)$/))o=P.practice[+m[1]].items[+m[2]];
 else if(m=l.match(/^practice(\d+)$/))o=P.practice[+m[1]];
 else if(m=l.match(/^test(\d+)$/))o=P.test[+m[1]];
 else if(m=l.match(/^exercise(\d+)$/))o=L.exercises[+m[1]];
 else if(l==='vocab')o=P.vocab.items.map(i=>i.en);
 console.log('--',l,JSON.stringify(o));}
