/* Court47 v0.5: experimental camera shot-motion events, not basket detection. */
(()=>{const el=id=>document.getElementById(id);let phase='idle',armedAt=0,lastEvent=0,shots=[];const key='court47_motion_v1';
try{const old=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(old))shots=old}catch{}
const show=()=>{const a=el('motionCount'),b=el('motionLast');if(a)a.textContent=shots.length;if(b)b.textContent=shots.length?new Date(shots[shots.length-1].time).toLocaleTimeString():'—'};
function observe(p,angles,time){if(!p||!el('form')||el('form').hidden)return;const right=(p[16].visibility??0)>.55&&(p[14].visibility??0)>.55&&(p[12].visibility??0)>.55;const left=(p[15].visibility??0)>.55&&(p[13].visibility??0)>.55&&(p[11].visibility??0)>.55;
let side=right?{w:p[16],s:p[12],e:angles.right,label:'правая'}:left?{w:p[15],s:p[11],e:angles.left,label:'левая'}:null;
if(!side){phase='idle';return}
const high=side.w.y<side.s.y-.055;const extended=side.e>145;
if(phase==='idle'&&high&&!extended&&time-lastEvent>1600){phase='armed';armedAt=time;el('motionPhase').textContent='Рука поднята — ожидаю выпрямления'}
else if(phase==='armed'){
if(time-armedAt>1700){phase='idle';el('motionPhase').textContent='Ожидаю броскового движения'}
else if(high&&extended&&time-armedAt>130){
lastEvent=time;phase='cooldown';const item={time:Date.now(),arm:side.label,elbow:side.e};
shots.push(item);if(shots.length>150)shots.shift();try{localStorage.setItem(key,JSON.stringify(shots))}catch{}
show();el('motionPhase').textContent='🏀 Возможный выпуск мяча · '+side.label+' рука · локоть ≈'+side.e+'°';
el('motionAdvice').textContent='Движение руки обнаружено. Это ещё не подтверждение броска или попадания. Снимай сбоку, чтобы локоть был хорошо виден.';
}}
else if(phase==='cooldown'&&time-lastEvent>1600){phase='idle';el('motionPhase').textContent='Готово к следующему движению'}
}
window.court47Shot={observe,reset(){shots=[];phase='idle';try{localStorage.removeItem(key)}catch{}show();el('motionPhase').textContent='Ожидаю броскового движения'}};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',show);else show();
})();