const sharp=require('sharp'),fs=require('fs');
const map={
  gold:'/Users/hideyourkids/Downloads/hf_20260622_223733_93f847d5-ee60-4639-b09d-ccc91da03b66.png',
  platinum:'/Users/hideyourkids/Downloads/hf_20260622_221636_59a42504-7407-41f0-8b90-00b2d5ce7d58.png',
  rose:'/Users/hideyourkids/Downloads/hf_20260622_220656_5005043b-84b8-4a46-bf05-23b99f540b65.png',
};
(async()=>{for(const[k,v]of Object.entries(map)){if(!fs.existsSync(v)){console.log('MISSING',k);continue;}
  await sharp(v).resize({width:1100}).webp({quality:86,effort:6}).toFile(__dirname+'/img/'+k+'.webp');
  console.log(k,'->',Math.round(fs.statSync(__dirname+'/img/'+k+'.webp').size/1024),'KB');}})();
