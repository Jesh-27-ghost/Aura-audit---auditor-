import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PageLoader from './components/PageLoader';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateDashboard from './pages/CandidateDashboard';
import RecordTask from './pages/RecordTask';
import ScoreCardPage from './pages/ScoreCardPage';
import BadgeView from './pages/BadgeView';
import EmployerDashboard from './pages/EmployerDashboard';
import VerifyBadge from './pages/VerifyBadge';
import Leaderboard from './pages/Leaderboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Walkthrough from './pages/Walkthrough';
import PuzzleArena from './pages/PuzzleArena';
import EmployerTasks from './pages/EmployerTasks';
import TaskSubmissions from './pages/TaskSubmissions';
import CandidateTaskList from './pages/CandidateTaskList';
import CandidateTaskTest from './pages/CandidateTaskTest';
import CandidateTaskSubmissionView from './pages/CandidateTaskSubmissionView';

function ProtectedRoute({ children, role }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Loading...</p>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" />;
    if (role && user.role !== role) return <Navigate to="/" />;
    return children;
}

function AppRoutes() {
    return (
        <>

            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/walkthrough" element={<Walkthrough />} />
                <Route
                    path="/puzzle-arena"
                    element={
                        <ProtectedRoute role="candidate">
                            <PuzzleArena />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/analytics"
                    element={
                        <ProtectedRoute>
                            <AnalyticsDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute role="candidate">
                            <CandidateDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/tasks"
                    element={
                        <ProtectedRoute role="candidate">
                            <CandidateTaskList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/tasks/:taskId/test"
                    element={
                        <ProtectedRoute role="candidate">
                            <CandidateTaskTest />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/tasks/submission/:id"
                    element={
                        <ProtectedRoute role="candidate">
                            <CandidateTaskSubmissionView />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/record"
                    element={
                        <ProtectedRoute role="candidate">
                            <RecordTask />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/results/:assessmentId"
                    element={
                        <ProtectedRoute>
                            <ScoreCardPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/badge/:badgeId" element={<BadgeView />} />
                <Route
                    path="/employer"
                    element={
                        <ProtectedRoute role="employer">
                            <EmployerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/employer/tasks"
                    element={
                        <ProtectedRoute role="employer">
                            <EmployerTasks />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/employer/tasks/:taskId/submissions"
                    element={
                        <ProtectedRoute role="employer">
                            <TaskSubmissions />
                        </ProtectedRoute>
                    }
                />
                <Route path="/verify/:badgeId" element={<VerifyBadge />} />
            </Routes>
        </>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <PageLoader />
                <AppRoutes />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#1a1f35',
                            color: '#f1f5f9',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            borderRadius: '12px',
                            fontSize: '0.9rem'
                        },
                        success: {
                            iconTheme: { primary: '#10b981', secondary: '#fff' }
                        },
                        error: {
                            iconTheme: { primary: '#f43f5e', secondary: '#fff' }
                        }
                    }}
                />
            </Router>
        </AuthProvider>
    );
}
