const sharp=require('sharp'),fs=require('fs');const s='/tmp/roseframes',o=__dirname+'/frames';
const f=fs.readdirSync(s).filter(x=>x.endsWith('.png')).sort();
(async()=>{let t=0;for(let i=0;i<f.length;i++){const out=`${o}/frame_${String(i).padStart(3,'0')}.webp`;await sharp(`${s}/${f[i]}`).webp({quality:92,effort:6}).toFile(out);t+=fs.statSync(out).size;}console.log('rose',f.length,'@native',(t/1048576).toFixed(2),'MB');})();
