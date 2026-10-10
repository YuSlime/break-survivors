const NORMAL_CLUTTER_LIMIT=18;
const CRITICAL_CLUTTER_LIMIT=36;

function formatDamage(value){
  return Math.max(1,Math.ceil(Number(value)||0)).toLocaleString('en-US');
}

export function resolveDamageNumber({damage=0,crit=false,existingCount=0,impact=true}={}){
  const amount=Number(damage);
  if(!impact||!Number.isFinite(amount)||amount<=0)return null;

  const count=Math.max(0,Math.floor(Number(existingCount)||0));
  if(crit){
    if(count>=CRITICAL_CLUTTER_LIMIT)return null;
    return Object.freeze({
      kind:'critical',
      text:formatDamage(amount)+'!',
      color:'#fff06c',
      life:.52,
      vy:-64,
      size:18,
      weight:1000,
      shadow:14
    });
  }

  if(count>=NORMAL_CLUTTER_LIMIT)return null;
  return Object.freeze({
    kind:'normal',
    text:formatDamage(amount),
    color:'#dbe9ff',
    life:.34,
    vy:-46,
    size:12,
    weight:800,
    shadow:6
  });
}
