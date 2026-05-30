import s from './cannonGame.module.css'
import { useRef, useState, useEffect } from 'react'

const BALL_COUNT = 10
const BALL_SIZE = 150
const BALL_RADIUS = BALL_SIZE / 2
const SPEED = 0.7
const BOUNCE_FORCE = 1
const MIN_CANNON_ANGLE = -90
const MAX_CANNON_ANGLE = 90
const PROJECTILE_SIZE = 50
const PROJECTILE_RADIUS = PROJECTILE_SIZE / 2
const PROJECTILE_SPEED = 4

const getRandomPosition = (maxX, maxY) => ({
    x: Math.random() * maxX,
    y: Math.random() * maxY,
})

const clamp = (value, min, max) => Math.max(min, Math.min(value, max))

const normalizeAngle = (angle) => {
    if (angle > 180) return angle - 360

    return angle
}

const isOverlapping = (ball, balls) =>
    balls.some((currentBall) => {
        const diffX = currentBall.x - ball.x
        const diffY = currentBall.y - ball.y

        return Math.hypot(diffX, diffY) < BALL_SIZE
    })

const createInitialBalls = (maxX, maxY) => {
    const balls = []

    for (let index = 0; index < BALL_COUNT; index++) {
        let position = getRandomPosition(maxX, maxY)
        let attempts = 0

        while (isOverlapping(position, balls) && attempts < 100) {
            position = getRandomPosition(maxX, maxY)
            attempts++
        }

        balls.push({
            id: index + 1,
            x: position.x,
            y: position.y,
            velocityX: Math.random() > 0.5 ? SPEED : -SPEED,
            velocityY: Math.random() > 0.5 ? SPEED : -SPEED,
        })
    }

    return balls
}

const handleBallCollisions = (nextBalls) => {
    for (let i = 0; i < nextBalls.length; i++) {
        for (let j = i + 1; j < nextBalls.length; j++) {
            const firstBall = nextBalls[i]
            const secondBall = nextBalls[j]
            const firstCenterX = firstBall.x + BALL_RADIUS
            const firstCenterY = firstBall.y + BALL_RADIUS
            const secondCenterX = secondBall.x + BALL_RADIUS
            const secondCenterY = secondBall.y + BALL_RADIUS
            const diffX = secondCenterX - firstCenterX
            const diffY = secondCenterY - firstCenterY
            const distance = Math.hypot(diffX, diffY)

            if (distance === 0 || distance >= BALL_SIZE) continue

            const normalX = diffX / distance
            const normalY = diffY / distance
            const overlap = BALL_SIZE - distance
            const firstVelocityAlongNormal =
                firstBall.velocityX * normalX + firstBall.velocityY * normalY
            const secondVelocityAlongNormal =
                secondBall.velocityX * normalX + secondBall.velocityY * normalY

            if (firstVelocityAlongNormal <= secondVelocityAlongNormal) continue

            firstBall.x -= (overlap / 2) * normalX
            firstBall.y -= (overlap / 2) * normalY
            secondBall.x += (overlap / 2) * normalX
            secondBall.y += (overlap / 2) * normalY

            const velocityDiff =
                (firstVelocityAlongNormal - secondVelocityAlongNormal) *
                ((1 + BOUNCE_FORCE) / 2)

            firstBall.velocityX -= velocityDiff * normalX
            firstBall.velocityY -= velocityDiff * normalY
            secondBall.velocityX += velocityDiff * normalX
            secondBall.velocityY += velocityDiff * normalY
        }
    }

    return nextBalls
}

const CannonGame = () => {
    const bgRef = useRef(null)
    const layoutRef = useRef(null)
    const cannonBaseRef = useRef(null)
    const cannonRef = useRef(null)
    const projectileIdRef = useRef(0)
    const hasCreatedBallsRef = useRef(false)
    const ballsRef = useRef([])
    const projectilesRef = useRef([])
    const [balls, setBalls] = useState([])
    const [projectiles, setProjectiles] = useState([])

    useEffect(() => {
        let animationId

        const animate = () => {
            const layout = layoutRef.current

            if (!layout) {
                animationId = requestAnimationFrame(animate)
                return
            }

            const maxBallX = layout.clientWidth - BALL_SIZE
            const maxBallY = layout.clientHeight - BALL_SIZE

            if (!hasCreatedBallsRef.current) {
                ballsRef.current = createInitialBalls(maxBallX, maxBallY)
                hasCreatedBallsRef.current = true
            }

            const movedBalls = ballsRef.current.map((ball) => {
                let nextX = ball.x + ball.velocityX
                let nextY = ball.y + ball.velocityY
                let nextVelocityX = ball.velocityX
                let nextVelocityY = ball.velocityY

                if (nextX <= 0 || nextX >= maxBallX) {
                    nextVelocityX *= -1
                    nextX = Math.max(0, Math.min(nextX, maxBallX))
                }

                if (nextY <= 0 || nextY >= maxBallY) {
                    nextVelocityY *= -1
                    nextY = Math.max(0, Math.min(nextY, maxBallY))
                }

                return {
                    ...ball,
                    x: nextX,
                    y: nextY,
                    velocityX: nextVelocityX,
                    velocityY: nextVelocityY,
                }
            })

            const nextBalls = handleBallCollisions(movedBalls)
            const layoutX = layout.offsetLeft
            const layoutY = layout.offsetTop
            const movedProjectiles = projectilesRef.current
                .map((projectile) => {
                    const targetBall = nextBalls.find(
                        (ball) => ball.id === projectile.targetBallId
                    )

                    if (!targetBall) return projectile

                    const projectileCenterX = projectile.x + PROJECTILE_RADIUS
                    const projectileCenterY = projectile.y + PROJECTILE_RADIUS
                    const targetCenterX = layoutX + targetBall.x + BALL_RADIUS
                    const targetCenterY = layoutY + targetBall.y + BALL_RADIUS
                    const diffX = targetCenterX - projectileCenterX
                    const diffY = targetCenterY - projectileCenterY
                    const distance = Math.hypot(diffX, diffY)

                    if (distance === 0) return projectile

                    const velocityX = (diffX / distance) * PROJECTILE_SPEED
                    const velocityY = (diffY / distance) * PROJECTILE_SPEED

                    return {
                        ...projectile,
                        x: projectile.x + velocityX,
                        y: projectile.y + velocityY,
                        velocityX,
                        velocityY,
                    }
                })
                .filter(
                    (projectile) =>
                        projectile.x > -PROJECTILE_SIZE &&
                        projectile.x < window.innerWidth + PROJECTILE_SIZE &&
                        projectile.y > -PROJECTILE_SIZE &&
                        projectile.y < window.innerHeight + PROJECTILE_SIZE
                )
            const destroyedBallIds = new Set()
            const destroyedProjectileIds = new Set()

            movedProjectiles.forEach((projectile) => {
                const targetBall = nextBalls.find(
                    (ball) => ball.id === projectile.targetBallId
                )

                if (!targetBall) {
                    destroyedProjectileIds.add(projectile.id)
                    return
                }

                const projectileCenterX = projectile.x + PROJECTILE_RADIUS
                const projectileCenterY = projectile.y + PROJECTILE_RADIUS
                const targetCenterX = layoutX + targetBall.x + BALL_RADIUS
                const targetCenterY = layoutY + targetBall.y + BALL_RADIUS
                const diffX = targetCenterX - projectileCenterX
                const diffY = targetCenterY - projectileCenterY
                const distance = Math.hypot(diffX, diffY)

                if (distance > BALL_RADIUS + PROJECTILE_RADIUS) return

                destroyedBallIds.add(targetBall.id)
                destroyedProjectileIds.add(projectile.id)
            })

            ballsRef.current = nextBalls.filter(
                (ball) => !destroyedBallIds.has(ball.id)
            )
            projectilesRef.current = movedProjectiles.filter(
                (projectile) => !destroyedProjectileIds.has(projectile.id)
            )

            setBalls(ballsRef.current)
            setProjectiles(projectilesRef.current)

            animationId = requestAnimationFrame(animate)
        }

        animationId = requestAnimationFrame(animate)

        return () => cancelAnimationFrame(animationId)
    }, [])

    useEffect(() => {
        const handlePointerMove = (e) => {
            const cannonBase = cannonBaseRef.current
            const cannon = cannonRef.current

            if (!cannonBase || !cannon) return

            const rect = cannonBase.getBoundingClientRect()
            const cannonCenterX = rect.left + rect.width / 2
            const cannonCenterY = rect.top + rect.height / 2
            const diffX = e.clientX - cannonCenterX
            const diffY = e.clientY - cannonCenterY
            const angle = normalizeAngle(
                Math.atan2(diffY, diffX) * (180 / Math.PI) + 90
            )
            const nextAngle = clamp(angle, MIN_CANNON_ANGLE, MAX_CANNON_ANGLE)

            cannon.style.transform = `rotate(${nextAngle}deg)`
        }

        window.addEventListener('pointermove', handlePointerMove)

        return () => window.removeEventListener('pointermove', handlePointerMove)
    }, [])

    const shootProjectileToTarget = (e, ball) => {
        e.stopPropagation()

        const bg = bgRef.current
        const cannonBase = cannonBaseRef.current
        const layout = layoutRef.current

        if (!bg || !cannonBase || !layout) return

        const bgRect = bg.getBoundingClientRect()
        const cannonRect = cannonBase.getBoundingClientRect()
        const layoutRect = layout.getBoundingClientRect()
        const cannonCenterX = cannonRect.left + cannonRect.width / 2
        const cannonCenterY = cannonRect.top + cannonRect.height / 2
        const ballCenterX = layoutRect.left + ball.x + BALL_RADIUS
        const ballCenterY = layoutRect.top + ball.y + BALL_RADIUS
        const diffX = ballCenterX - cannonCenterX
        const diffY = ballCenterY - cannonCenterY
        const distance = Math.hypot(diffX, diffY)

        if (distance === 0) return

        const directionX = diffX / distance
        const directionY = diffY / distance

        projectileIdRef.current += 1

        const nextProjectiles = [
            ...projectilesRef.current,
            {
                id: projectileIdRef.current,
                targetBallId: ball.id,
                x: cannonCenterX - bgRect.left - PROJECTILE_RADIUS,
                y: cannonCenterY - bgRect.top - PROJECTILE_RADIUS,
                velocityX: directionX * PROJECTILE_SPEED,
                velocityY: directionY * PROJECTILE_SPEED,
            },
        ]

        projectilesRef.current = nextProjectiles
        setProjectiles(nextProjectiles)
    }

    return (
        <div
            ref={bgRef}
            className={s.bg}
        >
            <div ref={layoutRef} className={s.layout}>
                {balls.map((ball) => (
                    <div
                        key={ball.id}
                        className={s.ball}
                        onPointerDown={(e) => shootProjectileToTarget(e, ball)}
                        style={{
                            transform: `translate(${ball.x}px, ${ball.y}px)`,
                        }}
                    />
                ))}
            </div>
            {projectiles.map((projectile) => (
                <div
                    key={projectile.id}
                    className={s.projectile}
                    style={{
                        transform: `translate(${projectile.x}px, ${projectile.y}px)`,
                    }}
                />
            ))}
            <div ref={cannonBaseRef} className={s.cannonBase}>
                <div
                    ref={cannonRef}
                    className={s.cannon}
                />
                <div className={s.cannonCircle} />
            </div>
        </div>
    )
}

export default CannonGame
