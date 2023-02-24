import { Canvas, useThree } from "@react-three/fiber";
import { Physics, Debug, useBox, usePlane, useSphere } from "@react-three/cannon";
import styles from "./Background.module.css";
import { BufferGeometry, Color, Mesh } from "three";
import { useEffect, useLayoutEffect, useMemo } from "react";


interface SphereData {
    colour: number,
    scale: number;
}


export default function Background() {
    const palette = [0x80fc00, 0x008bf8, 0xdc0073, 0xf5b700, 0x04e762];
    const count = 200;
    const spheres = Array.from({length: count}, () => ({colour: palette[Math.floor(Math.random() * palette.length)], scale: Math.random() + 0.25}));

    return (
        <div className={styles.background}>
            <Canvas orthographic camera={{position: [0, 0, 100], zoom: 100}}>
                <Physics>
                    <InstancedSpheres sphereData={spheres} count={count}/>
                    <Borders />
                </Physics>
            </Canvas>
        </div>
    );
}


function Borders() {
    const { viewport } = useThree();
    return (
        <>
            <Plane position={[0, -viewport.height / 2 - 1, 0]} rotation={[-Math.PI / 2, 0, 0]}/>
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


function Box() {
    const [ref, api] = useBox(() => ({ mass: 1}));

    return (
        <mesh ref={(ref as React.RefObject<Mesh<BufferGeometry>>)}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={"hotpink"} />
        </mesh>
    );
}

function InstancedSpheres({sphereData, count = 200}: {sphereData: SphereData[], count: number}) {
    const { viewport } = useThree();

    const [ref, api] = useSphere((index) => ({
        mass: 1,
        position: [Math.random() * viewport.width, viewport.height * (1.5 + Math.random()), 0],
        args: [sphereData[index].scale],
    }));

    const dummyColour = new Color();

    const colourBuffer = useMemo(() => Float32Array.from(new Array(count).fill(0).flatMap((_, i) => dummyColour.setHex(sphereData[i].colour).toArray())), [count]);

    useLayoutEffect(() => {
        for (let i = 0; i < count; i++) api.at(i).scaleOverride([sphereData[i].scale, sphereData[i].scale, sphereData[i].scale]);
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
