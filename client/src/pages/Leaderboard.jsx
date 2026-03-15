/**
 * Leaderboard Page
 * 
 * Displays the top 10 performers ranked by their highest AI assessment score.
 * Features:
 * - Gold / Silver / Bronze medal icons for ranks 1–3
 * - Animated entrance with Framer Motion
 * - Responsive layout (table on desktop, cards on mobile)
 * - Score color-coding (green for high, amber for mid, red for low)
 * - Public page — no authentication required
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, Award, TrendingUp, Flame, Sparkles, ChevronUp } from 'lucide-react';
import { getLeaderboard } from '../api';

export default function Leaderboard() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch leaderboard data
    useEffect(() => {
        const fetchLeaderboard = async (isBackground = false) => {
            if (!isBackground) setLoading(true);
            try {
                const { data } = await getLeaderboard();
                setEntries(data.data); // data.data is the array of entries
            } catch (err) {
                console.error('Failed to fetch leaderboard:', err);
                if (!isBackground) setError('Failed to load leaderboard. Please try again later.');
            } finally {
                if (!isBackground) setLoading(false);
            }
        };
        fetchLeaderboard();

        const interval = setInterval(() => {
            fetchLeaderboard(true);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    /**
     * Returns the medal emoji/icon for top 3 ranks
     * Rank 1 → Gold Crown, Rank 2 → Silver Medal, Rank 3 → Bronze Medal
     */
    const getMedalIcon = (rank) => {
        switch (rank) {
            case 1:
                return (
                    <div className="lb-medal lb-medal-gold" title="1st Place — Gold">
                        <Crown size={20} />
                    </div>
                );
            case 2:
                return (
                    <div className="lb-medal lb-medal-silver" title="2nd Place — Silver">
                        <Medal size={20} />
                    </div>
                );
            case 3:
                return (
                    <div className="lb-medal lb-medal-bronze" title="3rd Place — Bronze">
                        <Award size={20} />
                    </div>
                );
            default:
                return <span className="lb-rank-number">{rank}</span>;
        }
    };

    /**
     * Returns the CSS class for score color-coding
     */
    const getScoreClass = (score) => {
        if (score >= 90) return 'lb-score-legendary';
        if (score >= 75) return 'lb-score-high';
        if (score >= 60) return 'lb-score-medium';
        return 'lb-score-low';
    };

    /**
     * Returns a skill level badge class
     */
    const getLevelClass = (level) => {
        switch (level) {
            case 'Expert': return 'lb-level-expert';
            case 'Advanced': return 'lb-level-advanced';
            case 'Intermediate': return 'lb-level-intermediate';
            default: return 'lb-level-beginner';
        }
    };

    /**
     * Format the upload date nicely
     */
    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Stagger animation for rows
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: 'easeOut' }
        }
    };

    return (
        <div className="lb-page" id="leaderboard-page">
            {/* Header Section */}
            <motion.div
                className="lb-header"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="lb-header-icon">
                    <Trophy size={36} />
                </div>
                <h1 className="lb-title">
                    Leaderboard
                </h1>
                <p className="lb-subtitle">
                    Top performers ranked by their highest AI-verified skill scores
                </p>
            </motion.div>

            {/* Loading State */}
            {loading && (
                <div className="loading-container" style={{ minHeight: '40vh' }}>
                    <div className="spinner"></div>
                    <p className="loading-text">Loading leaderboard...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="lb-error">
                    <p>{error}</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && entries.length === 0 && (
                <div className="lb-empty">
                    <div className="lb-empty-icon">🏆</div>
                    <h3>No scores yet</h3>
                    <p>Be the first to take an assessment and claim the #1 spot!</p>
                </div>
            )}

            {/* Leaderboard Table */}
            {!loading && !error && entries.length > 0 && (
                <>
                    {/* Top 3 Podium Cards */}
                    <motion.div
                        className="lb-podium"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {entries.slice(0, 3).map((entry, idx) => (
                            <motion.div
                                key={entry.rank}
                                className={`lb-podium-card lb-podium-${entry.rank}`}
                                whileHover={{ y: -6, scale: 1.02 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <div className="lb-podium-medal">
                                    {getMedalIcon(entry.rank)}
                                </div>
                                <div className="lb-podium-score">
                                    <span className={`lb-score-value ${getScoreClass(entry.score)}`}>
                                        {entry.score}
                                    </span>
                                </div>
                                <h3 className="lb-podium-name">{entry.username}</h3>
                                <p className="lb-podium-skill">{entry.skillName}</p>
                                <span className={`lb-level-badge ${getLevelClass(entry.skillLevel)}`}>
                                    {entry.skillLevel}
                                </span>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Full Rankings Table */}
                    <motion.div
                        className="lb-table-wrapper"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="lb-table-header">
                            <Flame size={18} />
                            <h2>Full Rankings</h2>
                        </div>
                        <div className="lb-table">
                            {/* Table Head */}
                            <div className="lb-table-row lb-table-head">
                                <div className="lb-col lb-col-rank">Rank</div>
                                <div className="lb-col lb-col-user">User</div>
                                <div className="lb-col lb-col-skill">Skill / Video Title</div>
                                <div className="lb-col lb-col-score">Score</div>
                                <div className="lb-col lb-col-date">Date</div>
                            </div>

                            {/* Table Body */}
                            {entries.map((entry) => (
                                <motion.div
                                    key={entry.rank}
                                    className={`lb-table-row ${entry.rank <= 3 ? 'lb-table-row-top' : ''}`}
                                    variants={rowVariants}
                                    whileHover={{ x: 4, backgroundColor: 'rgba(99, 102, 241, 0.06)' }}
                                >
                                    <div className="lb-col lb-col-rank">
                                        {getMedalIcon(entry.rank)}
                                    </div>
                                    <div className="lb-col lb-col-user">
                                        <div className="lb-user-avatar">
                                            {entry.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="lb-user-name">{entry.username}</span>
                                    </div>
                                    <div className="lb-col lb-col-skill">
                                        <span className="lb-skill-name">{entry.skillName}</span>
                                        <span className={`lb-level-badge-sm ${getLevelClass(entry.skillLevel)}`}>
                                            {entry.skillLevel}
                                        </span>
                                    </div>
                                    <div className="lb-col lb-col-score">
                                        <div className={`lb-score-pill ${getScoreClass(entry.score)}`}>
                                            <ChevronUp size={14} />
                                            {entry.score}
                                        </div>
                                    </div>
                                    <div className="lb-col lb-col-date">
                                        {formatDate(entry.uploadDate)}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
}
