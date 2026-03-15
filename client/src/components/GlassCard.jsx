import { motion } from 'framer-motion';

/**
 * GlassCard — glassmorphism card with border glow and hover tilt
 */
export default function GlassCard({
    children,
    className = '',
    delay = 0,
    hover = true,
    ...props
}) {
    return (
        <motion.div
            className={`glass-card ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
            whileHover={hover ? {
                y: -6,
                boxShadow: '0 20px 60px rgba(99, 102, 241, 0.15), 0 0 40px rgba(99, 102, 241, 0.08)',
                borderColor: 'rgba(99, 102, 241, 0.3)',
            } : {}}
            style={{ willChange: 'transform' }}
            {...props}
        >
            {children}
        </motion.div>
    );
}
