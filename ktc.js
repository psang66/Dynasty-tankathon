const SOURCE='https://keeptradecut.com/dynasty-rankings';
const READER='https://r.jina.ai/http://keeptradecut.com/dynasty-rankings';
function cleanName(s=''){return s.replace(/\s+/g,' ').trim()}
function valObj(v={}){return {value:Number(v.value||v.overallValue||0),rank:Number(v.rank||v.overallRank||0),positionalRank:Number(v.positionalRank||0),trend:Number(v.overallTrend||v.trend||0)}}
function normalize(raw){
  const name=cleanName(raw.playerName||raw.player_name||raw.name||'');
  const position=String(raw.position||raw.pos||'').toUpperCase();
  if(!name||!['QB','RB','WR','TE','PICK','RDP'].includes(position))return null;
  const one=raw.oneQBValues||raw.oneQbValues||raw.one_qb||raw.oneQB||raw.values?.oneQB||{};
  const sf=raw.superflexValues||raw.superFlexValues||raw.superflex||raw.sf||raw.values?.superflex||{};
  return {id:String(raw.playerID||raw.playerId||raw.id||name),name,position:position==='RDP'?'PICK':position,team:raw.team||'',age:raw.age??null,slug:raw.slug||'',oneQB:valObj(one),superflex:valObj(sf)};
}
function parsePlayersArray(html=''){
  const marker=/playersArray\s*=\s*/g;const m=marker.exec(html);if(!m)return [];
  let i=m.index+m[0].length,depth=0,start=-1,inStr=false,quote='',esc=false;
  for(;i<html.length;i++){
    const c=html[i]; if(inStr){if(esc){esc=false;continue}if(c==='\\'){esc=true;continue}if(c===quote){inStr=false}continue}
    if(c==='"'||c==="'"||c==='`'){inStr=true;quote=c;continue}
    if(c==='['){if(start<0)start=i;depth++} else if(c===']'){depth--;if(start>=0&&depth===0){const src=html.slice(start,i+1);try{return JSON.parse(src).map(normalize).filter(Boolean)}catch{return []}}}
  }
  return [];
}
function parseReader(text=''){
  const lines=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean),out=[];
  for(let i=0;i<lines.length-5;i++){
    if(/^\d+$/.test(lines[i])&&/\b(QB|RB|WR|TE)\d+\b/.test(lines[i+2]||'')){
      const rank=Number(lines[i]);const nm=(lines[i+1]||'').replace(/^\[[^\]]+\]\([^)]*\)\s*/,'').trim();const pos=(lines[i+2].match(/(QB|RB|WR|TE)/)||[])[1];
      let value=0;for(let j=i+3;j<Math.min(lines.length,i+10);j++){if(/^\d{3,4}$/.test(lines[j])) value=Number(lines[j])}
      if(nm&&pos&&value)out.push({id:`reader-${rank}-${nm}`,name:nm.replace(/[A-Z]{2,3}$/,'').trim(),position:pos,team:'',age:null,slug:'',oneQB:{value,rank,positionalRank:0,trend:0},superflex:{value,rank,positionalRank:0,trend:0}})
    }
  }
  return out;
}
async function fetchText(url){const r=await fetch(url,{headers:{Accept:'text/html,*/*','User-Agent':'Mozilla/5.0 DynastyTankathon/6.0'}});if(!r.ok)throw new Error(`${url} ${r.status}`);return r.text()}
module.exports = async function handler(req,res){
  let players=[],mode='live',detail='';
  try{const html=await fetchText(SOURCE);players=parsePlayersArray(html);if(players.length<100)throw new Error(`playersArray parse produced ${players.length}`)}catch(e1){detail=String(e1.message||e1);try{const t=await fetchText(READER);players=parseReader(t);if(players.length<20)throw new Error(`reader parse produced ${players.length}`);mode='reader'}catch(e2){detail+=`; ${String(e2.message||e2)}`;mode='unavailable';players=[]}}
  res.setHeader('Cache-Control','s-maxage=3600, stale-while-revalidate=21600');res.status(200).json({source:'KeepTradeCut',sourceUrl:SOURCE,mode,detail,count:players.length,players});
}
