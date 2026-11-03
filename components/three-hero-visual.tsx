"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

interface ThreeHeroVisualProps {
  className?: string
  typingIntensity?: number // 0 to 1, increases when user is actively typing
}

export function ThreeHeroVisual({ className = "", typingIntensity = 0 }: ThreeHeroVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) return

    const width = container.clientWidth || 400
    const height = container.clientHeight || 400

    // 1. Scene & Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
    camera.position.set(0, 0, 5)

    // 2. WebGL Renderer with capped pixel ratio (max 2 for performance)
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // 3. Central Morphing Geometric Core (Icosahedron Wireframe + Points)
    const coreGeometry = new THREE.IcosahedronGeometry(1.6, 2)
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    })
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial)
    scene.add(coreMesh)

    // Inner glowing sphere
    const innerGeometry = new THREE.SphereGeometry(0.8, 24, 24)
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    })
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial)
    scene.add(innerMesh)

    // 4. Orbiting Particle Constellation
    const particleCount = 180
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    const color1 = new THREE.Color(0x3b82f6) // Blue
    const color2 = new THREE.Color(0x8b5cf6) // Purple
    const color3 = new THREE.Color(0x10b981) // Emerald

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 1.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      const mixedColor = i % 3 === 0 ? color1 : i % 3 === 1 ? color2 : color3
      colors[i * 3] = mixedColor.r
      colors[i * 3 + 1] = mixedColor.g
      colors[i * 3 + 2] = mixedColor.b
    }

    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    })
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particleSystem)

    // 5. Connecting Lines (Constellation Effect)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
    })
    const lineGeometry = new THREE.BufferGeometry()
    const linePositions = new Float32Array(particleCount * 2 * 3)
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3))
    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial)
    scene.add(lineMesh)

    // 6. Interactive Cursor Tracking (Mouse Parallax)
    let targetMouseX = 0
    let targetMouseY = 0
    let currentMouseX = 0
    let currentMouseY = 0

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      targetMouseX = x * 1.5
      targetMouseY = y * 1.5
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })

    // 7. Animation Loop using requestAnimationFrame with delta time
    let animationFrameId: number
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      const elapsed = clock.getElapsedTime()

      // Smooth mouse interpolation (lerp)
      currentMouseX += (targetMouseX - currentMouseX) * 0.05
      currentMouseY += (targetMouseY - currentMouseY) * 0.05

      // Base rotation + typing intensity multiplier
      const speedMultiplier = 1 + typingIntensity * 2.5
      coreMesh.rotation.x += delta * 0.3 * speedMultiplier
      coreMesh.rotation.y += delta * 0.45 * speedMultiplier
      innerMesh.rotation.x -= delta * 0.5 * speedMultiplier
      innerMesh.rotation.z += delta * 0.35 * speedMultiplier

      particleSystem.rotation.y += delta * 0.15 * speedMultiplier
      particleSystem.rotation.x += delta * 0.08 * speedMultiplier

      // Subtle breath pulse
      const pulse = 1 + Math.sin(elapsed * 2) * 0.04 + typingIntensity * 0.1
      coreMesh.scale.set(pulse, pulse, pulse)

      // Camera parallax
      camera.position.x = currentMouseX * 1.2
      camera.position.y = -currentMouseY * 1.2
      camera.lookAt(scene.position)

      renderer.render(scene, camera)
    }

    animate()

    // 8. Responsive Resize Listener
    const handleResize = () => {
      if (!container) return
      const newWidth = container.clientWidth || 400
      const newHeight = container.clientHeight || 400
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    window.addEventListener("resize", handleResize)

    // 9. Memory Cleanup on Unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)

      coreGeometry.dispose()
      coreMaterial.dispose()
      innerGeometry.dispose()
      innerMaterial.dispose()
      particleGeometry.dispose()
      particleMaterial.dispose()
      lineGeometry.dispose()
      lineMaterial.dispose()
      renderer.dispose()

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [typingIntensity])

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[300px] flex items-center justify-center pointer-events-none select-none overflow-hidden ${className}`}
      aria-hidden="true"
    />
  )
}
