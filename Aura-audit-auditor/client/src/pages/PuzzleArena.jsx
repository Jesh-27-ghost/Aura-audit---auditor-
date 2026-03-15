import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Trophy, ChevronRight, CheckCircle2, AlertCircle, RotateCcw, Brain, Lightbulb } from 'lucide-react';
import { startPuzzleSession, getNextPuzzle, submitPuzzleAnswer } from '../api';
import toast from 'react-hot-toast';

export default function PuzzleArena() {
    const navigate = useNavigate();
    const [gameState, setGameState] = useState('loading'); // loading, intro, playing, results
    const [sessionId, setSessionId] = useState(null);
    const [puzzle, setPuzzle] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [scores, setScores] = useState(null);
    const [progress, setProgress] = useState(0); // 0 to 8
    
    // Timer ref
    const timerRef = useRef(null);
    const audioRef = useRef({
        correct: new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'),
        incorrect: new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3')
    });

    useEffect(() => {
        const initSession = async () => {
            try {
                const { data } = await startPuzzleSession();
                setSessionId(data.sessionId);
                setGameState('intro');
            } catch (err) {
                toast.error("Failed to initialize session");
                navigate('/dashboard');
            }
        };
        initSession();
    }, []);

    useEffect(() => {
        if (gameState === 'playing' && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && gameState === 'playing') {
            handleSubmit(''); 
        }
        return () => clearInterval(timerRef.current);
    }, [gameState, timeLeft]);

    const fetchNextPuzzle = async () => {
        setGameState('loading');
        try {
            const { data } = await getNextPuzzle(sessionId);
            setPuzzle(data);
            setUserAnswer('');
            setTimeLeft(60);
            setGameState('playing');
        } catch (err) {
            toast.error("Failed to load puzzle");
            navigate('/dashboard');
        }
    };

    const handleSubmit = async (ans) => {
        clearInterval(timerRef.current);
        const finalAns = ans || userAnswer;
        const isCorrect = finalAns.toLowerCase().trim() === puzzle.a.toLowerCase().trim();

        if (isCorrect) {
            audioRef.current.correct.play();
            toast.success("Correct!", { icon: '👏' });
        } else {
            audioRef.current.incorrect.play();
            toast.error("Incorrect", { icon: '❌' });
        }

        try {
            const { data } = await submitPuzzleAnswer({
                sessionId,
                answer: finalAns,
                timeTaken: 60 - timeLeft,
                correct: isCorrect
            });

            if (data.completed) {
                setScores(data.metrics);
                setGameState('results');
            } else {
                setProgress(prev => prev + 1);
                fetchNextPuzzle();
            }
        } catch (err) {
            toast.error("Failed to submit answer");
        }
    };

    if (gameState === 'loading') {
        return (
            <div className="arena-loading" style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="puzzle-loader">
                    <Zap className="animate-bounce" size={64} style={{ color: '#f59e0b' }} />
                </div>
                <h2 style={{ marginTop: '1.5rem', color: 'var(--text-primary)' }}>Loading Puzzle...</h2>
            </div>
        );
    }

    return (
        <div className="arena-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <AnimatePresence mode="wait">
                {gameState === 'intro' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="card arena-intro"
                        style={{ textAlign: 'center', padding: '4rem 2rem' }}
                    >
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                                <Lightbulb size={50} color="#f59e0b" />
                            </div>
                            <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>Logic Arena</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '500px', margin: '0 auto' }}>
                                A series of hidden logic puzzles. Deduce the rules, solve the patterns, and prove your analytical thinking.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
                            <div className="rule-box">8 Puzzles</div>
                            <div className="rule-box">Adaptive Difficulty</div>
                            <div className="rule-box">60s Per Puzzle</div>
                            <div className="rule-box">Instant Scoring</div>
                        </div>

                        <button className="btn btn-gold btn-lg" onClick={fetchNextPuzzle} style={{ padding: '1.25rem 4rem', fontSize: '1.25rem' }}>
                            Start Challenge
                        </button>
                    </motion.div>
                )}

                {gameState === 'playing' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="puzzle-playarea"
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div className="progress-pills">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className={`pill ${i < progress ? 'active' : ''}`}></div>
                                ))}
                            </div>
                            <div className={`timer-ring ${timeLeft < 10 ? 'urgent' : ''}`}>
                                <Clock size={20} />
                                <span>{timeLeft}s</span>
                            </div>
                        </div>

                        <div className="card puzzle-card" style={{ padding: '4rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                            <div className="puzzle-type-badge">{puzzle.type.toUpperCase()}</div>
                            <div className="puzzle-question" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '3rem', fontFamily: 'var(--font-mono)' }}>
                                {puzzle.q}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <input
                                    autoFocus
                                    type="text"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="Enter Your Answer"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                    className="puzzle-input"
                                />
                                <button className="btn btn-gold" onClick={() => handleSubmit()} style={{ width: '80px' }}>
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                            
                            <p style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <AlertCircle size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                Tip: Look for patterns in positions or operations.
                            </p>
                        </div>
                    </motion.div>
                )}

                {gameState === 'results' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card arena-results"
                        style={{ textAlign: 'center', padding: '3rem' }}
                    >
                        <div style={{ marginBottom: '3rem' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <CheckCircle2 size={40} color="#10b981" />
                            </div>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Analysis Complete</h1>
                            <p style={{ color: 'var(--text-muted)' }}>Your cognitive reasoning profile has been generated.</p>
                        </div>

                        <div className="score-grid">
                            <ScoreTile label="Logical Reasoning" value={scores.reasoning} icon={<Brain size={18} />} />
                            <ScoreTile label="Pattern Recognition" value={scores.patternRecognition} icon={<Zap size={18} />} />
                            <ScoreTile label="Solving Speed" value={scores.speed} icon={<Clock size={18} />} />
                            <ScoreTile label="Cognitive Flexibility" value={scores.flexibility} icon={<RotateCcw size={18} />} />
                        </div>

                        <div style={{ marginTop: '3rem' }}>
                            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/dashboard')}>
                                Return to Dashboard
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .rule-box { background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); font-size: 0.9rem; font-weight: 600; }
                .progress-pills { display: flex; gap: 6px; }
                .pill { width: 30px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; transition: all 0.3s; }
                .pill.active { background: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.5); }
                .timer-ring { display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--text-primary); background: rgba(255,255,255,0.05); padding: 6px 16px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); }
                .timer-ring.urgent { color: #ef4444; border-color: #ef4444; animation: pulse 1s infinite; }
                .puzzle-type-badge { position: absolute; top: 1.5rem; left: 1.5rem; font-size: 0.7rem; font-weight: 800; color: #f59e0b; letter-spacing: 2px; background: rgba(245, 158, 11, 0.1); padding: 4px 10px; border-radius: 4px; }
                .puzzle-input { background: #0d1117; border: 1px solid #30363d; padding: 1rem 1.5rem; border-radius: 12px; color: #fff; font-size: 1.25rem; font-weight: 700; width: 250px; text-align: center; outline: none; transition: border-color 0.3s; }
                .puzzle-input:focus { border-color: #f59e0b; }
                .score-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
                .score-tile { background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); text-align: left; }
                .tile-header { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 0.8rem; margin-bottom: 0.5rem; }
                .tile-value { font-size: 1.75rem; font-weight: 800; color: #f59e0b; }
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
            `}</style>
        </div>
    );
}

function ScoreTile({ label, value, icon }) {
    return (
        <div className="score-tile">
            <div className="tile-header">{icon} {label}</div>
            <div className="tile-value">{value}/10</div>
        </div>
    );
}
