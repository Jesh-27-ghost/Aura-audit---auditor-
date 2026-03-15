import { motion } from 'framer-motion';

/**
 * Skeleton shimmer loader for the ScoreCard page.
 * Shows placeholder shapes while data is loading.
 */
export default function SkeletonLoader({ type = 'scorecard' }) {
    if (type === 'scorecard') {
        return (
            <div className="skeleton-page">
                <div className="skeleton-header">
                    <div className="skel skel-badge" />
                    <div className="skel-text-group">
                        <div className="skel skel-title" />
                        <div className="skel skel-subtitle" />
                    </div>
                </div>

                {/* Score Ring skeleton */}
                <div className="skeleton-score-section">
                    <div className="skel skel-ring" />
                    <div className="skel-text-group" style={{ flex: 1 }}>
                        <div className="skel skel-line skel-w80" />
                        <div className="skel skel-line skel-w60" />
                        <div className="skel skel-line skel-w40" />
                    </div>
                </div>

                {/* Dimension bars */}
                <div className="skeleton-dims">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="skeleton-dim-row">
                            <div className="skel skel-line skel-w30" />
                            <div className="skel skel-bar" />
                        </div>
                    ))}
                </div>

                {/* Cards */}
                <div className="skeleton-cards">
                    {[1, 2].map(i => (
                        <div key={i} className="skeleton-card-block">
                            <div className="skel skel-line skel-w50" />
                            <div className="skel skel-line skel-w80" />
                            <div className="skel skel-line skel-w60" />
                            <div className="skel skel-line skel-w70" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Generic content skeleton
    return (
        <div className="skeleton-page">
            <div className="skel skel-title" />
            <div className="skel skel-line skel-w80" />
            <div className="skel skel-line skel-w60" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
                <div className="skel skel-card-lg" />
                <div className="skel skel-card-lg" />
            </div>
        </div>
    );
}
