import axios from 'axios';

const API = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to all requests
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('skillproof_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('skillproof_token');
            localStorage.removeItem('skillproof_user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Assessment
export const submitAssessment = (formData) =>
    API.post('/assess', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000 // 2 minutes for video processing
    });
export const getAssessment = (id) => API.get(`/assess/${id}`);

// Badges
export const getMyBadges = () => API.get('/badge/my');
export const createBadge = (assessmentId) => API.post(`/badge/${assessmentId}`);

// Verification (public)
export const verifyBadge = (badgeId) => API.get(`/verify/${badgeId}`);

// Skills
export const getSkills = () => API.get('/skills');
export const searchSkills = (q) => API.get('/skills/search', { params: q ? { q } : {} });

// Candidates (employer)
export const searchCandidates = (params) => API.get('/candidates', { params });

// Leaderboard (public)
export const getLeaderboard = () => API.get('/leaderboard');

// Analytics
export const getAnalyticsCandidate = () => API.get('/analytics/candidate');
export const getAnalyticsTalent = (skill) => API.get('/analytics/talent', { params: skill ? { skill } : {} });
export const getSkillProgress = () => API.get('/analytics/skill-progress');

// Task Endpoints
export const createTask = (data) => API.post('/tasks', data);
export const generateTaskAI = (data) => API.post('/tasks/generate', data);
export const getTasks = (params) => API.get('/tasks', { params });
export const getTaskById = (id) => API.get(`/tasks/${id}`);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// Task Submissions (Candidate)
export const submitTaskTest = (taskId, formData) =>
    API.post(`/task-submissions/${taskId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000 // 3 minutes for dual video processing
    });
export const getTaskSubmission = (id) => API.get(`/task-submissions/${id}`);
export const getMyTaskSubmissions = () => API.get('/task-submissions/my');
export const getTaskSubmissions = (taskId) => API.get(`/task-submissions/task/${taskId}`);

// Arena
// export const getArenaLevel = () => API.get('/arena/level');
// export const getArenaChallenge = (level, language) => API.get('/arena/challenge', { params: { level, language } });
// export const submitArenaAttempt = (data) => API.post('/arena/submit', data);

// Logic Puzzle Arena
export const startPuzzleSession = () => API.post('/puzzle/start');
export const getNextPuzzle = (sessionId) => API.get('/puzzle/next', { params: { sessionId } });
export const submitPuzzleAnswer = (data) => API.post('/puzzle/submit', data);

export default API;
