import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTaskSubmission } from '../api';
import { ArrowLeft, CheckCircle, XCircle, ShieldAlert, Award, Brain, Target, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CandidateTaskSubmissionView() {
    const { id } = useParams();
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const { data } = await getTaskSubmission(id);
                setSubmission(data);
            } catch (err) {
                console.error('Failed to load submission details:', err);
                toast.error('Failed to load submission details');
            } finally {
                setLoading(false);
            }
        };
        fetchSubmission();
    }, [id]);

    if (loading) return (
        <div className="loading-container" style={{ minHeight: '60vh' }}>
            <div className="spinner"></div>
            <p className="loading-text">Loading your results...</p>
        </div>
    );

    if (!submission) return (
        <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h2>Submission not found</h2>
            <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Dashboard</Link>
        </div>
    );

    const isSuspicious = submission.suspicionScore > 60;

    return (
        <div className="dashboard">
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <Link to="/dashboard" className="back-link">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '1rem' }}>
                    <div>
                        <span className="skill-tag" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{submission.skillName}</span>
                        <h1>{submission.taskTitle}</h1>
                        <p>Submitted on {new Date(submission.createdAt).toLocaleDateString()} • Evaluated by Gemini AI</p>
                    </div>
                    {submission.passed ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '12px 24px', borderRadius: '12px', fontWeight: 600 }}>
                            <CheckCircle size={24} /> Assessment Passed
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)', backgroundColor: 'rgba(244, 63, 94, 0.1)', padding: '12px 24px', borderRadius: '12px', fontWeight: 600 }}>
                            <XCircle size={24} /> Assessment Failed
                        </div>
                    )}
                </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '2rem' }}>
                {/* Skill Score Card */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem' }}>
                    <div className="card-icon card-icon-gold" style={{ width: '80px', height: '80px' }}>
                        <Award size={40} />
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', margin: '1rem 0 0.5rem 0' }}>
                        {submission.overallScore}<span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>/100</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1rem' }}>Overall Skill Score</p>
                    <span className="badge-level badge-level-advanced">{submission.skillLevel}</span>
                </div>

                {/* Proctoring Score Card */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', borderColor: isSuspicious ? 'rgba(244,63,94,0.3)' : 'var(--border-color)', backgroundColor: isSuspicious ? 'rgba(244,63,94,0.05)' : 'var(--bg-card)' }}>
                    <div className={`card-icon ${isSuspicious ? 'card-icon-rose' : 'card-icon-emerald'}`} style={{ width: '80px', height: '80px' }}>
                        {isSuspicious ? <ShieldAlert size={40} /> : <ShieldCheck size={40} />}
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: isSuspicious ? 'var(--accent-rose)' : 'var(--text-primary)', margin: '1rem 0 0.5rem 0' }}>
                        {submission.suspicionScore}<span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>/100</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1rem' }}>Suspicion Score</p>
                    <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, backgroundColor: isSuspicious ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)', color: isSuspicious ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                        {isSuspicious ? 'High Risk' : 'Clean Session'}
                    </span>
                </div>
            </div>

            {/* AI Summary Section */}
            <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
                    <Brain size={24} /> AI Performance Analysis
                </h3>
                <div style={{ backgroundColor: 'var(--bg-body)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '2rem' }}>
                    {submission.employerSummary || "No technical breakdown provided."}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', marginBottom: '1rem', fontSize: '1.1rem' }}>
                            <CheckCircle size={18} /> Key Strengths
                        </h4>
                        <ul className="custom-list" style={{ '--list-color': 'var(--accent-emerald)' }}>
                            {submission.strengths?.map((item, i) => <li key={i}>{item}</li>) || <li>None identified</li>}
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', marginBottom: '1rem', fontSize: '1.1rem' }}>
                            <Target size={18} /> Areas for Improvement
                        </h4>
                        <ul className="custom-list" style={{ '--list-color': 'var(--accent-gold)' }}>
                            {submission.improvements?.map((item, i) => <li key={i}>{item}</li>) || <li>None identified</li>}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Proctoring Details (if high suspicion) */}
            {isSuspicious && (
                <div className="card" style={{ padding: '2.5rem', borderColor: 'rgba(244,63,94,0.3)', backgroundColor: 'rgba(244,63,94,0.02)' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', marginBottom: '1.5rem', color: 'var(--accent-rose)' }}>
                        <ShieldAlert size={24} /> Proctoring Report
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                        {submission.behavioralSummary}
                    </p>
                    
                    {submission.suspicionReasons?.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>Key Observations:</h4>
                            <ul className="custom-list" style={{ '--list-color': 'var(--accent-rose)' }}>
                                {submission.suspicionReasons.map((reason, i) => (
                                    <li key={i}>{reason}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {submission.suspicionDetails?.flaggedMoments?.length > 0 && (
                        <div>
                            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Flagged Activity:</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {submission.suspicionDetails.flaggedMoments.map((flag, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', backgroundColor: 'var(--bg-body)', borderRadius: '8px', borderLeft: '4px solid var(--accent-rose)' }}>
                                        <span style={{ fontFamily: 'monospace', color: 'var(--accent-rose)', fontWeight: 600, width: '60px' }}>{flag.timestamp || '0:00'}</span>
                                        <span style={{ color: 'var(--text-primary)' }}>{flag.description || flag.reason}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
