import { Scene, OrthographicCamera, WebGLRenderer, ShaderMaterial, Color, PlaneBufferGeometry, Mesh, Vector2, MathUtils, Clock } from 'three';
import fragmentShader from '../glsl/fragment.glsl';
import vertexShader from '../glsl/vertex.glsl';


const MAX_METABALLS = 16;
const FORCE_FACTOR = 50;
const WIDTH = 144;
const HEIGHT = 144;


const colourChoices = [
    new Color(0xd9dbf1),
    new Color(0x8e9dcc),
    new Color(0x7d84ac),
    new Color(0xdbf4a7),
]


function generateArray(f, length) {
    const arr = new Array(length);

    for (let i = 0; i < length; i++) {
        arr[i] = f();
    }

    return arr;
}

function randomColour() {
    return colourChoices[MathUtils.randInt(0, colourChoices.length - 1)];
}

window.onload = function() {
    const scene = new Scene();
    const camera = new OrthographicCamera(0, 0, 0, 0, 0.1, 1000);
    
    document.body.style.backgroundColor = "#f9f9ed";

    const renderer = new WebGLRenderer();
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.zIndex = "-1";

    let width;
    let height;
    let xOffset;

    let pixelated = false;

    function onResize() {
        width = window.innerHeight;
        height = window.innerHeight;
        xOffset = (window.innerWidth - width) / 2;
        camera.top = height / 2;
        camera.bottom = height / -2;
        camera.left = width / -2;
        camera.right = width / 2;
        camera.updateProjectionMatrix();
        renderer.domElement.style.left = xOffset.toString() + "px";
        renderer.setSize(width, height);
        updatePixelation();
    }

    onResize();

    window.addEventListener("resize", onResize, false);

    function updatePixelation() {
        if (pixelated) {
            renderer.setSize(width, height);
            renderer.setSize(WIDTH, HEIGHT, false);
            renderer.domElement.style.imageRendering = "pixelated";
        }
        else {
            renderer.setSize(width, height);
            renderer.domElement.style.imageRendering = "";
        }
    }

    function onClick() {
        pixelated = !pixelated;
        updatePixelation();
    }

    window.addEventListener("click", onClick, false);

    document.body.appendChild(renderer.domElement);

    let metaballCount = 16;

    // init uniforms
    const positions = generateArray(() => new Vector2(), MAX_METABALLS);
    for (let i = 0; i < metaballCount; i++) {
        positions[i] = new Vector2(MathUtils.seededRandom(), MathUtils.seededRandom());
    }
    
    const velocities = generateArray(() => new Vector2(), MAX_METABALLS);
    for (let i = 0; i < metaballCount; i++) {
        velocities[i] = new Vector2(MathUtils.randFloatSpread(1), MathUtils.randFloatSpread(1));
    }

    const radii = generateArray(() => 0.015 + MathUtils.seededRandom() * 0.04, MAX_METABALLS);

    const colourBuffer = generateArray(() => 0, MAX_METABALLS * 3);
    for (let i = 0; i < MAX_METABALLS; i++) {
        randomColour().toArray(colourBuffer, i * 3);
    }

    const geometry = new PlaneBufferGeometry(2, 2);
    const material = new ShaderMaterial({
        defines: {
            MAX_METABALLS: MAX_METABALLS,
        },
        uniforms: {
            MetaballCount: {value: metaballCount},
            Positions: {value: positions},
            Colours: {value: colourBuffer},
            Radii: {value: radii},
            Threshold: {value: 2.0},
            BackgroundColour: {value: new Color(0xf9f9ed)},
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });

    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    const clock = new Clock(true);

    let target = new Vector2();

    function onMouseMove(event) {
        event.preventDefault();
        target = new Vector2((event.clientX - xOffset) / width, 1 - (event.clientY / height));
    }

    addEventListener("mousemove", onMouseMove, false);

    function onVisibilityChange() {
        if (document.visibilityState == "visible") {
            clock.start();
            animate();
        }
    }

    addEventListener("visibilitychange", onVisibilityChange, false);

    function animate() {
        if (document.visibilityState == "visible") {
            requestAnimationFrame(animate);

            const deltaTime = clock.getDelta();
    
            for (let i = 0; i < metaballCount; i++) {
                const mass = 0.1 / radii[i];
                const projectedPosition = positions[i].clone().add(velocities[i].clone().multiplyScalar(deltaTime));
                const acceleration = (target.clone().sub(projectedPosition)).divideScalar(mass);
                acceleration.multiplyScalar(deltaTime * FORCE_FACTOR);
                velocities[i].add(acceleration);
                positions[i].add(velocities[i].clone().multiplyScalar(deltaTime));
            }
            material.uniformsNeedUpdate = true;
    
            renderer.render(scene, camera);
        }
    }

    animate();
}