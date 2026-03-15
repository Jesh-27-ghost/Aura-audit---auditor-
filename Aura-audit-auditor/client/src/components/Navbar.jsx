import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, User, Briefcase, Trophy, BarChart3, Play, FileText } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

    return (
        <nav className="navbar" id="main-navbar">
            <Link to="/" className="navbar-brand">
                <div className="logo-icon">
                    <Shield size={20} />
                </div>
                SkillBuster
            </Link>

            <div className="navbar-links">
                {/* Leaderboard link — always visible */}
                <Link to="/leaderboard" className={isActive('/leaderboard')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Trophy size={16} /> Leaderboard
                    </span>
                </Link>

                {/* Demo walkthrough — always visible */}
                <Link to="/walkthrough" className={isActive('/walkthrough')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Play size={16} /> Demo
                    </span>
                </Link>

                {!user ? (
                    <>
                        <Link to="/login" className={isActive('/login')}>Login</Link>
                        <Link to="/register" className="nav-btn nav-btn-primary">Get Started</Link>
                    </>
                ) : user.role === 'candidate' ? (
                    <>
                        <Link to="/dashboard" className={isActive('/dashboard')}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <User size={16} /> Dashboard
                            </span>
                        </Link>
                        <Link to="/tasks" className={isActive('/tasks') || location.pathname.includes('/tasks/') ? 'nav-link active' : 'nav-link'}>
                            Skill Tests
                        </Link>
                        <Link to="/puzzle" className={isActive('/puzzle')}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Play size={16} /> Logic Arena
                            </span>
                        </Link>
                        <Link to="/cv-upload" className={isActive('/cv-upload')}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FileText size={16} /> CV Profile
                            </span>
                        </Link>
                        <Link to="/analytics" className={isActive('/analytics')}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <BarChart3 size={16} /> Analytics
                            </span>
                        </Link>
                        <Link to="/record" className={isActive('/record')}>Record Task</Link>
                        <button onClick={handleLogout} className="nav-btn nav-btn-outline">
                            <LogOut size={16} /> Logout
                        </button>
                    </>
                ) : user.role === 'employer' ? (
                    <>
                        <Link to="/employer" className={isActive('/employer')}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Briefcase size={16} /> Dashboard
                            </span>
                        </Link>
                        <Link to="/employer/tasks" className={isActive('/employer/tasks') || location.pathname.includes('/submissions') ? 'nav-link active' : 'nav-link'}>
                            Assessments
                        </Link>
                        <Link to="/analytics" className={isActive('/analytics')}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <BarChart3 size={16} /> Analytics
                            </span>
                        </Link>
                        <button onClick={handleLogout} className="nav-btn nav-btn-outline">
                            <LogOut size={16} /> Logout
                        </button>
                    </>
                ) : null}
            </div>
        </nav>
    );
}
