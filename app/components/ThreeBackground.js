'use client';
import{useEffect,useRef}from'react';
export default function ThreeBackground(){
const ref=useRef(null);
useEffect(()=>{let aId;const go=async()=>{
const T=await import('three');const cv=ref.current;if(!cv)return;
const P=cv.parentElement,W=P.clientWidth,H=P.clientHeight,m=window.innerWidth<680;
let th=document.documentElement.getAttribute('data-theme')||'light';
const cam=new T.PerspectiveCamera(50,W/H,0.1,300);cam.position.set(0,3,20);cam.lookAt(0,0,0);
const R=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:true});R.setSize(W,H);R.setPixelRatio(Math.min(window.devicePixelRatio,2));R.shadowMap.enabled=true;

const build=(dk)=>{
const sc=new T.Scene();sc.fog=new T.Fog(dk?0x0C1020:0xC0DDF0,20,80);
const o={balloonG:null,birds:[],bflies:[],cel:null,pts:null,clouds:[],trees:[],rabbits:[]};
sc.add(new T.AmbientLight(dk?0x1A2040:0xFFF8E8,dk?0.5:0.8));
const dl=new T.DirectionalLight(dk?0x4466AA:0xFFE8C0,dk?0.4:0.9);dl.position.set(dk?8:-6,12,5);sc.add(dl);
if(dk){const pl=new T.PointLight(0x6688CC,0.4,50);pl.position.set(8,10,-5);sc.add(pl);}

// Sky dome
const sC=document.createElement('canvas');sC.width=2;sC.height=256;
const cx=sC.getContext('2d'),gr=cx.createLinearGradient(0,0,0,256);
if(dk){gr.addColorStop(0,'#040610');gr.addColorStop(0.5,'#0C1428');gr.addColorStop(1,'#101830');}
else{gr.addColorStop(0,'#4A9CE8');gr.addColorStop(0.4,'#80C8F0');gr.addColorStop(0.8,'#C0E0F0');gr.addColorStop(1,'#E0ECD8');}
cx.fillStyle=gr;cx.fillRect(0,0,2,256);
sc.add(new T.Mesh(new T.SphereGeometry(90,16,16),new T.MeshBasicMaterial({map:new T.CanvasTexture(sC),side:T.BackSide})));

// Sun/Moon
const cR=dk?1:1.6;const cel=new T.Mesh(new T.SphereGeometry(cR,20,20),new T.MeshBasicMaterial({color:dk?0xE0DCF0:0xFFE066}));
cel.position.set(dk?15:-16,15,-35);sc.add(cel);o.cel=cel;
const gs=new T.SpriteMaterial({color:dk?0xBBBBDD:0xFFDD44,transparent:true,opacity:dk?0.12:0.18});
const gl=new T.Sprite(gs);gl.scale.set(cR*7,cR*7,1);gl.position.copy(cel.position);sc.add(gl);

// Stars
if(dk){const sN=m?150:350,sP=new Float32Array(sN*3);for(let i=0;i<sN;i++){sP[i*3]=(Math.random()-.5)*120;sP[i*3+1]=Math.random()*50+5;sP[i*3+2]=-25-Math.random()*50;}
const sG=new T.BufferGeometry();sG.setAttribute('position',new T.BufferAttribute(sP,3));o.pts=new T.Points(sG,new T.PointsMaterial({color:0xEEEEFF,size:0.15,transparent:true,opacity:0.8}));sc.add(o.pts);}

// Ground
const gG=new T.PlaneGeometry(140,100);gG.rotateX(-Math.PI/2);
const gnd=new T.Mesh(gG,new T.MeshStandardMaterial({color:dk?0x0A1018:0x4A7830,roughness:0.95}));gnd.position.y=-2;sc.add(gnd);

// === REALISTIC MOUNTAINS (ConeGeometry with ridged noise) ===
for(let i=0;i<(m?5:9);i++){
  const mH=5+Math.random()*8,mR=4+Math.random()*5;
  const mGeo=new T.ConeGeometry(mR,mH,8+Math.floor(Math.random()*4),4);
  // Distort vertices for realism
  const pos=mGeo.attributes.position;
  for(let v=0;v<pos.count;v++){
    const y=pos.getY(v);if(y>-mH/2+0.1){
      const noiseX=(Math.random()-.5)*mR*0.25;const noiseZ=(Math.random()-.5)*mR*0.25;
      pos.setX(v,pos.getX(v)+noiseX*(1-y/mH));pos.setZ(v,pos.getZ(v)+noiseZ*(1-y/mH));
    }
  }
  mGeo.computeVertexNormals();
  const mtn=new T.Mesh(mGeo,new T.MeshStandardMaterial({color:dk?new T.Color().setHSL(.6,.15,.06+Math.random()*.03):new T.Color().setHSL(.28+Math.random()*.05,.3,.25+Math.random()*.1),roughness:.9,flatShading:true}));
  mtn.position.set((i-4)*8+(Math.random()-.5)*4,-2,-20-Math.random()*20);sc.add(mtn);
  // Snow cap
  if(mH>8){const capG=new T.ConeGeometry(mR*.3,mH*.2,8);
    const cap=new T.Mesh(capG,new T.MeshStandardMaterial({color:dk?0xC0C8D8:0xF0F0FF,roughness:.7,flatShading:true}));
    cap.position.set(mtn.position.x,mtn.position.y+mH*.42,mtn.position.z);sc.add(cap);}
}
// Smaller foreground hills
for(let h=0;h<(m?3:5);h++){const hR=5+Math.random()*4;
  const hill=new T.Mesh(new T.SphereGeometry(hR,10,6,0,Math.PI*2,0,Math.PI/2),
    new T.MeshStandardMaterial({color:dk?new T.Color().setHSL(.3,.15,.05):new T.Color().setHSL(.27,.45,.25+h*.04),roughness:.95}));
  hill.scale.y=.35;hill.position.set((h-2)*11+(Math.random()-.5)*5,-2,-10-h*3);sc.add(hill);}

// Trees
const tC=m?15:35;for(let i=0;i<tC;i++){const tx=(Math.random()-.5)*55,tz=-3-Math.random()*25,tH=1+Math.random()*2.5;
  sc.add(new T.Mesh(new T.CylinderGeometry(.06,.1,tH,6),new T.MeshStandardMaterial({color:dk?0x151E28:0x6A5030})).translateX(tx).translateY(-2+tH/2).translateZ(tz));
  const cr=.5+Math.random()*.8;const crown=new T.Mesh(new T.SphereGeometry(cr,8,6),new T.MeshStandardMaterial({color:dk?new T.Color().setHSL(.3,.2,.04+Math.random()*.03):new T.Color().setHSL(.24+Math.random()*.12,.5,.28+Math.random()*.15),roughness:.85}));
  crown.position.set(tx,-2+tH+cr*.4,tz);sc.add(crown);crown.userData={bx:tx,sw:.08+Math.random()*.12,fr:.4+Math.random()*.6};o.trees.push(crown);}

// Flowers/mushrooms
for(let i=0;i<(m?8:20);i++){const fx=(Math.random()-.5)*40,fz=(Math.random()-.5)*18;
  if(!dk){sc.add(new T.Mesh(new T.CylinderGeometry(.015,.015,.25,4),new T.MeshStandardMaterial({color:0x4A8030})).translateX(fx).translateY(-1.87).translateZ(fz));
    sc.add(new T.Mesh(new T.SphereGeometry(.06,6,4),new T.MeshStandardMaterial({color:[0xE84050,0xE8C040,0xD050D0,0x5080E8,0xFF8030][i%5]})).translateX(fx).translateY(-1.72).translateZ(fz));}
  else{sc.add(new T.Mesh(new T.CylinderGeometry(.025,.035,.12,5),new T.MeshStandardMaterial({color:0xC0B890})).translateX(fx).translateY(-1.94).translateZ(fz));
    sc.add(new T.Mesh(new T.SphereGeometry(.06,6,4,0,Math.PI*2,0,Math.PI/2),new T.MeshStandardMaterial({color:[0x3A6848,0x4A3060,0x2A4880][i%3],emissive:[0x1A3020,0x201828,0x101838][i%3],emissiveIntensity:.3})).translateX(fx).translateY(-1.88).translateZ(fz));}}

// Clouds/fireflies
if(!dk){for(let i=0;i<(m?3:8);i++){const cG=new T.Group();const cM=new T.MeshBasicMaterial({color:0xFFFFFF,transparent:true,opacity:.65});
  for(let b=0;b<5+Math.floor(Math.random()*4);b++){cG.add(new T.Mesh(new T.SphereGeometry(.4+Math.random()*.5,7,5),cM).translateX(b*.5-1).translateY((Math.random()-.5)*.3).translateZ((Math.random()-.5)*.3));}
  cG.position.set((Math.random()-.5)*50,9+Math.random()*6,-15-Math.random()*20);cG.userData={drift:.012+Math.random()*.01};sc.add(cG);o.clouds.push(cG);}}
else{const fC=m?50:100,fP=new Float32Array(fC*3);for(let i=0;i<fC;i++){fP[i*3]=(Math.random()-.5)*50;fP[i*3+1]=Math.random()*6-1;fP[i*3+2]=(Math.random()-.5)*30;}
  const fG=new T.BufferGeometry();fG.setAttribute('position',new T.BufferAttribute(fP,3));
  const ff=new T.Points(fG,new T.PointsMaterial({color:0xF0E880,size:.14,transparent:true,opacity:.6}));ff.userData={ff:true};sc.add(ff);o.clouds.push(ff);}

// Birds
for(let i=0;i<(m?5:12);i++){const bG=new T.Group();bG.add(new T.Mesh(new T.SphereGeometry(.07,6,4),new T.MeshStandardMaterial({color:dk?0x111118:0x3A3020})));
  const wM=new T.MeshStandardMaterial({color:dk?0x181820:[0x4A3828,0x2A2A28,0x5A4030][i%3],side:T.DoubleSide});
  const lw=new T.Mesh(new T.PlaneGeometry(.22,.07),wM);lw.position.x=-.13;lw.userData={wing:-1};bG.add(lw);
  const rw=new T.Mesh(new T.PlaneGeometry(.22,.07),wM);rw.position.x=.13;rw.userData={wing:1};bG.add(rw);
  bG.position.set((Math.random()-.5)*40,6+Math.random()*8,-5-Math.random()*20);bG.userData={spd:.03+Math.random()*.05,ws:5+Math.random()*5,ph:Math.random()*6.28,by:bG.position.y};sc.add(bG);o.birds.push(bG);}

// Butterflies (day)
if(!dk){for(let i=0;i<(m?4:10);i++){const bf=new T.Group();bf.add(new T.Mesh(new T.CylinderGeometry(.008,.008,.06,4),new T.MeshStandardMaterial({color:0x222222})));bf.children[0].rotation.z=Math.PI/2;
  const wC=[0xE84080,0x40A0E8,0xE8C040,0x80E840,0xE080E0][i%5];
  const l=new T.Mesh(new T.CircleGeometry(.05,6),new T.MeshStandardMaterial({color:wC,side:T.DoubleSide,transparent:true,opacity:.8}));l.position.y=.035;l.userData={wing:-1};bf.add(l);
  const r=new T.Mesh(new T.CircleGeometry(.05,6),new T.MeshStandardMaterial({color:wC,side:T.DoubleSide,transparent:true,opacity:.8}));r.position.y=-.035;r.userData={wing:1};bf.add(r);
  bf.position.set((Math.random()-.5)*25,Math.random()*4,(Math.random()-.5)*15);bf.userData={cx:bf.position.x,cy:bf.position.y,cz:bf.position.z,rx:2+Math.random()*3,ry:.5+Math.random(),rz:1+Math.random()*2,sp:.2+Math.random()*.4,ws:8+Math.random()*6,ph:Math.random()*6.28};sc.add(bf);o.bflies.push(bf);}}

// Rabbits
for(let i=0;i<(m?2:5);i++){const rG=new T.Group();
  rG.add(new T.Mesh(new T.SphereGeometry(.12,7,5),new T.MeshStandardMaterial({color:dk?0x888898:0xD0C0A0})));
  const hd=new T.Mesh(new T.SphereGeometry(.08,6,4),new T.MeshStandardMaterial({color:dk?0x9090A0:0xD8CCA8}));hd.position.set(.1,.1,0);rG.add(hd);
  rG.add(new T.Mesh(new T.CylinderGeometry(.015,.02,.1,4),new T.MeshStandardMaterial({color:dk?0xA0A0B0:0xE0D0B0})).translateX(.1).translateY(.2).translateZ(.03));
  rG.add(new T.Mesh(new T.CylinderGeometry(.015,.02,.1,4),new T.MeshStandardMaterial({color:dk?0xA0A0B0:0xE0D0B0})).translateX(.1).translateY(.2).translateZ(-.03));
  rG.position.set((Math.random()-.5)*30,-1.88,(Math.random()-.5)*15);rG.userData={bx:rG.position.x,bz:rG.position.z,sp:.8+Math.random()*1.2,ph:Math.random()*6.28,hh:.15+Math.random()*.1};sc.add(rG);o.rabbits.push(rG);}

// === HOT AIR BALLOON (replaces bike) ===
const bG=new T.Group();
// Envelope (balloon)
const envGeo=new T.SphereGeometry(1.2,12,10);
const envC=document.createElement('canvas');envC.width=64;envC.height=64;const ec=envC.getContext('2d');
const stripes=dk?['#3A5888','#2A4068','#4A6898','#2A4068']:['#E84040','#E8A030','#E8D840','#40A0E8'];
for(let s=0;s<8;s++){ec.fillStyle=stripes[s%stripes.length];ec.fillRect(0,s*8,64,8);}
const envMat=new T.MeshStandardMaterial({map:new T.CanvasTexture(envC),roughness:.6});
const env=new T.Mesh(envGeo,envMat);env.scale.set(1,1.3,1);env.position.y=2;bG.add(env);
// Basket
const basket=new T.Mesh(new T.BoxGeometry(.5,.35,.5),new T.MeshStandardMaterial({color:dk?0x4A3828:0x8A6030,roughness:.8}));
basket.position.y=.3;bG.add(basket);
// Ropes
const rM=new T.MeshBasicMaterial({color:dk?0x607090:0x6A5030});
[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{
  const rope=new T.Mesh(new T.CylinderGeometry(.01,.01,1.5,4),rM);
  rope.position.set(sx*.2,.95,sz*.2);rope.rotation.z=sx*-.12;rope.rotation.x=sz*.12;bG.add(rope);});
// Turtle passenger
const tG=new T.Group();
tG.add(new T.Mesh(new T.SphereGeometry(.2,8,6),new T.MeshStandardMaterial({color:dk?0x2A6838:0x3A8848,roughness:.7})));
tG.children[0].scale.set(1,.6,.8);
const thd=new T.Mesh(new T.SphereGeometry(.09,7,5),new T.MeshStandardMaterial({color:dk?0x40A040:0x55B848}));thd.position.set(.2,.08,0);tG.add(thd);
tG.add(new T.Mesh(new T.SphereGeometry(.018,5,4),new T.MeshBasicMaterial({color:0x111111})).translateX(.26).translateY(.13).translateZ(.04));
tG.add(new T.Mesh(new T.SphereGeometry(.018,5,4),new T.MeshBasicMaterial({color:0x111111})).translateX(.26).translateY(.13).translateZ(-.04));
tG.add(new T.Mesh(new T.SphereGeometry(.007,4,3),new T.MeshBasicMaterial({color:0xFFFFFF})).translateX(.27).translateY(.15).translateZ(.04));
const capM=new T.MeshStandardMaterial({color:dk?0xC8A030:0xE84030});
tG.add(new T.Mesh(new T.CylinderGeometry(.06,.08,.04,8),capM).translateX(.18).translateY(.2));
tG.add(new T.Mesh(new T.CylinderGeometry(.035,.06,.06,8),capM).translateX(.18).translateY(.25));
tG.position.set(0,.5,0);tG.scale.set(.5,.5,.5);bG.add(tG);

bG.position.set(0,4,0);bG.scale.set(.8,.8,.8);sc.add(bG);o.balloonG=bG;
return{scene:sc,o};};

const light=build(false),dark=build(true);
const ms={x:0,y:0};window.addEventListener('mousemove',(e)=>{ms.x=(e.clientX/W-.5)*2;ms.y=-(e.clientY/H-.5)*2;});
const onR=()=>{const w=P.clientWidth,h=P.clientHeight;cam.aspect=w/h;cam.updateProjectionMatrix();R.setSize(w,h);};
window.addEventListener('resize',onR);
const obs=new MutationObserver(()=>{th=document.documentElement.getAttribute('data-theme')||'light';});
obs.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});

let t=0,ba={light:0,dark:0};
const anim=(o,k)=>{
  ba[k]+=.003;const a=ba[k];
  const r=10+Math.sin(a*2)*5;
  o.balloonG.position.x=Math.cos(a)*r;o.balloonG.position.z=Math.sin(a)*r;
  o.balloonG.position.y=4+Math.sin(t*.5)*1.2+Math.cos(t*.3)*.5;
  o.balloonG.rotation.y=a+Math.PI;
  // Gentle sway
  o.balloonG.children[0].rotation.z=Math.sin(t*.8)*.05;
  o.birds.forEach(b=>{b.position.x+=b.userData.spd;if(b.position.x>28)b.position.x=-28;b.position.y=b.userData.by+Math.sin(t*1.5+b.userData.ph)*.6;b.children.forEach(c=>{if(c.userData.wing)c.rotation.x=Math.sin(t*b.userData.ws+b.userData.ph)*.7*c.userData.wing;});});
  o.bflies.forEach(bf=>{const d=bf.userData;bf.position.x=d.cx+Math.sin(t*d.sp+d.ph)*d.rx;bf.position.y=d.cy+Math.sin(t*d.sp*1.3+d.ph)*d.ry;bf.position.z=d.cz+Math.cos(t*d.sp*.7+d.ph)*d.rz;bf.rotation.y=Math.sin(t*d.sp+d.ph)*.5;bf.children.forEach(c=>{if(c.userData.wing)c.rotation.x=Math.sin(t*d.ws)*.8*c.userData.wing;});});
  o.clouds.forEach(c=>{if(c.userData.drift){c.position.x+=c.userData.drift;if(c.position.x>30)c.position.x=-30;}if(c.userData.ff){const p=c.geometry.attributes.position;for(let i=0;i<p.count;i++){p.array[i*3]+=Math.sin(t*.5+i)*.005;p.array[i*3+1]+=Math.cos(t*.7+i*.3)*.004;}p.needsUpdate=true;c.material.opacity=.3+Math.sin(t*1.2)*.3;}});
  o.trees.forEach(c=>{if(c.userData.bx!==undefined)c.position.x=c.userData.bx+Math.sin(t*c.userData.fr)*c.userData.sw;});
  if(o.pts)o.pts.material.opacity=.5+Math.sin(t*.8)*.3;
  o.rabbits.forEach(r=>{const d=r.userData;r.position.y=-1.88+Math.abs(Math.sin(t*d.sp+d.ph))*d.hh;r.position.x=d.bx+Math.sin(t*d.sp*.3+d.ph)*2;r.position.z=d.bz+Math.cos(t*d.sp*.2+d.ph)*1.5;});
};

const loop=()=>{aId=requestAnimationFrame(loop);t+=.016;
  cam.position.x+=(ms.x*2-cam.position.x)*.008;cam.position.y+=(3+ms.y*1-cam.position.y)*.008;cam.lookAt(0,0,0);
  const dk=th==='dark',cur=dk?dark:light;anim(cur.o,dk?'dark':'light');R.render(cur.scene,cam);};
loop();
cv._cleanup=()=>{window.removeEventListener('resize',onR);obs.disconnect();cancelAnimationFrame(aId);R.dispose();};
};go();return()=>{if(ref.current?._cleanup)ref.current._cleanup();};
},[]);
return <canvas ref={ref} className="hero-canvas" id="three-canvas"/>;
}
