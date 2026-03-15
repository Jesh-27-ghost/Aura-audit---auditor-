import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';

const mockSkillsData = [
  { name: "React Frontend Development", candidates: 18 },
  { name: "Node.js API Development", candidates: 15 },
  { name: "JavaScript Debugging", candidates: 20 },
  { name: "SQL Database Querying", candidates: 10 },
  { name: "Python Scripting", candidates: 8 },
  { name: "DevOps / Docker", candidates: 5 }
];

export default function SkillSearch({ value = '', onSelectSkill, onClear }) {
  const [query, setQuery] = useState(value);
  const [sortByCandidates, setSortByCandidates] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Sync with prop when cleared externally
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close suggestions when clicking outside the component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Memoize filtered and sorted skills to optimize performance for real-time filtering
  const filteredSkills = useMemo(() => {
    // Search is case-insensitive and supports partial matches
    let filtered = mockSkillsData.filter(skill =>
      skill.name.toLowerCase().includes(query.toLowerCase())
    );

    // Sort by candidates count if enabled (Bonus requirement)
    if (sortByCandidates) {
      filtered.sort((a, b) => b.candidates - a.candidates);
    }

    return filtered;
  }, [query, sortByCandidates]);

  // Helper function to highlight the matching text in the skill name
  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    // Use regex to case-insensitively replace query with highlighted span
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} style={{ backgroundColor: 'var(--accent-gold, #fbbf24)', color: '#000', borderRadius: '2px', padding: '0 2px' }}>
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  // Clear/reset the search bar
  const handleClear = () => {
    setQuery('');
    setSortByCandidates(false);
    if (onClear) onClear(); // Tell parent we cleared!
    searchRef.current?.querySelector('input')?.focus();
  };

  // Called when user clicks a suggestion
  const handleSkillSelect = (skillName) => {
    setQuery(skillName);
    setShowSuggestions(false);
    if (onSelectSkill) {
      onSelectSkill(skillName);
    }
  };

  return (
    <div className="skill-search-container" ref={searchRef} style={{ position: 'relative', marginBottom: '2rem', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Available Skills</h3>
        <button
          onClick={(e) => {
            e.preventDefault();
            setSortByCandidates(prev => !prev);
          }}
          className="btn btn-secondary btn-sm"
          style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}
          title="Sort by Number of Candidates"
          type="button"
        >
          <ArrowUpDown size={14} />
          {sortByCandidates ? 'Sorted by Candidates' : 'Sort by Candidates'}
        </button>
      </div>
      
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        <Search size={20} style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search available skills (e.g., Python, React)..."
          style={{
            width: '100%',
            padding: '14px 48px 14px 44px',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #334155)',
            backgroundColor: 'var(--bg-card, #1e293b)',
            color: 'var(--text-primary, #f8fafc)',
            fontSize: '1.05rem',
            outline: 'none',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease-in-out',
          }}
          onFocusCapture={(e) => {
            e.target.style.borderColor = 'var(--accent-primary, #3b82f6)';
            e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
          }}
          onBlurCapture={(e) => {
            e.target.style.borderColor = 'var(--border-color, #334155)';
            e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
        />
        {/* Clear/Reset button */}
        {query && (
          <button
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            }}
            aria-label="Clear search"
            type="button"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Real-time filtering Auto-complete suggestions */}
      {showSuggestions && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '8px',
          backgroundColor: 'var(--bg-card, #1e293b)',
          border: '1px solid var(--border-color, #334155)',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          zIndex: 50,
          maxHeight: '320px',
          overflowY: 'auto'
        }}>
          {filteredSkills.length > 0 ? (
            <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
              {filteredSkills.map((skill, index) => (
                <li
                  key={index}
                  onClick={() => handleSkillSelect(skill.name)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    padding: '12px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: index < filteredSkills.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    backgroundColor: hoveredIndex === index ? 'rgba(255,255,255,0.05)' : 'transparent',
                    transition: 'background-color 0.1s',
                  }}
                >
                  <span style={{ fontWeight: 500, color: 'var(--text-primary, #f8fafc)' }}>
                    {highlightText(skill.name, query)}
                  </span>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--text-secondary, #94a3b8)', 
                    backgroundColor: 'rgba(255,255,255,0.05)', 
                    padding: '4px 10px', 
                    borderRadius: '12px',
                    fontWeight: 500
                  }}>
                    {skill.candidates} candidate{skill.candidates !== 1 ? 's' : ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No skills found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
