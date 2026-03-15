import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginAPI } from '../api';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import ParticleBackground from '../components/ParticleBackground';
import MagneticButton from '../components/MagneticButton';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: i * 0.08, ease: [0.23, 1, 0.32, 1] }
    })
};

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusField, setFocusField] = useState(null);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await loginAPI({ email, password });
            loginUser(data.user, data.token);
            toast.success(`Welcome back, ${data.user.name}!`);
            navigate(data.user.role === 'employer' ? '/employer' : '/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ParticleBackground />

            <div className="login-premium-container" id="login-page">
                {/* Left side — branding panel */}
                <motion.div
                    className="login-brand-panel"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                >
                    <div className="login-brand-content">
                        <div className="login-brand-logo">
                            <div className="login-logo-icon">
                                <Shield size={24} />
                            </div>
                            <span>SkillBuster</span>
                        </div>

                        <h2>Your Skills.<br />
                            <span className="hero-gradient-text">Proven.</span>{' '}
                            <span className="hero-gold-text">Not Claimed.</span>
                        </h2>

                        <p>Record a real task. Let AI evaluate your skill. Earn a verified badge employers trust.</p>

                        <div className="login-brand-features">
                            {[
                                'AI-powered video assessment',
                                'Tamper-proof digital badges',
                                'Instant QR verification'
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    className="login-brand-feature"
                                    custom={i + 5}
                                    variants={fadeUp}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <div className="login-feature-dot" />
                                    {feature}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Right side — glass login card */}
                <motion.div
                    className="login-form-panel"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
                >
                    <div className="login-glass-card">
                        <motion.h1
                            custom={0}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                        >
                            Welcome Back
                        </motion.h1>
                        <motion.p
                            className="login-subtitle"
                            custom={1}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                        >
                            Sign in to your SkillBuster account
                        </motion.p>

                        <form onSubmit={handleSubmit}>
                            <motion.div
                                className={`login-field ${focusField === 'email' ? 'focused' : ''}`}
                                custom={2}
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                            >
                                <label htmlFor="login-email">
                                    <Mail size={14} /> Email
                                </label>
                                <input
                                    id="login-email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocusField('email')}
                                    onBlur={() => setFocusField(null)}
                                    required
                                />
                            </motion.div>

                            <motion.div
                                className={`login-field ${focusField === 'password' ? 'focused' : ''}`}
                                custom={3}
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                            >
                                <label htmlFor="login-password">
                                    <Lock size={14} /> Password
                                </label>
                                <input
                                    id="login-password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusField('password')}
                                    onBlur={() => setFocusField(null)}
                                    required
                                />
                            </motion.div>

                            <motion.div
                                custom={4}
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                            >
                                <MagneticButton
                                    as="button"
                                    type="submit"
                                    className="btn btn-primary login-submit-btn"
                                    disabled={loading}
                                    id="login-submit"
                                    pulse
                                >
                                    {loading ? (
                                        <>
                                            <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn size={18} /> Sign In <ArrowRight size={16} />
                                        </>
                                    )}
                                </MagneticButton>
                            </motion.div>
                        </form>

                        <motion.p
                            className="login-link"
                            custom={5}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                        >
                            Don't have an account? <Link to="/register">Register here</Link>
                        </motion.p>

                        {/* Demo accounts */}
                        <motion.div
                            className="login-demo-box"
                            custom={6}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                        >
                            <p className="login-demo-title">Demo Accounts</p>
                            <div className="login-demo-accounts">
                                <button
                                    className="login-demo-btn"
                                    onClick={() => { setEmail('hr@techcorp.com'); setPassword('password123'); }}
                                >
                                    <span className="login-demo-role">Employer</span>
                                    hr@techcorp.com
                                </button>
                                <button
                                    className="login-demo-btn"
                                    onClick={() => { setEmail('aarav@example.com'); setPassword('password123'); }}
                                >
                                    <span className="login-demo-role">Candidate</span>
                                    aarav@example.com
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
