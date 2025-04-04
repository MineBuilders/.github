import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import './background';

const image = document.querySelector<HTMLElement>('#index-page .logo img');
const canvas = document.querySelector<HTMLElement>('#index-page .logo canvas');
const logoBox = document.querySelector<HTMLElement>('#index-page .logo-box');

const animationStart = Date.now();
let animationDone = false;
logoBox.addEventListener('animationend', _ =>
    setTimeout(() => animationDone = true, (Date.now() - animationStart) * 1.3));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 1, 0.01, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
const deg = THREE.MathUtils.degToRad(1)

camera.position.set(0, 0, 56);
renderer.setClearAlpha(0);

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 10);
scene.add(ambientLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const loader = new GLTFLoader();
let logo: THREE.Object3D<THREE.Object3DEventMap>;
loader.load("./assets/models/logo.glb", data => {
    logo = data.scene;
    logo.remove(logo.getObjectByName('node_3'));
    logo.rotation.y = -90 * deg;
    scene.add(logo);

    animate();
    postShowCanvas();
});

let currentRotationY = 0;
function animate() {
    if (logo) logo.rotation.y = (-90 + currentRotationY) * deg;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

let canvasActiveTimer = null;
const canvasActive = () => {
    canvas.classList.add('active-animation');
    canvas.classList.add('active');
    if (canvasActiveTimer) clearTimeout(canvasActiveTimer);
    canvasActiveTimer = setTimeout(() => canvas.classList.remove("active"), 3000);
};
canvas.addEventListener('touchstart', canvasActive);
canvas.addEventListener('touchmove', canvasActive);
let mouseDown = false;
// @ts-ignore
canvas.addEventListener('mousedown', () => mouseDown = canvasActive() || true);
canvas.addEventListener('mouseup', () => mouseDown = false);
canvas.addEventListener('mousemove', () => mouseDown && canvasActive());
canvas.addEventListener('wheel', canvasActive);

function postShowCanvas() {
    if (animationDone) showCanvas();
    else setTimeout(postShowCanvas, 100);
}
function showCanvas() {
    image.classList.toggle("hide");
    canvas.classList.toggle("hide");
    const { clientWidth, clientHeight } = renderer.domElement;
    const [ width, height ] = [ clientWidth * devicePixelRatio, clientHeight * devicePixelRatio ];
    renderer.setSize(width, height, false);
}
