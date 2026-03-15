import { useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * MagneticButton — wraps children in a container that pulls
 * toward the cursor when within proximity. Also has shimmer on hover.
 */
export default function MagneticButton({
    children,
    className = '',
    as: Tag = 'button',
    magneticStrength = 0.3,
    magneticRadius = 80,
    shimmer = true,
    pulse = false,
    ...props
}) {
    const ref = useRef(null);
    const posRef = useRef({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < magneticRadius) {
            posRef.current = {
                x: dx * magneticStrength,
                y: dy * magneticStrength,
            };
            ref.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
        }
    };

    const handleMouseLeave = () => {
        if (!ref.current) return;
        ref.current.style.transform = 'translate(0px, 0px)';
        posRef.current = { x: 0, y: 0 };
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                display: 'inline-block',
                transition: 'transform 0.25s cubic-bezier(0.23, 1, 0.32, 1)',
                willChange: 'transform',
                position: 'relative',
            }}
            animate={pulse ? {
                boxShadow: [
                    '0 0 0px rgba(99, 102, 241, 0)',
                    '0 0 20px rgba(99, 102, 241, 0.4)',
                    '0 0 0px rgba(99, 102, 241, 0)',
                ],
            } : {}}
            transition={pulse ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } : {}}
            className={`magnetic-btn ${shimmer ? 'shimmer-btn' : ''}`}
        >
            <Tag className={className} style={{ position: 'relative', overflow: 'hidden' }} {...props}>
                {children}
                {shimmer && <span className="shimmer-effect" />}
            </Tag>
        </motion.div>
    );
}
