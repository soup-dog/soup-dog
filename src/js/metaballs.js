import { Scene, OrthographicCamera, WebGLRenderer, ShaderMaterial, Color, PlaneBufferGeometry, Mesh, Vector2, MathUtils, Clock } from 'three';
import fragmentShader from '../glsl/fragment.glsl';
import vertexShader from '../glsl/vertex.glsl';


// constants
const MAX_METABALLS = 16;
const THRESHOLD = 2.0;
const FORCE_FACTOR = 50;
const SCALE_UPDATE_FACTOR = 0.001;
const MIN_PIXELS = 16;
const SEEN_INFO_KEY = "seenInfo";

// colours
let backgroundColour = new Color(0xf9f9ed);
let colourChoices = [
    new Color(0xd9dbf1),
    new Color(0x8e9dcc),
    new Color(0x7d84ac),
    new Color(0xdbf4a7),
]

// utility function to generate array from function, good for generation random positions/velocities/colours
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

function clamp(value, min, max) {
    return value <= min ? min : value >= max ? max : value;
}

window.onload = function() {
    // hook mouse movement immediately
    let target = new Vector2(0.5, 0.5);

    function onMouseMove(event) {
        event.preventDefault();
        target = new Vector2((event.clientX - xOffset) / width, 1 - (event.clientY / height));
    }

    addEventListener("mousemove", onMouseMove, false);

    // pull params from query string
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });

    // if palette available in query string
    if (params.palette != null) {
        let value = params.palette;
        if (value.startsWith("https://coolors.co/palette/")) {
            value = value.slice("https://coolors.co/palette/".length);
        }
        console.log(value);
        const colourStrings = value.split("-");
        const colours = colourStrings.map(x => new Color(parseInt(x, 16)));
        // search for best background colour
        let backgroundColourIndex;
        let bestScore = -1;
        function backgroundScore(colour) { // score based on saturation and luminance
            const hsl = colour.getHSL(new Object());
            return Math.abs(0.5 - hsl.s) +  Math.abs(0.5 - hsl.l); // extreme luminance, extreme saturation is better (further from 0.5)
        }
        for (let i = 0; i < colours.length; i++) {
            const score = backgroundScore(colours[i]);
            if (score > bestScore) {
                bestScore = score;
                backgroundColourIndex = i;
            }
        }
        backgroundColour = colours[backgroundColourIndex];
        colours.splice(backgroundColourIndex, 1); // remove background colour from metaballs colour
        colourChoices = colours;
    }

    

    // if already seen info
    if (sessionStorage.getItem(SEEN_INFO_KEY)) {
        document.body.removeChild(document.getElementById("info-container")); // remove info container
    }
    else {
        document.getElementById("info-container").style.color = new Color(1 - backgroundColour.r, 1 - backgroundColour.g, 1 - backgroundColour.b).getStyle();
        sessionStorage.setItem(SEEN_INFO_KEY, JSON.stringify(true)); // set seen info
    }

    document.getElementById("load-shield").style.color = backgroundColour.getStyle(); // set load shield background colour
    document.body.style.backgroundColor = backgroundColour.getStyle(); // set body background colour

    const scene = new Scene();
    scene.background = backgroundColour;
    const camera = new OrthographicCamera(0, 0, 0, 0, 0.1, 1000);
    const renderer = new WebGLRenderer();

    let width = 0;
    let height = 0;
    let xOffset = 0;
    let renderScale = 1;

    function updateRenderScale() {
        if (renderScale !== 1) {
            renderer.setSize(width * renderScale, height * renderScale, false);
        }
    }

    let metaballCount = 16; // can be changed at runtime to vary number of metaballs

    // uniforms init
    const positions = generateArray(() => new Vector2(MathUtils.seededRandom(), MathUtils.seededRandom()), MAX_METABALLS);
    
    const velocities = generateArray(() => new Vector2(MathUtils.randFloatSpread(0.1), MathUtils.randFloatSpread(0.1)), MAX_METABALLS);

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
            Threshold: {value: THRESHOLD},
            BackgroundColour: {value: backgroundColour},
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });

    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    const clock = new Clock(true);

    function onWheel(event) {
        renderScale = clamp(renderScale + event.deltaY * SCALE_UPDATE_FACTOR, MIN_PIXELS / height, 1);
        updateRenderScale();
    }

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
        updateRenderScale();
    }

    function onVisibilityChange() {
        if (document.visibilityState == "visible") { // start rendering frames + reset clock if page becomes visible
            clock.start();
            animate();
        }
    }

    function animate() {
        if (document.visibilityState == "visible") { // only render frame if page is visible
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
        // otherwise exit render loop
    }

    onResize(); // set render 

    // hook user interactions
    addEventListener("wheel", onWheel, false);
    addEventListener("resize", onResize, false);
    addEventListener("visibilitychange", onVisibilityChange, false);

    document.body.appendChild(renderer.domElement); // add canvas
    document.body.removeChild(document.getElementById("load-shield")); // remove loading shield

    animate(); // enter render loop
}