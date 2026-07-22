/* ==========================================================================
   Three.js 3D Graphics Engine - Frutería Mis Dos Angelitos
   Renders Floating Yucatecan 3D Citrus in Hero & 3D Huacal in Wholesale
   ========================================================================== */

(function () {
  'use strict';

  // Wait for Three.js to load
  window.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js library not detected yet.');
      return;
    }

    initHero3D();
    initHuacal3D();
  });

  // --- HERO 3D SCENE (Floating Citrus & Particles) ---
  function initHero3D() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const container = canvas.parentElement;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffb300, 1.2);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x2e7d32, 0.8);
    dirLight2.position.set(-5, -5, 5);
    scene.add(dirLight2);

    // Group for 3D fruits
    const fruitsGroup = new THREE.Group();
    scene.add(fruitsGroup);

    // 1. Orange Fruit
    const orangeGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const orangeMat = new THREE.MeshStandardMaterial({
      color: 0xff6f00,
      roughness: 0.3,
      metalness: 0.1,
      bumpScale: 0.05
    });
    const orangeMesh = new THREE.Mesh(orangeGeo, orangeMat);
    orangeMesh.position.set(-1.2, 0.5, 0);

    // Leaf for orange
    const leafGeo = new THREE.ConeGeometry(0.3, 0.8, 16);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.4 });
    const leafMesh = new THREE.Mesh(leafGeo, leafMat);
    leafMesh.position.set(-1.2, 2.1, 0);
    leafMesh.rotation.z = Math.PI / 4;
    orangeMesh.add(leafMesh);

    fruitsGroup.add(orangeMesh);

    // 2. Lime / Limón Persa Fruit
    const limeGeo = new THREE.SphereGeometry(1.1, 32, 32);
    limeGeo.scale(1, 1.2, 1);
    const limeMat = new THREE.MeshStandardMaterial({
      color: 0x4caf50,
      roughness: 0.25,
      metalness: 0.05
    });
    const limeMesh = new THREE.Mesh(limeGeo, limeMat);
    limeMesh.position.set(1.8, -0.6, 1);
    fruitsGroup.add(limeMesh);

    // 3. Small Mandarina
    const manGeo = new THREE.SphereGeometry(0.9, 24, 24);
    manGeo.scale(1.2, 0.9, 1.2);
    const manMat = new THREE.MeshStandardMaterial({
      color: 0xffa000,
      roughness: 0.4
    });
    const manMesh = new THREE.Mesh(manGeo, manMat);
    manMesh.position.set(0.5, 1.8, -1);
    fruitsGroup.add(manMesh);

    // 4. Pitahaya (Red/Pink Sphere with spikes)
    const pitaGeo = new THREE.SphereGeometry(0.8, 24, 24);
    const pitaMat = new THREE.MeshStandardMaterial({
      color: 0xd50000,
      roughness: 0.3
    });
    const pitaMesh = new THREE.Mesh(pitaGeo, pitaMat);
    pitaMesh.position.set(-2.2, -1.5, -0.5);
    fruitsGroup.add(pitaMesh);

    // 5. Fresh Water Droplet Particles
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 12;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x81c784,
      size: 0.12,
      transparent: true,
      opacity: 0.7
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (e.clientX - windowHalfX) / 100;
      mouseY = (e.clientY - windowHalfY) / 100;
    });

    // Animation Loop
    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Floating sine wave motion
      orangeMesh.position.y = 0.5 + Math.sin(elapsedTime * 1.5) * 0.2;
      orangeMesh.rotation.y += 0.008;

      limeMesh.position.y = -0.6 + Math.cos(elapsedTime * 1.8) * 0.18;
      limeMesh.rotation.x += 0.01;

      manMesh.position.y = 1.8 + Math.sin(elapsedTime * 2.0) * 0.15;
      manMesh.rotation.z += 0.007;

      pitaMesh.position.y = -1.5 + Math.sin(elapsedTime * 1.2) * 0.25;

      particles.rotation.y = elapsedTime * 0.05;

      // Mouse inertia tracking
      targetX = mouseX * 0.3;
      targetY = mouseY * 0.3;

      fruitsGroup.rotation.y += (targetX - fruitsGroup.rotation.y) * 0.05;
      fruitsGroup.rotation.x += (targetY - fruitsGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    }

    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth && newHeight) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    });
  }

  // --- WHOLESALE 3D SCENE (Traditional Yucatecan Wooden Crate / Huacal) ---
  function initHuacal3D() {
    const canvas = document.getElementById('crate-canvas');
    if (!canvas) return;

    const container = canvas.parentElement;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(4, 3, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffd54f, 1.5);
    mainLight.position.set(6, 8, 5);
    scene.add(mainLight);

    const crateGroup = new THREE.Group();
    scene.add(crateGroup);

    // Wood Material
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x8d6e63,
      roughness: 0.7,
      metalness: 0.1
    });

    const slatGeoHoriz = new THREE.BoxGeometry(3.2, 0.25, 0.08);
    const slatGeoSide = new THREE.BoxGeometry(0.08, 0.25, 2.2);
    const cornerPostGeo = new THREE.BoxGeometry(0.15, 1.4, 0.15);

    // Build 4 Corner Posts
    const corners = [
      [-1.5, 0, -1.0],
      [1.5, 0, -1.0],
      [-1.5, 0, 1.0],
      [1.5, 0, 1.0]
    ];

    corners.forEach(pos => {
      const post = new THREE.Mesh(cornerPostGeo, woodMat);
      post.position.set(pos[0], pos[1], pos[2]);
      crateGroup.add(post);
    });

    // Horizontal Slats (Front & Back)
    [-0.4, 0, 0.4].forEach(y => {
      const slatFront = new THREE.Mesh(slatGeoHoriz, woodMat);
      slatFront.position.set(0, y, 1.04);
      crateGroup.add(slatFront);

      const slatBack = new THREE.Mesh(slatGeoHoriz, woodMat);
      slatBack.position.set(0, y, -1.04);
      crateGroup.add(slatBack);
    });

    // Side Slats (Left & Right)
    [-0.4, 0, 0.4].forEach(y => {
      const slatLeft = new THREE.Mesh(slatGeoSide, woodMat);
      slatLeft.position.set(-1.54, y, 0);
      crateGroup.add(slatLeft);

      const slatRight = new THREE.Mesh(slatGeoSide, woodMat);
      slatRight.position.set(1.54, y, 0);
      crateGroup.add(slatRight);
    });

    // Bottom Slats
    [-1.0, -0.5, 0, 0.5, 1.0].forEach(x => {
      const botSlat = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 2.1), woodMat);
      botSlat.position.set(x, -0.65, 0);
      crateGroup.add(botSlat);
    });

    // Fill Crate with 3D Oranges inside
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xff6f00, roughness: 0.3 });
    const orangeGeo = new THREE.SphereGeometry(0.35, 16, 16);

    for (let x = -1.1; x <= 1.1; x += 0.45) {
      for (let z = -0.7; z <= 0.7; z += 0.45) {
        for (let y = -0.4; y <= 0.3; y += 0.35) {
          if (Math.random() > 0.15) {
            const fruit = new THREE.Mesh(orangeGeo, orangeMat);
            fruit.position.set(
              x + (Math.random() - 0.5) * 0.1,
              y + (Math.random() - 0.5) * 0.08,
              z + (Math.random() - 0.5) * 0.1
            );
            crateGroup.add(fruit);
          }
        }
      }
    }

    // Interactive Drag to Rotate Crate
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      crateGroup.rotation.y += deltaMove.x * 0.01;
      crateGroup.rotation.x += deltaMove.y * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Animation Loop
    function animateHuacal() {
      requestAnimationFrame(animateHuacal);
      if (!isDragging) {
        crateGroup.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    }

    animateHuacal();
  }
})();
