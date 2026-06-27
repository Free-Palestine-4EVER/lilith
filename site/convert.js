const sharp=require('sharp'),fs=require('fs');
const srcDir='/tmp/snakeframes_src',outDir=__dirname+'/frames';
const files=fs.readdirSync(srcDir).filter(f=>f.endsWith('.png')).sort();
(async()=>{let total=0;
  for(let i=0;i<files.length;i++){
    const out=`${outDir}/frame_${String(i).padStart(3,'0')}.webp`;
    await sharp(`${srcDir}/${files[i]}`).resize({width:460}).webp({quality:82,effort:6}).toFile(out);
    total+=fs.statSync(out).size;
  }
  console.log('wrote',files.length,'frames @460px, total',(total/1048576).toFixed(2),'MB');
})();
