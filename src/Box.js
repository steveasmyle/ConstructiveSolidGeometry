import React, { useRef } from "react";

function Box(props) {
  const boxRef = useRef();
  return (
    <>
      <mesh {...props} ref={boxRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshPhongMaterial attach="material" color="#ff4400" />
      </mesh>
    </>
  );
}

export default Box;
