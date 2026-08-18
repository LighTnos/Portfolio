import React, { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useFBX, useAnimations } from '@react-three/drei'

const MODEL_URL = '/models/avatar.glb'
const IDLE_URL = '/models/idle.fbx'

const _headWorld = new THREE.Vector3()
const _camPos = new THREE.Vector3()
const _lookAt = new THREE.Vector3()

/**
 * Ready Player Me developer avatar: idle animation + cursor-follow head.
 * The model is normalized to 1 unit tall, feet at y=0.
 */
function AvatarModel() {
  const group = useRef()
  const { scene } = useGLTF(MODEL_URL)
  const idle = useFBX(IDLE_URL)
  const mouse = useRef({ x: 0, y: 0 })

  const animations = useMemo(() => {
    if (idle.animations && idle.animations.length) {
      idle.animations[0].name = 'idle'
      return [idle.animations[0]]
    }
    return []
  }, [idle])

  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    actions.idle?.reset().fadeIn(0.4).play()
    return () => actions.idle?.fadeOut(0.4)
  }, [actions])

  // Find head/neck bones for cursor tracking
  const bones = useMemo(() => {
    const found = {}
    scene.traverse((o) => {
      if (o.isBone) {
        if (!found.head && /head/i.test(o.name)) found.head = o
        if (!found.neck && /neck/i.test(o.name)) found.neck = o
      }
      if (o.isMesh) o.frustumCulled = false
    })
    return found
  }, [scene])

  // Normalize scale/position: 1 unit tall, feet at y=0, centered
  const { offset, scale } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const s = 1 / size.y
    return {
      scale: s,
      offset: new THREE.Vector3(-center.x * s, -box.min.y * s, -center.z * s),
    }
  }, [scene])

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // Runs after the animation mixer update, so head tracking wins.
  // The camera is re-framed from the head bone's actual world position
  // every frame, so the bust always stays in view regardless of
  // animation offsets or model scale.
  useFrame(({ camera }, dt) => {
    const damp = 1 - Math.exp(-6 * dt)
    const tx = mouse.current.x
    const ty = mouse.current.y

    if (bones.head) {
      bones.head.rotation.y += (tx * 0.5 - bones.head.rotation.y) * damp
      bones.head.rotation.x += (ty * 0.35 - bones.head.rotation.x) * damp
    }
    if (bones.neck) {
      bones.neck.rotation.y += (tx * 0.22 - bones.neck.rotation.y) * damp
      bones.neck.rotation.x += (ty * 0.15 - bones.neck.rotation.x) * damp
    }

    if (bones.head) {
      bones.head.getWorldPosition(_headWorld)
      const h = Math.max(_headWorld.y, 0.2)
      // Frame slightly lower and further back so hair keeps headroom
      _camPos.set(_headWorld.x * 0.25, h * 0.87, _headWorld.z + h * 0.95)
      _lookAt.set(_headWorld.x * 0.25, h * 0.87, _headWorld.z)
      camera.position.lerp(_camPos, camera.userData.framed ? damp : 1)
      camera.userData.framed = true
      camera.lookAt(_lookAt)
    }
  })

  return (
    <group ref={group}>
      <primitive object={scene} scale={scale} position={offset.toArray()} />
    </group>
  )
}

/**
 * Hero avatar canvas — frames head & shoulders of the normalized model,
 * transparent background, site-accent rim lighting.
 */
export default function Avatar3D({ className = '', style }) {
  return (
    <div className={className} style={style}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0.85, 0.95], fov: 32, near: 0.05, far: 10 }}
        onCreated={({ camera }) => camera.lookAt(0, 0.82, 0)}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 3, 2]} intensity={1.8} color="#ffffff" />
        <directionalLight position={[-3, 1.5, -2]} intensity={2.4} color="#b600a8" />
        <directionalLight position={[3, 1, -3]} intensity={1.6} color="#7621b0" />
        <Suspense fallback={null}>
          <AvatarModel />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload(MODEL_URL)
