const BASE='https://api.sleeper.app/v1';
const ALLOWED_PREFIXES=['/league/','/players/','/state/','/draft/'];
module.exports = async function handler(req,res){
  try{
    const path=String(req.query.path||'');
    if(!path.startsWith('/')||!ALLOWED_PREFIXES.some(p=>path.startsWith(p))) return res.status(400).json({error:'Invalid Sleeper path'});
    const r=await fetch(`${BASE}${path}`,{headers:{Accept:'application/json','User-Agent':'DynastyTankathon/6.0'}});
    const text=await r.text();
    res.setHeader('Cache-Control', path.startsWith('/players/')?'s-maxage=21600, stale-while-revalidate=86400':'s-maxage=60, stale-while-revalidate=300');
    res.status(r.status).send(text);
  }catch(e){res.status(502).json({error:'Sleeper proxy failed',detail:String(e?.message||e)})}
}
