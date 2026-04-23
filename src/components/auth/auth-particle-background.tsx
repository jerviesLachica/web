import { useEffect, useRef } from "react"

type Orb = {
  baseX: number
  baseY: number
  radius: number
  hue: number
  phase: number
  speed: number
  amplitudeX: number
  amplitudeY: number
  alpha: number
}

const ORB_COUNT = 8

function createOrbs(): Orb[] {
  return Array.from({ length: ORB_COUNT }, (_, index) => ({
    baseX: Math.random(),
    baseY: Math.random(),
    radius: 140 + Math.random() * 220,
    hue: [185, 205, 230, 280, 320][index % 5],
    phase: Math.random() * Math.PI * 2,
    speed: 0.14 + Math.random() * 0.28,
    amplitudeX: 60 + Math.random() * 180,
    amplitudeY: 40 + Math.random() * 140,
    alpha: 0.12 + Math.random() * 0.1,
  }))
}

export function AuthParticleBackground(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    const orbs = createOrbs()
    let animationFrameId = 0
    let startTime = performance.now()

    const resizeCanvas = (): void => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      const width = window.innerWidth
      const height = window.innerHeight

      canvas.width = Math.floor(width * ratio)
      canvas.height = Math.floor(height * ratio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const drawGrid = (width: number, height: number, time: number) => {
      context.save()
      context.strokeStyle = "rgba(148, 163, 184, 0.08)"
      context.lineWidth = 1

      const spacing = 48
      const offsetX = (time * 18) % spacing
      const offsetY = (time * 10) % spacing

      for (let x = -spacing; x < width + spacing; x += spacing) {
        context.beginPath()
        context.moveTo(x + offsetX, 0)
        context.lineTo(x + offsetX, height)
        context.stroke()
      }

      for (let y = -spacing; y < height + spacing; y += spacing) {
        context.beginPath()
        context.moveTo(0, y + offsetY)
        context.lineTo(width, y + offsetY)
        context.stroke()
      }

      context.restore()
    }

    const drawWaveBand = (
      width: number,
      height: number,
      time: number,
      amplitude: number,
      frequency: number,
      verticalOffset: number,
      colorStart: string,
      colorEnd: string,
      alpha: number
    ) => {
      const gradient = context.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, colorStart)
      gradient.addColorStop(1, colorEnd)

      context.save()
      context.beginPath()
      context.moveTo(0, height)

      for (let x = 0; x <= width; x += 8) {
        const wave =
          Math.sin(x * frequency + time * 1.6 + verticalOffset) * amplitude +
          Math.cos(x * frequency * 0.55 - time * 1.1 + verticalOffset) *
            (amplitude * 0.45)
        const y = height * verticalOffset + wave
        context.lineTo(x, y)
      }

      context.lineTo(width, height)
      context.closePath()
      context.globalAlpha = alpha
      context.fillStyle = gradient
      context.fill()
      context.restore()
    }

    const renderFrame = (now: number): void => {
      const width = window.innerWidth
      const height = window.innerHeight
      const time = (now - startTime) / 1000

      const baseGradient = context.createLinearGradient(0, 0, width, height)
      baseGradient.addColorStop(0, "#020617")
      baseGradient.addColorStop(0.35, "#081226")
      baseGradient.addColorStop(0.68, "#0b1120")
      baseGradient.addColorStop(1, "#030712")
      context.fillStyle = baseGradient
      context.fillRect(0, 0, width, height)

      const vignette = context.createRadialGradient(
        width * 0.5,
        height * 0.45,
        120,
        width * 0.5,
        height * 0.45,
        Math.max(width, height) * 0.7
      )
      vignette.addColorStop(0, "rgba(15, 23, 42, 0)")
      vignette.addColorStop(1, "rgba(2, 6, 23, 0.55)")
      context.fillStyle = vignette
      context.fillRect(0, 0, width, height)

      drawGrid(width, height, time)

      orbs.forEach((orb, index) => {
        const x =
          orb.baseX * width +
          Math.sin(time * orb.speed + orb.phase) * orb.amplitudeX
        const y =
          orb.baseY * height +
          Math.cos(time * (orb.speed * 0.85) + orb.phase) * orb.amplitudeY

        const gradient = context.createRadialGradient(x, y, 0, x, y, orb.radius)
        gradient.addColorStop(0, `hsla(${orb.hue}, 100%, 70%, ${orb.alpha + 0.04})`)
        gradient.addColorStop(0.4, `hsla(${orb.hue}, 100%, 60%, ${orb.alpha})`)
        gradient.addColorStop(1, `hsla(${orb.hue}, 100%, 50%, 0)`)

        context.save()
        context.globalCompositeOperation = index % 2 === 0 ? "screen" : "lighter"
        context.fillStyle = gradient
        context.beginPath()
        context.arc(x, y, orb.radius, 0, Math.PI * 2)
        context.fill()
        context.restore()
      })

      drawWaveBand(
        width,
        height,
        time,
        34,
        0.009,
        0.72,
        "rgba(34, 211, 238, 0.20)",
        "rgba(56, 189, 248, 0.04)",
        1
      )
      drawWaveBand(
        width,
        height,
        time + 0.8,
        48,
        0.007,
        0.62,
        "rgba(168, 85, 247, 0.16)",
        "rgba(59, 130, 246, 0.04)",
        0.9
      )
      drawWaveBand(
        width,
        height,
        time + 1.4,
        56,
        0.005,
        0.52,
        "rgba(45, 212, 191, 0.14)",
        "rgba(236, 72, 153, 0.04)",
        0.82
      )

      context.save()
      context.strokeStyle = "rgba(255,255,255,0.05)"
      context.lineWidth = 1
      context.beginPath()
      for (let x = 0; x <= width; x += 10) {
        const y =
          height * 0.38 +
          Math.sin(x * 0.01 - time * 1.4) * 16 +
          Math.cos(x * 0.004 + time * 0.8) * 12

        if (x === 0) {
          context.moveTo(x, y)
        } else {
          context.lineTo(x, y)
        }
      }
      context.stroke()
      context.restore()

      animationFrameId = requestAnimationFrame(renderFrame)
    }

    resizeCanvas()
    animationFrameId = requestAnimationFrame(renderFrame)
    window.addEventListener("resize", resizeCanvas)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-screen w-screen opacity-100"
    />
  )
}
