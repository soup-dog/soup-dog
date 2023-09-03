import { Canvas, useThree } from "@react-three/fiber";
import { Physics, Debug, useBox, usePlane, useSphere } from "@react-three/cannon";
import styles from "./Background.module.css";
import { BufferGeometry, Color, Mesh, Vector3 } from "three";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";


interface SphereData {
    colour: number,
    scale: number;
}


/*
given
c (count) = 200
d (depth) = 13
vol_total = v_w * v_h * d
vol_balls = 4/3*pi*mean_r^3*c
vol_balls/vol_total = k
k (amount of the volume we want to fill) = 0.377175662939

when v_w (viewport width) and v_h (viewport height) = 8.49, mean_r = 0.75

what is mean_r when v_w = a and v_h = b?

mean_r = cbrt(vol_balls*3/4/pi)
vol_balls = vol_total * k
vol_balls = v_w * v_h * d * k
mean_r = cbrt(v_w * v_h * d * k * 3 / 4 / pi / c)
mean_r = cbrt(a * b * d * k * 3 / 4 / pi)
let k_1 = d * k * 3 / 4 / pi
mean_r = cbrt(a * b * k_1)
*/

const k = 0.5; // amount of the volume we want to fill;
const K_1 = 13 * k * 3 / 4 / Math.PI / 200;


export default function Background() {
    return (
        <div className={styles.background}>
            <Canvas orthographic camera={{position: [0, 0, 100], zoom: 100}}>
                <Ballpit />
            </Canvas>
        </div>
    );
}

function Ballpit() {
    const palette = [0x80fc00, 0x008bf8, 0xdc0073, 0xf5b700, 0x04e762];
    const count = 200;
    const spheres = Array.from({length: count}, () => ({colour: palette[Math.floor(Math.random() * palette.length)], scale: Math.random() + 0.5}));

    // const [gravity, setGravity] = useState<[number, number, number]>([0, -1, 0]);

    // const [scrollPosition, setScrollPosition] = useState(0);
    // let lastScrollPosition = 0; 
    // const handleScroll = () => {
    //     const position = window.scrollY;
    //     console.log(lastScrollPosition, scrollPosition);
    //     console.log(lastScrollPosition - scrollPosition);
    //     // setGravity([0, (lastScrollPosition - scrollPosition) * 0.01, 0]);
    //     setScrollPosition(position);
    //     lastScrollPosition = position;
    // };

    // useEffect(() => {
    //     window.addEventListener("scroll", handleScroll), {passive: true};

    //     return () => {
    //         window.removeEventListener("scroll", handleScroll);
    //     };
    // }, []);

    return (
        <Physics>
            <InstancedSpheres sphereData={spheres} count={count}/>
            <Borders />
        </Physics>
    );
}


function Borders() {
    const { viewport } = useThree();
    return (
        <>
            <Plane position={[0, -viewport.height / 2 - 1, 0]} rotation={[-Math.PI / 2, 0, 0]}/>
            {/* <Plane position={[0, viewport.height * 3 - 1, 0]} rotation={[Math.PI / 2, 0, 0]}/> */}
            
            <Plane position={[-viewport.width / 2 - 1, 0, 0]} rotation={[0, Math.PI / 2, 0]}/>
            <Plane position={[viewport.width / 2 + 1, 0, 0]} rotation={[0, -Math.PI / 2, 0]}/>
            <Plane position={[0, 0, -1]} rotation={[0, 0, 0]}/>
            <Plane position={[0, 0, 12]} rotation={[0, -Math.PI, 0]}/>
        </>
    );
}


function Plane({position = [0, 0, 0], ...props}: {position: [number, number, number], [x: string]: any}): any {
    const [ref, api] = usePlane(() => ({...props}));
    useEffect(() => api.position.set(...position), [api, position]);
}


function InstancedSpheres({sphereData, count = 200}: {sphereData: SphereData[], count: number}) {
    const { viewport } = useThree();

    const scalingFactor = Math.cbrt(viewport.width * viewport.height * K_1);

    const [ref, api] = useSphere((index) => ({
        mass: sphereData[index].scale * scalingFactor * 100,
        position: [Math.random() * viewport.width, viewport.height * (1.5 + Math.random()), Math.random()],
        args: [sphereData[index].scale * scalingFactor],
    }));

    const dummyColour = new Color();

    const colourBuffer = useMemo(() => Float32Array.from(new Array(count).fill(0).flatMap((_, i) => dummyColour.setHex(sphereData[i].colour).toArray())), [count]);

    useLayoutEffect(() => {
        for (let i = 0; i < count; i++) {
            const correctedScale = scalingFactor * sphereData[i].scale;
            api.at(i).scaleOverride([correctedScale, correctedScale, correctedScale]);
        }
    }, []);

    const [scrollPosition, setScrollPosition] = useState(0); 
    let lastScrollPosition = 0;
    let lastScrollDelta = 0;
    const handleScroll = () => {
        const position = window.scrollY;
        const scrollDelta = position - lastScrollPosition;
        for (let i = 0; i < count; i++) {
            api.at(i).applyImpulse([0, (scrollDelta - lastScrollDelta) * 10, 0], [0, 0, 0]);
        }
        setScrollPosition(position);
        lastScrollDelta = scrollDelta;
        lastScrollPosition = position;
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll), {passive: true};

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <instancedMesh ref={(ref as any)} args={[undefined, undefined, count]}>
            <sphereGeometry>
                <instancedBufferAttribute attach="attributes-color" args={[colourBuffer, 3]} />
            </sphereGeometry>
            <meshBasicMaterial toneMapped={false} vertexColors />
        </instancedMesh>
    )
}
