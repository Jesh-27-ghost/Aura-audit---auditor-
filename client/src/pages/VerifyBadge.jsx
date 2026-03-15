import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyBadge as verifyBadgeAPI } from '../api';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, ShieldX, Award, CheckCircle, Calendar, User, TrendingUp, AlertTriangle } from 'lucide-react';

export default function VerifyBadge() {
    const { badgeId } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verify = async () => {
            try {
                const { data } = await verifyBadgeAPI(badgeId);
                setResult(data);
            } catch (err) {
                setResult({ valid: false });
            } finally {
                setLoading(false);
            }
        };
        verify();
    }, [badgeId]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Verifying badge...</p>
            </div>
        );
    }

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
        <div className="verify-container" id="verify-badge-page">
            <div className="verify-card">
                {/* Status */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="verify-status">
                        <div className={`verify-icon ${result.valid ? 'verify-icon-valid' : 'verify-icon-invalid'}`}>
                            {result.valid ? <ShieldCheck size={40} /> : <ShieldX size={40} />}
                        </div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem' }}>
                            {result.valid ? 'Badge Verified ✓' : 'Badge Not Found'}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            {result.valid
                                ? 'This is an authentic SkillBuster verified skill badge'
                                : 'This badge ID does not exist in our system'
                            }
                        </p>
                    </div>
                </div>

                {result.valid && result.badge && (
                    <>
                        {/* Badge Details */}
                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                                <div className="badge-verified-icon" style={{ width: 48, height: 48, margin: 0, fontSize: '1.2rem' }}>
                                    <Award size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{result.badge.candidateName}</h3>
                                    <p style={{ color: 'var(--accent-primary)', fontWeight: 500, fontSize: '0.9rem' }}>{result.badge.skillName}</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</p>
                                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: getScoreColor(result.badge.overallScore) }}>
                                        {result.badge.overallScore}/100
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Level</p>
                                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>{result.badge.skillLevel}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Industry</p>
                                    <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>{result.badge.industry}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Issued</p>
                                    <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>
                                        {new Date(result.badge.issuedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Verified Skills */}
                            <div className="badge-tags" style={{ justifyContent: 'flex-start' }}>
                                {result.badge.verifiedSkills?.map((skill, i) => (
                                    <span className="skill-tag" key={i}>{skill}</span>
                                ))}
                            </div>

                            {/* Summary */}
                            {result.badge.employerSummary && (
                                <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(99,102,241,0.05)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.1)' }}>
                                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-accent)', marginBottom: '0.5rem' }}>
                                        AI Assessment Summary
                                    </p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                                        "{result.badge.employerSummary}"
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Detailed Assessment */}
                        {result.assessment && (
                            <div className="card" style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1.25rem' }}>
                                    Detailed Assessment Breakdown
                                </h3>

                                {Object.entries(result.assessment.dimensions || {}).map(([key, dim]) => (
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
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                                    <div>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <TrendingUp size={14} style={{ color: 'var(--accent-emerald)' }} /> Strengths
                                        </h4>
                                        <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', paddingLeft: '1rem', lineHeight: 1.8 }}>
                                            {result.assessment.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <AlertTriangle size={14} style={{ color: 'var(--accent-gold)' }} /> To Improve
                                        </h4>
                                        <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', paddingLeft: '1rem', lineHeight: 1.8 }}>
                                            {result.assessment.improvements?.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Badge ID */}
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                Badge ID: {result.badge.badgeId}
                            </p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                Powered by SkillBuster × Gemini Vision AI
                            </p>
                        </div>
                    </>
                )}

                {!result.valid && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <Link to="/" className="btn btn-primary">
                            Go to SkillBuster
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
