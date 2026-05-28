'use client';

import { useEffect, useRef } from 'react';

export default function ThreeBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    let animationId;
    let renderer, scene, camera;
    const objects = [];

    const init = async () => {
      const THREE = (await import('three')).default || await import('three');

      const container = canvasRef.current;
      if (!container) return;

      const parent = container.parentElement;
      const width = parent.clientWidth;
      const height = parent.clientHeight;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({ canvas: container, alpha: true, antialias: false });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);

      const isMobile = window.innerWidth < 680;
      const cubeCount = isMobile ? 30 : 55;
      const coinCount = isMobile ? 40 : 80;

      const colors = [0x3B2A1A, 0x2D5016, 0x8B2E1A, 0xC8860A, 0xC4A265, 0x4A7C2F];

      // Cubes
      for (let i = 0; i < cubeCount; i++) {
        const geo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
        const mat = new THREE.MeshBasicMaterial({
          color: colors[Math.floor(Math.random() * colors.length)],
          wireframe: Math.random() > 0.5,
        });
        const cube = new THREE.Mesh(geo, mat);
        cube.position.set(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4
        );
        cube.userData.speed = 0.002 + Math.random() * 0.008;
        cube.userData.driftSpeed = 0.003 + Math.random() * 0.006;
        cube.userData.type = 'cube';
        scene.add(cube);
        objects.push(cube);
      }

      // Coins (flat planes)
      for (let i = 0; i < coinCount; i++) {
        const geo = new THREE.PlaneGeometry(0.08, 0.08);
        const mat = new THREE.MeshBasicMaterial({
          color: 0xC8860A,
          side: THREE.DoubleSide,
        });
        const coin = new THREE.Mesh(geo, mat);
        coin.position.set(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 3
        );
        coin.userData.speed = 0.005 + Math.random() * 0.01;
        coin.userData.driftSpeed = 0.002 + Math.random() * 0.005;
        coin.userData.type = 'coin';
        scene.add(coin);
        objects.push(coin);
      }

      // Mouse parallax
      const mouse = { x: 0, y: 0 };
      const handleMouseMove = (e) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener('mousemove', handleMouseMove);

      // Resize
      const handleResize = () => {
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      // Animate
      const animate = () => {
        animationId = requestAnimationFrame(animate);

        objects.forEach((obj) => {
          obj.rotation.x += obj.userData.speed;
          obj.rotation.y += obj.userData.speed * 0.7;
          obj.position.y += obj.userData.driftSpeed;

          if (obj.position.y > 5) {
            obj.position.y = -5;
            obj.position.x = (Math.random() - 0.5) * 12;
          }
        });

        // Lerp camera toward mouse
        camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.02;
        camera.position.y += (mouse.y * 0.3 - camera.position.y) * 0.02;

        renderer.render(scene, camera);
      };

      animate();

      // Cleanup references
      canvasRef.current._cleanup = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
        renderer.dispose();
      };
    };

    init();

    return () => {
      if (canvasRef.current && canvasRef.current._cleanup) {
        canvasRef.current._cleanup();
      }
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" id="three-canvas" />;
}
