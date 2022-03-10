/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/metaballs.js":
/*!*****************************!*\
  !*** ./src/js/metaballs.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var _glsl_fragment_glsl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../glsl/fragment.glsl */ \"./src/glsl/fragment.glsl\");\n/* harmony import */ var _glsl_vertex_glsl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../glsl/vertex.glsl */ \"./src/glsl/vertex.glsl\");\n\r\n\r\n\r\n\r\n\r\n// constants\r\nconst MAX_METABALLS = 16;\r\nconst THRESHOLD = 2.0;\r\nconst FORCE_FACTOR = 50;\r\nconst SCALE_UPDATE_FACTOR = 0.001;\r\nconst MIN_PIXELS = 16;\r\nconst SEEN_INFO_KEY = \"seenInfo\";\r\n\r\n// colours\r\nlet backgroundColour = new three__WEBPACK_IMPORTED_MODULE_2__.Color(0xf9f9ed);\r\nlet colourChoices = [\r\n    new three__WEBPACK_IMPORTED_MODULE_2__.Color(0xd9dbf1),\r\n    new three__WEBPACK_IMPORTED_MODULE_2__.Color(0x8e9dcc),\r\n    new three__WEBPACK_IMPORTED_MODULE_2__.Color(0x7d84ac),\r\n    new three__WEBPACK_IMPORTED_MODULE_2__.Color(0xdbf4a7),\r\n]\r\n\r\n// utility function to generate array from function, good for generation random positions/velocities/colours\r\nfunction generateArray(f, length) {\r\n    const arr = new Array(length);\r\n\r\n    for (let i = 0; i < length; i++) {\r\n        arr[i] = f();\r\n    }\r\n\r\n    return arr;\r\n}\r\n\r\nfunction randomColour() {\r\n    return colourChoices[three__WEBPACK_IMPORTED_MODULE_2__.MathUtils.randInt(0, colourChoices.length - 1)];\r\n}\r\n\r\nfunction clamp(value, min, max) {\r\n    return value <= min ? min : value >= max ? max : value;\r\n}\r\n\r\nwindow.onload = function() {\r\n    // hook mouse movement immediately\r\n    let target = new three__WEBPACK_IMPORTED_MODULE_2__.Vector2(0.5, 0.5);\r\n\r\n    function onMouseMove(event) {\r\n        event.preventDefault();\r\n        target = new three__WEBPACK_IMPORTED_MODULE_2__.Vector2((event.clientX - xOffset) / width, 1 - (event.clientY / height));\r\n    }\r\n\r\n    addEventListener(\"mousemove\", onMouseMove, false);\r\n\r\n    // pull params from query string\r\n    const params = new Proxy(new URLSearchParams(window.location.search), {\r\n        get: (searchParams, prop) => searchParams.get(prop),\r\n    });\r\n\r\n    // if palette available in query string\r\n    if (params.palette != null) {\r\n        let value = params.palette;\r\n        if (value.startsWith(\"https://coolors.co/palette/\")) {\r\n            value = value.slice(\"https://coolors.co/palette/\".length);\r\n        }\r\n        console.log(value);\r\n        const colourStrings = value.split(\"-\");\r\n        const colours = colourStrings.map(x => new three__WEBPACK_IMPORTED_MODULE_2__.Color(parseInt(x, 16)));\r\n        // search for best background colour\r\n        let backgroundColourIndex;\r\n        let bestScore = -1;\r\n        function backgroundScore(colour) { // score based on saturation and luminance\r\n            const hsl = colour.getHSL(new Object());\r\n            return Math.abs(0.5 - hsl.s) +  Math.abs(0.5 - hsl.l); // extreme luminance, extreme saturation is better (further from 0.5)\r\n        }\r\n        for (let i = 0; i < colours.length; i++) {\r\n            const score = backgroundScore(colours[i]);\r\n            if (score > bestScore) {\r\n                bestScore = score;\r\n                backgroundColourIndex = i;\r\n            }\r\n        }\r\n        backgroundColour = colours[backgroundColourIndex];\r\n        colours.splice(backgroundColourIndex, 1); // remove background colour from metaballs colour\r\n        colourChoices = colours;\r\n    }\r\n\r\n    \r\n\r\n    // if already seen info\r\n    if (sessionStorage.getItem(SEEN_INFO_KEY)) {\r\n        document.body.removeChild(document.getElementById(\"info-container\")); // remove info container\r\n    }\r\n    else {\r\n        document.getElementById(\"info-container\").style.color = new three__WEBPACK_IMPORTED_MODULE_2__.Color(1 - backgroundColour.r, 1 - backgroundColour.g, 1 - backgroundColour.b).getStyle();\r\n        sessionStorage.setItem(SEEN_INFO_KEY, JSON.stringify(true)); // set seen info\r\n    }\r\n\r\n    document.getElementById(\"load-shield\").style.color = backgroundColour.getStyle(); // set load shield background colour\r\n    document.body.style.backgroundColor = backgroundColour.getStyle(); // set body background colour\r\n\r\n    const scene = new three__WEBPACK_IMPORTED_MODULE_2__.Scene();\r\n    scene.background = backgroundColour;\r\n    const camera = new three__WEBPACK_IMPORTED_MODULE_2__.OrthographicCamera(0, 0, 0, 0, 0.1, 1000);\r\n    const renderer = new three__WEBPACK_IMPORTED_MODULE_2__.WebGLRenderer();\r\n\r\n    let width = 0;\r\n    let height = 0;\r\n    let xOffset = 0;\r\n    let renderScale = 1;\r\n\r\n    function updateRenderScale() {\r\n        if (renderScale !== 1) {\r\n            renderer.setSize(width * renderScale, height * renderScale, false);\r\n        }\r\n    }\r\n\r\n    let metaballCount = 16; // can be changed at runtime to vary number of metaballs\r\n\r\n    // uniforms init\r\n    const positions = generateArray(() => new three__WEBPACK_IMPORTED_MODULE_2__.Vector2(three__WEBPACK_IMPORTED_MODULE_2__.MathUtils.seededRandom(), three__WEBPACK_IMPORTED_MODULE_2__.MathUtils.seededRandom()), MAX_METABALLS);\r\n    \r\n    const velocities = generateArray(() => new three__WEBPACK_IMPORTED_MODULE_2__.Vector2(three__WEBPACK_IMPORTED_MODULE_2__.MathUtils.randFloatSpread(0.1), three__WEBPACK_IMPORTED_MODULE_2__.MathUtils.randFloatSpread(0.1)), MAX_METABALLS);\r\n\r\n    const radii = generateArray(() => 0.015 + three__WEBPACK_IMPORTED_MODULE_2__.MathUtils.seededRandom() * 0.04, MAX_METABALLS);\r\n\r\n    const colourBuffer = generateArray(() => 0, MAX_METABALLS * 3);\r\n    for (let i = 0; i < MAX_METABALLS; i++) {\r\n        randomColour().toArray(colourBuffer, i * 3);\r\n    }\r\n\r\n    const geometry = new three__WEBPACK_IMPORTED_MODULE_2__.PlaneBufferGeometry(2, 2);\r\n    const material = new three__WEBPACK_IMPORTED_MODULE_2__.ShaderMaterial({\r\n        defines: {\r\n            MAX_METABALLS: MAX_METABALLS,\r\n        },\r\n        uniforms: {\r\n            MetaballCount: {value: metaballCount},\r\n            Positions: {value: positions},\r\n            Colours: {value: colourBuffer},\r\n            Radii: {value: radii},\r\n            Threshold: {value: THRESHOLD},\r\n            BackgroundColour: {value: backgroundColour},\r\n        },\r\n        vertexShader: _glsl_vertex_glsl__WEBPACK_IMPORTED_MODULE_1__,\r\n        fragmentShader: _glsl_fragment_glsl__WEBPACK_IMPORTED_MODULE_0__,\r\n    });\r\n\r\n    const mesh = new three__WEBPACK_IMPORTED_MODULE_2__.Mesh(geometry, material);\r\n    scene.add(mesh);\r\n\r\n    const clock = new three__WEBPACK_IMPORTED_MODULE_2__.Clock(true);\r\n\r\n    function onWheel(event) {\r\n        renderScale = clamp(renderScale + event.deltaY * SCALE_UPDATE_FACTOR, MIN_PIXELS / height, 1);\r\n        updateRenderScale();\r\n    }\r\n\r\n    function onResize() {\r\n        width = window.innerHeight;\r\n        height = window.innerHeight;\r\n        xOffset = (window.innerWidth - width) / 2;\r\n        camera.top = height / 2;\r\n        camera.bottom = height / -2;\r\n        camera.left = width / -2;\r\n        camera.right = width / 2;\r\n        camera.updateProjectionMatrix();\r\n        renderer.domElement.style.left = xOffset.toString() + \"px\";\r\n        renderer.setSize(width, height);\r\n        updateRenderScale();\r\n    }\r\n\r\n    function onVisibilityChange() {\r\n        if (document.visibilityState == \"visible\") { // start rendering frames + reset clock if page becomes visible\r\n            clock.start();\r\n            animate();\r\n        }\r\n    }\r\n\r\n    function animate() {\r\n        if (document.visibilityState == \"visible\") { // only render frame if page is visible\r\n            requestAnimationFrame(animate);\r\n\r\n            const deltaTime = clock.getDelta();\r\n\r\n            for (let i = 0; i < metaballCount; i++) {\r\n                const mass = 0.1 / radii[i];\r\n                const projectedPosition = positions[i].clone().add(velocities[i].clone().multiplyScalar(deltaTime));\r\n                const acceleration = (target.clone().sub(projectedPosition)).divideScalar(mass);\r\n                acceleration.multiplyScalar(deltaTime * FORCE_FACTOR);\r\n                velocities[i].add(acceleration);\r\n                positions[i].add(velocities[i].clone().multiplyScalar(deltaTime));\r\n            }\r\n            material.uniformsNeedUpdate = true;\r\n    \r\n            renderer.render(scene, camera);\r\n        }\r\n        // otherwise exit render loop\r\n    }\r\n\r\n    onResize(); // set render \r\n\r\n    // hook user interactions\r\n    addEventListener(\"wheel\", onWheel, false);\r\n    addEventListener(\"resize\", onResize, false);\r\n    addEventListener(\"visibilitychange\", onVisibilityChange, false);\r\n\r\n    document.body.appendChild(renderer.domElement); // add canvas\r\n    document.body.removeChild(document.getElementById(\"load-shield\")); // remove loading shield\r\n\r\n    animate(); // enter render loop\r\n}\n\n//# sourceURL=webpack://soup-dog/./src/js/metaballs.js?");

/***/ }),

/***/ "./src/glsl/fragment.glsl":
/*!********************************!*\
  !*** ./src/glsl/fragment.glsl ***!
  \********************************/
/***/ ((module) => {

eval("module.exports = \"//#define MAX_METABALLS 1\\r\\n\\r\\nvarying vec2 UV;\\r\\n\\r\\nuniform int MetaballCount;\\r\\nuniform vec3 Colours[MAX_METABALLS];\\r\\nuniform vec2 Positions[MAX_METABALLS];\\r\\nuniform float Radii[MAX_METABALLS];\\r\\nuniform float Threshold;\\r\\nuniform vec3 BackgroundColour;\\r\\n\\r\\n\\r\\nfloat evaluate(vec2 position) {\\r\\n    float sum = 0.0;\\r\\n\\r\\n    for (int i = 0; i < MetaballCount; i++) {\\r\\n\\t\\tsum += Radii[i] / distance(position, Positions[i]);\\r\\n\\t}\\r\\n\\r\\n\\treturn sum;\\r\\n}\\r\\n\\r\\n\\r\\nvoid main() {\\r\\n    float sum = 0.0;\\r\\n    float biggest = -1.0;\\r\\n    vec3 colour = Colours[0];\\r\\n\\r\\n    for (int i = 0; i < MetaballCount; i++) {\\r\\n        float part = Radii[i] / distance(UV, Positions[i]);\\r\\n        if (part > biggest) {\\r\\n            biggest = part;\\r\\n            colour = Colours[i];\\r\\n        }\\r\\n        sum += part;\\r\\n    }\\r\\n\\r\\n    if (sum >= Threshold) {\\r\\n        gl_FragColor = vec4(colour, 1.0);\\r\\n    }\\r\\n    else {\\r\\n        gl_FragColor = vec4(BackgroundColour, 1.0);\\r\\n    }\\r\\n\\r\\n    // for (int i = 0; i < MetaballCount; i++) {\\r\\n    //     if (distance(UV, Positions[i]) - Radii[i] < 0.0) {\\r\\n    //         //gl_FragColor = vec4(UV.x, UV.y, 0.0, 1.0);\\r\\n    //         gl_FragColor = vec4(Colours[i], 1.0);\\r\\n    //         return;\\r\\n    //     }\\r\\n    // }\\r\\n\\r\\n    // gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\\r\\n}\";\n\n//# sourceURL=webpack://soup-dog/./src/glsl/fragment.glsl?");

/***/ }),

/***/ "./src/glsl/vertex.glsl":
/*!******************************!*\
  !*** ./src/glsl/vertex.glsl ***!
  \******************************/
/***/ ((module) => {

eval("module.exports = \"varying vec2 UV;\\r\\n\\r\\nvoid main() {\\r\\n    UV = uv;\\r\\n    gl_Position = vec4(position, 1.0);\\r\\n}\";\n\n//# sourceURL=webpack://soup-dog/./src/glsl/vertex.glsl?");

/***/ }),

/***/ "./node_modules/three/build/three.module.js":
/*!**************************************************!*\
  !*** ./node_modules/three/build/three.module.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/js/metaballs.js");
/******/ 	
/******/ })()
;