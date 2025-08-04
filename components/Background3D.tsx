"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Float, Text3D, Center } from "@react-three/drei"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Mesh } from "three"

// 3D卡通运动员组件
function CartoonAthlete({
  position,
  color,
  sport,
}: { position: [number, number, number]; color: string; sport: string }) {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.2
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        {/* 身体 */}
        <mesh ref={meshRef}>
          <capsuleGeometry args={[0.3, 1.2, 4, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* 头部 */}
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* 手臂 */}
        <mesh position={[-0.4, 0.3, 0]} rotation={[0, 0, Math.PI / 6]}>
          <capsuleGeometry args={[0.1, 0.6, 4, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        <mesh position={[0.4, 0.3, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <capsuleGeometry args={[0.1, 0.6, 4, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* 腿部 */}
        <mesh position={[-0.15, -0.8, 0]}>
          <capsuleGeometry args={[0.12, 0.8, 4, 8]} />
          <meshStandardMaterial color="#4169e1" />
        </mesh>
        <mesh position={[0.15, -0.8, 0]}>
          <capsuleGeometry args={[0.12, 0.8, 4, 8]} />
          <meshStandardMaterial color="#4169e1" />
        </mesh>

        {/* 运动装备 */}
        {sport === "football" && (
          <mesh position={[0.6, 0, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        )}

        {sport === "archery" && (
          <mesh position={[-0.6, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
            <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        )}
      </group>
    </Float>
  )
}

// 3D文字组件
function FloatingText({ position, text, color }: { position: [number, number, number]; text: string; color: string }) {
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
      <Center position={position}>
        <Text3D
          font="/fonts/Geist_Bold.json"
          size={0.3}
          height={0.05}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          {text}
          <meshStandardMaterial color={color} />
        </Text3D>
      </Center>
    </Float>
  )
}

// 装饰性几何体
function DecorativeShapes() {
  const shapes = useRef<Mesh[]>([])

  useFrame((state) => {
    shapes.current.forEach((shape, index) => {
      if (shape) {
        shape.rotation.x = state.clock.elapsedTime * (0.5 + index * 0.1)
        shape.rotation.y = state.clock.elapsedTime * (0.3 + index * 0.05)
      }
    })
  })

  return (
    <>
      {/* 奖杯形状 */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh ref={(el) => el && (shapes.current[0] = el)} position={[-4, 2, -3]}>
          <coneGeometry args={[0.3, 0.8, 8]} />
          <meshStandardMaterial color="#ffd700" />
        </mesh>
      </Float>

      {/* 奖牌形状 */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
        <mesh ref={(el) => el && (shapes.current[1] = el)} position={[4, 1, -2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.1, 16]} />
          <meshStandardMaterial color="#c0c0c0" />
        </mesh>
      </Float>

      {/* 星星形状 */}
      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.5}>
        <mesh ref={(el) => el && (shapes.current[2] = el)} position={[3, -1, -4]}>
          <octahedronGeometry args={[0.2]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
      </Float>

      {/* 火焰形状 */}
      <Float speed={1.8} rotationIntensity={0.5} floatIntensity={0.6}>
        <mesh ref={(el) => el && (shapes.current[3] = el)} position={[-3, -2, -3]}>
          <coneGeometry args={[0.15, 0.6, 6]} />
          <meshStandardMaterial color="#ff4500" />
        </mesh>
      </Float>
    </>
  )
}

export function Background3D() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }} style={{ background: "transparent" }}>
      <Environment preset="sunset" />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ff6b6b" />

      {/* 3D卡通运动员 */}
      <CartoonAthlete position={[-2, 0, -2]} color="#ff6b6b" sport="football" />
      <CartoonAthlete position={[2, -1, -3]} color="#4ecdc4" sport="archery" />
      <CartoonAthlete position={[0, 1, -4]} color="#45b7d1" sport="running" />
      <CartoonAthlete position={[-3, -1, -1]} color="#96ceb4" sport="gymnastics" />
      <CartoonAthlete position={[3, 0.5, -1]} color="#feca57" sport="swimming" />

      {/* 3D文字 */}
      <FloatingText position={[-1, 3, -2]} text="2025" color="#ffd700" />
      <FloatingText position={[1, -3, -2]} text="成都" color="#ff6b6b" />
      <FloatingText position={[0, 2.5, -5]} text="世运会" color="#4ecdc4" />

      {/* 装饰性几何体 */}
      <DecorativeShapes />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />
    </Canvas>
  )
}
