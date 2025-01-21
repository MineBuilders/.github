import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let animatedDone = false;
setTimeout(() => animatedDone = true, 1600);

const img = document.querySelector('#index-page .logo img');
const canvas = document.querySelector('#index-page .logo canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 64);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });

camera.position.set(0, 0, 56);
renderer.setClearAlpha(0);

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 10);
scene.add(ambientLight);

animate();

const deg = THREE.MathUtils.degToRad(1)

const loader = new GLTFLoader();
let logo: THREE.Object3D<THREE.Object3DEventMap>;
loader.load("./assets/models/logo.glb", data => {
    logo = data.scene;
    logo.rotation.y = -90 * deg;
    scene.add(logo);

    postShowCanvas();
});

// let currentRotationY = 0;
function animate() {
    // if (logo) logo.rotation.y = (-90 + currentRotationY) * deg;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

function postShowCanvas() {
    if (animatedDone) showCanvas();
    else setTimeout(postShowCanvas, 100);
}
function showCanvas() {
    img.classList.toggle("hide");
    canvas.classList.toggle("hide");
    const { clientWidth, clientHeight } = renderer.domElement;
    const [ width, height ] = [clientWidth * devicePixelRatio, clientHeight * devicePixelRatio];
    renderer.setSize(width, height, false);
}
