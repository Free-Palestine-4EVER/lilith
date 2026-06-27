const sharp=require('sharp'),fs=require('fs');const s='/tmp/heroframes',o=__dirname+'/hero';
const f=fs.readdirSync(s).filter(x=>x.endsWith('.png')).sort().slice(0,90);
(async()=>{let t=0;for(let i=0;i<f.length;i++){const out=`${o}/frame_${String(i).padStart(3,'0')}.webp`;await sharp(`${s}/${f[i]}`).webp({quality:92,effort:6}).toFile(out);t+=fs.statSync(out).size;}console.log('hero',f.length,'@native',(t/1048576).toFixed(2),'MB');})();
