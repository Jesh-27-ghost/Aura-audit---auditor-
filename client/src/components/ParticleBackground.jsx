import { useEffect, useRef, useCallback } from 'react';

const PARTICLE_COUNT = 80;
const CONNECTION_DISTANCE = 120;
const MOUSE_RADIUS = 200;
const MOUSE_FORCE = 0.08;

export default function ParticleBackground({ accelerate = false }) {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const particlesRef = useRef([]);
    const animFrameRef = useRef(null);
    const accelerateRef = useRef(accelerate);

    useEffect(() => {
        accelerateRef.current = accelerate;
    }, [accelerate]);

    const initParticles = useCallback((width, height) => {
        const particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.2,
            });
        }
        return particles;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;

        const setCanvasSize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * window.devicePixelRatio;
            canvas.height = height * window.devicePixelRatio;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };

        setCanvasSize();
        particlesRef.current = initParticles(width, height);

        const onMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const onResize = () => {
            setCanvasSize();
            particlesRef.current = initParticles(width, height);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('resize', onResize);

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            const particles = particlesRef.current;
            const mouse = mouseRef.current;
            const accel = accelerateRef.current;
            const speedMult = accel ? 2.5 : 1;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Mouse interaction
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MOUSE_RADIUS) {
                    const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE * speedMult;
                    p.vx += dx * force * 0.01;
                    p.vy += dy * force * 0.01;
                }

                // Update position
                p.x += p.vx * speedMult;
                p.y += p.vy * speedMult;

                // Damping
                p.vx *= 0.99;
                p.vy *= 0.99;

                // Wrap edges
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
                ctx.fill();

                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const cdx = p.x - p2.x;
                    const cdy = p.y - p2.y;
                    const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

                    if (cdist < CONNECTION_DISTANCE) {
                        const alpha = (1 - cdist / CONNECTION_DISTANCE) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }

                // Draw connection to mouse
                if (dist < MOUSE_RADIUS * 1.5) {
                    const alpha = (1 - dist / (MOUSE_RADIUS * 1.5)) * 0.2;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
                    ctx.lineWidth = 0.4;
                    ctx.stroke();
                }
            }

            animFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', onResize);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [initParticles]);

    return (
        <>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />
            {/* Grain overlay */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
                opacity: 0.03,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            }} />
        </>
    );
}
