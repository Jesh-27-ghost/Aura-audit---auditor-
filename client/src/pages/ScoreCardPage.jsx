import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Award, ArrowRight, TrendingUp, AlertTriangle, Clock, Eye, Crosshair, Zap } from 'lucide-react';
import { getAssessment } from '../api';
import SkeletonLoader from '../components/SkeletonLoader';

export default function ScoreCardPage() {
    const { assessmentId } = useParams();
    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const { data } = await getAssessment(assessmentId);
                setAssessment(data);
            } catch (err) {
                console.error('Failed to fetch assessment:', err);
                setError(err.response?.data?.message || 'Failed to load results');
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [assessmentId]);

    const getScoreColor = (score) => {
        if (score >= 85) return 'var(--accent-emerald)';
        if (score >= 70) return 'var(--accent-gold)';
        if (score >= 50) return '#f97316';
        return 'var(--accent-rose)';
    };

    const getBarGradient = (score) => {
        if (score >= 85) return 'linear-gradient(90deg, #10b981, #34d399)';
        if (score >= 70) return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
        if (score >= 50) return 'linear-gradient(90deg, #f97316, #fb923c)';
        return 'linear-gradient(90deg, #ef4444, #f87171)';
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return '#ef4444';
            case 'major': return '#f59e0b';
            case 'minor': return '#6366f1';
            default: return '#94a3b8';
        }
    };

    const getSeverityBg = (severity) => {
        switch (severity) {
            case 'critical': return 'rgba(239, 68, 68, 0.1)';
            case 'major': return 'rgba(245, 158, 11, 0.1)';
            case 'minor': return 'rgba(99, 102, 241, 0.1)';
            default: return 'rgba(148, 163, 184, 0.1)';
        }
    };

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: '80vh' }}>
                <SkeletonLoader type="scorecard" />
            </div>
        );
    }

    if (error || !assessment) {
        return (
            <div className="scorecard" id="scorecard-page">
                <div className="empty-state">
                    <div className="icon"><AlertTriangle size={48} /></div>
                    <h3>{error || 'Results not found'}</h3>
                    <Link to="/record" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        Try a New Assessment
                    </Link>
                </div>
            </div>
        );
    }

    const dimensions = [
        { key: 'technicalAccuracy', label: 'Technical Accuracy' },
        { key: 'efficiency', label: 'Efficiency' },
        { key: 'bestPractices', label: 'Best Practices' },
        { key: 'problemSolving', label: 'Problem Solving' }
    ];

    const badgeId = assessment.badgeId;
    const hasFlaws = assessment.flaws && assessment.flaws.length > 0;
    const hasTimestamps = assessment.timestamps && assessment.timestamps.length > 0;

    return (
        <div className="scorecard" id="scorecard-page">
            {/* Header */}
            <div className="scorecard-header">
                <h1>Assessment Results</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    {assessment.skillName} • {assessment.industry}
                </p>
                <div className={`status-badge ${assessment.passed ? 'status-passed' : 'status-failed'}`}>
                    {assessment.passed ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    {assessment.passed ? 'Passed — Badge Earned!' : 'Not Passed — Keep Practicing'}
                </div>
                {assessment.analyzedBy && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                        Analyzed by: {assessment.analyzedBy} {assessment.isGeminiAnalysis ? '✓ AI Verified' : ''}
                    </p>
                )}
            </div>

            {/* AI Video Description — what Gemini actually saw */}
            {assessment.videoDescription && (
                <div className="card" style={{
                    marginBottom: '2rem',
                    background: 'rgba(99, 102, 241, 0.03)',
                    border: '1px solid rgba(99, 102, 241, 0.15)',
                }}>
                    <h3 style={{
                        fontFamily: 'var(--font-display)', fontWeight: 700,
                        marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px',
                        fontSize: '1rem', color: 'var(--text-accent)'
                    }}>
                        <Eye size={18} /> What AI Observed in Your Video
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.92rem' }}>
                        {assessment.videoDescription}
                    </p>
                    {assessment.isRelevantToSkill === false && (
                        <div style={{
                            marginTop: '1rem', padding: '0.75rem 1rem',
                            background: 'rgba(239, 68, 68, 0.08)',
                            borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444', fontSize: '0.85rem', fontWeight: 600
                        }}>
                            ⚠ Video content does not appear to match the selected skill "{assessment.skillName}"
                        </div>
                    )}
                </div>
            )}

            {/* Overall Score */}
            <div className="card" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div className="score-circle" style={{ margin: '0 auto 1rem' }}>
                    <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle className="score-circle-bg" cx="60" cy="60" r="52" />
                        <circle
                            className="score-circle-fill"
                            cx="60" cy="60" r="52"
                            stroke={getScoreColor(assessment.overallScore)}
                            strokeDasharray={`${(assessment.overallScore / 100) * 326.7} 326.7`}
                        />
                    </svg>
                    <div className="score-circle-text" style={{ color: getScoreColor(assessment.overallScore) }}>
                        {assessment.overallScore}
                    </div>
                </div>
                <span className={`badge-level badge-level-${assessment.skillLevel?.toLowerCase()}`}>
                    {assessment.skillLevel}
                </span>
                <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', maxWidth: '500px', margin: '1rem auto 0' }}>
                    {assessment.employerSummary}
                </p>
            </div>

            {/* Dimensions */}
            <div className="dimensions-grid">
                {dimensions.map(({ key, label }) => {
                    const dim = assessment.dimensions?.[key];
                    if (!dim) return null;
                    return (
                        <div className="dimension-card" key={key}>
                            <div className="dimension-header">
                                <span className="dimension-name">{label}</span>
                                <span className="dimension-score" style={{ color: getScoreColor(dim.score) }}>
                                    {dim.score}
                                </span>
                            </div>
                            <div className="score-bar">
                                <div
                                    className="score-bar-fill"
                                    style={{ width: `${dim.score}%`, background: getBarGradient(dim.score) }}
                                ></div>
                            </div>
                            <p className="dimension-observation">{dim.observation}</p>
                        </div>
                    );
                })}
            </div>

            {/* Technique Flaws Section */}
            {hasFlaws && (
                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{
                        fontFamily: 'var(--font-display)', fontWeight: 700,
                        marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <Crosshair size={20} style={{ color: 'var(--accent-rose)' }} />
                        Technique Flaws Detected
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {assessment.flaws.map((flaw, i) => (
                            <div key={i} style={{
                                padding: '1rem 1.25rem',
                                background: getSeverityBg(flaw.severity),
                                borderRadius: '12px',
                                border: `1px solid ${getSeverityColor(flaw.severity)}22`,
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, bottom: 0,
                                    width: '4px', background: getSeverityColor(flaw.severity)
                                }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
                                    {flaw.timestamp && (
                                        <span style={{
                                            background: 'rgba(0,0,0,0.15)', padding: '2px 8px',
                                            borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600,
                                            fontFamily: 'monospace', color: 'var(--text-secondary)'
                                        }}>
                                            <Clock size={11} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                                            {flaw.timestamp}
                                        </span>
                                    )}
                                    <span style={{
                                        textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700,
                                        color: getSeverityColor(flaw.severity),
                                        letterSpacing: '0.05em'
                                    }}>
                                        {flaw.severity}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.4rem' }}>
                                    {flaw.description}
                                </p>
                                {flaw.suggestion && (
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                        💡 {flaw.suggestion}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Video Timeline */}
            {hasTimestamps && (
                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{
                        fontFamily: 'var(--font-display)', fontWeight: 700,
                        marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <Clock size={20} style={{ color: 'var(--text-accent)' }} />
                        Video Timeline
                    </h3>
                    <div style={{
                        borderLeft: '2px solid rgba(99, 102, 241, 0.2)',
                        paddingLeft: '1.5rem',
                        marginLeft: '0.5rem',
                        display: 'flex', flexDirection: 'column', gap: '1rem'
                    }}>
                        {assessment.timestamps.map((ts, i) => (
                            <div key={i} style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute', left: '-1.85rem', top: '4px',
                                    width: '10px', height: '10px', borderRadius: '50%',
                                    background: 'var(--text-accent)', border: '2px solid var(--bg-primary)'
                                }} />
                                <span style={{
                                    fontSize: '0.78rem', fontWeight: 700,
                                    color: 'var(--text-accent)', fontFamily: 'monospace'
                                }}>
                                    {ts.time}
                                </span>
                                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                    {ts.event}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Strengths & Improvements */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                <div className="feedback-section">
                    <h3><TrendingUp size={20} style={{ color: 'var(--accent-emerald)' }} /> Strengths</h3>
                    <ul className="feedback-list strengths">
                        {assessment.strengths?.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                        {(!assessment.strengths || assessment.strengths.length === 0) && (
                            <li style={{ color: 'var(--text-muted)' }}>No specific strengths identified</li>
                        )}
                    </ul>
                </div>
                <div className="feedback-section">
                    <h3><AlertTriangle size={20} style={{ color: 'var(--accent-gold)' }} /> Areas to Improve</h3>
                    <ul className="feedback-list improvements">
                        {assessment.improvements?.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                        {(!assessment.improvements || assessment.improvements.length === 0) && (
                            <li style={{ color: 'var(--text-muted)' }}>No specific improvements suggested</li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Verified Skills */}
            {assessment.verifiedSkills?.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1rem' }}>
                        Verified Skills
                    </h3>
                    <div className="badge-tags" style={{ justifyContent: 'flex-start' }}>
                        {assessment.verifiedSkills.map((skill, i) => (
                            <span className="skill-tag" key={i}>{skill}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' }}>
                {assessment.passed && badgeId && (
                    <Link to={`/badge/${badgeId}`} className="btn btn-gold">
                        <Award size={18} /> View Your Badge
                    </Link>
                )}
                <Link to="/record" className="btn btn-secondary">
                    Record Another Task <ArrowRight size={18} />
                </Link>
                <Link to="/dashboard" className="btn btn-secondary">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
