import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import gsap from "gsap";

/**
 * Initial for Three.js
 */
// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const bggeometry = new THREE.SphereGeometry(500, 60, 40);
// invert the geometry on the x-axis so that all of the faces point inward
bggeometry.scale(-1, 1, 1);
const bgtexture = new THREE.TextureLoader().load("bg.jpg");
bgtexture.colorSpace = THREE.SRGBColorSpace;
const bgmaterial = new THREE.MeshBasicMaterial({ map: bgtexture });

const mesh = new THREE.Mesh(bggeometry, bgmaterial);

scene.add(mesh);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// MODELVIEWER
let pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(
  new RoomEnvironment(),
  0.04
).texture;

// Light
// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
// scene.add(directionalLight);
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
// scene.add(ambientLight);

// Axishelper
const axisHelper = new THREE.AxesHelper(5);
scene.add(axisHelper);

// Control
const orbitControls = new OrbitControls(camera, renderer.domElement);
camera.position.set(4, 4, 4);
orbitControls.update();

/**
 * Main
 */
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let intersects;

const outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene,
  camera
);
outlinePass.visibleEdgeColor.set("#ff0000");
outlinePass.edgeStrength = 3;
outlinePass.edgeThickness = 2;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(outlinePass);

// Car model
const gltfLoader = new GLTFLoader();

let car_outside_duration = 1;
let car_outside_delay = 4;

// Car Body
let car;
let wheel_f, wheel_b, underbody; // Wheel and bottom
let car_body_only = new THREE.Object3D();

// Engine
let engine;
let engine_split_parent;

gltfLoader.load("car.glb", function (gltf) {
  car = gltf.scene;
  scene.add(car);
  car.scale.set(0, 0, 0);
  car.rotation.y = - Math.PI * 8;

  gsap.to(car.rotation, {
    duration: 3,
    y: 0,
  })
  gsap.to(car.scale, {
    duration: 3,
    x: 1,
    y: 1,
    z: 1,
  })

  // Define
  wheel_f = scene.getObjectByName("Cylinder001"); // front wheel
  wheel_b = scene.getObjectByName("Cylinder000"); // back wheel
  underbody = scene.getObjectByName("underbody"); // underbody
  engine = scene.getObjectByName("v8_engineglb"); // engine
  engine_split_parent =
    engine.children[0].children[0].children[0].children[0].children;

  car_body_only = scene
    .getObjectByName("Root")
    .children.filter(
      (child) =>
        child.name !== "Cylinder001" &&
        child.name !== "Cylinder000" &&
        child.name !== "underbody"
    );

  // car body
  gsap.to(wheel_f.position, {
    // front wheel
    duration: car_outside_duration,
    delay: car_outside_delay,
    y: -5,
  });
  gsap.to(wheel_b.position, {
    // back wheel
    duration: car_outside_duration,
    delay: car_outside_delay,
    y: 5,
  });
  gsap.to(underbody.position, {
    // underboard
    duration: car_outside_duration,
    delay: car_outside_delay,
    z: -4,
  });
  car_body_only.forEach((child) => {
    // car body
    gsap.to(child.position, {
      duration: car_outside_duration,
      delay: car_outside_delay,
      z: 4,
    });
  });

  gsap.to(wheel_f.position, {
    // front wheel
    duration: car_outside_duration,
    delay: car_outside_delay + car_outside_duration,
    x: -5,
  });
  gsap.to(wheel_b.position, {
    // back wheel
    duration: car_outside_duration,
    delay: car_outside_delay + car_outside_duration,
    x: -5,
  });
  gsap.to(underbody.position, {
    // underboard
    duration: car_outside_duration,
    delay: car_outside_delay + car_outside_duration,
    x: -5,
  });
  car_body_only.forEach((child) => {
    // car body
    gsap.to(child.position, {
      duration: car_outside_duration,
      delay: car_outside_delay + car_outside_duration,
      x: -5,
    });
  });

  // engine
  gsap.to(engine.position, {
    // engine
    duration: car_outside_duration,
    delay: car_outside_delay + car_outside_duration,
    x: 0,
    y: 0,
    z: 0,
  });
  engine_split_parent.forEach((child) => {
    // engine split
    const pos = child.position;
    gsap.to(child.position, {
      duration: car_outside_duration,
      delay: car_outside_delay + 2 * car_outside_duration,
      x: pos.x * 5,
      y: pos.y * 5,
      z: pos.z * 5,
    });
  });
  gsap.to(camera.position, {
    duration: car_outside_duration,
    delay: car_outside_delay + 2 * car_outside_duration,
    x: 2,
    y: 2,
    z: 2,
  });
  

  // Outline
  for (let i = 0; i < engine_split_parent.length; i++) {
    // Check if the child is not named "qq" or "ww"
    if (
      engine_split_parent[i].name !== "qq" &&
      engine_split_parent[i].name !== "ww"
    ) {
      // Add the child to the outline pass
      outlinePass.selectedObjects.push(engine_split_parent[i]);
    }
  }
});

window.addEventListener("mousemove", function (event) {
  // Calculate the mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Raycast from the camera to the mouse position
  raycaster.setFromCamera(mouse, camera);

  // Get the intersected objects
  try {
    intersects = raycaster.intersectObjects(engine_split_parent);
    console.log(intersects[0].object.name);

    if (intersects.length > 0) {
      outlinePass.selectedObjects = [intersects[0].object];
    } else {
      outlinePass.selectedObjects = [];
    }

    // Loop through the intersected objects and add them to the outline pass
    // for (let i = 0; i < intersects.length; i++) {
    //   // Check if the intersected object is not named "qq" or "ww"
    //   if (
    //     intersects[i].object.name !== "qq" &&
    //     intersects[i].object.name !== "ww"
    //   ) {
    //     // Add the intersected object to the outline pass
    //     outlinePass.selectedObjects.push(intersects[i].object);
    //   }
    // }
  } catch {}
});

window.addEventListener("click", function (event) {
  try {
    document.querySelector(".card-title h2").innerText =
      intersects[0].object.name;
    document.querySelector(".card-description").innerText =
      intersects[0].object.name;
  } catch {}
});

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  composer.setSize(width, height);
}

window.addEventListener("resize", onWindowResize);

function animate() {
  try {
    // engine.getWorldPosition(enginePos);
    // console.log(enginePos);
  } catch (error) {}

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
