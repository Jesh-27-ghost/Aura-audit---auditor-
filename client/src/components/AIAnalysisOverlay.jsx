import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle, Upload, Eye, Sparkles, Shield, Zap } from 'lucide-react';

/**
 * Multi-step AI analysis overlay shown during video assessment.
 * Displays animated progress through 4 phases:
 *  1. Uploading video
 *  2. AI scanning frames
 *  3. Generating scorecard
 *  4. Finalizing results
 */

const STEPS = [
    { id: 'upload', label: 'Uploading video to cloud...', icon: Upload, duration: 4000, detail: 'Encrypting & transferring your recording' },
    { id: 'scan', label: 'Gemini AI scanning frames...', icon: Eye, duration: 12000, detail: 'Analyzing code patterns, logic flow & accuracy' },
    { id: 'score', label: 'Generating scorecard...', icon: Brain, duration: 6000, detail: 'Evaluating dimensions: accuracy, efficiency, best practices' },
    { id: 'finalize', label: 'Finalizing results...', icon: Shield, duration: 3000, detail: 'Integrity check & badge eligibility' },
];

const TOTAL_DURATION = STEPS.reduce((s, step) => s + step.duration, 0);

const AI_FACTS = [
    '🧬 Gemini Vision analyzes every frame of your recording',
    '🔍 Code logic, variable naming, and structure are all evaluated',
    '🛡️ Anti-fraud: deepfake & proxy detection runs simultaneously',
    '📊 Your score is based on 4 dimensions of skill mastery',
    '🏆 Scores above 70% automatically generate a verified badge',
    '⚡ Average analysis time: 15-25 seconds',
];

export default function AIAnalysisOverlay({ visible }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [stepProgress, setStepProgress] = useState(0);
    const [overallProgress, setOverallProgress] = useState(0);
    const [factIndex, setFactIndex] = useState(0);
    const startTime = useRef(Date.now());
    const rafRef = useRef(null);

    // Animate progress
    useEffect(() => {
        if (!visible) return;

        startTime.current = Date.now();
        setCurrentStep(0);
        setStepProgress(0);
        setOverallProgress(0);

        const tick = () => {
            const elapsed = Date.now() - startTime.current;
            const overall = Math.min(elapsed / TOTAL_DURATION, 0.95); // cap at 95% so it doesn't look "done" before server returns
            setOverallProgress(overall * 100);

            // Determine current step
            let accum = 0;
            for (let i = 0; i < STEPS.length; i++) {
                if (elapsed < accum + STEPS[i].duration) {
                    setCurrentStep(i);
                    setStepProgress(((elapsed - accum) / STEPS[i].duration) * 100);
                    break;
                }
                accum += STEPS[i].duration;
                if (i === STEPS.length - 1) {
                    setCurrentStep(STEPS.length - 1);
                    setStepProgress(95);
                }
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [visible]);

    // Rotate facts
    useEffect(() => {
        if (!visible) return;
        const interval = setInterval(() => {
            setFactIndex(prev => (prev + 1) % AI_FACTS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [visible]);

    const ActiveIcon = STEPS[currentStep]?.icon || Brain;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="ai-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="ai-overlay-bg" />

                    <motion.div
                        className="ai-overlay-card"
                        initial={{ scale: 0.85, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: -20 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                    >
                        {/* Brain animation */}
                        <div className="ai-brain-container">
                            <div className="ai-brain-pulse" />
                            <div className="ai-brain-pulse ai-brain-pulse-2" />
                            <motion.div
                                className="ai-brain-icon"
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <ActiveIcon size={36} strokeWidth={1.5} />
                            </motion.div>

                            {/* Orbiting particles */}
                            {[0, 72, 144, 216, 288].map((deg, i) => (
                                <motion.div
                                    key={i}
                                    className="ai-orbit-particle"
                                    animate={{
                                        rotate: [deg, deg + 360],
                                    }}
                                    transition={{
                                        duration: 6 + i,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                    style={{ position: 'absolute', inset: -10 }}
                                >
                                    <div
                                        className="ai-particle-dot"
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {/* Step label */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                className="ai-step-label"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3>{STEPS[currentStep].label}</h3>
                                <p>{STEPS[currentStep].detail}</p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Step indicators */}
                        <div className="ai-steps">
                            {STEPS.map((step, i) => (
                                <div
                                    key={i}
                                    className={`ai-step-item ${i < currentStep ? 'ai-step-done' : i === currentStep ? 'ai-step-active' : ''}`}
                                >
                                    <div className="ai-step-circle">
                                        {i < currentStep ? (
                                            <CheckCircle size={16} />
                                        ) : (
                                            <span>{i + 1}</span>
                                        )}
                                    </div>
                                    <span className="ai-step-name">{step.id}</span>
                                </div>
                            ))}
                        </div>

                        {/* Overall progress bar */}
                        <div className="ai-progress-track">
                            <motion.div
                                className="ai-progress-fill"
                                style={{ width: `${overallProgress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                            <div className="ai-progress-glow" style={{ left: `${overallProgress}%` }} />
                        </div>
                        <div className="ai-progress-pct">{Math.round(overallProgress)}%</div>

                        {/* Rotating facts */}
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={factIndex}
                                className="ai-fact"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.3 }}
                            >
                                {AI_FACTS[factIndex]}
                            </motion.p>
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
