import { motion } from 'framer-motion';

/**
 * NeuralLoader — "Neural Pulse" loading animation with
 * circular progress, scanning line, and glowing aura.
 */
export default function NeuralLoader({ text = 'Analyzing...', progress = null }) {
    return (
        <div className="neural-loader-overlay">
            {/* Scanning line that moves vertically */}
            <motion.div
                className="neural-scan-line"
                animate={{ top: ['-5%', '105%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="neural-loader-content">
                {/* Outer glow rings */}
                <motion.div
                    className="neural-glow-ring neural-glow-ring-1"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="neural-glow-ring neural-glow-ring-2"
                    animate={{ scale: [1.1, 1.5, 1.1], opacity: [0.2, 0.05, 0.2] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* SVG circular progress */}
                <div className="neural-circle-container">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        {/* Track */}
                        <circle
                            cx="50" cy="50" r="42"
                            fill="none"
                            stroke="rgba(99, 102, 241, 0.1)"
                            strokeWidth="3"
                        />
                        {/* Spinning arc */}
                        <motion.circle
                            cx="50" cy="50" r="42"
                            fill="none"
                            stroke="url(#neural-gradient)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray="264"
                            strokeDashoffset={progress !== null ? 264 - (progress / 100) * 264 : 180}
                            animate={progress === null ? { rotate: [0, 360] } : {}}
                            transition={progress === null ? { duration: 1.5, repeat: Infinity, ease: 'linear' } : {}}
                            style={{ transformOrigin: 'center' }}
                        />
                        {/* Inner dots */}
                        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                            <motion.circle
                                key={i}
                                cx={50 + 30 * Math.cos((angle * Math.PI) / 180)}
                                cy={50 + 30 * Math.sin((angle * Math.PI) / 180)}
                                r="1.5"
                                fill="#6366f1"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{
                                    duration: 1.5,
                                    delay: i * 0.2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            />
                        ))}
                        <defs>
                            <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="50%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Center icon */}
                    <motion.div
                        className="neural-center-icon"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        ⬡
                    </motion.div>
                </div>

                {/* Text */}
                <motion.p
                    className="neural-text"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    {text}
                </motion.p>

                {progress !== null && (
                    <div className="neural-progress-text">{Math.round(progress)}%</div>
                )}
            </div>
        </div>
    );
}
