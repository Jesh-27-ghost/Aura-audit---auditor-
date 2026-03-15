const { store } = require('../store');

// Puzzle Types & Generators
const PUZZLE_TYPES = ['alphabet', 'sequence', 'math', 'pattern'];

const generateAlphabetPuzzle = (level) => {
    const list = [
        { q: "DOG = 26, CAT = 24, BAT = 23, What is RAT?", a: "39", hint: "A=1, B=2... Sum of positions" },
        { q: "A = 1, D = 4, G = 7, What is J?", a: "10", hint: "Alphabet position" },
        { q: "ACE = 9, BEE = 12, What is CAB?", a: "6", hint: "Sum of positions" }
    ];
    return list[Math.floor(Math.random() * list.length)];
};

const generateSequencePuzzle = (level) => {
    const start = Math.floor(Math.random() * 10) + 1;
    let sequence = [];
    let answer;
    
    if (level === 1) { // Add/Sub
        const diff = Math.floor(Math.random() * 5) + 2;
        sequence = [start, start + diff, start + diff * 2, start + diff * 3];
        answer = start + diff * 4;
    } else { // Multi/Square
        sequence = [start, start * 2, start * 4, start * 8];
        answer = start * 16;
    }
    
    return {
        q: `${sequence.join(' → ')} → ?`,
        a: answer.toString(),
        hint: "Identify the progression"
    };
};

const generateMathPuzzle = (level) => {
    const ops = [
        { q: "Input: 5, Output: 120. Identify operation for Input: 4", a: "24", hint: "n!" },
        { q: "Input: 3, Output: 9. Input: 4, Output: 16. Input: 5, Output: ?", a: "25", hint: "n^2" }
    ];
    return ops[Math.floor(Math.random() * ops.length)];
};

const startSession = async (req, res) => {
    try {
        const session = {
            candidateId: req.user._id,
            startTime: new Date().toISOString(),
            puzzles: [],
            currentDifficulty: 1,
            completed: false,
            metrics: {
                reasoning: 0,
                patternRecognition: 0,
                speed: 0,
                flexibility: 0
            }
        };
        // In a real app, save to DB. Here we use memory/JSON store
        const newSession = store.insert('puzzleSessions', session);
        res.status(201).json({ sessionId: newSession._id, level: 1 });
    } catch (error) {
        res.status(500).json({ message: "Failed to start puzzle session" });
    }
};

const getNextPuzzle = async (req, res) => {
    try {
        const { sessionId } = req.query;
        const session = store.findById('puzzleSessions', sessionId);
        if (!session || session.completed) return res.status(404).json({ message: "Session not found" });

        const level = session.currentDifficulty;
        const type = PUZZLE_TYPES[Math.floor(Math.random() * PUZZLE_TYPES.length)];
        
        let puzzle;
        if (type === 'alphabet') puzzle = generateAlphabetPuzzle(level);
        else if (type === 'sequence') puzzle = generateSequencePuzzle(level);
        else puzzle = generateMathPuzzle(level);

        res.json({ ...puzzle, type });
    } catch (error) {
        res.status(500).json({ message: "Error generating puzzle" });
    }
};

const submitAnswer = async (req, res) => {
    try {
        const { sessionId, answer, timeTaken, correct } = req.body;
        const session = store.findById('puzzleSessions', sessionId);
        
        session.puzzles.push({ answer, timeTaken, correct, level: session.currentDifficulty });
        
        if (correct) {
            session.currentDifficulty = Math.min(4, session.currentDifficulty + 1);
        }

        if (session.puzzles.length >= 8) {
            session.completed = true;
            // Calculate final scores
            const correctCount = session.puzzles.filter(p => p.correct).length;
            const avgTime = session.puzzles.reduce((acc, p) => acc + p.timeTaken, 0) / session.puzzles.length;
            
            session.metrics = {
                reasoning: (correctCount / 8 * 10).toFixed(1),
                patternRecognition: (correctCount > 5 ? 8.5 : 6.0),
                speed: (avgTime < 15 ? 9.0 : 7.0),
                flexibility: (session.currentDifficulty > 3 ? 8.8 : 7.5)
            };
        }

        store.updateById('puzzleSessions', sessionId, session);
        res.json({ correct, completed: session.completed, metrics: session.metrics });
    } catch (error) {
        res.status(500).json({ message: "Submission failed" });
    }
};

module.exports = { startSession, getNextPuzzle, submitAnswer };
