const sharp=require('sharp'),fs=require('fs');
const D='/Users/hideyourkids/Downloads/';
const src={
  'gold-base':'gold rink product no eyes mouth closed.png.png',
  'gold-eyes':'gold rink product with eyes mouth closed.png',
  'gold-open':'gold rink product with eyes mouth open.png',
  'rose-base':'rose gold rink product no eyes mouth closed.png.png',
  'rose-eyes':'rose gold rink product with eyes mouth closed.png',
  'rose-open':'rose gold rink product with eyes mouth open.png',
  'platinum-base':'platinumm rink product no eyes mouth closed.png.png',
  'platinum-eyes':'platinum rink product with eyes mouth closed.png.png',
  'platinum-open':'platinum rink product with eyes mouth open.png',
};
// zoom factor to MATCH gold (gold is reference, most zoomed). crop = 1/zoom
const crop={ gold:1.0, rose:0.83, platinum:0.85 };
(async()=>{
  for(const [out,fname] of Object.entries(src)){
    const p=D+fname; if(!fs.existsSync(p)){console.log('MISSING',fname);continue;}
    const metal=out.split('-')[0];
    const f=crop[metal];
    const m=await sharp(p).metadata();
    const side=Math.round(Math.min(m.width,m.height)*f);
    const left=Math.round((m.width-side)/2), top=Math.round((m.height-side)/2);
    await sharp(p).extract({left,top,width:side,height:side}).resize(1200,1200).webp({quality:88,effort:6}).toFile(`img/config/${out}.webp`);
    console.log(out,'crop',f,'->',Math.round(fs.statSync(`img/config/${out}.webp`).size/1024)+'KB');
  }
})();
