const sharp=require('sharp');
(async()=>{
  const src='frames/frame_062.webp';        // big centered head
  const head={left:55, top:185, width:610, height:610};
  for(const s of [180,192,512]){
    await sharp(src).extract(head).resize(s,s).png().toFile(`icon-${s}.png`);
  }
  await sharp('icon-180.png').toFile('apple-touch-icon.png');
  console.log('icons rebuilt from frame_062 head crop');
})();
