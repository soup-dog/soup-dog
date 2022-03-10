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

/***/ "./src/js/index.js":
/*!*************************!*\
  !*** ./src/js/index.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n\r\n\r\nconst speedMin = 0.5;\r\nconst speedMax = 4;\r\nconst speedRange = speedMax - speedMin;\r\n\r\nfunction getRandomSpeed() {\r\n    const speed = (three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.seededRandom() * 2 - 1) * speedRange;\r\n    return Math.sign(speed) * speedMin + speed;\r\n}\r\n\r\nwindow.onload = function() {\r\n    const circleRadius = 50;\r\n    const gravity = new three__WEBPACK_IMPORTED_MODULE_0__.Vector2(0, -9.8);\r\n    const dragCoefficient = 0.9;\r\n    const clock = new three__WEBPACK_IMPORTED_MODULE_0__.Clock(true);\r\n\r\n    let width = window.innerWidth;\r\n    let height = window.innerHeight;\r\n\r\n    let floorY = -height + circleRadius;\r\n\r\n    window.addEventListener(\"resize\", function() {\r\n        width = window.innerWidth;\r\n        height = window.innerHeight;\r\n        floorY = -height + circleRadius;\r\n        camera.top = height / 2;\r\n        camera.bottom = height / -2;\r\n        camera.left = width / -2;\r\n        camera.right = width / 2;\r\n        camera.updateProjectionMatrix();\r\n        renderer.setSize(width, height);\r\n    });\r\n\r\n    const scene = new three__WEBPACK_IMPORTED_MODULE_0__.Scene();\r\n    const camera = new three__WEBPACK_IMPORTED_MODULE_0__.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0.1, 1000);\r\n    \r\n    const renderer = new three__WEBPACK_IMPORTED_MODULE_0__.WebGLRenderer({ alpha: true, antialias: true });\r\n    \r\n    renderer.setSize(width, height);\r\n    renderer.domElement.style.position = \"absolute\";\r\n    renderer.domElement.style.top = \"0\";\r\n    renderer.domElement.style.left = \"0\";\r\n    renderer.domElement.style.zIndex = \"-1\";\r\n    document.body.appendChild(renderer.domElement);\r\n\r\n    const geometry = new three__WEBPACK_IMPORTED_MODULE_0__.CircleGeometry(circleRadius, 64);\r\n    const material = new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({ color: 0x000000 });\r\n    let circles = [];\r\n    let velocities = [];\r\n    \r\n    camera.position.z = 5;\r\n    camera.position.y = height / -2;\r\n\r\n    document.getElementById(\"trigger\").onclick = function() {\r\n        const circle = new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(geometry, material);\r\n        circles.push(circle);\r\n        velocities.push(new three__WEBPACK_IMPORTED_MODULE_0__.Vector2(getRandomSpeed(), getRandomSpeed()));\r\n        scene.add(circle);\r\n    }\r\n\r\n    function animate() {\r\n        requestAnimationFrame(animate);\r\n\r\n        const deltaTime = clock.getDelta();\r\n\r\n        let destroy = false;\r\n\r\n        for (let i = 0; i < circles.length; i++) {\r\n            circles[i].position.x += velocities[i].x;\r\n            circles[i].position.y += velocities[i].y;\r\n            if (circles[i].position.y <= floorY) {\r\n                circles[i].position.y = floorY + floorY - circles[i].position.y;\r\n                velocities[i].y = -velocities[i].y;\r\n                velocities[i].y *= dragCoefficient;\r\n            }\r\n            velocities[i].add(gravity.clone().multiplyScalar(deltaTime));\r\n            if (circles[i].position.x + circleRadius < camera.left || circles[i].position.x - circleRadius > camera.right) {\r\n                destroy = true;\r\n                scene.remove(circles[i]);\r\n                circles[i] = null;\r\n                velocities[i] = null;\r\n            }\r\n        }\r\n        \r\n        if (destroy) {\r\n            circles = circles.filter(x => x !== null);\r\n            velocities = velocities.filter(x => x !== null);\r\n        }\r\n\r\n        renderer.render(scene, camera);\r\n    }\r\n\r\n    animate();\r\n}\n\n//# sourceURL=webpack://soup-dog/./src/js/index.js?");

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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/js/index.js");
/******/ 	
/******/ })()
;