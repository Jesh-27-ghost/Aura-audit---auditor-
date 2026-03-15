import { useState, useRef, useCallback, useEffect } from 'react';
import { Info } from 'lucide-react';

const CONFIDENCE_ZONES = [
    {
        min: 0, max: 25,
        level: 'Low Confidence',
        difficulty: 'Basic Level',
        color: '#4CAF50',
        emojis: ['🌱', '🙂', '📘'],
        label: 'Low Confidence — Basic Level'
    },
    {
        min: 26, max: 50,
        level: 'Moderate Confidence',
        difficulty: 'Developing Skills',
        color: '#FFC107',
        emojis: ['🧠', '🤔', '💡'],
        label: 'Moderate Confidence — Developing Skills'
    },
    {
        min: 51, max: 75,
        level: 'High Confidence',
        difficulty: 'Strong Understanding',
        color: '#FF9800',
        emojis: ['⚡', '🧑‍💻', '🚀'],
        label: 'High Confidence — Strong Understanding'
    },
    {
        min: 76, max: 100,
        level: 'Expert Confidence',
        difficulty: 'Challenge Mode',
        color: '#F44336',
        emojis: ['🔥', '🏆', '👑'],
        label: 'Expert Confidence — Challenge Mode'
    }
];

function getZone(value) {
    return CONFIDENCE_ZONES.find(z => value >= z.min && value <= z.max) || CONFIDENCE_ZONES[0];
}

function getEmoji(value) {
    const zone = getZone(value);
    // Pick emoji based on sub-position within the zone
    const range = zone.max - zone.min;
    const pos = value - zone.min;
    const idx = Math.min(Math.floor((pos / (range + 1)) * zone.emojis.length), zone.emojis.length - 1);
    return zone.emojis[idx];
}

export default function ConfidenceSlider({ value, onChange }) {
    const trackRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    const zone = getZone(value);
    const emoji = getEmoji(value);

    const updateValue = useCallback((clientX) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const pct = Math.max(0, Math.min(1, x / rect.width));
        onChange(Math.round(pct * 100));
    }, [onChange]);

    // Mouse events
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        updateValue(e.clientX);
    };

    useEffect(() => {
        if (!isDragging) return;
        const handleMouseMove = (e) => updateValue(e.clientX);
        const handleMouseUp = () => setIsDragging(false);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, updateValue]);

    // Touch events
    const handleTouchStart = (e) => {
        setIsDragging(true);
        updateValue(e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
        if (isDragging) updateValue(e.touches[0].clientX);
    };

    const handleTouchEnd = () => setIsDragging(false);

    return (
        <div className="confidence-slider-container" id="confidence-slider">
            {/* Header */}
            <div className="confidence-slider-header">
                <h3 className="confidence-slider-title">
                    How confident are you?
                </h3>
                <div
                    className="confidence-slider-info"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <Info size={16} />
                    {showTooltip && (
                        <div className="confidence-tooltip">
                            Your confidence level adjusts the difficulty of this assessment. Higher confidence means stricter grading and fewer hints.
                        </div>
                    )}
                </div>
            </div>

            {/* Dynamic Label */}
            <div className="confidence-label-display" style={{ color: zone.color }}>
                <span className="confidence-emoji-large">{emoji}</span>
                <span className="confidence-label-text">{zone.label}</span>
            </div>

            {/* Slider Track */}
            <div
                className={`confidence-track-wrapper ${isDragging ? 'dragging' : ''}`}
                ref={trackRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Color zone segments */}
                <div className="confidence-track">
                    {CONFIDENCE_ZONES.map((z, i) => (
                        <div
                            key={i}
                            className="confidence-zone-segment"
                            style={{
                                width: `${z.max - z.min + 1}%`,
                                background: value >= z.min
                                    ? `linear-gradient(90deg, ${z.color}cc, ${z.color}88)`
                                    : 'rgba(255,255,255,0.06)'
                            }}
                        />
                    ))}
                </div>

                {/* Filled progress */}
                <div
                    className="confidence-track-fill"
                    style={{
                        width: `${value}%`,
                        background: `linear-gradient(90deg, #4CAF50, ${zone.color})`
                    }}
                />

                {/* Emoji thumb */}
                <div
                    className={`confidence-thumb ${isDragging ? 'active' : ''}`}
                    style={{ left: `${value}%` }}
                >
                    <span className="confidence-thumb-emoji">{emoji}</span>
                </div>
            </div>

            {/* Zone markers */}
            <div className="confidence-zone-labels">
                {CONFIDENCE_ZONES.map((z, i) => (
                    <div
                        key={i}
                        className={`confidence-zone-marker ${value >= z.min && value <= z.max ? 'active' : ''}`}
                        style={{ color: value >= z.min && value <= z.max ? z.color : 'var(--text-muted)' }}
                    >
                        {z.difficulty}
                    </div>
                ))}
            </div>

            {/* Value indicator */}
            <div className="confidence-value-indicator">
                <span style={{ color: zone.color, fontWeight: 700 }}>{value}</span>
                <span style={{ color: 'var(--text-muted)' }}> / 100</span>
            </div>
        </div>
    );
}

export { CONFIDENCE_ZONES, getZone };
