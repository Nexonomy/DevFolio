'use client';
import { useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// Perlin FBM noise — zero deps
// ---------------------------------------------------------------------------
function buildNoise() {
  const p = new Uint8Array(512);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 256; i++) p[256 + i] = p[i];
  const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp  = (a, b, t) => a + t * (b - a);
  const grad  = (h, x, y) => { const hh = h & 3, u = hh < 2 ? x : y, v = hh < 2 ? y : x; return ((hh & 1) ? -u : u) + ((hh & 2) ? -v : v); };
  return {
    get(x, y) {
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
      const xf = x - Math.floor(x), yf = y - Math.floor(y);
      const u = fade(xf), v = fade(yf), a = p[X] + Y, b = p[X + 1] + Y;
      return lerp(lerp(grad(p[a], xf, yf), grad(p[b], xf - 1, yf), u), lerp(grad(p[a + 1], xf, yf - 1), grad(p[b + 1], xf - 1, yf - 1), u), v);
    },
    fbm(x, y, oct = 4) {
      let val = 0, amp = 0.5, freq = 1, max = 0;
      for (let i = 0; i < oct; i++) { val += this.get(x * freq, y * freq) * amp; max += amp; amp *= 0.5; freq *= 2; }
      return val / max;
    },
  };
}

const ss = t => t * t * (3 - 2 * t); // smoothstep


// ===========================================================================
// COMPONENT
// ===========================================================================
export default function ThreeBackground() {
  const ref = useRef(null);

  useEffect(() => {
    let animId;
    const noise = buildNoise();

    const init = async () => {
      const T = await import('three');
      const canvas = ref.current;
      if (!canvas) return;

      const parent = canvas.parentElement;
      let W = parent.clientWidth, H = parent.clientHeight;
      const isMobile = W < 680;

      // ── Renderer ──────────────────────────────────────────────────────────
      const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFShadowMap;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      // ── Camera ────────────────────────────────────────────────────────────
      const camera = new T.PerspectiveCamera(52, W / H, 0.1, 400);
      camera.position.set(0, 4, 22);
      camera.lookAt(0, 1, 0);

      // ── Theme ─────────────────────────────────────────────────────────────
      let theme = document.documentElement.getAttribute('data-theme') || 'light';
      const themeObserver = new MutationObserver(() => { theme = document.documentElement.getAttribute('data-theme') || 'light'; });
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

      // ── Mouse parallax ────────────────────────────────────────────────────
      const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMouseMove = e => { mouse.tx = (e.clientX / W - 0.5) * 2; mouse.ty = -(e.clientY / H - 0.5) * 2; };
      window.addEventListener('mousemove', onMouseMove);

      // ── Resize ────────────────────────────────────────────────────────────
      const onResize = () => { W = parent.clientWidth; H = parent.clientHeight; camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H); };
      window.addEventListener('resize', onResize);

      // ── Lazy scene registry — build on first use ───────────────────────────
      const scenes = {};
      const getScene = (dark) => {
        const k = dark ? 'dark' : 'light';
        if (!scenes[k]) scenes[k] = buildScene(T, noise, dark, isMobile);
        return scenes[k];
      };

      // Build the initial theme scene immediately, defer the other scene
      getScene(theme === 'dark');
      const timerId = setTimeout(() => getScene(theme !== 'dark'), 600);

      // ── Animation tick ────────────────────────────────────────────────────
      let elapsed = 0, lastTS = 0;
      const tick = (ts = 0) => {
        animId = requestAnimationFrame(tick);
        const dt = Math.min((ts - lastTS) / 1000, 0.05); // capped delta, seconds
        lastTS = ts;
        elapsed += dt;

        mouse.x += (mouse.tx - mouse.x) * 0.055;
        mouse.y += (mouse.ty - mouse.y) * 0.055;
        camera.position.x += (mouse.x * 3.0 - camera.position.x) * 0.014;
        camera.position.y += (4 + mouse.y * 1.6 - camera.position.y) * 0.014;
        camera.lookAt(0, 1, 0);

        const isDark = theme === 'dark';
        const dayNight = isDark ? 1.0 : ss(Math.max(0, Math.min(1, (1 - Math.sin(elapsed * 0.001 + Math.PI / 2)) * 0.5)));
        const current = getScene(isDark);
        animateScene(T, current, elapsed, isDark, dayNight, renderer);
        renderer.render(current.scene, camera);
      };
      tick();

      // ── Visibility API — pause rendering when tab is hidden ───────────────
      const onVis = () => {
        if (document.hidden) cancelAnimationFrame(animId);
        else { lastTS = 0; tick(); }
      };
      document.addEventListener('visibilitychange', onVis);

      // ── Cleanup ───────────────────────────────────────────────────────────
      canvas._cleanup = () => {
        clearTimeout(timerId);
        cancelAnimationFrame(animId);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', onVis);
        themeObserver.disconnect();
        renderer.dispose();
      };
    };

    init();
    return () => { if (ref.current?._cleanup) ref.current._cleanup(); };
  }, []);

  return <canvas ref={ref} className="hero-canvas" id="three-canvas" />;
}

// ===========================================================================
// SCENE BUILDER
// ===========================================================================
function buildScene(T, noise, dk, mobile) {
  const scene = new T.Scene();
  // Warmer, slightly denser fog for atmosphere and depth
  scene.fog = new T.FogExp2(dk ? 0x060c1a : 0xa8d4f0, dk ? 0.014 : 0.0095);
  const refs = {};

  setupSky(T, scene, dk, refs);
  setupLighting(T, scene, dk, refs, mobile);

  setupGround(T, scene, noise, dk, mobile, refs);
  createGroundMist(T, scene, dk, refs);

  createRocks(T, scene, dk, mobile);
  createHills(T, scene, noise, dk, mobile, refs);
  createMountains(T, scene, noise, dk, mobile, refs);
  createTrees(T, scene, dk, mobile, refs);
  createFlowers(T, scene, dk, mobile);
  createGrass(T, scene, dk, mobile, refs);
  createForegroundDetails(T, scene, dk, mobile);
  createCelestialBody(T, scene, dk, refs);
  createStars(T, scene, dk, mobile, refs);
  createAurora(T, scene, dk, mobile, refs);
  createShootingStars(T, scene, dk, mobile, refs);
  createClouds(T, scene, dk, mobile, refs);
  createFireflies(T, scene, dk, mobile, refs);
  createBirds(T, scene, dk, mobile, refs);
  createButterflies(T, scene, dk, mobile, refs);
  createBalloon(T, scene, dk, refs);

  return { scene, refs };
}

// ===========================================================================
// SKY DOME
// ===========================================================================
function setupSky(T, scene, dk, refs) {
  const cv = document.createElement('canvas'); cv.width = 2; cv.height = 512;
  const ctx = cv.getContext('2d'), gr = ctx.createLinearGradient(0, 0, 0, 512);
  if (dk) {
    gr.addColorStop(0,    '#000208');
    gr.addColorStop(0.20, '#060d1c');
    gr.addColorStop(0.50, '#0a1124');
    gr.addColorStop(0.80, '#0d1528');
    gr.addColorStop(1,    '#111e38');
  } else {
    gr.addColorStop(0,    '#0d4db5'); // deep blue zenith
    gr.addColorStop(0.14, '#2272d8'); // rich sky
    gr.addColorStop(0.36, '#52a8f4'); // mid sky
    gr.addColorStop(0.58, '#8ccef8'); // hazy upper horizon
    gr.addColorStop(0.74, '#c8e6f8'); // pale horizon
    gr.addColorStop(0.86, '#e8d4a8'); // golden warm band
    gr.addColorStop(0.94, '#d4b878'); // rich golden horizon
    gr.addColorStop(1,    '#c8a860'); // amber ground-glow
  }
  ctx.fillStyle = gr; ctx.fillRect(0, 0, 2, 512);
  const skyMat = new T.MeshBasicMaterial({ map: new T.CanvasTexture(cv), side: T.BackSide, depthWrite: false });
  scene.add(new T.Mesh(new T.SphereGeometry(200, 24, 12), skyMat));
  refs.skyMat = skyMat;
}

// ===========================================================================
// LIGHTING
// ===========================================================================
function setupLighting(T, scene, dk, refs, mobile) {
  const hemi = new T.HemisphereLight(
    dk ? 0x1c2a50 : 0xc8e0ff,   // sky colour
    dk ? 0x050a0a : 0x4a7a18,   // ground bounce
    dk ? 0.55 : 1.1
  );
  scene.add(hemi); refs.hemiLight = hemi;

  const ambient = new T.AmbientLight(dk ? 0x0d1525 : 0xfff0d0, dk ? 0.4 : 0.60);
  scene.add(ambient); refs.ambientLight = ambient;

  // Main sun — high angle, warm gold
  const sun = new T.DirectionalLight(dk ? 0x6688bb : 0xffe090, dk ? 0.7 : 1.8);
  sun.position.set(dk ? 12 : -18, 22, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 512 : 1024, mobile ? 512 : 1024);
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 100;
  sun.shadow.camera.left = -38; sun.shadow.camera.right = 38;
  sun.shadow.camera.top = 32;  sun.shadow.camera.bottom = -14;
  sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.04;
  scene.add(sun); refs.sun = sun; refs.sunDayI = dk ? 0.7 : 1.8;

  if (dk) {
    const rim = new T.DirectionalLight(0x2233aa, 0.35); rim.position.set(-12, 6, -12); scene.add(rim);
    const glow = new T.PointLight(0x4466cc, 0.6, 70); glow.position.set(10, 12, -8); scene.add(glow);
  } else {
    // Warm fill from front-right to illuminate the foreground grass
    const fill = new T.DirectionalLight(0xffca80, 0.55); fill.position.set(18, 6, 14); scene.add(fill);
    // Cool blue fill from opposite side for shadow contrast
    const cool = new T.DirectionalLight(0x90c8ff, 0.20); cool.position.set(-20, 10, 10); scene.add(cool);
  }
  refs.dayFogColor   = new T.Color(0xa8d4f0);
  refs.nightFogColor = new T.Color(0x060c18);
  refs._lastDN = -1;
}

// ===========================================================================
// ROAD CURVE
// ===========================================================================

// ===========================================================================
// GROUND — 5-tone palette, higher amplitude, winding dirt path
// ===========================================================================
function setupGround(T, scene, noise, dk, mobile, refs) {
  const segsW = mobile ? 60 : 90, segsD = mobile ? 42 : 62;
  const geo = new T.PlaneGeometry(160, 100, segsW, segsD);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const sX = dk ? 44.3 : 7.8, sZ = dk ? 91.1 : 23.5;
  const count = pos.count;
  const cols = new Float32Array(count * 3);

  // 5-tone day / night palettes
  const shadowC = new T.Color(dk ? 0x040e06 : 0x246010);
  const baseC   = new T.Color(dk ? 0x091408 : 0x3a8c18);
  const midC    = new T.Color(dk ? 0x112010 : 0x54b022);
  const brightC = new T.Color(dk ? 0x1e3418 : 0x7cd832);
  const earthC  = new T.Color(dk ? 0x0c0c08 : 0x7a5a2a);
  const tmp = new T.Color();

  for (let i = 0; i < count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);

    // Richer multi-octave height — max ~0.85 so terrain has real bumps
    const h = Math.max(0,
      noise.fbm((x + sX) * 0.10, (z + sZ) * 0.10, 4) * 0.55 +
      noise.fbm((x + sX) * 0.26, (z + sZ) * 0.26, 3) * 0.20 +
      noise.fbm((x + sX) * 0.58, (z + sZ) * 0.58, 2) * 0.10
    );

    // Winding dirt path through scene centre (meanders with z)
    const pathCx = Math.sin(z * 0.055) * 3.8 + Math.sin(z * 0.13) * 1.4;
    const pathW  = 2.6 + Math.sin(z * 0.09) * 0.8;
    const pathT  = Math.max(0, 1 - Math.abs(x - pathCx) / pathW);
    const pathBlend = pathT * pathT * (3 - 2 * pathT); // smoothstep

    // Slightly flatten path, leaving gentle rolls
    const finalH = h * (1 - pathBlend * 0.55);
    pos.setY(i, finalH);

    // Build colour: height-based palette + earth patches + path
    const ht = Math.min(1, finalH / 0.65);
    if (pathBlend > 0.3 && !dk) {
      // Dirt path colour — mix between earth and base green at edges
      tmp.lerpColors(earthC, baseC, Math.max(0, 1 - pathBlend));
    } else {
      // Height gradient: shadow → base → mid → bright
      if (ht < 0.18) {
        tmp.lerpColors(shadowC, baseC, ht / 0.18);
      } else if (ht < 0.48) {
        tmp.lerpColors(baseC, midC, (ht - 0.18) / 0.30);
      } else {
        tmp.lerpColors(midC, brightC, Math.min(1, (ht - 0.48) / 0.52));
      }
      // Occasional dry/earth patches for visual variety
      const dry = noise.fbm((x + sX + 77) * 0.38, (z + sZ + 43) * 0.38, 2);
      if (dry > 0.28 && !dk) tmp.lerp(earthC, (dry - 0.28) * 0.55);
    }

    cols[i * 3] = tmp.r; cols[i * 3 + 1] = tmp.g; cols[i * 3 + 2] = tmp.b;
  }

  geo.setAttribute('color', new T.BufferAttribute(cols, 3));
  geo.computeVertexNormals();

  const mesh = new T.Mesh(geo, new T.MeshStandardMaterial({
    vertexColors: true, roughness: 0.90, flatShading: true,
  }));
  mesh.position.y = -2.2; mesh.receiveShadow = true;
  scene.add(mesh); refs.ground = mesh;
}

// ===========================================================================
// ROCKS
// ===========================================================================
function createRocks(T, scene, dk, mobile) {
  const count = mobile ? 14 : 32; // reduced: was 18/42
  const mats = [
    new T.MeshStandardMaterial({ color: dk ? 0x2a3038 : 0x8a8878, roughness: 0.92, flatShading: true }),
    new T.MeshStandardMaterial({ color: dk ? 0x1e2830 : 0x787060, roughness: 0.88, flatShading: true }),
    new T.MeshStandardMaterial({ color: dk ? 0x1a2820 : 0x5a7040, roughness: 0.95, flatShading: true }),
  ];
  const bases = [new T.DodecahedronGeometry(1,0), new T.IcosahedronGeometry(1,0), new T.OctahedronGeometry(1,0)];
  for (let i = 0; i < count; i++) {
    const ti = i % 3, geo = bases[ti].clone(), p = geo.attributes.position;
    for (let v = 0; v < p.count; v++) {
      p.setX(v, p.getX(v) + (Math.random()-0.5)*0.2);
      p.setY(v, p.getY(v) + (Math.random()-0.5)*0.15);
      p.setZ(v, p.getZ(v) + (Math.random()-0.5)*0.2);
    }
    geo.computeVertexNormals();
    const rock = new T.Mesh(geo, mats[ti]);
    const sy = 0.06 + Math.random() * 0.18;
    rock.scale.set(0.08 + Math.random()*0.26, sy, 0.07 + Math.random()*0.22);
    rock.position.set((Math.random()-0.5)*44, -2.2+sy*0.5, Math.random()<0.7 ? (Math.random()-0.5)*14 : -8-Math.random()*12);
    rock.rotation.set((Math.random()-0.5)*0.5, Math.random()*Math.PI*2, (Math.random()-0.5)*0.3);
    rock.castShadow = true; rock.receiveShadow = true; scene.add(rock);
  }
}

// ===========================================================================
// HILLS
// ===========================================================================
function createHills(T, scene, noise, dk, mobile, refs) {
  refs.hills = [];
  const layers = [
    // Distant — cooler, more muted, atmospheric haze
    { z:-30, w:150, d:32, sw:mobile?40:80, sd:mobile?12:22, bY:-1.4, amp:5.5, fr:0.14, oct:4,
      cL:new T.Color().setHSL(0.60,0.30,0.40), cD:new T.Color().setHSL(0.60,0.20,0.09) },
    // Mid — warmer, richer green
    { z:-17, w:130, d:30, sw:mobile?48:90, sd:mobile?14:26, bY:-1.7, amp:4.0, fr:0.19, oct:4,
      cL:new T.Color().setHSL(0.35,0.58,0.30), cD:new T.Color().setHSL(0.36,0.32,0.07) },
    // Near-mid — deep forest green, saturated
    { z: -5, w:110, d:24, sw:mobile?46:86, sd:mobile?14:24, bY:-1.95, amp:3.0, fr:0.24, oct:3,
      cL:new T.Color().setHSL(0.30,0.72,0.24), cD:new T.Color().setHSL(0.28,0.32,0.06) },
    // Foreground — gentle ridge at camera base, frames the scene
    { z:  7, w:110, d:16, sw:mobile?40:70, sd:mobile?10:14, bY:-2.02, amp:1.35, fr:0.32, oct:3,
      cL:new T.Color().setHSL(0.28,0.76,0.26), cD:new T.Color().setHSL(0.27,0.32,0.06) },
  ];
  layers.forEach((cfg, li) => {
    const geo = new T.PlaneGeometry(cfg.w, cfg.d, cfg.sw, cfg.sd);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, ox = (Math.random()-0.5)*22, oz = (Math.random()-0.5)*6;
    for (let i = 0; i < pos.count; i++)
      pos.setY(i, Math.max(0, noise.fbm((pos.getX(i)+ox)*cfg.fr, (pos.getZ(i)+oz)*cfg.fr, cfg.oct)) * cfg.amp);
    geo.computeVertexNormals();
    const mesh = new T.Mesh(geo, new T.MeshStandardMaterial({ color: dk?cfg.cD:cfg.cL, roughness:0.86, flatShading:true }));
    mesh.position.set(0, cfg.bY, cfg.z); mesh.receiveShadow = true; mesh.castShadow = li > 0;
    scene.add(mesh); refs.hills.push(mesh);
  });
}

// ===========================================================================
// MOUNTAINS — vertex-colour snow caps, clustered
// ===========================================================================
function createMountains(T, scene, noise, dk, mobile, refs) {
  refs.mountains = [];
  const rPal = dk
    ? [(r)=>new T.Color().setHSL(0.62,0.22,0.035+r*0.008+Math.random()*0.015), (r)=>new T.Color().setHSL(0.60,0.18,0.055+r*0.01+Math.random()*0.018)]
    : [()=>new T.Color().setHSL(0.66+Math.random()*0.07,0.30,0.48+Math.random()*0.10), ()=>new T.Color().setHSL(0.53+Math.random()*0.06,0.34,0.36+Math.random()*0.10)];
  const sC = dk ? new T.Color(0xbfcede) : new T.Color(0xddeeff);
  const sB = dk ? new T.Color(0x9aaec8) : new T.Color(0xc8dff8);
  const ranges = [
    { ri:0, cl:mobile?[{cx:-28,n:3},{cx:10,n:2},{cx:42,n:2}]:[{cx:-55,n:3},{cx:-22,n:4},{cx:8,n:3},{cx:38,n:4},{cx:62,n:2}], zBase:-58,zJ:18,hMn:10,hMx:24,rMn:7,rMx:14,sp:14,sg:7,st:0.48,sb:0.22 },
    { ri:1, cl:mobile?[{cx:-18,n:2},{cx:5,n:3},{cx:30,n:2}]:[{cx:-45,n:2},{cx:-14,n:3},{cx:12,n:2},{cx:34,n:3},{cx:55,n:2}], zBase:-40,zJ:10,hMn:6,hMx:14,rMn:5,rMx:10,sp:10,sg:6,st:0.52,sb:0.20 },
  ];
  const tmp = new T.Color();
  ranges.forEach(cfg => {
    const rfn = rPal[cfg.ri];
    cfg.cl.forEach(cl => {
      for (let ci = 0; ci < cl.n; ci++) {
        const mH=cfg.hMn+Math.random()*(cfg.hMx-cfg.hMn), mR=cfg.rMn+Math.random()*(cfg.rMx-cfg.rMn), segs=cfg.sg+Math.floor(Math.random()*4);
        const geo=new T.ConeGeometry(mR,mH,segs,5), pos=geo.attributes.position, cnt=pos.count;
        for (let v=0;v<cnt;v++){const y=pos.getY(v),nY=(y+mH/2)/mH;if(nY>0.02){const j=(1-nY)*0.42;pos.setX(v,pos.getX(v)+(Math.random()-0.5)*mR*j);pos.setZ(v,pos.getZ(v)+(Math.random()-0.5)*mR*j);}}
        const vc=new Float32Array(cnt*3), rc=rfn(cfg.ri);
        for (let v=0;v<cnt;v++){const nY=(pos.getY(v)+mH/2)/mH,sT=Math.min(1,Math.max(0,(nY-cfg.st)/cfg.sb)),sm=sT*sT*(3-2*sT);tmp.lerpColors(rc,sm>0.5?sC:sB,sm);vc[v*3]=tmp.r;vc[v*3+1]=tmp.g;vc[v*3+2]=tmp.b;}
        geo.setAttribute('color',new T.BufferAttribute(vc,3)); geo.computeVertexNormals();
        const mtn=new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:0.90,flatShading:true}));
        const xPos=cl.cx+(ci/Math.max(1,cl.n-1)-0.5)*cfg.sp+(Math.random()-0.5)*6;
        mtn.scale.set(0.75+Math.random()*0.55,1.0,0.75+Math.random()*0.55); mtn.rotation.y=Math.random()*Math.PI*2;
        mtn.position.set(xPos,-2.2,cfg.zBase-Math.random()*cfg.zJ); mtn.castShadow=cfg.ri>0; mtn.receiveShadow=true;
        scene.add(mtn); refs.mountains.push(mtn);
      }
    });
  });
}

// ===========================================================================
// TREES
// ===========================================================================
function createTrees(T, scene, dk, mobile, refs) {
  refs.trees = [];
  const trunkMat = new T.MeshStandardMaterial({ color:dk?0x1a2020:0x6a4018, roughness:0.9, flatShading:true });

  const spawnTree = (tx, tz, tH, scale=1) => {
    const trunk=new T.Mesh(new T.CylinderGeometry(0.07*scale,0.16*scale,tH,5),trunkMat);
    trunk.position.set(tx,-2.2+tH/2,tz); trunk.castShadow=true; scene.add(trunk);
    if (Math.random()>0.35) {
      for (let l=0;l<3;l++) {
        const cr=(0.95-l*0.22)*(0.8+Math.random()*0.4)*scale, ch=(1.15-l*0.18)*(0.8+Math.random()*0.4)*scale;
        const col=dk?new T.Color().setHSL(0.34,0.30,0.04+Math.random()*0.025):new T.Color().setHSL(0.28+Math.random()*0.08,0.70,0.20+Math.random()*0.14);
        const cone=new T.Mesh(new T.ConeGeometry(cr,ch,6+Math.floor(Math.random()*3)),new T.MeshStandardMaterial({color:col,roughness:0.82,flatShading:true}));
        cone.position.set(tx,-2.2+tH+l*0.62*scale+0.22,tz); cone.castShadow=true;
        cone.userData={baseX:tx,sway:(0.03+Math.random()*0.05)*scale,freq:0.28+Math.random()*0.45};
        scene.add(cone); refs.trees.push(cone);
      }
    } else {
      const cr=(0.60+Math.random()*1.0)*scale;
      const col=dk?new T.Color().setHSL(0.32,0.22,0.04+Math.random()*0.03):new T.Color().setHSL(0.25+Math.random()*0.10,0.62,0.24+Math.random()*0.16);
      const crown=new T.Mesh(new T.SphereGeometry(cr,7,5),new T.MeshStandardMaterial({color:col,roughness:0.82,flatShading:true}));
      crown.position.set(tx,-2.2+tH+cr*0.44,tz); crown.castShadow=true;
      crown.userData={baseX:tx,sway:(0.06+Math.random()*0.10)*scale,freq:0.35+Math.random()*0.55};
      scene.add(crown); refs.trees.push(crown);
    }
  };

  // Close foreground trees on both sides — big, frame the scene
  // Kept at z=-2 to z=-10 so they frame without blocking the view
  const fgSlots = mobile ? [[-9,-2],[-14,-4],[10,-2],[16,-3],[-6,-5],[12,-5]] :
    [[-10,-2],[-16,-4],[-22,-2],[11,-2],[18,-3],[24,-2],[-7,-5],[14,-5],[-18,-6],[20,-4]];
  for (const [tx,tz] of fgSlots) {
    const tH=(2.2+Math.random()*2.0);
    spawnTree(tx + (Math.random()-0.5)*2, tz, tH, 1.2+Math.random()*0.5);
  }

  // Mid and background trees
  const tCount = mobile ? 14 : 34;
  for (let i=0; i<tCount; i++) {
    const tx=(Math.random()-0.5)*70, tz=-5-Math.random()*28, tH=1.2+Math.random()*2.8;
    spawnTree(tx, tz, tH, 1.0);
  }
}

// ===========================================================================
// FLOWERS / MUSHROOMS
// ===========================================================================
function createFlowers(T, scene, dk, mobile) {
  const stemMat=new T.MeshStandardMaterial({color:dk?0xb0a878:0x489020,roughness:0.85});
  const fC=[0xe83848,0xe8c038,0xd048cc,0x4888e8,0xff8028,0xff4480];
  const sC=[0x3a6848,0x4a2e60,0x284a88], sE=[0x1a3020,0x201828,0x101838];
  for (let i=0;i<(mobile?10:24);i++) { // reduced count
    const fx=(Math.random()-0.5)*44,fz=(Math.random()-0.5)*22;
    if (!dk) {
      scene.add(new T.Mesh(new T.CylinderGeometry(0.014,0.014,0.30,4),stemMat).translateX(fx).translateY(-1.90).translateZ(fz));
      scene.add(new T.Mesh(new T.SphereGeometry(0.075,6,4),new T.MeshStandardMaterial({color:fC[i%fC.length]})).translateX(fx).translateY(-1.72).translateZ(fz));
    } else {
      scene.add(new T.Mesh(new T.CylinderGeometry(0.026,0.036,0.13,5),stemMat).translateX(fx).translateY(-1.95).translateZ(fz));
      scene.add(new T.Mesh(new T.SphereGeometry(0.08,6,4,0,Math.PI*2,0,Math.PI/2),new T.MeshStandardMaterial({color:sC[i%3],emissive:sE[i%3],emissiveIntensity:0.55})).translateX(fx).translateY(-1.88).translateZ(fz));
    }
  }
}

// ===========================================================================
// GRASS
// ===========================================================================
function createGrass(T, scene, dk, mobile, refs) {
  const count = mobile ? 200 : 500; // reduced: was 250/700
  const verts=[], data=[];
  for (let i=0;i<count;i++) {
    const gx=(Math.random()-0.5)*58,gz=(Math.random()-0.5)*30,gh=0.18+Math.random()*0.38;
    verts.push(gx-0.028,-2.2,gz, gx+0.028,-2.2,gz, gx,-2.2+gh,gz);
    data.push({x:gx,phase:Math.random()*6.28,freq:1.2+Math.random()*0.8});
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.BufferAttribute(new Float32Array(verts),3));
  geo.computeVertexNormals();
  const mesh=new T.Mesh(geo,new T.MeshStandardMaterial({color:dk?0x0c1a10:0x58aa28,side:T.DoubleSide,roughness:0.92,flatShading:true}));
  scene.add(mesh); refs.grassMesh=mesh; refs.grassData=data;
}

// ===========================================================================
// GROUND MIST — thin atmospheric layer at ground level for depth
// ===========================================================================
function createGroundMist(T, scene, dk, refs) {
  // Layered mist planes at ground level — gives the "valley haze" look
  const layers = dk
    ? [{ y:-1.4, op:0.06, c:0x1a2840 }, { y:-0.6, op:0.035, c:0x121e38 }]
    : [{ y:-1.3, op:0.055, c:0xdcecf8 }, { y:-0.5, op:0.028, c:0xc8e0f0 }];

  for (const l of layers) {
    const geo = new T.PlaneGeometry(180, 80, 1, 1);
    geo.rotateX(-Math.PI / 2);
    const mat = new T.MeshBasicMaterial({ color:l.c, transparent:true, opacity:l.op, depthWrite:false });
    const mist = new T.Mesh(geo, mat);
    mist.position.set(0, l.y, -8);
    scene.add(mist);
  }
}

// ===========================================================================
// FOREGROUND DETAILS — stumps, large boulders, ferns close to camera
// ===========================================================================
function createForegroundDetails(T, scene, dk, mobile) {
  // Large mossy boulders at camera level — give immediate foreground depth
  const boulderMat = new T.MeshStandardMaterial({ color:dk?0x252e28:0x6e7060, roughness:0.94, flatShading:true });
  const boulderMat2 = new T.MeshStandardMaterial({ color:dk?0x1e2820:0x5a6850, roughness:0.96, flatShading:true });
  const boulderPositions = mobile
    ? [[-12,-2],[-8,-4],[10,-2],[15,-3]]
    : [[-13,-2],[-9,-4],[-18,-2],[9,-2],[14,-3],[19,-4],[-5,-5],[5,-3]];

  for (const [bx, bz] of boulderPositions) {
    const geo = [new T.DodecahedronGeometry(1,0), new T.IcosahedronGeometry(1,0)][Math.floor(Math.random()*2)].clone();
    const p = geo.attributes.position;
    for (let v=0; v<p.count; v++) {
      p.setX(v, p.getX(v)+(Math.random()-0.5)*0.3);
      p.setY(v, p.getY(v)+(Math.random()-0.5)*0.2);
      p.setZ(v, p.getZ(v)+(Math.random()-0.5)*0.3);
    }
    geo.computeVertexNormals();
    const s = 0.18+Math.random()*0.28;
    const rock = new T.Mesh(geo, Math.random()>0.5?boulderMat:boulderMat2);
    rock.scale.set(s*1.4, s*(0.6+Math.random()*0.5), s*1.2);
    rock.position.set(bx+(Math.random()-0.5)*1.5, -2.2+s*0.3, bz);
    rock.rotation.set((Math.random()-0.5)*0.4, Math.random()*Math.PI*2, (Math.random()-0.5)*0.3);
    rock.castShadow=true; rock.receiveShadow=true;
    scene.add(rock);
  }

  // Stumps — old tree trunks, no crown
  if (!dk) {
    const stumpMat = new T.MeshStandardMaterial({ color:0x5a3810, roughness:0.95, flatShading:true });
    const stumpTopMat = new T.MeshStandardMaterial({ color:0x4a5838, roughness:0.90, flatShading:true });
    const stumpPositions = mobile ? [[-5,-3],[8,-4]] : [[-5,-3],[7,-4],[12,-5],[-10,-3]];
    for (const [sx,sz] of stumpPositions) {
      const sh = 0.22+Math.random()*0.18, sr = 0.14+Math.random()*0.10;
      const stump = new T.Mesh(new T.CylinderGeometry(sr,sr*1.2,sh,7), stumpMat);
      stump.position.set(sx+(Math.random()-0.5), -2.2+sh/2, sz);
      stump.castShadow=true; scene.add(stump);
      // Mossy top ring
      const top = new T.Mesh(new T.CylinderGeometry(sr*1.05,sr*1.05,0.04,7), stumpTopMat);
      top.position.set(sx+(Math.random()-0.5), -2.2+sh+0.01, sz);
      scene.add(top);
    }
  }
}

// ===========================================================================
// CELESTIAL BODY
// ===========================================================================
function createCelestialBody(T, scene, dk, refs) {
  const r=dk?1.3:2.5;
  const cel=new T.Mesh(new T.SphereGeometry(r,20,20),new T.MeshBasicMaterial({color:dk?0xdde4ff:0xffe050}));
  cel.position.set(dk?16:-20,20,-42); scene.add(cel); refs.cel=cel;
  for (let i=1;i<=4;i++) {
    const sp=new T.Sprite(new T.SpriteMaterial({color:dk?0xaabbdd:0xffdd44,transparent:true,opacity:dk?0.065/i:0.12/i}));
    sp.scale.setScalar(r*(5+i*2.8)); sp.position.copy(cel.position); scene.add(sp);
  }
  if (!dk) {
    for (let i=0;i<12;i++) { // reduced: was 14
      const ray=new T.Mesh(new T.PlaneGeometry(0.22,16+Math.random()*12),new T.MeshBasicMaterial({color:0xffee88,transparent:true,opacity:0.025+Math.random()*0.02,side:T.DoubleSide}));
      ray.position.copy(cel.position); ray.rotation.z=(i/12)*Math.PI*2; scene.add(ray);
    }
  }
  if (dk) {
    [{x:0.3,y:0.4,r:0.22},{x:-0.45,y:-0.2,r:0.16},{x:0.1,y:-0.5,r:0.19}].forEach(c=>{
      const cr=new T.Mesh(new T.SphereGeometry(c.r,7,7),new T.MeshBasicMaterial({color:0xbbc8e0}));
      cr.position.set(cel.position.x+c.x,cel.position.y+c.y,cel.position.z+1.0); scene.add(cr);
    });
  }
}

// ===========================================================================
// STARS / AURORA / SHOOTING STARS / CLOUDS / FIREFLIES
// ===========================================================================
function createStars(T,scene,dk,mobile,refs){
  if(!dk)return;
  const n=mobile?220:500, pos=new Float32Array(n*3); // reduced: was 280/650
  for(let i=0;i<n;i++){pos[i*3]=(Math.random()-0.5)*180;pos[i*3+1]=8+Math.random()*70;pos[i*3+2]=-30-Math.random()*65;}
  refs.stars=new T.Points(new T.BufferGeometry(),new T.PointsMaterial({color:0xeeeeff,size:0.14,transparent:true,opacity:0.95,sizeAttenuation:true}));
  refs.stars.geometry.setAttribute('position',new T.BufferAttribute(pos,3));
  scene.add(refs.stars);
}

function createAurora(T,scene,dk,mobile,refs){
  if(!dk||mobile)return;
  const geo=new T.PlaneGeometry(80,12,60,10); // reduced: was 80×12
  const pos=geo.attributes.position;
  // Store base Y so animation recomputes from it rather than accumulating
  const baseY=new Float32Array(pos.count);
  for(let i=0;i<pos.count;i++){baseY[i]=0; pos.setZ(i,(Math.random()-0.5)*3);}
  refs.aurora=new T.Mesh(geo,new T.MeshBasicMaterial({color:0x20cc80,transparent:true,opacity:0.08,side:T.DoubleSide}));
  refs.aurora.userData.baseY=baseY;
  refs.aurora.position.set(0,26,-46); refs.aurora.rotation.x=-0.22; scene.add(refs.aurora);
}

function createShootingStars(T,scene,dk,mobile,refs){
  if(!dk)return; refs.shootingStars=[];
  for(let i=0;i<(mobile?2:3);i++){ // reduced: was 4
    const geo=new T.BufferGeometry(); geo.setAttribute('position',new T.BufferAttribute(new Float32Array([0,0,0,-3,-0.7,0]),3));
    const line=new T.Line(geo,new T.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0}));
    line.position.set((Math.random()-0.5)*80,24+Math.random()*20,-35-Math.random()*20);
    line.userData={timer:Math.random()*280,interval:160+Math.random()*320,active:false,life:0};
    scene.add(line); refs.shootingStars.push(line);
  }
}

function createClouds(T,scene,dk,mobile,refs){
  if(dk)return; refs.clouds=[];
  for(let i=0;i<(mobile?3:8);i++){ // reduced: was 4/10
    const g=new T.Group(), m=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.72});
    for(let b=0;b<4+Math.floor(Math.random()*6);b++){const bl=new T.Mesh(new T.SphereGeometry(0.48+Math.random()*0.7,6,4),m);bl.position.set(b*0.52-1.3,(Math.random()-0.5)*0.42,(Math.random()-0.5)*0.55);bl.scale.set(1,0.52+Math.random()*0.3,0.8+Math.random()*0.35);g.add(bl);}
    g.position.set((Math.random()-0.5)*60,9+Math.random()*8,-14-Math.random()*26);g.userData={drift:0.007+Math.random()*0.011};
    scene.add(g); refs.clouds.push(g);
  }
}

function createFireflies(T,scene,dk,mobile,refs){
  const count=mobile?60:130; // reduced: was 80/180
  const pos=new Float32Array(count*3), data=[];
  for(let i=0;i<count;i++){
    pos[i*3]=(Math.random()-0.5)*60;pos[i*3+1]=dk?Math.random()*7-0.5:Math.random()*16-1;pos[i*3+2]=(Math.random()-0.5)*36;
    data.push({vx:(Math.random()-0.5)*0.009,vy:dk?(Math.random()-0.5)*0.006:0.002+Math.random()*0.004,ph:Math.random()*6.28});
  }
  const geo=new T.BufferGeometry(); geo.setAttribute('position',new T.BufferAttribute(pos,3));
  refs.fireflies=new T.Points(geo,new T.PointsMaterial({color:dk?0xccee44:0xfff0a0,size:dk?0.18:0.12,transparent:true,opacity:dk?0.82:0.60,sizeAttenuation:true}));
  refs.fireflies.userData={data}; scene.add(refs.fireflies);
}

// ===========================================================================
// BIRDS / BUTTERFLIES / RABBITS
// ===========================================================================
function createBirds(T,scene,dk,mobile,refs){
  refs.birds=[];
  const bM=new T.MeshStandardMaterial({color:dk?0x111118:0x3a3020}), wC=dk?[0x181820,0x202028]:[0x5a4030,0x2a2a28,0x6a4838];
  for(let i=0;i<(mobile?5:12);i++){ // reduced: was 6/16
    const g=new T.Group(); g.add(new T.Mesh(new T.SphereGeometry(0.078,5,3),bM));
    const wM=new T.MeshStandardMaterial({color:wC[i%wC.length],side:T.DoubleSide});
    [-1,1].forEach(s=>{const w=new T.Mesh(new T.PlaneGeometry(0.25,0.08),wM);w.position.x=0.145*s;w.userData={wing:s};g.add(w);});
    g.position.set((Math.random()-0.5)*50,6+Math.random()*10,-5-Math.random()*25);
    g.userData={spd:0.022+Math.random()*0.042,ws:4.5+Math.random()*5.5,ph:Math.random()*6.28,baseY:g.position.y};
    scene.add(g); refs.birds.push(g);
  }
}

function createButterflies(T,scene,dk,mobile,refs){
  if(dk)return; refs.butterflies=[];
  const pal=[0xe84080,0x40a0e8,0xe8c040,0x80e840,0xe080e0,0xff6820,0x40e8c0];
  for(let i=0;i<(mobile?4:10);i++){ // reduced: was 5/14
    const g=new T.Group(); g.add(new T.Mesh(new T.CylinderGeometry(0.008,0.008,0.065,4),new T.MeshStandardMaterial({color:0x222222}))); g.children[0].rotation.z=Math.PI/2;
    const wM=new T.MeshStandardMaterial({color:pal[i%pal.length],side:T.DoubleSide,transparent:true,opacity:0.85});
    [-1,1].forEach(s=>{const w=new T.Mesh(new T.CircleGeometry(0.058,5),wM);w.position.y=s*0.04;w.userData={wing:s};g.add(w);});
    g.position.set((Math.random()-0.5)*30,Math.random()*5,(Math.random()-0.5)*18);
    g.userData={cx:g.position.x,cy:g.position.y,cz:g.position.z,rx:2.2+Math.random()*3.8,ry:0.6+Math.random()*1.0,rz:1.2+Math.random()*2.2,sp:0.18+Math.random()*0.38,ws:8+Math.random()*7,ph:Math.random()*6.28};
    scene.add(g); refs.butterflies.push(g);
  }
}

// ===========================================================================
// BALLOON
// ===========================================================================
function createBalloon(T,scene,dk,refs){
  const g=new T.Group();
  const cv=document.createElement('canvas'); cv.width=64; cv.height=64;
  const ec=cv.getContext('2d'), str=dk?['#3a5888','#1e3460','#4a68a0']:['#e83838','#e8a028','#e8d838','#38a0e8'];
  for(let s=0;s<8;s++){ec.fillStyle=str[s%str.length];ec.fillRect(0,s*8,64,8);}
  const env=new T.Mesh(new T.SphereGeometry(1.35,14,10),new T.MeshStandardMaterial({map:new T.CanvasTexture(cv),roughness:0.48}));
  env.scale.set(1,1.38,1); env.position.y=2.2; env.castShadow=true; g.add(env);
  g.add(new T.Mesh(new T.BoxGeometry(0.54,0.40,0.54),new T.MeshStandardMaterial({color:dk?0x4a3828:0x8a5a24,roughness:0.82})));
  const rM=new T.MeshBasicMaterial({color:dk?0x607090:0x6a4820});
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{const rope=new T.Mesh(new T.CylinderGeometry(0.012,0.012,1.65,4),rM);rope.position.set(sx*0.23,1.05,sz*0.23);rope.rotation.set(sz*0.12,0,sx*-0.12);g.add(rope);});
  const flame=new T.Mesh(new T.ConeGeometry(0.09,0.3,5),new T.MeshBasicMaterial({color:dk?0xff8820:0xff5500,transparent:true,opacity:0.78}));
  flame.position.y=0.8; g.add(flame); refs.flame=flame;
  const fl2 = new T.PointLight(dk?0xff6620:0xff8828,0.65,5.5); fl2.position.set(0,0.8,0); g.add(fl2);
  // Turtle
  const tG=new T.Group();
  const sh=new T.Mesh(new T.SphereGeometry(0.2,7,5),new T.MeshStandardMaterial({color:dk?0x2a6838:0x3a9050,roughness:0.7})); sh.scale.set(1,0.6,0.8); tG.add(sh);
  const hd2=new T.Mesh(new T.SphereGeometry(0.09,6,4),new T.MeshStandardMaterial({color:dk?0x40a040:0x55c050})); hd2.position.set(0.22,0.08,0); tG.add(hd2);
  tG.position.set(0,0.54,0); tG.scale.setScalar(0.5); g.add(tG);
  g.position.set(0,5,0); g.scale.setScalar(0.88); scene.add(g);
  refs.balloon=g; refs.balloonAngle=0;
}

// ===========================================================================
// ANIMATE SCENE — every performance fix lives here
// ===========================================================================
function animateScene(T, { scene, refs }, t, dk, dayNight, renderer) {

  // ── Day/Night — throttled: only update when value shifts by >1% ─────────
  if (!dk && Math.abs(dayNight - (refs._lastDN ?? -1)) > 0.01) {
    refs._lastDN = dayNight;
    const dI = refs.sunDayI || 1.6;
    refs.sun.intensity          = dI   * (1-dayNight) + 0.12 * dayNight;
    refs.hemiLight.intensity    = 1.0  * (1-dayNight) + 0.12 * dayNight;
    refs.ambientLight.intensity = 0.55 * (1-dayNight) + 0.18 * dayNight;
    refs.skyMat.color.setRGB(1-dayNight*0.92, 1-dayNight*0.88, 1-dayNight*0.70);
    scene.fog.color.lerpColors(refs.dayFogColor, refs.nightFogColor, dayNight);
    renderer.setClearColor(scene.fog.color, 0);
  }

  // ── Balloon ───────────────────────────────────────────────────────────
  refs.balloonAngle = (refs.balloonAngle || 0) + 0.0028;
  const ba = refs.balloonAngle, br = 11 + Math.sin(ba*1.7)*5;
  refs.balloon.position.set(Math.cos(ba*0.9)*br, 5+Math.sin(t*0.42)*1.5+Math.cos(t*0.27)*0.65, Math.sin(ba*0.9)*br*0.55);
  refs.balloon.rotation.y = ba*0.9 + Math.PI;
  if (refs.flame) { refs.flame.scale.y=0.75+Math.sin(t*14)*0.28+Math.sin(t*21)*0.12; refs.flame.material.opacity=0.55+Math.sin(t*12)*0.22; }

  // ── Birds ────────────────────────────────────────────────────────────
  for (const b of refs.birds) {
    b.position.x += b.userData.spd; if (b.position.x > 32) b.position.x = -32;
    b.position.y = b.userData.baseY + Math.sin(t*1.4+b.userData.ph)*0.7;
    for (const c of b.children) if (c.userData.wing) c.rotation.x = Math.sin(t*b.userData.ws+b.userData.ph)*0.75*c.userData.wing;
  }

  // ── Butterflies ──────────────────────────────────────────────────────
  for (const bf of (refs.butterflies||[])) {
    const d=bf.userData;
    bf.position.set(d.cx+Math.sin(t*d.sp+d.ph)*d.rx, d.cy+Math.sin(t*d.sp*1.3+d.ph)*d.ry, d.cz+Math.cos(t*d.sp*0.7+d.ph)*d.rz);
    bf.rotation.y=Math.sin(t*d.sp+d.ph)*0.55;
    for (const c of bf.children) if (c.userData.wing) c.rotation.x=Math.sin(t*d.ws)*0.85*c.userData.wing;
  }

  // ── Clouds ───────────────────────────────────────────────────────────
  for (const c of (refs.clouds||[])) { c.position.x+=c.userData.drift; if(c.position.x>34)c.position.x=-34; }

  // ── Trees sway ───────────────────────────────────────────────────────
  for (const c of refs.trees) c.position.x = c.userData.baseX + Math.sin(t*c.userData.freq)*c.userData.sway;

  // ── Stars twinkle ────────────────────────────────────────────────────
  if (refs.stars) refs.stars.material.opacity = 0.62 + Math.sin(t*0.72)*0.30;

  // ── Aurora — recompute Y from stored base (fixes the drift-to-infinity bug) ──
  if (refs.aurora) {
    const ap = refs.aurora.geometry.attributes.position;
    const aa = ap.array, by = refs.aurora.userData.baseY;
    for (let i = 0; i < ap.count; i++) aa[i*3+1] = by[i] + Math.sin(aa[i*3]*0.16+t*0.36)*0.9;
    ap.needsUpdate = true;
    refs.aurora.material.opacity = 0.05 + Math.sin(t*0.25)*0.038;
    refs.aurora.material.color.setHSL((Math.sin(t*0.08)*0.5+0.5)*0.15+0.38, 0.8, 0.5);
  }

  // ── Shooting stars ────────────────────────────────────────────────────
  for (const ss2 of (refs.shootingStars||[])) {
    ss2.userData.timer++;
    if (!ss2.userData.active && ss2.userData.timer > ss2.userData.interval) { ss2.userData.active=true; ss2.userData.life=0; ss2.userData.timer=0; ss2.material.opacity=0.95; ss2.position.set((Math.random()-0.5)*80,24+Math.random()*20,-34-Math.random()*20); }
    if (ss2.userData.active) { ss2.userData.life++; ss2.position.x+=0.48; ss2.position.y-=0.19; ss2.material.opacity=Math.max(0,0.95-ss2.userData.life*0.033); if(ss2.userData.life>28){ss2.userData.active=false;ss2.material.opacity=0;ss2.userData.interval=160+Math.random()*320;} }
  }

  // ── Grass sway ────────────────────────────────────────────────────────
  if (refs.grassMesh) {
    const ga = refs.grassMesh.geometry.attributes.position.array;
    for (let i = 0; i < refs.grassData.length; i++) {
      const d = refs.grassData[i];
      ga[i*9+6] = d.x + Math.sin(t*d.freq+d.phase)*0.048;
    }
    refs.grassMesh.geometry.attributes.position.needsUpdate = true;
  }

  // ── Fireflies / sparkles ──────────────────────────────────────────────
  if (refs.fireflies) {
    const fa = refs.fireflies.geometry.attributes.position.array;
    const fd = refs.fireflies.userData.data;
    for (let i = 0; i < fd.length; i++) {
      fa[i*3]   += fd[i].vx + Math.sin(t*0.38+fd[i].ph)*0.006;
      fa[i*3+1] += fd[i].vy + (dk ? Math.cos(t*0.52+fd[i].ph*1.3)*0.004 : 0);
      if (Math.abs(fa[i*3]) > 30) fd[i].vx *= -0.85;
      if (dk) { if(fa[i*3+1]>7)fd[i].vy=-Math.abs(fd[i].vy); if(fa[i*3+1]<-1)fd[i].vy=Math.abs(fd[i].vy); }
      else { if(fa[i*3+1]>16){fa[i*3+1]=-1;fa[i*3]=(Math.random()-0.5)*60;} }
    }
    refs.fireflies.geometry.attributes.position.needsUpdate = true;
    refs.fireflies.material.opacity = dk ? 0.42+Math.sin(t*1.35+Math.cos(t*0.5))*0.38 : 0.42+Math.sin(t*0.55)*0.20;
  }
}
