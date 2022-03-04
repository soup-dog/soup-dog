import { Scene, OrthographicCamera, WebGLRenderer, CircleGeometry, MeshBasicMaterial, Mesh, Vector2, MathUtils, Clock } from 'three';

const speedMin = 0.5;
const speedMax = 4;
const speedRange = speedMax - speedMin;

function getRandomSpeed() {
    const speed = (MathUtils.seededRandom() * 2 - 1) * speedRange;
    return Math.sign(speed) * speedMin + speed;
}

window.onload = function() {
    const circleRadius = 50;
    const gravity = new Vector2(0, -9.8);
    const dragCoefficient = 0.9;
    const clock = new Clock(true);

    let width = window.innerWidth;
    let height = window.innerHeight;

    let floorY = -height + circleRadius;

    window.addEventListener("resize", function() {
        width = window.innerWidth;
        height = window.innerHeight;
        floorY = -height + circleRadius;
        camera.top = height / 2;
        camera.bottom = height / -2;
        camera.left = width / -2;
        camera.right = width / 2;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });

    const scene = new Scene();
    const camera = new OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0.1, 1000);
    
    const renderer = new WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(width, height);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.zIndex = "-1";
    document.body.appendChild(renderer.domElement);

    const geometry = new CircleGeometry(circleRadius, 64);
    const material = new MeshBasicMaterial({ color: 0x000000 });
    let circles = [];
    let velocities = [];
    
    camera.position.z = 5;
    camera.position.y = height / -2;

    document.getElementById("trigger").onclick = function() {
        const circle = new Mesh(geometry, material);
        circles.push(circle);
        velocities.push(new Vector2(getRandomSpeed(), getRandomSpeed()));
        scene.add(circle);
    }

    function animate() {
        const deltaTime = clock.getDelta();
        requestAnimationFrame(animate);

        let destroy = false;

        for (let i = 0; i < circles.length; i++) {
            circles[i].position.x += velocities[i].x;
            circles[i].position.y += velocities[i].y;
            if (circles[i].position.y <= floorY) {
                circles[i].position.y = floorY + floorY - circles[i].position.y;
                velocities[i].y = -velocities[i].y;
                velocities[i].y *= dragCoefficient;
            }
            velocities[i].add(gravity.clone().multiplyScalar(deltaTime));
            if (circles[i].position.x + circleRadius < camera.left || circles[i].position.x - circleRadius > camera.right) {
                destroy = true;
                scene.remove(circles[i]);
                circles[i] = null;
                velocities[i] = null;
            }
        }
        
        if (destroy) {
            circles = circles.filter(x => x !== null);
            velocities = velocities.filter(x => x !== null);
        }

        renderer.render(scene, camera);
    }

    animate();
}