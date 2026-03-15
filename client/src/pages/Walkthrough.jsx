import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Play, Pause, RotateCcw, Volume2, VolumeX, ArrowRight, ArrowLeft,
    Sparkles, Video, Brain, Award, Shield, QrCode, Users, Search,
    Monitor, Wrench, UtensilsCrossed, CheckCircle, Eye, Zap, Clock
} from 'lucide-react';

// ═══════════════════════════════════════════════
// SCENE DATA — 60-second walkthrough script
// ═══════════════════════════════════════════════
const SCENES = [
    {
        id: 'hero',
        start: 0, end: 10,
        caption: 'Welcome to SkillBuster. We stop resume fraud by turning your actions into verified credentials.',
        label: 'Stop Resume Fraud. Prove Your Skills.',
    },
    {
        id: 'record',
        start: 10, end: 22,
        caption: 'Candidates simply pick a skill and record themselves performing a real-world task.',
        label: 'Step 1: Record a real-world task.',
    },
    {
        id: 'coding',
        start: 22, end: 35,
        caption: 'No multiple-choice questions. Just raw ability captured on screen.',
        label: 'Real Tasks. No Guesswork.',
    },
    {
        id: 'ai',
        start: 35, end: 45,
        caption: 'Our Gemini Vision AI audits every frame, evaluating your logic, accuracy, and best practices.',
        label: 'Gemini AI audits your performance.',
    },
    {
        id: 'badge',
        start: 45, end: 55,
        caption: 'Pass the audit, and you earn a tamper-proof digital badge backed by a full AI report.',
        label: 'Earn Your Verified Badge.',
    },
    {
        id: 'employer',
        start: 55, end: 60,
        caption: 'Employers: just scan the QR code to verify. Hire with 100% confidence, every single time.',
        label: 'Scan to Verify. Hire with Confidence.',
    },
];

const TOTAL = 60;

// ═══════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════
const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
};

// ═══════════════════════════════════════════════
// INDIVIDUAL SCENE COMPONENTS
// ═══════════════════════════════════════════════

function SceneHero() {
    return (
        <div className="wt-scene wt-scene-hero">
            <div className="wt-hero-grid" />
            <div className="wt-hero-orb wt-hero-orb-1" />
            <div className="wt-hero-orb wt-hero-orb-2" />
            <motion.div
                className="wt-hero-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="wt-chip"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <span className="wt-chip-dot" />
                    <Sparkles size={14} /> AI-Powered Skill Verification
                </motion.div>

                <motion.h1
                    className="wt-hero-h1"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    Your Skills.<br />
                    <span className="hero-gradient-text">Proven.</span>{' '}
                    <span className="hero-gold-text">Not Claimed.</span>
                </motion.h1>

                <motion.p
                    className="wt-hero-sub"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                >
                    Record a task. Get AI-verified by Gemini Vision.<br />
                    Earn a digital badge employers trust.
                </motion.p>

                <motion.div
                    className="wt-hero-btns"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                >
                    <button className="btn btn-primary btn-lg">I'm a Candidate <ArrowRight size={18} /></button>
                    <button className="btn btn-secondary btn-lg">I'm an Employer <Search size={18} /></button>
                </motion.div>

                <motion.div
                    className="wt-hero-steps"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                >
                    {['Record Task', 'AI Evaluates', 'Get Badge'].map((s, i) => (
                        <div key={i} className="wt-hero-step">
                            <div className="wt-hero-step-num">{i + 1}</div>
                            <span>{s}</span>
                        </div>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
}

function SceneRecord() {
    return (
        <div className="wt-scene wt-scene-record">
            <div className="wt-rec-layout">
                <motion.div
                    className="wt-rec-panel"
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2>🎯 Choose Your Skill</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                        Select the skill you want to demonstrate
                    </p>
                    <div className="wt-skill-grid">
                        {[
                            { icon: '⚛️', name: 'React Frontend', sel: true },
                            { icon: '🐍', name: 'Python Backend' },
                            { icon: '🔌', name: 'Electrical' },
                            { icon: '🍳', name: 'Culinary Arts' },
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                className={`wt-skill-card ${s.sel ? 'wt-skill-selected' : ''}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                            >
                                <span className="wt-skill-icon">{s.icon}</span>
                                <span>{s.name}</span>
                            </motion.div>
                        ))}
                    </div>
                    <motion.button
                        className="wt-record-btn"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <span className="wt-rec-dot" /> Record Task
                    </motion.button>
                </motion.div>

                <motion.div
                    className="wt-code-preview"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <div className="wt-code-top">
                        <span className="wt-dot" style={{ background: '#ff5f57' }} />
                        <span className="wt-dot" style={{ background: '#febc2e' }} />
                        <span className="wt-dot" style={{ background: '#28c840' }} />
                        <span className="wt-code-filename">RecordTask.jsx</span>
                    </div>
                    <pre className="wt-code-body">{`import { useState, useRef } from 'react';
import { uploadVideo } from '../api';

// Real-time screen capture
export default function RecordTask() {
  const [isRec, setRec] = useState(false);
  const streamRef = useRef(null);

  const start = async () => {
    const s = await navigator
      .mediaDevices.getDisplayMedia();
    streamRef.current = s;
    setRec(true);
  };

  return (
    <button onClick={start}>
      {isRec ? "Stop" : "Record"}
    </button>
  );
}`}</pre>
                </motion.div>
            </div>
        </div>
    );
}

function SceneCoding() {
    return (
        <div className="wt-scene wt-scene-coding">
            <div className="wt-split">
                <div className="wt-split-left">
                    <div className="wt-vsc-top">
                        <div className="wt-vsc-tab">Dashboard.jsx</div>
                    </div>
                    <pre className="wt-vsc-code">{`import { useState } from 'react';
import TaskCard from './TaskCard';

// Main Dashboard Component
export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [filter, setF] = useState('all');

  const handleSubmit = async () => {
    const res = await fetch('/api/assess');
    const data = await res.json();
    setTasks(p => [...p, data]);
  };

  return (
    <div className="dashboard">
      <h1>My Assessments</h1>
      {tasks.map(t => (
        <TaskCard key={t.id} {...t} />
      ))}
    </div>
  );
}`}</pre>
                    <div className="wt-split-label">📺 Live Screen Capture</div>
                </div>
                <div className="wt-split-divider" />
                <div className="wt-split-right">
                    <div className="wt-webcam">
                        <div className="wt-webcam-silhouette">
                            <Users size={80} style={{ opacity: 0.12 }} />
                        </div>
                        <div className="wt-webcam-rec"><span className="wt-rec-dot" />REC 03:42</div>
                    </div>
                    <motion.div
                        className="wt-countdown"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        04:18
                    </motion.div>
                    <div className="wt-split-label">📹 Video Capture</div>
                </div>
            </div>
        </div>
    );
}

function SceneAI() {
    const tags = ['✓ useState Hook', '✓ Component Structure', '✓ Error Handling', '✓ API Integration', '✓ Best Practices'];
    return (
        <div className="wt-scene wt-scene-ai">
            <motion.div
                className="wt-ai-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="wt-ai-brain">
                    <motion.div
                        className="wt-ai-ring wt-ai-ring-1"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.div
                        className="wt-ai-ring wt-ai-ring-2"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.div
                        className="wt-ai-ring wt-ai-ring-3"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="wt-ai-core">🧠</div>
                    {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                        <motion.div
                            key={i}
                            className="wt-ai-node"
                            style={{
                                top: `${50 + 45 * Math.sin((deg * Math.PI) / 180)}%`,
                                left: `${50 + 45 * Math.cos((deg * Math.PI) / 180)}%`,
                            }}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                        />
                    ))}
                </div>

                <h2 className="wt-ai-title">
                    Gemini AI <span className="hero-gradient-text">Analyzing</span>
                </h2>
                <p className="wt-ai-sub">Auditing logic, accuracy, and best practices</p>

                <div className="wt-ai-tags">
                    {tags.map((tag, i) => (
                        <motion.span
                            key={i}
                            className="wt-ai-tag"
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.3 }}
                        >
                            {tag}
                        </motion.span>
                    ))}
                </div>

                <div className="wt-ai-bar">
                    <motion.div
                        className="wt-ai-bar-fill"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 8, ease: 'easeInOut' }}
                    />
                </div>
            </motion.div>

            <motion.div
                className="wt-json-panel"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
            >
                <pre className="wt-json-scroll">{`{
  "model": "gemini-1.5-flash",
  "analysis": {
    "technicalAccuracy": {
      "score": 90,
      "observation": "Correct useState"
    },
    "efficiency": {
      "score": 88,
      "observation": "Clean async"
    },
    "bestPractices": {
      "score": 85,
      "observation": "Good structure"
    },
    "problemSolving": {
      "score": 92,
      "observation": "Logical approach"
    }
  },
  "verifiedSkills": [
    "React Hooks",
    "State Management",
    "API Integration",
    "JSX Patterns"
  ],
  "passed": true,
  "overallScore": 85
}`}</pre>
            </motion.div>
        </div>
    );
}

function SceneBadge() {
    return (
        <div className="wt-scene wt-scene-badge">
            <div className="wt-badge-layout">
                <motion.div
                    className="wt-badge-card"
                    initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ duration: 0.8, type: 'spring' }}
                >
                    <div className="wt-badge-shimmer" />
                    <div className="wt-badge-award">🏆</div>
                    <div className="wt-badge-verified">VERIFIED SKILL BADGE</div>
                    <div className="wt-badge-name">Jesh M.</div>
                    <div className="wt-badge-skill">React Frontend Development</div>
                    <div className="wt-badge-level">Expert</div>

                    <div className="wt-badge-score-ring">
                        <svg viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                            <motion.circle
                                cx="60" cy="60" r="45" fill="none" stroke="#10b981" strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray="283"
                                strokeDashoffset="283"
                                animate={{ strokeDashoffset: 283 - (85 / 100) * 283 }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                            />
                        </svg>
                        <div className="wt-badge-score-val">
                            <span className="wt-badge-score-num">85</span>
                            <span className="wt-badge-score-label">SCORE</span>
                        </div>
                    </div>

                    <div className="wt-badge-qr">
                        <div className="wt-badge-qr-glow" />
                        <QrCode size={100} strokeWidth={1} color="#1a1f35" />
                    </div>
                    <div className="wt-badge-scan-text">Scan to verify</div>
                </motion.div>

                <motion.div
                    className="wt-badge-info"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2>Tamper-Proof<br /><span className="hero-gold-text">Digital Badges</span></h2>
                    <p>Your badge contains the full AI report and a unique QR code for instant verification — no account needed.</p>
                    {[
                        { icon: '🔗', text: 'Unique UUID-based verification URL', bg: 'rgba(99,102,241,0.1)', color: '#818cf8' },
                        { icon: '🛡️', text: 'Tamper-proof with full audit trail', bg: 'rgba(245,166,35,0.1)', color: '#f5a623' },
                        { icon: '📱', text: 'QR code for instant mobile scan', bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
                        { icon: '🌐', text: 'Public /verify/:id — no login required', bg: 'rgba(6,182,212,0.1)', color: '#06b6d4' },
                    ].map((f, i) => (
                        <motion.div
                            key={i}
                            className="wt-badge-feat"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + i * 0.15 }}
                        >
                            <div className="wt-badge-feat-icon" style={{ background: f.bg, color: f.color }}>{f.icon}</div>
                            <span>{f.text}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

function SceneEmployer() {
    const candidates = [
        { init: 'JM', name: 'Jesh M.', level: 'Expert', score: 92, color: '#818cf8', bg: 'rgba(99,102,241,0.12)' },
        { init: 'AK', name: 'Arjun K.', level: 'Advanced', score: 85, color: '#f5a623', bg: 'rgba(245,166,35,0.12)' },
        { init: 'PS', name: 'Priya S.', level: 'Intermediate', score: 78, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
        { init: 'RV', name: 'Rohan V.', level: 'Expert', score: 96, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
    ];

    return (
        <div className="wt-scene wt-scene-employer">
            <motion.div
                className="wt-emp-layout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="wt-emp-top">
                    <h2>Employer Dashboard — <span className="hero-gradient-text">Hire with Confidence</span></h2>
                    <div className="wt-emp-filters">
                        {['All', 'React', 'Python', 'Electrical'].map((f, i) => (
                            <span key={i} className={`wt-emp-filter ${f === 'React' ? 'wt-emp-filter-active' : ''}`}>{f}</span>
                        ))}
                    </div>
                </div>

                <div className="wt-emp-table">
                    <div className="wt-emp-thead">
                        {['Candidate', 'Skill', 'Level', 'Score', 'Verified', 'Action'].map(h => (
                            <span key={h}>{h}</span>
                        ))}
                    </div>
                    {candidates.map((c, i) => (
                        <motion.div
                            key={i}
                            className="wt-emp-row"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.12 }}
                        >
                            <span><span className="wt-emp-avatar" style={{ background: c.bg, color: c.color }}>{c.init}</span>{c.name}</span>
                            <span><span className="wt-emp-skill-tag">React</span></span>
                            <span style={{ color: c.score >= 85 ? '#10b981' : '#f5a623', fontWeight: 700 }}>{c.level}</span>
                            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: c.score >= 85 ? '#10b981' : '#f5a623' }}>{c.score}%</span>
                            <span>✅ AI Verified</span>
                            <span><button className="wt-emp-verify">🔍 Verify</button></span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <motion.div
                className="wt-phone"
                initial={{ opacity: 0, scale: 0.7, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1, type: 'spring' }}
            >
                <div className="wt-phone-screen">
                    <motion.div
                        className="wt-phone-check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
                    >
                        ✓
                    </motion.div>
                    <div className="wt-phone-text">Verified!</div>
                    <div className="wt-phone-sub">Jesh M. — React Expert<br />Score: 92% • AI Verified</div>
                </div>
            </motion.div>
        </div>
    );
}

// Map scene IDs to components
const SCENE_COMPONENTS = {
    hero: SceneHero,
    record: SceneRecord,
    coding: SceneCoding,
    ai: SceneAI,
    badge: SceneBadge,
    employer: SceneEmployer,
};

// ═══════════════════════════════════════════════
// MAIN WALKTHROUGH PAGE
// ═══════════════════════════════════════════════
export default function Walkthrough() {
    const [playing, setPlaying] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [activeScene, setActiveScene] = useState(0);
    const rafRef = useRef(null);
    const startRef = useRef(null);
    const pausedAtRef = useRef(0);

    const play = useCallback(() => {
        startRef.current = performance.now() - pausedAtRef.current * 1000;
        setPlaying(true);
    }, []);

    const pause = useCallback(() => {
        pausedAtRef.current = elapsed;
        setPlaying(false);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }, [elapsed]);

    const restart = useCallback(() => {
        pausedAtRef.current = 0;
        setElapsed(0);
        setActiveScene(0);
        startRef.current = performance.now();
        setPlaying(true);
    }, []);

    const goToScene = useCallback((idx) => {
        const t = SCENES[idx].start;
        pausedAtRef.current = t;
        setElapsed(t);
        setActiveScene(idx);
        startRef.current = performance.now() - t * 1000;
    }, []);

    useEffect(() => {
        if (!playing) return;

        const tick = (ts) => {
            const e = (ts - startRef.current) / 1000;
            const clamped = Math.min(e, TOTAL);
            setElapsed(clamped);

            let idx = 0;
            for (let i = 0; i < SCENES.length; i++) {
                if (clamped >= SCENES[i].start && clamped < SCENES[i].end) idx = i;
            }
            if (clamped >= TOTAL) idx = SCENES.length - 1;
            setActiveScene(idx);

            if (clamped < TOTAL) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                setPlaying(false);
            }
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [playing]);

    const ActiveComp = SCENE_COMPONENTS[SCENES[activeScene].id];
    const progress = (elapsed / TOTAL) * 100;

    return (
        <div className="wt-page" id="walkthrough-page">
            {/* Progress bar */}
            <div className="wt-progress">
                <div className="wt-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            {/* Scene viewport */}
            <div className="wt-viewport">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeScene}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="wt-scene-wrap"
                    >
                        <ActiveComp />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Caption bar */}
            <div className="wt-caption-bar">
                <div className="wt-caption-left">
                    <motion.p
                        key={activeScene}
                        className="wt-caption-text"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {SCENES[activeScene].caption}
                    </motion.p>
                </div>
                <motion.span
                    key={`label-${activeScene}`}
                    className="wt-caption-label"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    {SCENES[activeScene].label}
                </motion.span>
            </div>

            {/* Controls */}
            <div className="wt-controls">
                <div className="wt-controls-left">
                    <button className="wt-ctrl-btn" onClick={playing ? pause : play}>
                        {playing ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button className="wt-ctrl-btn" onClick={restart}>
                        <RotateCcw size={16} />
                    </button>
                    <span className="wt-timer">{fmt(elapsed)} / {fmt(TOTAL)}</span>
                </div>

                <div className="wt-scene-dots">
                    {SCENES.map((s, i) => (
                        <button
                            key={i}
                            className={`wt-scene-dot ${i === activeScene ? 'wt-scene-dot-active' : ''} ${elapsed >= s.start ? 'wt-scene-dot-past' : ''}`}
                            onClick={() => goToScene(i)}
                            title={s.label}
                        />
                    ))}
                </div>

                <div className="wt-controls-right">
                    <button
                        className="wt-ctrl-btn"
                        onClick={() => goToScene(Math.max(0, activeScene - 1))}
                        disabled={activeScene === 0}
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <button
                        className="wt-ctrl-btn"
                        onClick={() => goToScene(Math.min(SCENES.length - 1, activeScene + 1))}
                        disabled={activeScene === SCENES.length - 1}
                    >
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
