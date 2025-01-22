import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const image = document.querySelector<HTMLElement>('#index-page .logo img');
const canvas = document.querySelector<HTMLElement>('#index-page .logo canvas');
const logoBox = document.querySelector<HTMLElement>('#index-page .logo-box');
const titleBox = document.querySelector<HTMLElement>('#index-page .title');

const animationStart = Date.now();
let animationDone = false;
logoBox.addEventListener('animationend', _ =>
    setTimeout(() => animationDone = true, (Date.now() - animationStart) * 1.3));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 80);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
const deg = THREE.MathUtils.degToRad(1)

camera.position.set(0, 0, 56);
renderer.setClearAlpha(0);

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 10);
scene.add(ambientLight);

const loader = new GLTFLoader();
let logo: THREE.Object3D<THREE.Object3DEventMap>;
loader.load("./assets/models/logo.glb", data => {
    logo = data.scene;
    logo.rotation.y = -90 * deg;
    scene.add(logo);

    animate();
    postShowCanvas();
});

let currentRotationY = 0;
function animate() {
    if (logo) logo.rotation.y = (-90 + currentRotationY) * deg;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

function postShowCanvas() {
    if (animationDone) showCanvas();
    else setTimeout(postShowCanvas, 100);
}
function showCanvas() {
    image.classList.toggle("hide");
    canvas.classList.toggle("hide");
    const { clientWidth, clientHeight } = renderer.domElement;
    const [ width, height ] = [clientWidth * devicePixelRatio, clientHeight * devicePixelRatio];
    renderer.setSize(width, height, false);
}



const bezier = cubicBezier(1, -0.54, 0, 1.54);
const autoRotation = setInterval(() => {
    if (!animationDone) return;
    const endN = 300;
    let n = 0;
    const timer = setInterval(() =>
        // @ts-ignore
        currentRotationY = ++n >= endN ? clearInterval(timer) || 0 : 360 * bezier(n / endN), 1);
}, 5000);

function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
    const bezier = (t: number, p0: number, p1: number, p2: number, p3: number) => {
        const u = 1 - t;
        return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
    }
    const solveX = (t: number) => bezier(t, 0, x1, x2, 1);
    const solveY = (t: number) => bezier(t, 0, y1, y2, 1);
    return function(t: number) {
        let left = 0;
        let right = 1;
        const epsilon = 0.0001;
        let x = solveX(t);

        while (right - left > epsilon) {
            let mid = (left + right) / 2;
            let xMid = solveX(mid);
            if (xMid < x) {
                left = mid;
            } else {
                right = mid;
            }
        }

        let resultT = (left + right) / 2;
        return solveY(resultT);
    };
}
