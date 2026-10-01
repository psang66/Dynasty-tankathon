const SOURCE='https://www.tankathon.com/nfl/big-board';
const READER='https://r.jina.ai/http://www.tankathon.com/nfl/big-board';
const ALLOWED=new Set(['QB','RB','WR','TE']);
const SNAPSHOT=[
[1,'Jeremiah Smith','WR','Ohio State'],[4,'Arch Manning','QB','Texas'],[5,'Cam Coleman','WR','Texas'],[7,'Darian Mensah','QB','Miami'],[8,'Dante Moore','QB','Oregon'],[12,'Charlie Becker','WR','Indiana'],[16,'Jamari Johnson','TE','Oregon'],[18,"Trey'Dez Green",'TE','LSU'],[19,'Jadan Baugh','RB','Florida'],[21,'Trinidad Chambliss','QB','Ole Miss'],[22,'Ryan Coleman-Williams','WR','Alabama'],[25,'Ahmad Hardy','RB','Missouri'],[26,'CJ Carr','QB','Notre Dame'],[27,'Kewan Lacy','RB','Ole Miss'],[30,'Julian Sayin','QB','Ohio State'],[38,'KJ Duff','WR','Rutgers'],[45,'Mario Craver','WR','Texas A&M'],[46,'Omarion Miller','WR','Arizona State'],[55,'Reed Harris','WR','Arizona State'],[57,'Ryan Wingo','WR','Texas'],[61,'Jayden Maiava','QB','USC'],[66,'Luke Reynolds','TE','Virginia Tech'],[67,'Wyatt Young','WR','Oklahoma State'],[74,'Terrance Carter Jr.','TE','Texas Tech'],[89,'Deuce Alexander','WR','Ole Miss'],[107,'Peter Clarke','TE','Temple'],[120,'Justice Haynes','RB','Georgia Tech']
].map(([overallRank,name,pos,school],i)=>({rank:i+1,overallRank,name,pos,school,source:'Tankathon snapshot'}));
function strip(h=''){return h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&#39;|&apos;/gi,"'").replace(/&quot;/gi,'"').replace(/\s+/g,' ').trim()}
function parseHtml(html){
  const text=strip(html), re=/(\d{1,3})\s+([A-Z][A-Za-z'.’\- ]{2,45})\s+(QB|RB|WR|TE)\s*\|\s*([A-Za-z0-9&.'’\- ]{2,45})/g;
  const out=[],seen=new Set(); let m;
  while((m=re.exec(text))){const overallRank=Number(m[1]),name=m[2].trim(),pos=m[3],school=m[4].trim();const key=`${name}|${pos}`;if(!seen.has(key)&&ALLOWED.has(pos)){seen.add(key);out.push({rank:out.length+1,overallRank,name,pos,school,source:'Tankathon'})}}
  return out.sort((a,b)=>a.overallRank-b.overallRank).map((x,i)=>({...x,rank:i+1}));
}
function parseReader(text=''){
  const re=/(?:^|\n)\s*(\d{1,3})\s*\n+\s*([^\n]{2,55}?)\s+(QB|RB|WR|TE)\s*\|\s*([^\n]{2,55})/g;const out=[],seen=new Set();let m;
  while((m=re.exec(text))){const overallRank=Number(m[1]),name=m[2].replace(/\[[^\]]*\]\([^)]*\)/g,'').trim(),pos=m[3],school=m[4].trim();const key=`${name}|${pos}`;if(name&&!seen.has(key)){seen.add(key);out.push({rank:out.length+1,overallRank,name,pos,school,source:'Tankathon reader'})}}
  return out.sort((a,b)=>a.overallRank-b.overallRank).map((x,i)=>({...x,rank:i+1}));
}
async function get(url){const r=await fetch(url,{headers:{Accept:'text/html,*/*','User-Agent':'Mozilla/5.0 DynastyTankathon/6.0'}});if(!r.ok)throw new Error(`${r.status}`);return r.text()}
module.exports = async function handler(req,res){
  let prospects=[],mode='live',detail='';
  try{prospects=parseHtml(await get(SOURCE));if(prospects.length<8)throw new Error(`parsed ${prospects.length}`)}catch(e1){detail=`direct: ${e1.message}`;try{prospects=parseReader(await get(READER));if(prospects.length<8)throw new Error(`parsed ${prospects.length}`);mode='reader'}catch(e2){detail+=`; reader: ${e2.message}`;prospects=SNAPSHOT;mode='snapshot'}}
  res.setHeader('Cache-Control','s-maxage=21600, stale-while-revalidate=86400');res.status(200).json({source:'Tankathon',sourceUrl:SOURCE,draftClass:'2027',positions:[...ALLOWED],mode,detail,count:prospects.length,prospects});
}
