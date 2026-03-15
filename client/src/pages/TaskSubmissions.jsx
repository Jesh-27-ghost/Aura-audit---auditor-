import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTaskSubmissions, getTaskById } from '../api';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Play, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

export default function TaskSubmissions() {
    const { taskId } = useParams();
    const [task, setTask] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const [taskRes, subRes] = await Promise.all([
                    getTaskById(taskId),
                    getTaskSubmissions(taskId)
                ]);
                setTask(taskRes.data);
                setSubmissions(subRes.data);
            } catch (err) {
                console.error('Failed to fetch details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [taskId]);

    const getSuspicionColor = (score) => {
        if (score >= 76) return 'var(--accent-rose)'; // Critical
        if (score >= 56) return 'var(--accent-gold)'; // High
        if (score >= 36) return 'var(--accent-gold)'; // Moderate
        if (score >= 16) return 'var(--text-primary)'; // Low
        return 'var(--accent-emerald)'; // Clean
    };

    const getSuspicionLabel = (score) => {
        if (score >= 76) return 'Critical Risk';
        if (score >= 56) return 'High Risk';
        if (score >= 36) return 'Moderate Risk';
        if (score >= 16) return 'Low Risk';
        return 'Clean';
    };

    if (loading) return (
        <div className="loading-container" style={{ minHeight: '60vh' }}>
            <div className="spinner"></div>
            <p className="loading-text">Loading submissions...</p>
        </div>
    );

    if (!task) return (
        <div className="empty-state" style={{ minHeight: '60vh' }}>
            <h3>Task not found</h3>
            <Link to="/employer/tasks" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Tasks</Link>
        </div>
    );

    return (
        <div className="dashboard" id="task-submissions-page">
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <Link to="/employer/tasks" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', marginBottom: '1rem', textDecoration: 'none', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} /> Back to All Tasks
                </Link>
                <h1>{task.title} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '1.2rem' }}>— Submissions</span></h1>
                <p>Review candidate attempts, skill scores, and AI proctoring reports</p>
            </div>

            <div className="dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-title">Total Submissions</div>
                    <div className="stat-value">{submissions.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title">Passed</div>
                    <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
                        {submissions.filter(s => s.passed).length}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-title">Failed</div>
                    <div className="stat-value" style={{ color: 'var(--accent-rose)' }}>
                        {submissions.filter(s => !s.passed).length}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-title">Avg. Suspicion Score</div>
                    <div className="stat-value" style={{ color: 'var(--accent-gold)' }}>
                        {submissions.length > 0 
                            ? Math.round(submissions.reduce((acc, s) => acc + s.suspicionScore, 0) / submissions.length) 
                            : 0}/100
                    </div>
                </div>
            </div>

            {submissions.length === 0 ? (
                <div className="empty-state">
                    <h3>No submissions yet</h3>
                    <p>Candidates haven't attempted this task yet.</p>
                </div>
            ) : (
                <div className="submissions-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {submissions.map((sub) => {
                        const isExpanded = expandedId === sub._id;
                        const isHighRisk = sub.suspicionScore >= 56;
                        
                        return (
                            <div key={sub._id} className="submission-card" style={{ backgroundColor: 'var(--bg-card)', border: `1px solid ${isHighRisk ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'}`, borderRadius: '12px', overflow: 'hidden' }}>
                                {/* Header (Always visible) */}
                                <div 
                                    style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: isHighRisk ? 'rgba(239,68,68,0.05)' : 'transparent' }}
                                    onClick={() => setExpandedId(isExpanded ? null : sub._id)}
                                >
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {sub.candidateName}
                                            {sub.passed ? 
                                                <span className="badge-status success"><CheckCircle size={14} /> Passed</span> : 
                                                <span className="badge-status error"><XCircle size={14} /> Failed</span>
                                            }
                                        </h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            {sub.candidateEmail} &bull; Submitted {new Date(sub.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                        {/* Skill Score */}
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Skill Score</div>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: sub.overallScore >= 70 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                                                {sub.overallScore}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/100</span>
                                            </div>
                                        </div>
                                        
                                        {/* Suspicion Score */}
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Suspicion Score</div>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: getSuspicionColor(sub.suspicionScore), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                {isHighRisk && <ShieldAlert size={18} />}
                                                {sub.suspicionScore}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/100</span>
                                            </div>
                                        </div>

                                        <div style={{ paddingLeft: '1rem', borderLeft: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                                            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        
                                        {/* Left Column: Skill Analysis */}
                                        <div>
                                            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <CheckCircle size={18} /> Skill Analysis ({sub.skillLevel})
                                            </h4>
                                            
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', fontStyle: 'italic', padding: '1rem', backgroundColor: 'var(--bg-body)', borderRadius: '8px', borderLeft: '4px solid var(--accent-primary)' }}>
                                                "{sub.employerSummary}"
                                            </p>

                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Strengths:</div>
                                                <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    {sub.strengths?.slice(0, 3).map((s, i) => <li key={i} style={{ marginBottom: '4px' }}>{s}</li>) || <li>None noted</li>}
                                                </ul>
                                            </div>

                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Improvements Needed:</div>
                                                <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    {sub.improvements?.slice(0, 3).map((s, i) => <li key={i} style={{ marginBottom: '4px' }}>{s}</li>) || <li>None noted</li>}
                                                </ul>
                                            </div>

                                            {sub.screenVideoPath && (
                                                <div style={{ marginTop: '2rem' }}>
                                                    <a href={`http://localhost:5000/${sub.screenVideoPath.replace(/\\/g, '/').split('server/')[1] || sub.screenVideoPath.replace(/\\/g, '/').split('server\\')[1]}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                        <Play size={14} /> View Screen Recording
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Column: Suspicion & Proctoring */}
                                        <div>
                                            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: isHighRisk ? 'var(--accent-rose)' : 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <ShieldAlert size={18} /> Proctoring Report
                                            </h4>

                                            <div style={{ padding: '1.25rem', backgroundColor: isHighRisk ? 'rgba(239,68,68,0.1)' : 'var(--bg-body)', border: `1px solid ${isHighRisk ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'}`, borderRadius: '8px', marginBottom: '1.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: getSuspicionColor(sub.suspicionScore), textTransform: 'uppercase' }}>
                                                        {getSuspicionLabel(sub.suspicionScore)}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0, marginBottom: (sub.suspicionReasons?.length > 0 || sub.suspicionDetails?.suspicionReasons?.length > 0) ? '1rem' : 0 }}>
                                                    {sub.behavioralSummary || (sub.suspicionDetails?.behavioralSummary)}
                                                </p>
                                                {(sub.suspicionReasons?.length > 0 || sub.suspicionDetails?.suspicionReasons?.length > 0) && (
                                                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        {(sub.suspicionReasons || sub.suspicionDetails?.suspicionReasons).map((reason, i) => (
                                                            <li key={i}>{reason}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>

                                            {sub.suspicionDetails?.flaggedMoments?.length > 0 && (
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <AlertTriangle size={14} style={{ color: 'var(--accent-gold)' }} /> Flagged Events
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        {sub.suspicionDetails.flaggedMoments.map((flag, idx) => (
                                                            <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '6px', fontSize: '0.85rem', borderLeft: `3px solid ${flag.severity === 'critical' || flag.severity === 'high' ? 'var(--accent-rose)' : 'var(--accent-gold)'}` }}>
                                                                <strong style={{ color: 'var(--text-primary)', marginRight: '6px' }}>[{flag.timestamp || 'N/A'}]</strong>
                                                                <span style={{ color: 'var(--text-secondary)' }}>{flag.concern || flag.description}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {sub.webcamVideoPath && (
                                                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                                                    <a href={`http://localhost:5000/${sub.webcamVideoPath.replace(/\\/g, '/').split('server/')[1] || sub.webcamVideoPath.replace(/\\/g, '/').split('server\\')[1]}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                        <Play size={14} /> View Webcam Recording
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
