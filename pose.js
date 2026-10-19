/* Court47 Pose Lab v0.4 — on-device experimental landmark tracking */
(()=>{let landmarker=null, busy=false, last=0, samples=0;
const $=id=>document.getElementById(id);
const status=()=> $('poseStatus');
const canvas=()=> $('poseCanvas');
const connections=[[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];
function angle(a,b,c){const u=[a.x-b.x,a.y-b.y],v=[c.x-b.x,c.y-b.y];let n=(u[0]*v[0]+u[1]*v[1])/(Math.hypot(...u)*Math.hypot(...v)||1);return Math.round(Math.acos(Math.min(1,Math.max(-1,n)))*180/Math.PI)}
let raf=0, active=false, gen=0;
async function load(){
if(landmarker)return;
status().textContent='Загрузка модели позы (требуется интернет)...';
const mod=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/+esm');
const vision=await mod.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm');
landmarker=await mod.PoseLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',delegate:'CPU'},runningMode:'VIDEO',numPoses:1});
}
function draw(points,w,h){const c=canvas(),ctx=c.getContext('2d');c.width=w;c.height=h;ctx.clearRect(0,0,w,h);if(!points)return;ctx.strokeStyle='#b873ff';ctx.lineWidth=4;for(let [a,b] of connections){if((points[a].visibility??1)<.5||(points[b].visibility??1)<.5)continue;ctx.beginPath();ctx.moveTo(points[a].x*w,points[a].y*h);ctx.lineTo(points[b].x*w,points[b].y*h);ctx.stroke()}ctx.fillStyle='#53f8d4';for(let n of [11,12,13,14,15,16,23,24,25,26,27,28]){let p=points[n];if((p.visibility??1)<.5)continue;ctx.beginPath();ctx.arc(p.x*w,p.y*h,5,0,7);ctx.fill()}}
function loop(token){if(!active||token!==gen)return;raf=requestAnimationFrame(()=>loop(token));const v=$('camera');if(!v||v.readyState<2||busy||performance.now()-last<115)return;busy=true;last=performance.now();try{const res=landmarker.detectForVideo(v,last),pts=res.landmarks?.[0];draw(pts,v.videoWidth,v.videoHeight);if(!pts){status().textContent='Покажи фигуру целиком в кадре';return}const l=angle(pts[11],pts[13],pts[15]),r=angle(pts[12],pts[14],pts[16]);if(!Number.isFinite(l)||!Number.isFinite(r))return;const visible=(pts[11].visibility??1)>.5&&(pts[12].visibility??1)>.5; if(!visible){status().textContent='Плечи должны быть видны';return}samples++;$('poseAngles').textContent='Левый локоть: '+l+'° · Правый локоть: '+r+'°';status().textContent='Отслеживание позы активно · кадры: '+samples; }catch(e){status().textContent='Ошибка модели: '+e.message}finally{busy=false}}
window.court47Pose={async start(){const v=$('camera');if(!v.srcObject){status().textContent='Сначала включи камеру';return}try{await load();active=true;gen++;loop(gen);$('poseStart').disabled=true;$('poseStop').disabled=false}catch(e){status().textContent='Не удалось загрузить модель: '+e.message}},stop(){active=false;gen++;cancelAnimationFrame(raf);const c=canvas();if(c)c.getContext('2d').clearRect(0,0,c.width,c.height);$('poseStart').disabled=false;$('poseStop').disabled=true;status().textContent='Анализ остановлен'}}})();
