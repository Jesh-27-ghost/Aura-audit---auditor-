import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { searchCandidates } from '../api';
import { QRCodeSVG } from 'qrcode.react';

import {
    Search, Users, Award, TrendingUp, AlertTriangle,
    Mail, X, ExternalLink, Filter, Briefcase, ChevronDown,
    FileText, Zap, Loader2, ClipboardCheck, Brain
} from 'lucide-react';
import SkillSearch from '../components/SkillSearch';

const skillLevels = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
const skillOptions = [
    '', 'React Frontend Development', 'Node.js API Development',
    'JavaScript Debugging', 'SQL Database Querying',
    'Python Scripting', 'DevOps / Docker'
];

export default function EmployerDashboard() {
    const { user } = useAuth();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchSkill, setSearchSkill] = useState('');
    const [minScore, setMinScore] = useState('');
    const [level, setLevel] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [activeTab, setActiveTab] = useState('badges');
    const [generatedTest, setGeneratedTest] = useState(null);

    const fetchCandidates = async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            const params = {};
            if (searchSkill) params.skill = searchSkill;
            if (minScore) params.minScore = minScore;
            if (level) params.level = level;

            const { data } = await searchCandidates(params);
            setCandidates(data);
        } catch (err) {
            console.error('Failed to search candidates:', err);
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();

        const interval = setInterval(() => {
            fetchCandidates(true);
        }, 10000);

        return () => clearInterval(interval);
    }, [searchSkill, minScore, level]);

    // Callback when a skill is selected from the SkillSearchBar
    const handleSkillSelect = useCallback((skillName) => {
        setSearchSkill(skillName);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCandidates();
    };

    const getScoreClass = (score) => {
        if (score >= 85) return 'score-high';
        if (score >= 70) return 'score-medium';
        return 'score-low';
    };

    const getScoreColor = (score) => {
        if (score >= 85) return 'var(--accent-emerald)';
        if (score >= 70) return 'var(--accent-gold)';
        return 'var(--accent-rose)';
    };

    const getBarGradient = (score) => {
        if (score >= 85) return 'linear-gradient(90deg, #10b981, #34d399)';
        if (score >= 70) return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
        return 'linear-gradient(90deg, #ef4444, #f87171)';
    };

    return (
        <div className="dashboard" id="employer-dashboard">
            <div className="dashboard-header">
                <h1>Employer Dashboard</h1>
                <p>Find verified, AI-assessed candidates for your team</p>
            </div>

            {/* Interactive Skill Search Component */}
            <SkillSearch 
                value={searchSkill} 
                onSelectSkill={handleSkillSelect} 
                onClear={() => handleSkillSelect('')} 
            />

            {/* Candidate Filters */}
            <form onSubmit={handleSearch} className="search-bar" id="candidate-search" style={{ marginTop: '-1rem' }}>
                {searchSkill ? (
                    <div className="form-select" style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0 12px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {`Skill: ${searchSkill}`}
                        </span>
                        <button type="button" onClick={() => handleSkillSelect('')} style={{ background: 'none', border: 'none', marginLeft: 'auto', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="form-select" style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0 12px' }}>
                         <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>All Skills</span>
                    </div>
                )}
                <input
                    type="number"
                    className="form-input"
                    placeholder="Min Score (0-100)"
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value)}
                    min="0"
                    max="100"
                    id="search-min-score"
                />
                <select
                    className="form-select"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    id="search-level"
                >
                    <option value="">All Levels</option>
                    {skillLevels.filter(Boolean).map(l => (
                        <option key={l} value={l}>{l}</option>
                    ))}
                </select>
                <button type="submit" className="btn btn-primary" id="search-submit">
                    <Search size={18} /> Search
                </button>
            </form>

            {/* Tabs */}
            <div className="dashboard-tabs" style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <button 
                    onClick={() => setActiveTab('badges')}
                    className={`tab-btn ${activeTab === 'badges' ? 'active' : ''}`}
                    style={{ padding: '0.75rem 0', background: 'none', border: 'none', color: activeTab === 'badges' ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: 600, borderBottom: activeTab === 'badges' ? '2px solid var(--accent-primary)' : 'none', cursor: 'pointer' }}
                >
                    Verified Badges
                </button>
                <button 
                    onClick={() => setActiveTab('insights')}
                    className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
                    style={{ padding: '0.75rem 0', background: 'none', border: 'none', color: activeTab === 'insights' ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: 600, borderBottom: activeTab === 'insights' ? '2px solid var(--accent-primary)' : 'none', cursor: 'pointer' }}
                >
                    Hiring Insights
                </button>
            </div>

            {/* Results Grid */}
            {loading ? (
                <div className="loading-container" style={{ minHeight: '30vh' }}>
                    <div className="spinner"></div>
                    <p className="loading-text">Searching candidates...</p>
                </div>
            ) : activeTab === 'badges' ? (
                <>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        <Users size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                        {candidates.length} verified candidate{candidates.length !== 1 ? 's' : ''} found
                    </p>

                    {candidates.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon"><Search size={48} /></div>
                            <h3>No candidates found</h3>
                            <p>Try adjusting your search filters</p>
                        </div>
                    ) : (
                        <div className="dashboard-grid">
                            {candidates.map((item, i) => (
                                <div className="candidate-card card" key={i}>
                                    <div className="candidate-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div className="candidate-info">
                                            <h3 style={{ margin: 0 }}>{item.candidate.name}</h3>
                                            <p className="candidate-skill text-accent" style={{ fontSize: '0.9rem', marginTop: '4px' }}>{item.assessment.skillName}</p>
                                        </div>
                                        <span className={`candidate-score-badge ${getScoreClass(item.assessment.overallScore)}`}>
                                            {item.assessment.overallScore}
                                        </span>
                                    </div>

                                    <span className={`badge-level badge-level-${item.assessment.skillLevel?.toLowerCase()}`}>
                                        {item.assessment.skillLevel}
                                    </span>

                                    <div className="badge-tags" style={{ justifyContent: 'flex-start', marginTop: '1rem', marginBottom: '1rem' }}>
                                        {item.assessment.verifiedSkills?.slice(0, 3).map((skill, j) => (
                                            <span className="skill-tag" key={j}>{skill}</span>
                                        ))}
                                    </div>

                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem', fontStyle: 'italic' }}>
                                        "{item.assessment.employerSummary}"
                                    </p>

                                    {item.puzzle && (
                                        <div style={{ 
                                            background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)',
                                            padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Zap size={16} color="#8b5cf6" />
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#8b5cf6' }}>Logic Reasoning</span>
                                            </div>
                                            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#8b5cf6' }}>{item.puzzle.metrics.reasoning}/10</span>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => setSelectedCandidate(item)}
                                            style={{ flex: 1 }}
                                        >
                                            View Report
                                        </button>
                                        {item.badgeId && (
                                            <Link to={`/verify/${item.badgeId}`} className="btn btn-secondary btn-sm">
                                                <ExternalLink size={14} />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="empty-state">
                    <div className="icon"><TrendingUp size={48} /></div>
                    <h3>Insights Coming Soon</h3>
                    <p>Advanced talent analytics are being processed</p>
                </div>
            )}

            {/* Detail Modal */}
            {selectedCandidate && (
                <div className="modal-overlay" onClick={() => setSelectedCandidate(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedCandidate.candidate.name}</h2>
                            <button className="modal-close" onClick={() => setSelectedCandidate(null)}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Score Overview */}
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem' }}>
                            <div className="score-circle">
                                <svg width="120" height="120" viewBox="0 0 120 120">
                                    <circle className="score-circle-bg" cx="60" cy="60" r="52" />
                                    <circle
                                        className="score-circle-fill"
                                        cx="60" cy="60" r="52"
                                        stroke={getScoreColor(selectedCandidate.assessment.overallScore)}
                                        strokeDasharray={`${(selectedCandidate.assessment.overallScore / 100) * 326.7} 326.7`}
                                    />
                                </svg>
                                <div className="score-circle-text" style={{ color: getScoreColor(selectedCandidate.assessment.overallScore) }}>
                                    {selectedCandidate.assessment.overallScore}
                                </div>
                            </div>
                            <div>
                                <p style={{ color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                                    {selectedCandidate.assessment.skillName}
                                </p>
                                <span className={`badge-level badge-level-${selectedCandidate.assessment.skillLevel?.toLowerCase()}`}>
                                    {selectedCandidate.assessment.skillLevel}
                                </span>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    Assessed: {new Date(selectedCandidate.assessment.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Cognitive Reasoning Logic */}
                        {selectedCandidate.puzzle && (
                            <div style={{ marginBottom: '2rem', padding: '1.25rem', background: 'rgba(139, 92, 246, 0.03)', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                                <h4 style={{ fontSize: '0.9rem', color: '#8b5cf6', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Zap size={18} /> Cognitive Reasoning Profile
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Logical Reasoning</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8b5cf6' }}>{selectedCandidate.puzzle.metrics.reasoning}/10</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Pattern Recognition</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8b5cf6' }}>{selectedCandidate.puzzle.metrics.patternRecognition}/10</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Solving Speed</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8b5cf6' }}>{selectedCandidate.puzzle.metrics.speed}/10</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Cognitive Flexibility</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8b5cf6' }}>{selectedCandidate.puzzle.metrics.flexibility}/10</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Dimensions */}
                        {Object.entries(selectedCandidate.assessment.dimensions || {}).map(([key, dim]) => (
                            <div key={key} style={{ marginBottom: '1rem' }}>
                                <div className="dimension-header">
                                    <span className="dimension-name" style={{ textTransform: 'capitalize' }}>
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <span className="dimension-score" style={{ color: getScoreColor(dim.score) }}>
                                        {dim.score}
                                    </span>
                                </div>
                                <div className="score-bar">
                                    <div className="score-bar-fill" style={{ width: `${dim.score}%`, background: getBarGradient(dim.score) }}></div>
                                </div>
                                <p className="dimension-observation">{dim.observation}</p>
                            </div>
                        ))}

                        {/* Strengths & Improvements */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1.5rem 0' }}>
                            <div>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <TrendingUp size={14} style={{ color: 'var(--accent-emerald)' }} /> Strengths
                                </h4>
                                <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', paddingLeft: '1rem', lineHeight: 1.8 }}>
                                    {selectedCandidate.assessment.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <AlertTriangle size={14} style={{ color: 'var(--accent-gold)' }} /> To Improve
                                </h4>
                                <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', paddingLeft: '1rem', lineHeight: 1.8 }}>
                                    {selectedCandidate.assessment.improvements?.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                        </div>

                        {/* Verified Skills */}
                        <div className="badge-tags" style={{ justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
                            {selectedCandidate.assessment.verifiedSkills?.map((skill, i) => (
                                <span className="skill-tag" key={i}>{skill}</span>
                            ))}
                        </div>

                        <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <a href={`mailto:${selectedCandidate.candidate.email}`} className="btn btn-primary flex-1">
                                <Mail size={18} /> Contact Candidate
                            </a>
                            <button className="btn btn-secondary" onClick={() => setSelectedCandidate(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
