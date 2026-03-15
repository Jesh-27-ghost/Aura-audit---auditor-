import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTaskById, submitTaskTest } from '../api';
import toast from 'react-hot-toast';
import { Camera, Monitor, ShieldAlert, ArrowLeft, Send } from 'lucide-react';
import TestTaskbar from '../components/TestTaskbar';
import ConfidenceSlider, { getZone } from '../components/ConfidenceSlider';

export default function CandidateTaskTest() {
    const { taskId } = useParams();
    const navigate = useNavigate();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [testState, setTestState] = useState('PRE_TEST'); // PRE_TEST, RECORDING, SUBMITTING
    const [confidenceValue, setConfidenceValue] = useState(50);
    
    // Refs for accessing latest state/functions inside event listeners
    const testStateRef = useRef(testState);
    const submitTestRef = useRef(null);

    useEffect(() => {
        testStateRef.current = testState;
    }, [testState]);

    // Media states
    const [webcamStream, setWebcamStream] = useState(null);
    const [screenStream, setScreenStream] = useState(null);
    const webcamRecorderRef = useRef(null);
    const screenRecorderRef = useRef(null);
    const webcamChunksRef = useRef([]);
    const screenChunksRef = useRef([]);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const { data } = await getTaskById(taskId);
                setTask(data);
            } catch (err) {
                toast.error('Failed to load task');
                navigate('/tasks');
            } finally {
                setLoading(false);
            }
        };
        fetchTask();
        
        // Cleanup streams on unmount
        return () => {
            if (webcamStream) webcamStream.getTracks().forEach(t => t.stop());
            if (screenStream) screenStream.getTracks().forEach(t => t.stop());
        };
    }, [taskId, navigate]);

    // Request permissions and start assessment immediately
    const handleStartAssessment = async () => {
        try {
            // 1. Get webcam (Force user-facing camera)
            const camStream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, 
                audio: true 
            });
            setWebcamStream(camStream);

            // 2. Get screen
            const sStream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: 'always', displaySurface: 'monitor' },
                audio: false
            });
            setScreenStream(sStream);
            
            // Listen for user stopping screen share via browser UI
            sStream.getVideoTracks()[0].onended = () => {
                if (testStateRef.current === 'RECORDING') {
                    toast('Screen share stopped. Auto-submitting assessment...', { icon: '⚠️' });
                    submitTestRef.current();
                }
            };

            // 3. Start Recording
            startRecording(camStream, sStream);

        } catch (err) {
            console.error('Permission denied or error:', err);
            toast.error('You must allow both camera and screen recording to start the test.');
            
            // Cleanup just in case one stream succeeded but the other failed
            if (webcamStream) webcamStream.getTracks().forEach(t => t.stop());
            if (screenStream) screenStream.getTracks().forEach(t => t.stop());
            setWebcamStream(null);
            setScreenStream(null);
        }
    };

    // Start recording streams
    const startRecording = (camStream, sStream) => {
        // Initialize Screen Recorder
        screenChunksRef.current = [];
        screenRecorderRef.current = new MediaRecorder(sStream, { mimeType: 'video/webm' });
        screenRecorderRef.current.ondataavailable = e => {
            if (e.data.size > 0) screenChunksRef.current.push(e.data);
        };
        screenRecorderRef.current.start(1000); // collect chunk every second

        // Initialize Webcam Recorder
        webcamChunksRef.current = [];
        webcamRecorderRef.current = new MediaRecorder(camStream, { mimeType: 'video/webm' });
        webcamRecorderRef.current.ondataavailable = e => {
            if (e.data.size > 0) webcamChunksRef.current.push(e.data);
        };
        webcamRecorderRef.current.start(1000);

        setTestState('RECORDING');
        toast.success(`Assessment started! You have ${task.timeLimitMinutes} minutes.`);
    };

    // Submit the dual-recordings
    const submitTest = async () => {
        if (testStateRef.current === 'SUBMITTING') return; // Prevent double submission
        setTestState('SUBMITTING');

        // Stop MediaRecorders safely
        const stopRecorder = (recorderRef, chunksRef) => new Promise((resolve) => {
            if (!recorderRef.current || recorderRef.current.state === 'inactive') return resolve(null);
            recorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                resolve(blob);
            };
            recorderRef.current.stop();
        });

        const [screenBlob, webcamBlob] = await Promise.all([
            stopRecorder(screenRecorderRef, screenChunksRef),
            stopRecorder(webcamRecorderRef, webcamChunksRef)
        ]);

        // Stop all tracks
        if (webcamStream) webcamStream.getTracks().forEach(t => t.stop());
        if (screenStream) screenStream.getTracks().forEach(t => t.stop());
        setWebcamStream(null);
        setScreenStream(null);

        if (!screenBlob) {
            toast.error('Error generating screen recording. Please try again.');
            setTestState('PRE_TEST');
            return;
        }

        const formData = new FormData();
        formData.append('screenVideo', screenBlob, 'screen.webm');
        if (webcamBlob) formData.append('webcamVideo', webcamBlob, 'webcam.webm');
        formData.append('confidenceValue', String(confidenceValue));

        try {
            toast.loading('Analyzing your submission... This takes ~1-3 minutes.', { id: 'analyze' });
            await submitTaskTest(task._id, formData);
            toast.success('Analysis complete!', { id: 'analyze' });
            navigate('/dashboard'); // Go back to dashboard to see results
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission failed. Please check your network and try again.', { id: 'analyze', duration: 5000 });
            setTestState('PRE_TEST'); // allow retry
        }
    };

    // Keep ref updated
    useEffect(() => {
        submitTestRef.current = submitTest;
    }, [submitTest]);

    const cancelTest = () => {
        if (window.confirm('Are you sure you want to cancel? This attempt will not be saved.')) {
            if (webcamStream) webcamStream.getTracks().forEach(t => t.stop());
            if (screenStream) screenStream.getTracks().forEach(t => t.stop());
            navigate('/tasks');
        }
    };

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading secure environment...</p>
        </div>
    );

    if (!task) return null; // Let the useEffect handle the redirect

    return (
        <div className="test-environment">
            {testState === 'PRE_TEST' && (
                <div className="pre-test-container">
                    <div className="test-wrapper">
                        <Link to="/tasks" className="back-link">
                            <ArrowLeft size={16} /> Back to List
                        </Link>

                        <div className="card-glass pre-test-card">
                        <div className="post-header" style={{ marginBottom: '2rem' }}>
                            <span className="skill-tag">{task.skillName}</span>
                            <h1 style={{ marginTop: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{task.title}</h1>
                            <p style={{ color: 'var(--text-muted)' }}>Created by {task.employerName}</p>
                        </div>

                        <div className="card instructions-card">
                            <h3>Task Instructions</h3>
                            <p className="task-desc">{task.description}</p>
                            
                            {task.questions?.length > 0 && (
                                <>
                                    <h3>Questions / Requirements</h3>
                                    <ul className="task-questions">
                                        {task.questions.map((q, i) => (
                                            <li key={i}>{q}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>

                        <ConfidenceSlider value={confidenceValue} onChange={setConfidenceValue} />

                        <div className="proctoring-notice">
                            <h3>
                                <ShieldAlert size={18} /> Proctored Session Requirements
                            </h3>
                            <ul className="pre-test-checklist">
                                <li><strong>Time Limit:</strong> {task.timeLimitMinutes} minutes</li>
                                <li><strong>Screen Recording:</strong> Ensure your entire screen is shared to capture your work in external tools (e.g., VS Code).</li>
                                <li><strong>Webcam Monitoring:</strong> AI will analyze eye movement, distractions, and presence to calculate a Suspicion Score.</li>
                                <li><strong>Audio:</strong> Background noise and communication will be monitored.</li>
                                <li><strong>Difficulty:</strong> Set to <strong style={{ color: getZone(confidenceValue).color }}>{getZone(confidenceValue).difficulty}</strong> based on your confidence level.</li>
                            </ul>
                        </div>

                            <div className="pre-test-actions">
                                <p>You will be prompted to allow camera and screen recording.</p>
                                <button className="btn btn-primary" onClick={handleStartAssessment}>
                                    <Camera size={18} /> Start Assessment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {testState === 'RECORDING' && (
                <div className="active-test-container">
                    <div className="test-wrapper">
                        <div className="active-test-header">
                            <div>
                                <span className="skill-tag">{task.skillName}</span>
                                <h1>{task.title}</h1>
                            </div>
                        </div>

                        <div className="active-test-content">
                            <div className="card instructions-card">
                                <h3>Instructions</h3>
                                <p className="task-desc">{task.description}</p>
                                
                                {task.questions?.length > 0 && (
                                    <>
                                        <h3>Tasks to Complete</h3>
                                        <ol className="task-questions">
                                            {task.questions.map((q, i) => (
                                                <li key={i}>{q}</li>
                                            ))}
                                        </ol>
                                    </>
                                )}
                            </div>

                            <div className="recording-status-box">
                                <p>You may now switch to your IDE (e.g., VS Code) or terminal to complete the work.</p>
                                <p><strong>Screen and webcam recording is active in the background.</strong> You can see your recording status below.</p>
                            </div>
                        </div>
                    </div>

                    <TestTaskbar 
                        skillName={task.skillName}
                        timeLimitMinutes={task.timeLimitMinutes}
                        isRecording={true}
                        hasWebcam={!!webcamStream}
                        hasScreen={!!screenStream}
                        onSubmit={submitTest}
                        onCancel={cancelTest}
                        webcamStream={webcamStream}
                        screenStream={screenStream}
                    />
                </div>
            )}

            {testState === 'SUBMITTING' && (
                <div className="submitting-container">
                    <div className="spinner processing-spinner"></div>
                    <h2>Analyzing your submission...</h2>
                    <p className="processing-text">
                        SkillBuster Proctor and Gemini Vision are reviewing your screen footage for technical accuracy and your webcam footage for behavioral integrity.
                    </p>
                    <div className="processing-warning">
                        <ShieldAlert size={18} />
                        <span>Do not close this page. This process takes 1-3 minutes.</span>
                    </div>
                </div>
            )}
        </div>
    );
}
