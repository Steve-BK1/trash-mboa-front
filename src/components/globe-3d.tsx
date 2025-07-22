"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function NeuralNetworkGlobe() {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Générer les points du réseau
  const { points, connections } = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const connections: THREE.Vector3[] = [];
    
    // Créer des points sur une sphère
    const radius = 1;
    const numPoints = 200;
    
    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;
      
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);
      
      points.push(new THREE.Vector3(x, y, z));
    }
    
    // Créer des connexions entre points proches
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const distance = points[i].distanceTo(points[j]);
        if (distance < 0.8) {
          connections.push(points[i], points[j]);
        }
      }
    }
    
    return { points, connections };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} scale={2}>
      {/* Points du réseau */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]}
            count={points.length}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#007AFF"
          transparent
          opacity={0.9}
        />
      </points>
      
      {/* Lignes de connexion */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(connections.flatMap(p => [p.x, p.y, p.z])), 3]}
            count={connections.length}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#007AFF"
          transparent
          opacity={0.4}
        />
      </lineSegments>
    </group>
  );
}

export function Globe3D() {
  return (
    <div className="w-full h-full min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] relative">
      <Canvas 
        camera={{ position: [0, 0, 4], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <NeuralNetworkGlobe />
      </Canvas>
    </div>
  );
} 