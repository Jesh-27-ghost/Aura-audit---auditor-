/**
 * Analytics Dashboard Page
 *
 * Three premium charts powered by Recharts:
 * 1. Radar Chart — Candidate dimensions vs Industry Average
 * 2. Line Chart  — Score growth over last 5 assessments (Learning Velocity)
 * 3. Bar Chart   — Employer talent pool distribution by skill level
 *
 * FinTech color palette: Deep Blues, Emerald Greens, Gold
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAnalyticsCandidate, getAnalyticsTalent, getSkillProgress } from '../api';
import { motion } from 'framer-motion';
import {
    BarChart3, TrendingUp, Radar, Activity,
    Target, Award, Percent, Zap, Layers
} from 'lucide-react';
import {
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Radar as RechartsRadar, Legend, Tooltip, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart,
    BarChart, Bar, Cell
} from 'recharts';

/* ── FinTech Color Palette ─────────────────── */
const COLORS = {
    deepBlue: '#1e3a5f',
    royalBlue: '#3b82f6',
    emerald: '#10b981',
    emeraldLight: '#34d399',
    gold: '#f59e0b',
    goldLight: '#fbbf24',
    indigo: '#6366f1',
    slate: '#64748b',
    rose: '#f43f5e',
    candidateLine: '#10b981',
    industryLine: 'rgba(99, 102, 241, 0.5)',
    gridStroke: 'rgba(255, 255, 255, 0.06)',
    textMuted: 'rgba(148, 163, 184, 0.8)'
};

const BAR_COLORS = ['#64748b', '#10b981', '#6366f1', '#f59e0b'];

// Per-skill chart colors — cycle through these
const SKILL_COLORS = [
    { stroke: '#10b981', fill: '#10b981' },  // emerald
    { stroke: '#6366f1', fill: '#6366f1' },  // indigo
    { stroke: '#f59e0b', fill: '#f59e0b' },  // gold
    { stroke: '#3b82f6', fill: '#3b82f6' },  // blue
    { stroke: '#ec4899', fill: '#ec4899' },  // pink
    { stroke: '#06b6d4', fill: '#06b6d4' },  // cyan
    { stroke: '#8b5cf6', fill: '#8b5cf6' },  // violet
    { stroke: '#ef4444', fill: '#ef4444' },  // red
];

/* ── Custom Tooltip Component ─────────────── */
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="an-tooltip">
            <p className="an-tooltip-label">{label}</p>
            {payload.map((entry, i) => (
                <p key={i} className="an-tooltip-value" style={{ color: entry.color || entry.fill }}>
                    {entry.name}: <strong>{entry.value}</strong>
                </p>
            ))}
        </div>
    );
}

/* ── Skill Progress Tooltip ───────────────── */
function SkillTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
        <div className="an-tooltip">
            <p className="an-tooltip-label">{d?.date || label}</p>
            <p className="an-tooltip-value" style={{ color: payload[0]?.color || '#10b981' }}>
                Score: <strong>{d?.score}/100</strong>
            </p>
            {d?.level && (
                <p className="an-tooltip-value" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                    Level: {d.level} {d.passed ? '✅' : '❌'}
                </p>
            )}
        </div>
    );
}

/* ── Stat Card Component ──────────────────── */
function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
    return (
        <motion.div
            className="an-stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
        >
            <div className="an-stat-icon" style={{ background: `${color}15`, color }}>
                <Icon size={20} />
            </div>
            <div className="an-stat-value">{value}</div>
            <div className="an-stat-label">{label}</div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════
   MAIN ANALYTICS DASHBOARD COMPONENT
   ══════════════════════════════════════════════ */
export default function AnalyticsDashboard() {
    const { user } = useAuth();
    const isCandidate = user?.role === 'candidate';
    const isEmployer = user?.role === 'employer';

    // Candidate data
    const [radarData, setRadarData] = useState([]);
    const [growthData, setGrowthData] = useState([]);
    const [stats, setStats] = useState(null);

    // Employer data
    const [talentData, setTalentData] = useState([]);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState('');

    // Skill progress data
    const [skillProgressData, setSkillProgressData] = useState({});
    const [skillList, setSkillList] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch candidate analytics
    useEffect(() => {
        if (!isCandidate) return;
        const fetchData = async (isBackground = false) => {
            if (!isBackground) setLoading(true);
            try {
                const [analyticsRes, progressRes] = await Promise.all([
                    getAnalyticsCandidate(),
                    getSkillProgress()
                ]);
                setRadarData(analyticsRes.data.radarData || []);
                setGrowthData(analyticsRes.data.growthData || []);
                setStats(analyticsRes.data.stats || null);
                setSkillProgressData(progressRes.data.skills || {});
                setSkillList(progressRes.data.skillList || []);
            } catch (err) {
                console.error('Analytics fetch error:', err);
                if (!isBackground) setError('Failed to load analytics.');
            } finally {
                if (!isBackground) setLoading(false);
            }
        };
        fetchData();

        const interval = setInterval(() => {
            fetchData(true);
        }, 10000);

        return () => clearInterval(interval);
    }, [isCandidate]);

    // Fetch employer talent data
    useEffect(() => {
        if (!isEmployer) return;
        const fetchTalent = async (isBackground = false) => {
            if (!isBackground) setLoading(true);
            try {
                const { data } = await getAnalyticsTalent(selectedSkill);
                setTalentData(data.talentData || []);
                setAvailableSkills(data.availableSkills || []);
            } catch (err) {
                console.error('Talent fetch error:', err);
                if (!isBackground) setError('Failed to load talent data.');
            } finally {
                if (!isBackground) setLoading(false);
            }
        };
        fetchTalent();

        const interval = setInterval(() => {
            fetchTalent(true);
        }, 10000);

        return () => clearInterval(interval);
    }, [isEmployer, selectedSkill]);

    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i) => ({
            opacity: 1, y: 0,
            transition: { duration: 0.5, delay: i * 0.15, ease: 'easeOut' }
        })
    };

    return (
        <div className="an-page" id="analytics-dashboard">
            {/* ── Header ── */}
            <motion.div
                className="an-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="an-header-icon">
                    <BarChart3 size={32} />
                </div>
                <h1 className="an-title">Analytics Dashboard</h1>
                <p className="an-subtitle">
                    {isCandidate
                        ? 'Track your performance, identify strengths, and monitor your skill growth'
                        : 'Explore the talent pool distribution across skill levels'}
                </p>
            </motion.div>

            {/* ── Loading ── */}
            {loading && (
                <div className="loading-container" style={{ minHeight: '40vh' }}>
                    <div className="spinner"></div>
                    <p className="loading-text">Crunching your data...</p>
                </div>
            )}

            {/* ── Error ── */}
            {error && !loading && (
                <div className="an-error"><p>{error}</p></div>
            )}

            {/* ══════════════════════════════════════
               CANDIDATE VIEW
               ══════════════════════════════════════ */}
            {!loading && !error && isCandidate && (
                <>
                    {/* Stats Row */}
                    {stats && (
                        <div className="an-stats-row">
                            <StatCard icon={Target} label="Total Assessments" value={stats.totalAssessments} color={COLORS.royalBlue} delay={0} />
                            <StatCard icon={Activity} label="Average Score" value={stats.avgScore} color={COLORS.emerald} delay={0.1} />
                            <StatCard icon={Award} label="Best Score" value={stats.bestScore} color={COLORS.gold} delay={0.2} />
                            <StatCard icon={Percent} label="Pass Rate" value={`${stats.passRate}%`} color={COLORS.indigo} delay={0.3} />
                        </div>
                    )}

                    <div className="an-charts-grid">
                        {/* ── Chart 1: Radar — Performance Dimensions ── */}
                        <motion.div
                            className="an-chart-card"
                            custom={0}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="an-chart-header">
                                <Radar size={18} className="an-chart-icon" />
                                <div>
                                    <h3>Performance Radar</h3>
                                    <p>Your latest scores vs. industry average</p>
                                </div>
                            </div>
                            {radarData.length > 0 ? (
                                <div className="an-chart-body">
                                    <ResponsiveContainer width="100%" height={320}>
                                        <RadarChart data={radarData} outerRadius="75%">
                                            <PolarGrid stroke={COLORS.gridStroke} />
                                            <PolarAngleAxis
                                                dataKey="dimension"
                                                tick={{ fill: COLORS.textMuted, fontSize: 12, fontWeight: 500 }}
                                            />
                                            <PolarRadiusAxis
                                                angle={30}
                                                domain={[0, 100]}
                                                tick={{ fill: COLORS.textMuted, fontSize: 10 }}
                                                axisLine={false}
                                            />
                                            <RechartsRadar
                                                name="You"
                                                dataKey="candidate"
                                                stroke={COLORS.emerald}
                                                fill={COLORS.emerald}
                                                fillOpacity={0.2}
                                                strokeWidth={2}
                                            />
                                            <RechartsRadar
                                                name="Industry Avg"
                                                dataKey="industryAvg"
                                                stroke={COLORS.industryLine}
                                                fill={COLORS.indigo}
                                                fillOpacity={0.08}
                                                strokeWidth={2}
                                                strokeDasharray="4 4"
                                            />
                                            <Legend
                                                wrapperStyle={{ fontSize: '12px', color: COLORS.textMuted, paddingTop: '12px' }}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="an-chart-empty">
                                    <p>Complete an assessment to see your radar chart</p>
                                </div>
                            )}
                        </motion.div>

                        {/* ── Chart 2: Area/Line — Skill Growth (Learning Velocity) ── */}
                        <motion.div
                            className="an-chart-card"
                            custom={1}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="an-chart-header">
                                <TrendingUp size={18} className="an-chart-icon" />
                                <div>
                                    <h3>Learning Velocity</h3>
                                    <p>Score trend across your last 5 assessments</p>
                                </div>
                            </div>
                            {growthData.length > 1 ? (
                                <div className="an-chart-body">
                                    <ResponsiveContainer width="100%" height={320}>
                                        <AreaChart data={growthData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridStroke} />
                                            <XAxis
                                                dataKey="assessment"
                                                tick={{ fill: COLORS.textMuted, fontSize: 12 }}
                                                axisLine={{ stroke: COLORS.gridStroke }}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                domain={[0, 100]}
                                                tick={{ fill: COLORS.textMuted, fontSize: 12 }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area
                                                type="monotone"
                                                dataKey="score"
                                                name="Score"
                                                stroke={COLORS.emerald}
                                                strokeWidth={2.5}
                                                fill="url(#scoreGradient)"
                                                dot={{ r: 5, fill: COLORS.emerald, strokeWidth: 2, stroke: '#0c0c1c' }}
                                                activeDot={{ r: 7, fill: COLORS.goldLight, stroke: COLORS.gold, strokeWidth: 2 }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : growthData.length === 1 ? (
                                <div className="an-chart-empty">
                                    <Zap size={24} style={{ color: COLORS.gold, marginBottom: 8 }} />
                                    <p>You have 1 assessment — complete more to see your growth trend!</p>
                                </div>
                            ) : (
                                <div className="an-chart-empty">
                                    <p>Complete assessments to track your learning velocity</p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* ── Chart 3: Per-Skill Progress Graphs ── */}
                    {skillList.length > 0 && (
                        <motion.div
                            className="an-skill-progress-section"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="an-chart-header" style={{ marginBottom: '20px' }}>
                                <Layers size={18} className="an-chart-icon" />
                                <div>
                                    <h3>Skill Progress by Field</h3>
                                    <p>Track your improvement in each skill over time</p>
                                </div>
                            </div>

                            <div className="an-skill-progress-grid">
                                {skillList.map((skillName, idx) => {
                                    const data = skillProgressData[skillName] || [];
                                    const color = SKILL_COLORS[idx % SKILL_COLORS.length];
                                    const latestScore = data.length > 0 ? data[data.length - 1].score : 0;
                                    const latestLevel = data.length > 0 ? data[data.length - 1].level : '—';
                                    const improvement = data.length >= 2
                                        ? data[data.length - 1].score - data[0].score
                                        : 0;
                                    const gradientId = `skillGrad-${idx}`;

                                    return (
                                        <motion.div
                                            key={skillName}
                                            className="an-skill-card"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * idx }}
                                        >
                                            {/* Skill card header */}
                                            <div className="an-skill-card-header">
                                                <div>
                                                    <h4 className="an-skill-card-title">{skillName}</h4>
                                                    <div className="an-skill-card-meta">
                                                        <span className="an-skill-badge" style={{ background: `${color.stroke}15`, color: color.stroke }}>
                                                            {latestLevel}
                                                        </span>
                                                        <span className="an-skill-attempts">{data.length} attempt{data.length !== 1 ? 's' : ''}</span>
                                                    </div>
                                                </div>
                                                <div className="an-skill-score-display">
                                                    <span className="an-skill-score-num" style={{ color: color.stroke }}>{latestScore}</span>
                                                    <span className="an-skill-score-label">Latest</span>
                                                    {improvement !== 0 && (
                                                        <span className={`an-skill-delta ${improvement > 0 ? 'an-skill-delta-up' : 'an-skill-delta-down'}`}>
                                                            {improvement > 0 ? '↑' : '↓'} {Math.abs(improvement)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Chart */}
                                            {data.length > 1 ? (
                                                <div className="an-skill-chart">
                                                    <ResponsiveContainer width="100%" height={180}>
                                                        <AreaChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                                                            <defs>
                                                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor={color.fill} stopOpacity={0.25} />
                                                                    <stop offset="95%" stopColor={color.fill} stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridStroke} />
                                                            <XAxis
                                                                dataKey="date"
                                                                tick={{ fill: COLORS.textMuted, fontSize: 10 }}
                                                                axisLine={{ stroke: COLORS.gridStroke }}
                                                                tickLine={false}
                                                            />
                                                            <YAxis
                                                                domain={[0, 100]}
                                                                tick={{ fill: COLORS.textMuted, fontSize: 10 }}
                                                                axisLine={false}
                                                                tickLine={false}
                                                            />
                                                            <Tooltip content={<SkillTooltip />} />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="score"
                                                                name="Score"
                                                                stroke={color.stroke}
                                                                strokeWidth={2.5}
                                                                fill={`url(#${gradientId})`}
                                                                dot={{ r: 4, fill: color.stroke, strokeWidth: 2, stroke: '#0c0c1c' }}
                                                                activeDot={{ r: 6, fill: COLORS.goldLight, stroke: COLORS.gold, strokeWidth: 2 }}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            ) : data.length === 1 ? (
                                                <div className="an-skill-single">
                                                    <div className="an-skill-single-score" style={{ color: color.stroke }}>
                                                        {data[0].score}<span>/100</span>
                                                    </div>
                                                    <p>Complete more attempts to see your progress trend</p>
                                                </div>
                                            ) : (
                                                <div className="an-skill-empty">
                                                    <p>No data yet</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </>
            )}

            {/* ══════════════════════════════════════
               EMPLOYER VIEW
               ══════════════════════════════════════ */}
            {!loading && !error && isEmployer && (
                <motion.div
                    className="an-chart-card an-chart-card-wide"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="an-chart-header">
                        <BarChart3 size={18} className="an-chart-icon" />
                        <div style={{ flex: 1 }}>
                            <h3>Talent Pool Distribution</h3>
                            <p>Number of verified candidates at each skill level</p>
                        </div>
                        {/* Skill filter dropdown */}
                        <select
                            className="an-skill-select"
                            value={selectedSkill}
                            onChange={(e) => setSelectedSkill(e.target.value)}
                        >
                            <option value="">All Skills</option>
                            {availableSkills.map(skill => (
                                <option key={skill} value={skill}>{skill}</option>
                            ))}
                        </select>
                    </div>
                    <div className="an-chart-body">
                        <ResponsiveContainer width="100%" height={380}>
                            <BarChart data={talentData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }} barSize={60}>
                                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridStroke} />
                                <XAxis
                                    dataKey="level"
                                    tick={{ fill: COLORS.textMuted, fontSize: 13, fontWeight: 500 }}
                                    axisLine={{ stroke: COLORS.gridStroke }}
                                    tickLine={false}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fill: COLORS.textMuted, fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }} />
                                <Bar dataKey="candidates" name="Candidates" radius={[8, 8, 0, 0]}>
                                    {talentData.map((entry, index) => (
                                        <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            )}

            {/* No role (shouldn't happen but just in case) */}
            {!loading && !error && !isCandidate && !isEmployer && (
                <div className="an-chart-empty" style={{ marginTop: '3rem' }}>
                    <p>Please log in to view your analytics.</p>
                </div>
            )}
        </div>
    );
}
