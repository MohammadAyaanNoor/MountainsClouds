import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Lenis from 'lenis'
import gsap from 'gsap';
import { GLTFLoader, OutputPass } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import mountainVertex from './Shaders/mountainShaders/vertex.vert';
import mountainFragment from './Shaders/mountainShaders/fragment.frag';
import peakVertex from './Shaders/PeakShaders/vertex.vert';
import peakFragment from './Shaders/PeakShaders/fragment.frag';
import cloudVertex from './Shaders/cloudsShaders/vertex.vert';
import cloudFragment from './Shaders/cloudsShaders/fragment.frag';
import GUI from 'lil-gui';

const gui = new GUI()
// Initialize Lenis
const lenis = new Lenis({
  autoRaf: true,
  duration: 4.0,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});
const canvas = document.querySelector('.webgl');
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}
const loader = new THREE.TextureLoader()
const perlin = loader.load('/PerlinNoise.webp')
const noise = loader.load('/noise.webp')
const voronoiTexture = loader.load('/voronoi.webp');
voronoiTexture.wrapS = THREE.RepeatWrapping;
voronoiTexture.wrapT = THREE.RepeatWrapping;
// Load the normal map (adjust the path to match your actual file)
const normalTexture = loader.load('/rock_normal.webp'); 
normalTexture.wrapS = THREE.RepeatWrapping;
normalTexture.wrapT = THREE.RepeatWrapping;

const snowDiffuseTexture = loader.load('/snow_diffuse.webp');
snowDiffuseTexture.wrapS = THREE.RepeatWrapping;
snowDiffuseTexture.wrapT = THREE.RepeatWrapping;

const snowRockMixTexture = loader.load('/snowRockMix.webp');
// We do not repeat the mask because it is usually painted to map 1:1 to the UVs of the whole model
snowRockMixTexture.wrapS = THREE.ClampToEdgeWrapping;
snowRockMixTexture.wrapT = THREE.ClampToEdgeWrapping;


const noiseNormalTexture = loader.load('/noise-solid-normal.webp'); 
noiseNormalTexture.wrapS = THREE.RepeatWrapping;
noiseNormalTexture.wrapT = THREE.RepeatWrapping;

const rockDiffuseTexture = loader.load('/rock_diffuse.webp');
rockDiffuseTexture.wrapS = THREE.RepeatWrapping;
rockDiffuseTexture.wrapT = THREE.RepeatWrapping;


// 1. INITIALIZE SCENE, CAMERA, AND CONTROLS FIRST
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2('#d6e1ed', 4.15); // Adjust color and density
scene.background = new THREE.Color('#d6e1ed');

// --- CAMERA & PARALLAX SETUP ---
const cameraGroup = new THREE.Group(); // Create a group to hold the camera
scene.add(cameraGroup);

const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 30, 1000);
camera.position.z = 500;
camera.fov = (180 * (2 * Math.atan(window.innerHeight / 2 / 500))) / Math.PI;
camera.updateProjectionMatrix();
cameraGroup.add(camera); // Add camera to the group instead of the scene

// Track mouse position (-0.5 to 0.5)
const cursor = { x: 0, y: 0 };
window.addEventListener('mousemove', (event) => {
  cursor.x = (event.clientX / sizes.width) - 0.5;
  cursor.y = (event.clientY / sizes.height) - 0.5;
});

const controls = new OrbitControls(camera, canvas);
controls.enabled = false
controls.enableDamping = true;


const mountainMaterial = new THREE.ShaderMaterial({
  vertexShader: mountainVertex,
  fragmentShader: mountainFragment,
  uniforms: {
    uNormalMap: new THREE.Uniform(normalTexture),
    uSnowDiffuse: new THREE.Uniform(snowDiffuseTexture),
    uSnowRockMix: new THREE.Uniform(snowRockMixTexture),
    uRockNormal : new THREE.Uniform(noiseNormalTexture)
  },
  transparent:true
});

const peakMaterial = new THREE.ShaderMaterial({
  vertexShader: peakVertex,
  fragmentShader: peakFragment,
  uniforms: {
    uNormalMap: new THREE.Uniform(normalTexture),
    uSnowDiffuse: new THREE.Uniform(snowDiffuseTexture),
    uSnowRockMix: new THREE.Uniform(snowRockMixTexture),
    uSnowDiffuse: new THREE.Uniform(snowDiffuseTexture),
    uSnowRockMix: new THREE.Uniform(snowRockMixTexture)
  },
  transparent:true
});

const cloudMaterial = new THREE.ShaderMaterial({
  vertexShader: cloudVertex,
  fragmentShader: cloudFragment,
  uniforms:{
    uTime : new THREE.Uniform(0),
    uNoise : new THREE.Uniform(noise),
    uPerlin : new THREE.Uniform(perlin),
    uVoronoi: new THREE.Uniform(voronoiTexture)
  },

  side: THREE.DoubleSide, // Helpful in case clouds are viewed from behind
  transparent: true,
  depthWrite:false,
  depthTest:false
});
// --- NEW SKYBOX SHADERS ---
const skyboxVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyboxFragment = `
  uniform sampler2D uPerlin;
  varying vec2 vUv;

  void main() {
    // Calculate a couple of octaves of noise by sampling the texture at different scales
    float noise = texture2D(uPerlin, vUv * 2.0).r * 0.5;
    noise += texture2D(uPerlin, vUv * 4.0).r * 0.25;
    noise += texture2D(uPerlin, vUv * 8.0).r * 0.125;

    // Convert hex colors to normalized RGB floats
    // #9aa7b2 = 154, 167, 178 -> 0.604, 0.655, 0.698
    // #e5ecf2 = 229, 236, 242 -> 0.898, 0.925, 0.949
    vec3 color1 = vec3(0.604, 0.655, 0.698);
    vec3 color2 = vec3(0.898, 0.925, 0.949);

    // Mix the two colors using the generated noise
    vec3 finalColor = mix(color1, color2, noise);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const skyboxMaterial = new THREE.ShaderMaterial({
  vertexShader: skyboxVertex,
  fragmentShader: skyboxFragment,
  uniforms: {
    uPerlin: new THREE.Uniform(perlin)
  },
  depthWrite: false, // Moved from the loader into the material definition
  side: THREE.BackSide // Usually required for skyboxes so they render on the inside
});


// 3. NOW LOAD THE MODELS
// 3. NOW LOAD THE MODELS
const gltfLoader = new GLTFLoader();

const mountain = gltfLoader.load('/models/mountains.glb', (gltf) => {
  const model = gltf.scene;
  model.position.y = 10
  model.traverse((child) => {
    if (child.isMesh) {
      // Safely get the child name and parent name
      const name = child.name ? child.name.toLowerCase() : '';
      const parentName = child.parent && child.parent.name ? child.parent.name.toLowerCase() : '';

      // Hide the 3D curve
      if (name.includes('curve') || parentName.includes('curve')) {
        child.visible = false;
      }

      // Assign materials, properties, and render order to the visible objects
      if (child.visible !== false) {
        if (name.includes('mountain') || parentName.includes('mountain')) {
          child.material = mountainMaterial;
          child.renderOrder = 1; // Big mountain render order
        } else if (name.includes('peak') || parentName.includes('peak')) {
          child.material = peakMaterial;
          child.renderOrder = 20; // Small peaks render order
        } else if (name.includes('cloud') || parentName.includes('clouds')) {
          child.material = cloudMaterial;
          child.renderOrder = 10; // Clouds render order
        } else if (name.includes('skybox') || parentName.includes('skybox')) {
          // --- APPLY NEW SKYBOX MATERIAL ---
          child.material = skyboxMaterial;
          child.renderOrder = -10; // Forces it to render first (in the background)
        }
      }
    }
  });

  scene.add(model);
  
  // --- CAMERA POSITIONING LOGIC ---
  const pointHomepage = model.getObjectByName('Point-Homepage');
  const targetPointHomepage = model.getObjectByName('TargetPoint-Homepage');

  if (pointHomepage && targetPointHomepage) {
    const cameraPos = new THREE.Vector3();
    const targetPos = new THREE.Vector3();

    pointHomepage.getWorldPosition(cameraPos);
    targetPointHomepage.getWorldPosition(targetPos);

    

    camera.position.copy(cameraPos);
    controls.target.copy(targetPos);
    
    camera.lookAt(targetPos);

    camera.fov = (180 * (2 * Math.atan(window.innerHeight / 2 / 500))) / Math.PI;
    camera.updateProjectionMatrix();

    controls.update();
  } else {
    console.warn("Could not find 'Point-Homepage' or 'TargetPoint-Homepage' in the model.");
  }
});

const homepage = gltfLoader.load('/models/Homepage.glb', (gltf) => {
  const model = gltf.scene;
  
  model.traverse((child) => {
    // InstancedMesh returns true for child.isMesh, so this catches it!
    if (child.isMesh) {
      const name = child.name ? child.name.toLowerCase() : '';
      const parentName = child.parent && child.parent.name ? child.parent.name.toLowerCase() : '';

      // Hide the curve
      if (name.includes('curve') || parentName.includes('curve')) {
        child.visible = false;
      }

      // Assign materials and render order
      if (child.visible !== false) {
        if (name.includes('mountain') || parentName.includes('mountain')) {
          child.material = mountainMaterial;
          child.renderOrder = 1;
        } else if (name.includes('peak') || parentName.includes('peak')) {
          child.material = peakMaterial;
          child.renderOrder = 20;
        } else if (name.includes('cloud') || parentName.includes('cloud')) {
          // This will now successfully apply to the InstancedMesh clouds!
          // child.material = cloudMaterial; 
          child.renderOrder = 10;
        }
      }
    }
  });

  scene.add(model);
});

// Adds a soft global light to illuminate all textures evenly
const ambientLight = new THREE.AmbientLight('#ffffff', 1.5);
scene.add(ambientLight);

// Adds a directional sun-like light for shadows and depth
const directionalLight = new THREE.DirectionalLight('#ffffff', 2);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

let webglImages = [];
// function setMediaSize(){
//   const images = [...document.querySelectorAll('[data-webgl-media]')]

//   const imageGeo = new THREE.PlaneGeometry(1,1,32,32);
// webglImages =  images.map((img,i)=>{
//   img.style.opacity = 0;
//     const {width,height,top,left} = img.getBoundingClientRect();
//     const material = new THREE.ShaderMaterial({
//       vertexShader: vertex,
//       fragmentShader: fragment,
//       uniforms : {
//         uTime : new THREE.Uniform(0),
//         uTexture : new THREE.Uniform(new THREE.TextureLoader().load(img.src)),
//         uResolution : new THREE.Uniform(new THREE.Vector2(width,height)),
//         uMouse : new THREE.Uniform(new THREE.Vector2(0,0)),
//         uEnter : new THREE.Uniform(0)

//       }
//     })
//     const mesh = new THREE.Mesh(imageGeo, material);
//     mesh.scale.set(width,height,1);
//     mesh.position.x = left - sizes.width/2 + width/2;
//     mesh.position.y = -top + sizes.height/2 - height/2 + scrollY;

//     scene.add(mesh);

//     img.addEventListener('mousemove',(e)=>{
//       const x = e.offsetX/width;
//       const y = 1.0 - e.offsetY/height;

//       gsap.to(material.uniforms.uMouse.value,{
//         x: x,
//         y: y,
//         duration: 0.5,
//         ease: 'circ'

//       })

//     })
//     img.addEventListener('mouseenter',(e)=>{
//       gsap.to(material.uniforms.uEnter,{
//         value: 1,
//         duration: 0.5,
//         ease: 'circ'
//       })
//     })
      
//     img.addEventListener('mouseleave',()=>{
//       gsap.to(material.uniforms.uEnter,{
//         value: 0,
//         duration: 0.5
//       })
//     })

//     return{
//     mesh,
//     material,
//     img
//   }
// })
// }
// setMediaSize()
// function updatePosition(){
//   webglImages.forEach((obj,i)=>{
//     const {width,height,top,left} = obj.img.getBoundingClientRect();
//     obj.mesh.position.x = left - sizes.width/2 + width/2;
//     obj.mesh.position.y = -top + sizes.height/2 - height/2;
//   })
// }

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setClearColor('#868686', 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;

// --- NEW POST-PROCESSING SETUP ---
const renderPass = new RenderPass(scene, camera);

// Parameters: resolution, strength, radius, threshold
const unrealBloomPass = new UnrealBloomPass()
unrealBloomPass.strength = 0.2
unrealBloomPass.radius = 1
unrealBloomPass.threshold = 0.2
unrealBloomPass.enabled = false

gui.add(unrealBloomPass,'enabled')
gui.add(unrealBloomPass,'strength',0,2,0.001)
gui.add(unrealBloomPass,'radius',0,2,0.001)
gui.add(unrealBloomPass,'threshold',0,1,0.001)


const renderTarget = new THREE.WebGLRenderTarget(
    800,
    600,
    {
        samples:renderer.getPixelRatio === 1 ? 2 : 0
    }

)

const composer = new EffectComposer(renderer,renderTarget);
composer.addPass(renderPass); // 1. Render the base scene
composer.addPass(unrealBloomPass)   // 2. Add the glowing bloom
composer.setSize(sizes.width, sizes.height)
composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
window.addEventListener('resize',()=>{
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  composer.setSize(sizes.width, sizes.height);
})

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));



const clock = new THREE.Clock();

function tick(time){
  // Update Lenis
  lenis.raf(time);
  // const elapsedTime = clock.getElapsedTime()
  const deltaTime = clock.getDelta();
  cloudMaterial.uniforms.uTime.value += deltaTime
  // console.log(cloudMaterial.uniforms.uTime.value)
  // Sync meshes with HTML scroll position
  // updatePosition();

  // Update uniforms/controls
  // webglImages.forEach((obj)=>{
  //   obj.material.uniforms.uTime.value = time/1000;
  // })
  const parallaxAmplitude = 25; // Increase this to make the movement wider
  const parallaxSpeed = 3;      // Increase this to make it follow the mouse faster
  
  // Calculate the target position based on mouse
  const targetX = cursor.x * parallaxAmplitude;
  const targetY = -cursor.y * parallaxAmplitude; // Invert Y so moving mouse up looks up

  // Smoothly interpolate (lerp) the camera group's position
  cameraGroup.position.x += (targetX - cameraGroup.position.x) * parallaxSpeed * deltaTime;
  cameraGroup.position.y += (targetY - cameraGroup.position.y) * parallaxSpeed * deltaTime;
  controls.update()
  // renderer.render(scene, camera);
  composer.render(scene,camera);
  window.requestAnimationFrame(tick);
}
tick();