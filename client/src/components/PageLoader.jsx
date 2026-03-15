import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';

/**
 * Full-page brand loader shown on first visit.
 * Displays the SkillBuster logo with orbital rings,
 * then dissolves away after assets are ready.
 */
export default function PageLoader() {
    const [visible, setVisible] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate loading progress
        const steps = [
            { pct: 25, delay: 300 },
            { pct: 55, delay: 600 },
            { pct: 80, delay: 900 },
            { pct: 100, delay: 1400 },
        ];

        const timers = steps.map(({ pct, delay }) =>
            setTimeout(() => setProgress(pct), delay)
        );

        // Fade out after complete
        const hideTimer = setTimeout(() => setVisible(false), 2200);

        return () => {
            timers.forEach(clearTimeout);
            clearTimeout(hideTimer);
        };
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="page-loader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                >
                    {/* Background effects */}
                    <div className="pl-grid" />
                    <div className="pl-orb pl-orb-1" />
                    <div className="pl-orb pl-orb-2" />

                    {/* Logo with orbital rings */}
                    <motion.div
                        className="pl-logo-wrap"
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', damping: 12, stiffness: 120 }}
                    >
                        <div className="pl-ring pl-ring-1" />
                        <div className="pl-ring pl-ring-2" />
                        <div className="pl-ring pl-ring-3" />

                        <div className="pl-logo-icon">
                            <Shield size={32} strokeWidth={2.5} />
                        </div>
                    </motion.div>

                    {/* Brand name */}
                    <motion.h1
                        className="pl-brand"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        Skill<span className="pl-brand-accent">Buster</span>
                    </motion.h1>

                    {/* Tagline */}
                    <motion.p
                        className="pl-tagline"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                    >
                        AI-Powered Skill Verification
                    </motion.p>

                    {/* Progress bar */}
                    <motion.div
                        className="pl-bar-track"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 200 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                    >
                        <motion.div
                            className="pl-bar-fill"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                    </motion.div>

                    {/* Dots */}
                    <div className="pl-dots">
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                className="pl-dot"
                                animate={{
                                    opacity: [0.3, 1, 0.3],
                                    scale: [0.8, 1.2, 0.8],
                                }}
                                transition={{
                                    duration: 1.2,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
