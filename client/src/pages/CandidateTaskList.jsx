import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTasks, getSkills } from '../api';
import { Briefcase, Clock, Code, PlayCircle, Filter } from 'lucide-react';

export default function CandidateTaskList() {
    const [tasks, setTasks] = useState([]);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterSkill, setFilterSkill] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [skillsRes, tasksRes] = await Promise.all([
                    getSkills(),
                    getTasks({ active: true }) // Only fetch active tasks
                ]);
                setSkills(skillsRes.data);
                setTasks(tasksRes.data);
            } catch (err) {
                console.error('Failed to fetch tasks/skills', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const filteredTasks = filterSkill 
        ? tasks.filter(t => t.skillName === filterSkill)
        : tasks;

    return (
        <div className="dashboard" id="candidate-task-list">
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Briefcase size={28} /> Available Skill Tests
                </h1>
                <p>Browse and attempt proctored skill assessments to earn badges and prove your abilities to employers.</p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                    <Filter size={16} /> Filter by Category:
                </label>
                <select 
                    className="form-select" 
                    style={{ maxWidth: '300px', margin: 0 }}
                    value={filterSkill}
                    onChange={(e) => setFilterSkill(e.target.value)}
                >
                    <option value="">All Skills</option>
                    {skills.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="loading-container" style={{ minHeight: '30vh' }}>
                    <div className="spinner"></div>
                    <p className="loading-text">Loading assessments...</p>
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="empty-state">
                    <div className="icon"><Briefcase size={48} /></div>
                    <h3>No assessments found</h3>
                    <p>There are no active skill tests matching your criteria right now.</p>
                </div>
            ) : (
                <div className="dashboard-grid">
                    {filteredTasks.map(task => (
                        <div className="task-card" key={task._id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <span className="skill-tag" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>{task.skillName}</span>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>{task.title}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Created by <strong style={{ color: 'var(--accent-primary)' }}>{task.employerName}</strong></p>
                            </div>

                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, marginBottom: '1.5rem' }}>
                                {task.description?.substring(0, 150)}{task.description?.length > 150 ? '...' : ''}
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', backgroundColor: 'rgba(0,0,0,0.1)', padding: '0.75rem', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={14} style={{ color: 'var(--accent-gold)' }} /> {task.timeLimitMinutes} min limit
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Code size={14} style={{ color: 'var(--accent-emerald)' }} /> {task.questions?.length || 0} tasks
                                </div>
                            </div>

                            <button 
                                className="btn btn-primary" 
                                style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
                                onClick={() => navigate(`/tasks/${task._id}/test`)}
                            >
                                <PlayCircle size={18} /> Start Assessment
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
