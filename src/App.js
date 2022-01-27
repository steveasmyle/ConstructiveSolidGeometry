import * as THREE from "three";
import { Suspense, useMemo, useEffect, useState, useRef } from "react";
import {
  Canvas,
  extend,
  useLoader,
  useFrame,
  useThree
} from "@react-three/fiber";
import { OrbitControls, Stats, CameraShake } from "@react-three/drei";
import { CSG } from "three-csg-ts";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import avenirUrl from "./fonts/AvenirHeavy.blob";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

extend({ TextGeometry, EffectComposer, RenderPass, UnrealBloomPass });

function CutoutText({
  children,
  vAlign = "center",
  hAlign = "center",
  dAlign = "center",
  size = 1,
  color = "#ffffff",
  colorGlow = "#0099ff",
  bevelEnabled = true,
  bevelSegments = 0,
  bevelThickness = 0.01,
  bevelSize = 0.01,
  layerDepth = 0.01,
  glowDepth = 0.01,
  ...props
}) {
  const font = useLoader(FontLoader, avenirUrl);

  const mesh = useMemo(() => {
    let textMesh = new THREE.Mesh(
      new TextGeometry(children, {
        font: font,
        size: size,
        height: glowDepth + layerDepth * 10,
        curveSegments: 32,
        bevelEnabled: true,
        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelOffset: 0,
        bevelSegments: 0
      }),
      new THREE.MeshBasicMaterial()
    );

    let solidMesh = new THREE.Mesh(
      new THREE.BoxGeometry(26, 23, layerDepth),
      new THREE.MeshPhongMaterial({ color: color })
    );

    let solidMeshGlow = new THREE.Mesh(
      new THREE.BoxGeometry(26, 23, glowDepth),
      new THREE.MeshPhongMaterial({ color: colorGlow })
    );

    const boxSize = new THREE.Vector3();
    textMesh.geometry.computeBoundingBox();
    textMesh.geometry.boundingBox.getSize(boxSize);
    textMesh.position.setX(
      hAlign === "center" ? -boxSize.x / 2 : hAlign === "right" ? 0 : -boxSize.x
    );
    textMesh.position.setY(
      vAlign === "center" ? -boxSize.y / 2 : vAlign === "top" ? 0 : -boxSize.y
    );
    textMesh.position.setZ(
      dAlign === "center" ? -boxSize.z / 2 : dAlign === "top" ? 0 : -boxSize.z
    );

    //textMesh.position.setZ(textMesh.position.z - textDepth);
    //solidMeshGlow.position.setZ(layerDepth + glowDepth);

    textMesh.updateMatrix();
    solidMesh.updateMatrix();
    solidMeshGlow.updateMatrix();

    return [
      CSG.subtract(solidMesh, textMesh),
      CSG.subtract(solidMeshGlow, textMesh)
    ];
    //return CSG.union(solidMesh, textMesh);
    //return CSG.intersect(solidMesh, textMesh);
  }, []);

  const groupRef = useRef(null);
  const textRef = useRef(null);
  const glowRef = useRef(null);

  return (
    <group ref={groupRef}>
      <mesh
        position={[
          mesh[0].position.x,
          mesh[0].position.y,
          mesh[0].position.z + glowDepth / 2 + layerDepth / 2 + glowDepth
        ]}
        ref={textRef}
        geometry={mesh[0].geometry}
        material={mesh[0].material}
      />
      <mesh
        position={[
          mesh[1].position.x,
          mesh[1].position.y,
          mesh[1].position.z + glowDepth
        ]}
        ref={glowRef}
        geometry={mesh[1].geometry}
        material={mesh[1].material}
      />
    </group>
  );
}

function Text({
  children,
  vAlign = "center",
  hAlign = "center",
  dAlign = "center",
  size = 1,
  color = "#ffffff",
  colorGlow = "#0099ff",
  bevelEnabled = true,
  bevelSegments = 0,
  bevelThickness = 0.01,
  bevelSize = 0.01,
  layerDepth = 0.01,
  glowDepth = 0.01,
  flushExtrusion = 0,
  ...props
}) {
  const font = useLoader(FontLoader, avenirUrl);

  const mesh = useMemo(() => {
    let textMesh = new THREE.Mesh(
      new TextGeometry(children, {
        font: font,
        size: size,
        height: layerDepth,
        curveSegments: 32,
        bevelEnabled: true,
        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelOffset: 0,
        bevelSegments: 16
      }),
      new THREE.MeshPhongMaterial({ color: color })
    );

    const boxSize = new THREE.Vector3();
    textMesh.geometry.computeBoundingBox();
    textMesh.geometry.boundingBox.getSize(boxSize);
    textMesh.position.setX(
      hAlign === "center" ? -boxSize.x / 2 : hAlign === "right" ? 0 : -boxSize.x
    );
    textMesh.position.setY(
      vAlign === "center" ? -boxSize.y / 2 : vAlign === "top" ? 0 : -boxSize.y
    );

    textMesh.updateMatrix();

    return textMesh;
  }, []);

  const glow = useMemo(() => {
    let textMesh = new THREE.Mesh(
      new TextGeometry(children, {
        font: font,
        size: size,
        height: glowDepth,
        curveSegments: 32,
        bevelEnabled: true,
        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelOffset: 0,
        bevelSegments: 16
      }),
      new THREE.MeshPhongMaterial({ color: colorGlow })
    );

    const boxSize = new THREE.Vector3();
    textMesh.geometry.computeBoundingBox();
    textMesh.geometry.boundingBox.getSize(boxSize);
    textMesh.position.setX(
      hAlign === "center" ? -boxSize.x / 2 : hAlign === "right" ? 0 : -boxSize.x
    );
    textMesh.position.setY(
      vAlign === "center" ? -boxSize.y / 2 : vAlign === "top" ? 0 : -boxSize.y
    );
    let middleZ =
      dAlign === "center" ? -boxSize.z / 2 : dAlign === "top" ? 0 : -boxSize.z;

    textMesh.position.setZ(middleZ - glowDepth / 2 - layerDepth / 2);

    textMesh.updateMatrix();

    return textMesh;
  }, []);
  const groupRef = useRef(null);
  const textRef = useRef(null);
  const textGlowRef = useRef(null);

  useFrame(({ clock }) => {
    if (!textRef.current) {
      console.log("returned");
      return;
    }
    groupRef.current.position.z = MovementFactor(clock);
  });

  return (
    <group ref={groupRef}>
      <mesh
        position={[
          mesh.position.x,
          mesh.position.y,
          mesh.position.z + glowDepth + flushExtrusion
        ]}
        ref={textRef}
        geometry={mesh.geometry}
        material={mesh.material}
      />
      <mesh
        position={[
          glow.position.x,
          glow.position.y,
          glow.position.z + glowDepth + flushExtrusion
        ]}
        ref={textGlowRef}
        geometry={glow.geometry}
        material={glow.material}
      />
    </group>
  );
}

function MovementFactor(clock) {
  const t = clock.oldTime * 0.00005;
  const TWO_PI = 2 * Math.PI;
  return 1.5 * Math.sin(TWO_PI * t * 1);
}

function Bloom({ children }) {
  const { gl, camera, size } = useThree();
  const [scene, setScene] = useState();
  const composer = useRef();
  useEffect(
    () => void scene && composer.current.setSize(size.width, size.height),
    [size]
  );
  useFrame(() => scene && composer.current.render(), 1);
  return (
    <>
      <scene ref={setScene}>{children}</scene>
      <effectComposer ref={composer} args={[gl]}>
        <renderPass attachArray="passes" scene={scene} camera={camera} />
        <unrealBloomPass attachArray="passes" args={[undefined, 1.5, 1, 0]} />
      </effectComposer>
    </>
  );
}

function App() {
  return (
    <Canvas camera={{ position: [0, 5, 5] }}>
      <OrbitControls zoomSpeed={0.05} autoRotate={false} />
      <Stats />
      <CameraShake
        maxYaw={0.01}
        maxPitch={0.01}
        maxRoll={0.01}
        yawFrequency={0.5}
        pitchFrequency={0.5}
        rollFrequency={0.4}
      />
      <pointLight intensity={1} position={[0, 0, 4]} />
      <ambientLight intensity={0.5} />
      <Suspense fallback="null">
        <Bloom>
          <ambientLight intensity={1} />
          <pointLight intensity={2} position={[0, 30, 0]} />
          <CutoutText
            children={"NEVER NORMAL"}
            bevelThickness={0}
            bevelSize={0}
            layerDepth={0.02}
            glowDepth={3}
            color={0x000000}
            colorGlow={0xffff88}
          />
          <Text
            children={"NEVER NORMAL"}
            bevelThickness={0.01}
            bevelSize={0.01}
            layerDepth={0.02}
            glowDepth={3}
            color={0x000000}
            colorGlow={0xffff88}
            flushExtrusion={1}
          />
        </Bloom>
      </Suspense>
    </Canvas>
  );
}

export default App;
