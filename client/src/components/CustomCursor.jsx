import { useEffect, useRef, useState, useCallback } from 'react';

export default function CustomCursor() {
    const cursorRef = useRef(null);
    const dotRef = useRef(null);
    const posRef = useRef({ x: 0, y: 0 });
    const targetRef = useRef({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [ripples, setRipples] = useState([]);

    // Spawn a ripple at click position
    const spawnRipple = useCallback((x, y) => {
        const id = Date.now() + Math.random();
        setRipples(prev => [...prev, { id, x, y }]);
        // Remove after animation ends
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== id));
        }, 600);
    }, []);

    useEffect(() => {
        // Only on desktop
        if (window.matchMedia('(pointer: coarse)').matches) return;

        const onMouseMove = (e) => {
            targetRef.current = { x: e.clientX, y: e.clientY };

            // Dot follows instantly
            if (dotRef.current) {
                dotRef.current.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
            }
        };

        const onMouseDown = (e) => {
            setIsClicking(true);
            spawnRipple(e.clientX, e.clientY);
        };
        const onMouseUp = () => setIsClicking(false);

        const checkHover = () => {
            const els = document.querySelectorAll('button, a, .card, .role-option, .magnetic-btn, [data-cursor-hover]');
            const handleEnter = () => setIsHovering(true);
            const handleLeave = () => setIsHovering(false);

            els.forEach(el => {
                el.addEventListener('mouseenter', handleEnter);
                el.addEventListener('mouseleave', handleLeave);
            });

            return () => {
                els.forEach(el => {
                    el.removeEventListener('mouseenter', handleEnter);
                    el.removeEventListener('mouseleave', handleLeave);
                });
            };
        };

        // Observe DOM for new interactive elements
        const observer = new MutationObserver(() => {
            cleanup = checkHover();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        let cleanup = checkHover();

        // LERP animation
        let animFrame;
        const animate = () => {
            const lerp = 0.15;
            posRef.current.x += (targetRef.current.x - posRef.current.x) * lerp;
            posRef.current.y += (targetRef.current.y - posRef.current.y) * lerp;

            if (cursorRef.current) {
                const size = isHovering ? 48 : 32;
                const offset = size / 2;
                cursorRef.current.style.transform = `translate(${posRef.current.x - offset}px, ${posRef.current.y - offset}px)`;
                cursorRef.current.style.width = size + 'px';
                cursorRef.current.style.height = size + 'px';
            }

            animFrame = requestAnimationFrame(animate);
        };

        animate();

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            cancelAnimationFrame(animFrame);
            observer.disconnect();
            if (cleanup) cleanup();
        };
    }, [isHovering, spawnRipple]);

    // Mobile — don't render
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
        return null;
    }

    return (
        <>
            {/* Outer ring — smooth LERP follow */}
            <div
                ref={cursorRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: `2px solid rgba(99, 102, 241, ${isHovering ? 0.8 : 0.5})`,
                    pointerEvents: 'none',
                    zIndex: 10000,
                    transition: 'width 0.2s, height 0.2s, border-color 0.2s, background 0.15s',
                    willChange: 'transform',
                    mixBlendMode: 'difference',
                    boxShadow: isHovering
                        ? '0 0 20px rgba(99, 102, 241, 0.3), inset 0 0 20px rgba(99, 102, 241, 0.1)'
                        : 'none',
                    background: isClicking ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    transform: isClicking ? 'scale(0.85)' : undefined,
                }}
            />

            {/* Inner dot — instant follow */}
            <div
                ref={dotRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: isClicking ? '#a78bfa' : '#6366f1',
                    pointerEvents: 'none',
                    zIndex: 10001,
                    willChange: 'transform',
                    transition: 'background 0.1s, transform 0.1s',
                    ...(isClicking ? { transform: dotRef.current?.style.transform + ' scale(1.8)' } : {}),
                }}
            />

            {/* Click ripples */}
            {ripples.map(ripple => (
                <div
                    key={ripple.id}
                    className="cursor-ripple"
                    style={{
                        position: 'fixed',
                        left: ripple.x,
                        top: ripple.y,
                        pointerEvents: 'none',
                        zIndex: 9999,
                    }}
                >
                    <div className="cursor-ripple-ring cursor-ripple-ring-1" />
                    <div className="cursor-ripple-ring cursor-ripple-ring-2" />
                    <div className="cursor-ripple-burst" />
                </div>
            ))}
        </>
    );
}
