import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import GUI from 'lil-gui';
import waterVertexShader from './shaders/water/vertex.glsl';
import waterFragmentShader from './shaders/water/fragment.glsl';

/**
 * Steps
 */
/*
    - Real Shading with Lights: Adding directional/point Lights
    - Adding reflection
    - Prepare the shader
    - Directional Light: 
        - We need the normal and the view direction(vertor from the camera to the position of the fragment)
        - Issue: all the normals are currently pointing upward, completely ignoring the actual shape of the waves
        - We cannot update the normal attribute because it would need to change on each frame (much subdivision, many vertices)
        - Despite we need to figure out a way of updating the normals from the vertex agaix
        - In the case of a grid we can use "the neighbours technique": Ignoring the normal attribute and calculate 
        the theoritical position of neighbours to calculate the normal (putting the neighbour at the same distance)
        - Then we are going to calculate a direction coming from th middle vertex.(cross product = perpendicular to the both neighbours)
        - We are going to find neighbours applying the wave elevation: Elevation as a functio
        - to chatch elevation details form neighbours with a smaller"shift", that will not be visible in the final waves
        - to chatch elevation details form neighbours with a bigger"shift", we might miss elevation details

*/
/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 });
const debugObject = {};

// Canvas
const canvas = document.querySelector('canvas.webgl');

//Loaders
const dracoLoader = new DRACOLoader();

dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);


// Scene
const scene = new THREE.Scene();

// Axes Helper 
// const axesHelper = new THREE.AxesHelper();
// axesHelper.position.y += 0.25;
// scene.add(axesHelper);

// Crea una luz direccional y colócala en la escena
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight2.position.set(-2, 5, -2);
scene.add(directionalLight2);

/**
 * Models- GLTF Loader
 */

let silverSurfer;

gltfLoader.load(
    '/models/silver_surfer.glb',
    (gltf) => {
        // gltf.scene es un objeto THREE.Group que contiene el modelo
        silverSurfer = gltf.scene;
      
        
        // Opcional: ajustar escala, posición o rotación del modelo
        silverSurfer.scale.set(0.3, 0.3, 0.3);
        silverSurfer.position.set(0, 0, 0);

          // Recorrer todas las mallas del modelo
          silverSurfer.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;   
              child.receiveShadow = true; 
            }
          });
          
    
        // Agregar el modelo a la escena
        scene.add(silverSurfer);
      },
      (xhr) => {
        // Callback para el progreso de la carga (opcional)
        console.log((xhr.loaded / xhr.total * 100) + '% cargado');
      },
      (error) => {
        // Callback en caso de error
        console.error('Error al cargar el modelo:', error);
      }
);


/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512);
//Since we are calculating the normal ourselves, we can remove
// the normal attribute from the geometry using deleteAttribute
waterGeometry.deleteAttribute('normal');
waterGeometry.deleteAttribute('uv');
//The only attribute that we only have is the position

// Colors
debugObject.depthColor = '#ff4000'; //#186691
debugObject.surfaceColor = '#151c37'; //#9bd8ff

gui.addColor(debugObject, 'depthColor').onChange(() => { waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor) });
gui.addColor(debugObject, 'surfaceColor').onChange(() => { waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor) });

// Material
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
   // wireframe: true,
    uniforms:
    {
        uTime: { value: 0 },
        
        uBigWavesElevation: { value: 0.2 },
        uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
        uBigWavesSpeed: { value: 0.75 },

        uSmallWavesElevation: { value: 0.15 },
        uSmallWavesFrequency: { value: 3 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallIterations: { value: 4 },

        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
        uColorOffset: { value: 0.925 }, //0.08
        uColorMultiplier: { value: 1 }//5
    }
});

gui.add(waterMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('uBigWavesElevation');
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWavesFrequencyX');
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWavesFrequencyY');
gui.add(waterMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('uBigWavesSpeed');

gui.add(waterMaterial.uniforms.uSmallWavesElevation, 'value').min(0).max(1).step(0.001).name('uSmallWavesElevation');
gui.add(waterMaterial.uniforms.uSmallWavesFrequency, 'value').min(0).max(30).step(0.001).name('uSmallWavesFrequency');
gui.add(waterMaterial.uniforms.uSmallWavesSpeed, 'value').min(0).max(4).step(0.001).name('uSmallWavesSpeed');
gui.add(waterMaterial.uniforms.uSmallIterations, 'value').min(0).max(5).step(1).name('uSmallIterations');

gui.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset');
gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplier');

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = - Math.PI * 0.5;
scene.add(water);


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(1, 1, 1);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
// addding the toneMapping
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();

    // Water
    waterMaterial.uniforms.uTime.value = elapsedTime;

    //update silver surfer
      // Actualiza el uniform de tiempo para cada malla
     
      

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
}

tick();