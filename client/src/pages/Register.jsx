import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerAPI } from '../api';
import toast from 'react-hot-toast';
import { UserPlus, User, Briefcase, Mail, Lock, ArrowRight, Shield } from 'lucide-react';
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

export default function Register() {
    const [searchParams] = useSearchParams();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(searchParams.get('role') || 'candidate');
    const [loading, setLoading] = useState(false);
    const [focusField, setFocusField] = useState(null);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await registerAPI({ name, email, password, role });
            loginUser(data.user, data.token);
            toast.success('Account created successfully!');
            navigate(role === 'employer' ? '/employer' : '/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ParticleBackground />

            <div className="login-premium-container" id="register-page">
                {/* Left side — branding */}
                <motion.div
                    className="login-brand-panel"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                >
                    <div className="login-brand-content">
                        <div className="login-brand-logo">
                            <div className="login-logo-icon"><Shield size={24} /></div>
                            <span>Aura Audit</span>
                        </div>

                        <h2>Join the Future of<br />
                            <span className="hero-gradient-text">Skill Verification</span>
                        </h2>

                        <p>Whether you're proving your abilities or hiring the best talent — Aura Audit has you covered.</p>

                        <div className="login-brand-features">
                            {[
                                'Record once, prove forever',
                                'AI detects real competence',
                                'Employers verify in seconds'
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

                {/* Right side — glass form card */}
                <motion.div
                    className="login-form-panel"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
                >
                    <div className="login-glass-card">
                        <motion.h1 custom={0} variants={fadeUp} initial="hidden" animate="visible">
                            Create Account
                        </motion.h1>
                        <motion.p className="login-subtitle" custom={1} variants={fadeUp} initial="hidden" animate="visible">
                            Choose your role and start your journey
                        </motion.p>

                        {/* Role selector */}
                        <motion.div className="register-role-grid" custom={2} variants={fadeUp} initial="hidden" animate="visible">
                            <button
                                className={`register-role-btn ${role === 'candidate' ? 'active' : ''}`}
                                onClick={() => setRole('candidate')}
                                type="button"
                                id="role-candidate"
                            >
                                <User size={20} />
                                <span>Candidate</span>
                                <span className="register-role-desc">Prove your skills</span>
                            </button>
                            <button
                                className={`register-role-btn ${role === 'employer' ? 'active' : ''}`}
                                onClick={() => setRole('employer')}
                                type="button"
                                id="role-employer"
                            >
                                <Briefcase size={20} />
                                <span>Employer</span>
                                <span className="register-role-desc">Hire verified talent</span>
                            </button>
                        </motion.div>

                        <form onSubmit={handleSubmit}>
                            <motion.div className={`login-field ${focusField === 'name' ? 'focused' : ''}`} custom={3} variants={fadeUp} initial="hidden" animate="visible">
                                <label htmlFor="register-name"><User size={14} /> Full Name</label>
                                <input id="register-name" type="text" placeholder="John Doe" value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onFocus={() => setFocusField('name')} onBlur={() => setFocusField(null)} required />
                            </motion.div>

                            <motion.div className={`login-field ${focusField === 'email' ? 'focused' : ''}`} custom={4} variants={fadeUp} initial="hidden" animate="visible">
                                <label htmlFor="register-email"><Mail size={14} /> Email</label>
                                <input id="register-email" type="email" placeholder="your@email.com" value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocusField('email')} onBlur={() => setFocusField(null)} required />
                            </motion.div>

                            <motion.div className={`login-field ${focusField === 'password' ? 'focused' : ''}`} custom={5} variants={fadeUp} initial="hidden" animate="visible">
                                <label htmlFor="register-password"><Lock size={14} /> Password</label>
                                <input id="register-password" type="password" placeholder="Min 6 characters" value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusField('password')} onBlur={() => setFocusField(null)} required minLength={6} />
                            </motion.div>

                            <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
                                <MagneticButton as="button" type="submit" className="btn btn-primary login-submit-btn" disabled={loading} id="register-submit" pulse>
                                    {loading ? (
                                        <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account...</>
                                    ) : (
                                        <><UserPlus size={18} /> Create Account <ArrowRight size={16} /></>
                                    )}
                                </MagneticButton>
                            </motion.div>
                        </form>

                        <motion.p className="login-link" custom={7} variants={fadeUp} initial="hidden" animate="visible">
                            Already have an account? <Link to="/login">Sign in</Link>
                        </motion.p>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
