import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyBadge as verifyBadgeAPI } from '../api';
import { QRCodeSVG } from 'qrcode.react';
import { Award, Download, Share2, ExternalLink } from 'lucide-react';

export default function BadgeView() {
    const { badgeId } = useParams();
    const [badge, setBadge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBadge = async () => {
            try {
                const { data } = await verifyBadgeAPI(badgeId);
                if (data.valid) {
                    setBadge(data.badge);
                } else {
                    setError('Badge not found');
                }
            } catch (err) {
                setError('Failed to load badge');
            } finally {
                setLoading(false);
            }
        };
        fetchBadge();
    }, [badgeId]);

    const getScoreColor = (score) => {
        if (score >= 85) return 'var(--accent-emerald)';
        if (score >= 70) return 'var(--accent-gold)';
        return 'var(--accent-rose)';
    };

    const getLevelClass = (level) => {
        switch (level) {
            case 'Expert': return 'badge-level-expert';
            case 'Advanced': return 'badge-level-advanced';
            case 'Intermediate': return 'badge-level-intermediate';
            default: return 'badge-level-beginner';
        }
    };

    const verifyUrl = `${window.location.origin}/verify/${badgeId}`;

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: `SkillBuster Badge - ${badge.skillName}`,
                text: `${badge.candidateName} earned a verified ${badge.skillLevel} badge in ${badge.skillName}!`,
                url: verifyUrl
            });
        } else {
            navigator.clipboard.writeText(verifyUrl);
            alert('Verification link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Loading badge...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="badge-container">
                <div className="empty-state">
                    <div className="icon">🔍</div>
                    <h3>{error}</h3>
                    <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Go Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="badge-container" id="badge-view-page">
            <div className="badge-card">
                {/* Verified Icon */}
                <div className="badge-verified-icon">
                    <Award size={32} />
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600, marginBottom: '1rem' }}>
                    Verified Skill Badge
                </p>

                {/* Candidate Name */}
                <div className="badge-name">{badge.candidateName}</div>

                {/* Skill */}
                <div className="badge-skill">{badge.skillName}</div>

                {/* Level */}
                <div className={`badge-level ${getLevelClass(badge.skillLevel)}`}>
                    {badge.skillLevel}
                </div>

                {/* Score Circle */}
                <div className="score-circle" style={{ margin: '1.5rem auto' }}>
                    <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle className="score-circle-bg" cx="60" cy="60" r="52" />
                        <circle
                            className="score-circle-fill"
                            cx="60" cy="60" r="52"
                            stroke={getScoreColor(badge.overallScore)}
                            strokeDasharray={`${(badge.overallScore / 100) * 326.7} 326.7`}
                        />
                    </svg>
                    <div className="score-circle-text" style={{ color: getScoreColor(badge.overallScore) }}>
                        {badge.overallScore}
                    </div>
                </div>

                {/* Verified Skills */}
                <div className="badge-tags">
                    {badge.verifiedSkills?.map((skill, i) => (
                        <span className="skill-tag" key={i}>{skill}</span>
                    ))}
                </div>

                {/* Employer Summary */}
                {badge.employerSummary && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem', fontStyle: 'italic' }}>
                        "{badge.employerSummary}"
                    </p>
                )}

                {/* Issue Date */}
                <div className="badge-date">
                    Issued: {new Date(badge.issuedAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    })}
                </div>

                {/* QR Code */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div className="badge-qr">
                        <QRCodeSVG
                            value={verifyUrl}
                            size={160}
                            level="H"
                            fgColor="#1a1f35"
                            bgColor="#ffffff"
                        />
                    </div>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Scan to verify this badge
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary btn-sm" onClick={handleShare}>
                        <Share2 size={16} /> Share
                    </button>
                    <Link to={`/verify/${badgeId}`} className="btn btn-secondary btn-sm">
                        <ExternalLink size={16} /> Verify Link
                    </Link>
                </div>

                {/* Badge ID */}
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1.5rem', fontFamily: 'monospace' }}>
                    Badge ID: {badge.badgeId}
                </p>
            </div>
        </div>
    );
}
