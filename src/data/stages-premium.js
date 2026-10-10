function freezeAnchors(items){
  return Object.freeze(items.map(item=>Object.freeze({...item})));
}

const NEON_RUINS=Object.freeze({
  id:'neon-ruins',
  name:'NEON RUINS',
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

const STAGES=Object.freeze({'neon-ruins':NEON_RUINS});

export function getStageEnvironment(id='neon-ruins'){
  return STAGES[id]||NEON_RUINS;
}

export function listStageEnvironments(){
  return Object.freeze(Object.keys(STAGES));
}
