import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video, Shield, Award, Search, Users,
    Monitor, Stethoscope, Wrench, UtensilsCrossed, HardHat,
    ArrowRight, Sparkles, Zap, ChevronDown, Eye, Brain
} from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import MagneticButton from '../components/MagneticButton';
import GlassCard from '../components/GlassCard';

const industries = [
    { icon: <Monitor size={28} />, name: 'IT / Software', desc: 'Build, debug, deploy in real-time', color: '#6366f1' },
    { icon: <Stethoscope size={28} />, name: 'Healthcare', desc: 'Medical procedures & diagnostics', color: '#10b981' },
    { icon: <Wrench size={28} />, name: 'Electrical / ITI', desc: 'Wiring, circuits & installations', color: '#f59e0b' },
    { icon: <UtensilsCrossed size={28} />, name: 'Hospitality', desc: 'Service excellence & plating', color: '#f43f5e' },
    { icon: <HardHat size={28} />, name: 'Construction', desc: 'Hands-on trade skills', color: '#06b6d4' }
];

const steps = [
    {
        icon: <Video size={24} />,
        title: 'Record Your Task',
        desc: 'Record yourself completing a real skill task — coding, wiring, medical procedures, anything.',
        gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    },
    {
        icon: <Brain size={24} />,
        title: 'AI Evaluates You',
        desc: 'Gemini Vision AI watches your video and scores your technique, efficiency, and best practices.',
        gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
    },
    {
        icon: <Award size={24} />,
        title: 'Get Verified Badge',
        desc: 'Score 70%+ and earn a tamper-proof digital badge with QR code that employers can instantly verify.',
        gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    }
];

const stats = [
    { number: '4.7 Cr', label: 'ITI graduates with unverified skills', icon: <Users size={20} /> },
    { number: '78%', label: 'Employers hire wrong due to fake resumes', icon: <Eye size={20} /> },
    { number: '∞', label: 'Potential when skills are truly proven', icon: <Zap size={20} /> }
];

// Animation variants
const stagger = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.12, delayChildren: 0.2 }
    }
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } }
};

export default function Home() {
    const [hoveredIndustry, setHoveredIndustry] = useState(null);

    return (
        <>
            <ParticleBackground />

            {/* ═══════════════════════ HERO ═══════════════════════ */}
            <section className="hero-premium" id="hero-section">
                <motion.div
                    className="hero-content-premium"
                    variants={stagger}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Floating badge */}
                    <motion.div className="hero-chip" variants={fadeUp}>
                        <span className="hero-chip-dot" />
                        <Sparkles size={14} />
                        AI-Powered Skill Verification
                    </motion.div>

                    {/* Headline — staggered reveal */}
                    <motion.h1 className="hero-headline" variants={fadeUp}>
                        <span className="hero-line">Your Skills.</span>
                        <br />
                        <motion.span
                            className="hero-gradient-text"
                            variants={fadeUp}
                        >
                            Proven.
                        </motion.span>{' '}
                        <motion.span
                            className="hero-gold-text"
                            variants={fadeUp}
                        >
                            Not Claimed.
                        </motion.span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p className="hero-sub" variants={fadeUp}>
                        Record a 5-minute task. Get AI-verified by Gemini Vision.
                        <br />
                        Earn a digital badge employers trust. No fake certificates, ever.
                    </motion.p>

                    {/* CTA Buttons with magnetic effect */}
                    <motion.div className="hero-actions" variants={fadeUp}>
                        <MagneticButton
                            as={Link}
                            to="/register?role=candidate"
                            className="btn btn-primary btn-lg"
                            id="cta-candidate"
                            pulse
                        >
                            I'm a Candidate <ArrowRight size={20} />
                        </MagneticButton>
                        <MagneticButton
                            as={Link}
                            to="/register?role=employer"
                            className="btn btn-glass btn-lg"
                            id="cta-employer"
                        >
                            I'm an Employer <Search size={20} />
                        </MagneticButton>
                    </motion.div>

                    {/* Scroll indicator */}
                    <motion.div
                        className="hero-scroll-hint"
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <ChevronDown size={20} />
                    </motion.div>
                </motion.div>
            </section>

            {/* ═══════════════════════ DEMO BANNER ═══════════════════════ */}
            <section style={{ padding: '2rem 2rem 0', position: 'relative', zIndex: 1 }}>
                <motion.div
                    className="demo-banner-premium"
                    id="demo-banner"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="demo-pulse" />
                    <div>
                        <strong style={{ color: '#f1f5f9' }}>🔴 Live Demo:</strong>
                        <span style={{ color: '#94a3b8' }}> Upload any screen recording and watch Gemini assess it in real time. No pre-recorded results.</span>
                    </div>
                </motion.div>
            </section>

            {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
            <section className="section-premium" id="how-it-works">
                <motion.div
                    className="section-header-premium"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2>How It <span className="hero-gradient-text">Works</span></h2>
                    <p>Three simple steps from skill demonstration to verified credential</p>
                </motion.div>

                <div className="steps-grid-premium">
                    {steps.map((step, i) => (
                        <GlassCard key={i} delay={i * 0.15} className="step-card-premium">
                            <div className="step-num" style={{ background: step.gradient }}>
                                {i + 1}
                            </div>
                            <div className="step-icon-wrap" style={{ background: step.gradient }}>
                                {step.icon}
                            </div>
                            <h3>{step.title}</h3>
                            <p>{step.desc}</p>
                        </GlassCard>
                    ))}
                </div>
            </section>

            {/* ═══════════════════════ INDUSTRIES ═══════════════════════ */}
            <section className="section-premium section-alt" id="industries-section">
                <motion.div
                    className="section-header-premium"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2>Works Across <span className="hero-gold-text">Industries</span></h2>
                    <p>From software engineering to skilled trades — verify any hands-on ability</p>
                </motion.div>

                <div className="industries-grid-premium">
                    {industries.map((ind, i) => (
                        <motion.div
                            key={i}
                            className="industry-card-premium"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.08 }}
                            whileHover={{
                                y: -8,
                                boxShadow: `0 20px 60px ${ind.color}15`,
                                borderColor: `${ind.color}40`,
                            }}
                            onMouseEnter={() => setHoveredIndustry(i)}
                            onMouseLeave={() => setHoveredIndustry(null)}
                        >
                            <div
                                className="industry-icon-premium"
                                style={{ background: `${ind.color}15`, color: ind.color }}
                            >
                                {ind.icon}
                            </div>
                            <h3>{ind.name}</h3>
                            <p>{ind.desc}</p>
                            <motion.div
                                className="industry-glow"
                                style={{ background: ind.color }}
                                animate={{ opacity: hoveredIndustry === i ? 0.06 : 0 }}
                            />
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════════ STATS ═══════════════════════ */}
            <section className="section-premium" id="stats-section">
                <div className="stats-premium">
                    {stats.map((stat, i) => (
                        <motion.div
                            className="stat-premium"
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.15 }}
                        >
                            <div className="stat-icon-premium">{stat.icon}</div>
                            <div className="stat-number-premium">{stat.number}</div>
                            <div className="stat-label-premium">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════════ FINAL CTA ═══════════════════════ */}
            <section className="section-premium section-alt" style={{ textAlign: 'center' }}>
                <motion.div
                    className="section-header-premium"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2>Ready to <span className="hero-gradient-text">Prove Your Skills</span>?</h2>
                    <p>Join thousands of candidates who've earned verified skill badges</p>
                </motion.div>
                <motion.div
                    style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <MagneticButton
                        as={Link}
                        to="/register?role=candidate"
                        className="btn btn-gold btn-lg"
                    >
                        Start Recording <Video size={20} />
                    </MagneticButton>
                    <MagneticButton
                        as={Link}
                        to="/register?role=employer"
                        className="btn btn-glass btn-lg"
                    >
                        Hire Verified Talent <Users size={20} />
                    </MagneticButton>
                </motion.div>
            </section>

            {/* ═══════════════════════ FOOTER ═══════════════════════ */}
            <footer className="footer-premium" id="footer">
                <motion.p
                    className="footer-tagline-premium"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    "Your hands are your resume."
                </motion.p>
                <p className="footer-credit-premium">
                    SkillBuster — AI-Powered Skill Verification | Built with React + Node.js + Gemini Vision API
                </p>
            </footer>
        </>
    );
}
