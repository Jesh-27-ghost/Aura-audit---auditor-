/**
 * SkillSearchBar — Real-time skill search with autocomplete for Employer Mode
 * 
 * Features:
 *  - Search-as-you-type with case-insensitive partial matching
 *  - Autocomplete dropdown with candidate counts and match highlighting
 *  - Clear/reset button
 *  - Sort toggle (by candidate count)
 *  - "No skills found" empty state
 *  - Keyboard navigation (arrow keys + enter + escape)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ArrowUpDown, Users, Sparkles } from 'lucide-react';
import { searchSkills } from '../api';

export default function SkillSearchBar({ onSkillSelect, selectedSkill }) {
    // --- State ---
    const [query, setQuery] = useState('');               // Current search text
    const [allSkills, setAllSkills] = useState([]);        // Full skills list from API
    const [filtered, setFiltered] = useState([]);          // Filtered results shown in dropdown
    const [isOpen, setIsOpen] = useState(false);           // Dropdown visibility
    const [activeIndex, setActiveIndex] = useState(-1);    // Keyboard-navigated item index
    const [sortAsc, setSortAsc] = useState(false);         // Sort direction toggle
    const [loading, setLoading] = useState(true);

    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // --- Fetch skills on mount ---
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const { data } = await searchSkills();
                setAllSkills(data);
                setFiltered(data);
            } catch (err) {
                console.error('Failed to fetch skills:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSkills();
    }, []);

    // --- Filter + sort whenever query or sort direction changes ---
    useEffect(() => {
        let results = allSkills;

        // Apply search filter (case-insensitive, partial match)
        if (query.trim()) {
            const q = query.trim().toLowerCase();
            results = allSkills.filter(s => s.name.toLowerCase().includes(q));
        }

        // Apply sort by candidate count
        results = [...results].sort((a, b) =>
            sortAsc ? a.candidates - b.candidates : b.candidates - a.candidates
        );

        setFiltered(results);
        setActiveIndex(-1); // Reset keyboard nav on re-filter
    }, [query, allSkills, sortAsc]);

    // --- Close dropdown on outside click ---
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                inputRef.current && !inputRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- Highlight matching text in skill name ---
    const highlightMatch = useCallback((text) => {
        if (!query.trim()) return text;
        const q = query.trim();
        const idx = text.toLowerCase().indexOf(q.toLowerCase());
        if (idx === -1) return text;

        return (
            <>
                {text.slice(0, idx)}
                <mark>{text.slice(idx, idx + q.length)}</mark>
                {text.slice(idx + q.length)}
            </>
        );
    }, [query]);

    // --- Handle skill selection ---
    const handleSelect = (skill) => {
        setQuery(skill.name);
        setIsOpen(false);
        onSkillSelect?.(skill.name);
    };

    // --- Clear the search ---
    const handleClear = () => {
        setQuery('');
        setIsOpen(false);
        setActiveIndex(-1);
        onSkillSelect?.(''); // Reset to show all
        inputRef.current?.focus();
    };

    // --- Keyboard navigation ---
    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown') {
                setIsOpen(true);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(prev => Math.min(prev + 1, filtered.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (activeIndex >= 0 && filtered[activeIndex]) {
                    handleSelect(filtered[activeIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setActiveIndex(-1);
                break;
        }
    };

    // --- Toggle sort direction ---
    const toggleSort = () => {
        setSortAsc(prev => !prev);
    };

    return (
        <div className="skill-search-container" id="skill-search">
            {/* Section label */}
            <div className="skill-search-label">
                <Sparkles size={16} />
                <span>Find Skills</span>
            </div>

            {/* Input row: icon + input + sort + clear */}
            <div className="skill-search-input-wrapper">
                <Search size={18} className="skill-search-icon" />
                <input
                    ref={inputRef}
                    type="text"
                    className="skill-search-input"
                    placeholder="Search skills — e.g. Python, React, DevOps..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    id="skill-search-input"
                    autoComplete="off"
                />

                {/* Sort toggle button */}
                <button
                    className={`skill-search-sort-btn ${sortAsc ? 'active' : ''}`}
                    onClick={toggleSort}
                    title={sortAsc ? 'Sort: fewest candidates first' : 'Sort: most candidates first'}
                    type="button"
                    id="skill-search-sort"
                >
                    <ArrowUpDown size={16} />
                </button>

                {/* Clear button — only visible when there's text */}
                {query && (
                    <button
                        className="skill-search-clear"
                        onClick={handleClear}
                        title="Clear search"
                        type="button"
                        id="skill-search-clear"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Autocomplete dropdown */}
            {isOpen && (
                <div className="skill-search-dropdown" ref={dropdownRef} id="skill-search-dropdown">
                    {loading ? (
                        <div className="skill-search-loading">
                            <div className="spinner" style={{ width: 20, height: 20 }}></div>
                            <span>Loading skills...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        /* No results state */
                        <div className="skill-search-no-results" id="skill-search-no-results">
                            <Search size={24} />
                            <span>No skills found</span>
                            <small>Try a different search term</small>
                        </div>
                    ) : (
                        /* Skill suggestion list */
                        filtered.map((skill, i) => (
                            <button
                                key={skill.name}
                                className={`skill-search-item ${i === activeIndex ? 'active' : ''} ${selectedSkill === skill.name ? 'selected' : ''}`}
                                onClick={() => handleSelect(skill)}
                                onMouseEnter={() => setActiveIndex(i)}
                                id={`skill-option-${i}`}
                                type="button"
                            >
                                <div className="skill-search-item-info">
                                    <span className="skill-search-item-name">
                                        {highlightMatch(skill.name)}
                                    </span>
                                    {skill.industry && (
                                        <span className="skill-search-item-industry">{skill.industry}</span>
                                    )}
                                </div>
                                <span className="skill-search-item-count">
                                    <Users size={13} />
                                    {skill.candidates}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
