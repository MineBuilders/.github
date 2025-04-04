import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Refractor } from "three/examples/jsm/objects/Refractor.js";
import { WaterRefractionShader } from "three/examples/jsm/shaders/WaterRefractionShader.js";

let isMobile = false;

const background = document.querySelector<HTMLCanvasElement>('#index-page .background');
const foreground = document.querySelector<HTMLCanvasElement>('#index-page .foreground');

const bScene = new THREE.Scene();
const fScene = new THREE.Scene();
const bRenderer = new THREE.WebGLRenderer({ antialias: true, canvas: background });
const fRenderer = new THREE.WebGLRenderer({ antialias: true, canvas: foreground });
const bCamera = new THREE.PerspectiveCamera(60, 1, 0.01, 1000);
const fCamera = new THREE.PerspectiveCamera(60, 1, 0.01, 1000);

resize();

// const controls = new OrbitControls(bCamera, background);
// controls.enableDamping = true;
// controls.target.set(2.78, -14.23, 20.29)

const desktopSets = [
    [ [ 3.55, -11.24, 24.52 ], [ -.23, .36, .08 ] ],
    [ [ 1.09, 4.4, -14.98 ], [ -2.54, .06, 3.1 ] ],
    [ [ 2.18, -12.47, 16.99 ], [ -1.57, 0, -2.49 ] ],
    [ [ 9.68, .13, 32.47 ], [ -.48, .37, .19 ] ],
    [ [ 13.77, 15.33, 14.04 ], [ -.83, .59, .54 ] ],
    [ [ 21.5, 3.04, 18.85 ], [ -.59, .79, .45 ] ],
    [ [ -3.74, -7.22, 11.08 ], [ -1.57, 0, 0 ] ],
    [ [ -.64, -15.63, 14.91 ], [ -.36, .71, .24 ] ],
    [ [ 1.47, -15.68, 18.09 ], [ .02, .39, -.01 ] ],
    [ [ 2.14, -12.49, 17.01 ], [ -.41, -.96, -.34 ] ],
    [ [ 3.71, -13.3, 20.77 ], [ .57, .15, -.1 ] ],
    // [ [ 0, 0, 0 ], [ 0, 0, 0 ] ],
];
const mobileSets = [
    [ [ 2.78, -14.23, 20.29 ], [ -.26, .1, .03 ] ],
];
(([ [ px, py, pz ], [ rx, ry, rz ] ]) => {
    bCamera.position.set(px, py, pz);
    bCamera.rotation.set(rx, ry, rz);
})(getRandom(isMobile ? mobileSets : desktopSets));
// bCamera.position.set(.5, -16, 22);

enum BackgroundStyle {
    MassFog,
    Color,
    BlurGlass,
    BlurColor,
    Wireframe,
    BlurWire,
}

const backgroundStyle = (() => {
    const values = Object.values(BackgroundStyle)
        .filter(value => typeof value === 'number') as number[];
    return getRandom(values) as BackgroundStyle;
})();
// const backgroundStyle = BackgroundStyle.BlurGlass;
console.log("backgroundStyle", backgroundStyle);

((it) => {
    it(bScene, true);
    it(fScene, false);
})((it: THREE.Scene, isBg: boolean) => {
    it.background = new THREE.Color(0x0c101c);
    it.fog = new THREE.FogExp2(0x0c101c, isMobile ? .06 : (
        backgroundStyle == BackgroundStyle.MassFog ? .1 : .04
    ));

    const ambientLight = new THREE.AmbientLight(0x222244,
        backgroundStyle == BackgroundStyle.BlurGlass && !isBg && !isMobile ? 1 : 20);
    it.add(ambientLight);
    const moonLight = new THREE.DirectionalLight(0x8888ff,
        backgroundStyle == BackgroundStyle.BlurGlass && !isBg && !isMobile ? 1 : 20);
    moonLight.position.set(10, 30, -20);
    moonLight.lookAt(.5, -16, 22);
    it.add(moonLight);
    // it.add(new THREE.DirectionalLightHelper(moonLight));

    const lavaLight = new THREE.RectAreaLight(0xff6d00, 50, 5, 6);
    lavaLight.position.set(-3.5, -20, 11);
    lavaLight.rotation.x = THREE.MathUtils.degToRad(90);
    it.add(lavaLight.clone());
    lavaLight.intensity = 20;
    lavaLight.position.y -= 0.001;
    lavaLight.rotation.x = THREE.MathUtils.degToRad(-90);
    it.add(lavaLight);
    // it.add(new RectAreaLightHelper(lavaLight));
});

window.addEventListener("resize", () => {
    bScene.fog = new THREE.FogExp2(0x0c101c, isMobile ? .06 : .04);
});

const updateRefractor = (() => {
    if (backgroundStyle != BackgroundStyle.BlurGlass
        && backgroundStyle != BackgroundStyle.BlurColor
        && backgroundStyle != BackgroundStyle.BlurWire) return () => {
    };
    const loader = new THREE.TextureLoader();
    const normalMap = loader.load('./assets/images/FloorsCheckerboard_S_Normal.jpg');
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    const geometry = new THREE.PlaneGeometry(1, 1);
    const refractor = new Refractor(geometry, {
        color: 0xcbcbcb,
        textureWidth: 512,
        textureHeight: 512,
        shader: WaterRefractionShader,
    });
    refractor.material.uniforms.tDudv.value = normalMap;
    fScene.add(refractor);
    return () => {
        const distanceToPlane = 5;
        const aspectRatio = window.innerWidth / window.innerHeight;
        const fov = fCamera.fov * (Math.PI / 180);
        const height = 2 * Math.tan(fov / 2) * distanceToPlane;
        const width = height * aspectRatio;
        refractor.scale.set(width, height, 1);
        const direction = new THREE.Vector3();
        fCamera.getWorldDirection(direction);
        refractor.position.copy(fCamera.position).add(direction.multiplyScalar(distanceToPlane));
        refractor.lookAt(fCamera.position);
    };
})();

// fScene.fog = new THREE.Fog(0x0c101c, .01, 30);

let startRendering: number;
const loader = new GLTFLoader();
loader.load("./assets/models/background.glb", data => {
    const bModel = data.scene;
    bModel.rotation.y = THREE.MathUtils.degToRad(180);
    bScene.add(bModel)

    const fModel = bModel.clone();
    const fMaterial = new THREE.MeshStandardMaterial({
        // color: 0x00ff00,
        color: 0x4a5976,
        roughness: 0.5,
        metalness: 0.01,
    });
    if (backgroundStyle == BackgroundStyle.Wireframe
        || backgroundStyle == BackgroundStyle.BlurWire
    ) fMaterial.wireframe = true;
    if (
        backgroundStyle == BackgroundStyle.Color
        || backgroundStyle == BackgroundStyle.BlurColor
        || backgroundStyle == BackgroundStyle.Wireframe
        || backgroundStyle == BackgroundStyle.BlurWire
    ) { // @ts-ignore
        fModel.traverse(child => child.isMesh && (child.material = fMaterial));
    }
    fScene.add(fModel);

    startRendering = Date.now();
    background.classList.add("rendering");
    foreground.classList.add("rendering");
    animate();
});

// const s = document.querySelector<HTMLElement>('.sub');
function animate() {
    // s.innerHTML = `${bCamera.position.x.toFixed(2)},${bCamera.position.y.toFixed(2)},${bCamera.position.z.toFixed(2)}
    // <br>${bCamera.rotation.x.toFixed(2)},${bCamera.rotation.y.toFixed(2)},${bCamera.rotation.z.toFixed(2)}`;
    // controls.update();
    if (Date.now() - startRendering > 1000) return;
    if (!isMobile && backgroundStyle != BackgroundStyle.MassFog) updateRefractor();
    if (!isMobile && backgroundStyle != BackgroundStyle.MassFog) fCamera.position.copy(bCamera.position);
    if (!isMobile && backgroundStyle != BackgroundStyle.MassFog) fCamera.quaternion.copy(bCamera.quaternion);
    bRenderer.render(bScene, bCamera);
    if (!isMobile && backgroundStyle != BackgroundStyle.MassFog) fRenderer.render(fScene, fCamera);
    requestAnimationFrame(animate);
}

window.addEventListener("resize", () => resize());

function resize() {
    isMobile = window.innerWidth < 768;
    foreground.style.display = (isMobile || backgroundStyle == BackgroundStyle.MassFog) ? "none" : "block";
    background.attributes.removeNamedItem("style");
    foreground.attributes.removeNamedItem("style");
    bRenderer.setPixelRatio(window.devicePixelRatio);
    fRenderer.setPixelRatio(window.devicePixelRatio);
    bRenderer.setSize(background.clientWidth, background.clientHeight);
    bCamera.aspect = background.clientWidth / background.clientHeight;
    bCamera.updateProjectionMatrix();
    const fStyle = window.getComputedStyle(foreground);
    fRenderer.setSize(foreground.clientWidth, foreground.clientHeight);
    fCamera.setViewOffset(
        background.clientWidth,
        background.clientHeight,
        Number.parseFloat(fStyle.left.slice(0, -2)),
        Number.parseFloat(fStyle.top.slice(0, -2)),
        foreground.clientWidth,
        foreground.clientHeight
    );
    fCamera.updateProjectionMatrix();
}

function getRandom<T>(array: T[]) {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}
