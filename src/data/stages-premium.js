function freezeAnchors(items){
  return Object.freeze(items.map(item=>Object.freeze({...item})));
}

const NEON_RUINS=Object.freeze({
  id:'neon-ruins',
  name:'NEON RUINS',
  motif:'city',
  surface:'#07101b',
  grid:'#10273a',
  gridAccent:'#173b52',
  accent:'#56dfff',
  secondary:'#b35cff',
  danger:'#ff5f8e',
  warm:'#ffc35e',
  border:'#447da3',
  borderHot:'#9eeaff',
  haze:'#153a52',
  hazeAlpha:.16,
  rainDensity:.62,
  roadBands:freezeAnchors([
    {x:.00,y:.45,w:1.00,h:.11,axis:'x'},
    {x:.25,y:.00,w:.10,h:1.00,axis:'y'},
    {x:.69,y:.00,w:.075,h:1.00,axis:'y'},
    {x:.00,y:.16,w:1.00,h:.052,axis:'x'}
  ]),
  neonPanels:freezeAnchors([
    {x:.06,y:.08,w:.11,h:.028,color:'#56dfff'},
    {x:.18,y:.28,w:.075,h:.022,color:'#ff5f8e'},
    {x:.40,y:.09,w:.10,h:.025,color:'#b35cff'},
    {x:.58,y:.30,w:.085,h:.022,color:'#56dfff'},
    {x:.77,y:.10,w:.13,h:.026,color:'#ffc35e'},
    {x:.84,y:.66,w:.09,h:.024,color:'#ff5f8e'},
    {x:.46,y:.77,w:.12,h:.026,color:'#56dfff'},
    {x:.10,y:.72,w:.10,h:.024,color:'#b35cff'}
  ]),
  puddles:freezeAnchors([
    {x:.08,y:.39,w:.14,h:.028,color:'#56dfff'},
    {x:.31,y:.57,w:.095,h:.022,color:'#b35cff'},
    {x:.52,y:.42,w:.13,h:.027,color:'#56dfff'},
    {x:.72,y:.58,w:.11,h:.024,color:'#ff5f8e'},
    {x:.81,y:.31,w:.10,h:.021,color:'#ffc35e'},
    {x:.17,y:.83,w:.15,h:.026,color:'#56dfff'},
    {x:.59,y:.82,w:.12,h:.024,color:'#b35cff'}
  ])
});

const RESEARCH_ZERO=Object.freeze({
  id:'research-zero',
  name:'RESEARCH ZERO',
  motif:'laboratory',
  surface:'#07131a',
  grid:'#17303a',
  gridAccent:'#255264',
  accent:'#b8efff',
  secondary:'#7da7ff',
  danger:'#ff5b67',
  warm:'#ffd16f',
  border:'#6d9aac',
  borderHot:'#e4fbff',
  haze:'#244956',
  hazeAlpha:.13,
  rainDensity:.06,
  roadBands:freezeAnchors([
    {x:.00,y:.22,w:1.00,h:.075,axis:'x'},
    {x:.00,y:.67,w:1.00,h:.085,axis:'x'},
    {x:.30,y:.00,w:.075,h:1.00,axis:'y'},
    {x:.76,y:.00,w:.065,h:1.00,axis:'y'}
  ]),
  neonPanels:freezeAnchors([
    {x:.05,y:.07,w:.14,h:.018,color:'#b8efff'},
    {x:.23,y:.14,w:.08,h:.016,color:'#ff5b67'},
    {x:.42,y:.08,w:.12,h:.020,color:'#7da7ff'},
    {x:.62,y:.16,w:.10,h:.016,color:'#b8efff'},
    {x:.81,y:.09,w:.11,h:.018,color:'#ff5b67'},
    {x:.11,y:.79,w:.13,h:.018,color:'#7da7ff'},
    {x:.48,y:.82,w:.10,h:.017,color:'#b8efff'},
    {x:.76,y:.76,w:.14,h:.020,color:'#ffd16f'}
  ]),
  puddles:freezeAnchors([
    {x:.10,y:.36,w:.11,h:.020,color:'#8eeaff'},
    {x:.26,y:.57,w:.08,h:.018,color:'#7da7ff'},
    {x:.43,y:.38,w:.13,h:.020,color:'#8eeaff'},
    {x:.63,y:.58,w:.09,h:.019,color:'#b8efff'},
    {x:.78,y:.39,w:.12,h:.020,color:'#7da7ff'},
    {x:.49,y:.90,w:.10,h:.018,color:'#8eeaff'}
  ])
});

const ASH_WASTELAND=Object.freeze({
  id:'ash-wasteland',
  name:'ASH WASTELAND',
  motif:'wasteland',
  surface:'#140b09',
  grid:'#2a1713',
  gridAccent:'#4b261b',
  accent:'#ff784d',
  secondary:'#c84538',
  danger:'#ff4545',
  warm:'#ffcf63',
  border:'#7d3927',
  borderHot:'#ffab63',
  haze:'#6b2415',
  hazeAlpha:.23,
  rainDensity:.05,
  roadBands:freezeAnchors([
    {x:.00,y:.34,w:1.00,h:.065,axis:'x'},
    {x:.00,y:.73,w:1.00,h:.050,axis:'x'},
    {x:.17,y:.00,w:.055,h:1.00,axis:'y'},
    {x:.61,y:.00,w:.09,h:1.00,axis:'y'}
  ]),
  neonPanels:freezeAnchors([
    {x:.07,y:.12,w:.08,h:.018,color:'#ff784d'},
    {x:.28,y:.20,w:.10,h:.020,color:'#ffcf63'},
    {x:.45,y:.08,w:.07,h:.016,color:'#c84538'},
    {x:.66,y:.23,w:.12,h:.020,color:'#ff784d'},
    {x:.83,y:.12,w:.08,h:.018,color:'#ffcf63'},
    {x:.14,y:.82,w:.11,h:.020,color:'#c84538'},
    {x:.52,y:.84,w:.09,h:.018,color:'#ff784d'},
    {x:.78,y:.72,w:.13,h:.022,color:'#ffcf63'}
  ]),
  puddles:freezeAnchors([
    {x:.06,y:.48,w:.15,h:.030,color:'#7d2b20'},
    {x:.24,y:.62,w:.11,h:.024,color:'#a53725'},
    {x:.41,y:.44,w:.14,h:.028,color:'#ff784d'},
    {x:.59,y:.59,w:.16,h:.031,color:'#7d2b20'},
    {x:.77,y:.46,w:.12,h:.026,color:'#a53725'},
    {x:.34,y:.88,w:.13,h:.027,color:'#ff9a4f'},
    {x:.68,y:.87,w:.10,h:.023,color:'#7d2b20'}
  ])
});

const VOID_SECTOR=Object.freeze({
  id:'void-sector',
  name:'VOID SECTOR',
  motif:'void',
  surface:'#080610',
  grid:'#1b1230',
  gridAccent:'#332054',
  accent:'#c768ff',
  secondary:'#745cff',
  danger:'#ff4fd8',
  warm:'#8fe9ff',
  border:'#56327b',
  borderHot:'#df9bff',
  haze:'#3d155b',
  hazeAlpha:.29,
  rainDensity:.12,
  roadBands:freezeAnchors([
    {x:.00,y:.26,w:1.00,h:.055,axis:'x'},
    {x:.00,y:.62,w:1.00,h:.070,axis:'x'},
    {x:.36,y:.00,w:.060,h:1.00,axis:'y'},
    {x:.79,y:.00,w:.048,h:1.00,axis:'y'}
  ]),
  neonPanels:freezeAnchors([
    {x:.08,y:.10,w:.09,h:.020,color:'#c768ff'},
    {x:.22,y:.31,w:.07,h:.017,color:'#745cff'},
    {x:.39,y:.12,w:.12,h:.022,color:'#ff4fd8'},
    {x:.57,y:.27,w:.08,h:.018,color:'#c768ff'},
    {x:.76,y:.11,w:.13,h:.023,color:'#8fe9ff'},
    {x:.85,y:.68,w:.07,h:.018,color:'#ff4fd8'},
    {x:.48,y:.80,w:.11,h:.021,color:'#745cff'},
    {x:.12,y:.75,w:.10,h:.020,color:'#c768ff'}
  ]),
  puddles:freezeAnchors([
    {x:.05,y:.41,w:.13,h:.028,color:'#5c2e84'},
    {x:.27,y:.54,w:.10,h:.023,color:'#745cff'},
    {x:.47,y:.46,w:.15,h:.031,color:'#c768ff'},
    {x:.69,y:.54,w:.12,h:.026,color:'#5c2e84'},
    {x:.80,y:.35,w:.11,h:.025,color:'#ff4fd8'},
    {x:.18,y:.88,w:.14,h:.028,color:'#745cff'},
    {x:.58,y:.86,w:.13,h:.027,color:'#5c2e84'}
  ])
});

const STAGES=Object.freeze({
  'neon-ruins':NEON_RUINS,
  'research-zero':RESEARCH_ZERO,
  'ash-wasteland':ASH_WASTELAND,
  'void-sector':VOID_SECTOR
});

export function resolveStageEnvironmentId({limitBreakLevel=0}={}){
  const raw=Number(limitBreakLevel);
  if(!Number.isFinite(raw)||raw<0)return 'neon-ruins';
  const lb=Math.floor(raw);
  if(lb>=10)return 'void-sector';
  if(lb>=5)return 'ash-wasteland';
  if(lb>=3)return 'research-zero';
  return 'neon-ruins';
}

export function getStageTransitionCue({fromLimitBreak=0,toLimitBreak=0}={}){
  const fromRaw=Number(fromLimitBreak);
  const toRaw=Number(toLimitBreak);
  if(!Number.isFinite(fromRaw)||!Number.isFinite(toRaw))return null;
  const from=Math.floor(fromRaw),to=Math.floor(toRaw);
  if(from<0||to<0||to<=from)return null;
  const fromId=resolveStageEnvironmentId({limitBreakLevel:from});
  const toId=resolveStageEnvironmentId({limitBreakLevel:to});
  if(fromId===toId)return null;
  const stage=getStageEnvironment(toId);
  return Object.freeze({
    title:'SECTOR SHIFT',
    stageId:stage.id,
    stageName:stage.name,
    color:stage.accent,
    fromLimitBreak:from,
    toLimitBreak:to,
    delayMs:300,
    displayMs:560
  });
}

export function getStageEnvironment(id='neon-ruins'){
  return STAGES[id]||NEON_RUINS;
}

export function listStageEnvironments(){
  return Object.freeze(Object.keys(STAGES));
}
