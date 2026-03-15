import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitAssessment, getSkills } from '../api';
import toast from 'react-hot-toast';
import { Video, Square, Upload, Camera, Monitor, Sparkles } from 'lucide-react';
import AIAnalysisOverlay from '../components/AIAnalysisOverlay';
import ConfidenceSlider from '../components/ConfidenceSlider';

export default function RecordTask() {
    const [skills, setSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [recordedUrl, setRecordedUrl] = useState(null);
    const [timer, setTimer] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recordingMode, setRecordingMode] = useState('dual'); // 'screen', 'camera', or 'dual'
    const [confidenceValue, setConfidenceValue] = useState(50);

    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const cameraStreamRef = useRef(null);
    const videoRef = useRef(null);
    const previewRef = useRef(null);
    const cameraPreviewRef = useRef(null);
    const canvasRef = useRef(null);
    const timerRef = useRef(null);
    const animationFrameRef = useRef(null);
    const chunksRef = useRef([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const { data } = await getSkills();
                setSkills(data);
                if (data.length > 0) {
                    setSelectedSkill(data[0].name);
                    setSelectedIndustry(data[0].industry);
                }
            } catch (err) {
                console.error('Failed to fetch skills:', err);
            }
        };
        fetchSkills();

        return () => {
            stopStream();
            if (timerRef.current) clearInterval(timerRef.current);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    const stopStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (cameraStreamRef.current) {
            cameraStreamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    const startRecording = async () => {
        let isActuallyRecording = true;
        try {
            chunksRef.current = [];
            let stream;

            if (recordingMode === 'screen') {
                const displayStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { mediaSource: 'screen' },
                    audio: true
                });
                try {
                    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const tracks = [...displayStream.getTracks(), ...audioStream.getAudioTracks()];
                    stream = new MediaStream(tracks);
                } catch {
                    stream = displayStream;
                }
            } else if (recordingMode === 'camera') {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: 1280, height: 720 },
                    audio: true
                });
            } else if (recordingMode === 'dual') {
                // Dual mode: Screen + Camera PiP
                const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

                screenStreamRef.current = displayStream;
                cameraStreamRef.current = cameraStream;

                // Create hidden video elements for internal processing
                const vScreen = document.createElement('video');
                vScreen.srcObject = displayStream;
                await vScreen.play();

                const vCamera = document.createElement('video');
                vCamera.srcObject = cameraStream;
                await vCamera.play();

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 1280;
                canvas.height = 720;

                const draw = () => {
                    if (!isActuallyRecording) return;
                    
                    // Draw Screen (Base)
                    ctx.drawImage(vScreen, 0, 0, canvas.width, canvas.height);
                    
                    // Draw Camera (Overlay - PiP)
                    const camWidth = 320;
                    const camHeight = 180;
                    const padding = 20;
                    
                    // Circular/Rounded clipping for premium look
                    ctx.save();
                    ctx.beginPath();
                    ctx.roundRect(canvas.width - camWidth - padding, canvas.height - camHeight - padding, camWidth, camHeight, 15);
                    ctx.clip();
                    ctx.drawImage(vCamera, canvas.width - camWidth - padding, canvas.height - camHeight - padding, camWidth, camHeight);
                    ctx.restore();
                    
                    // Border for PiP
                    ctx.strokeStyle = '#6366f1';
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    // AI Sentinel Monitoring Indicator
                    ctx.font = 'bold 20px Inter, sans-serif';
                    ctx.fillStyle = '#10b981';
                    ctx.fillText('● AI SENTINEL ACTIVE — MONITORING SCREEN & CAMERA', 40, 50);
                    
                    ctx.font = '14px Inter, sans-serif';
                    ctx.fillStyle = 'rgba(255,255,255,0.7)';
                    ctx.fillText('SkillBuster Forensic Integrity Protocol v2.5', 40, 75);

                    animationFrameRef.current = requestAnimationFrame(draw);
                };
                draw();

                const canvasStream = canvas.captureStream(30);
                // Combine canvas video with camera audio
                const tracks = [...canvasStream.getVideoTracks(), ...cameraStream.getAudioTracks()];
                stream = new MediaStream(tracks);
                canvasRef.current = canvas;
            }

            streamRef.current = stream;
            if (previewRef.current) {
                previewRef.current.srcObject = stream;
                previewRef.current.play();
            }

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                    ? 'video/webm;codecs=vp9'
                    : 'video/webm',
                videoBitsPerSecond: 2500000 
            });

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                isActuallyRecording = false;
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                setRecordedBlob(blob);
                setRecordedUrl(URL.createObjectURL(blob));
                stopStream();
                if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(1000);
            setIsRecording(true);
            setTimer(0);

            timerRef.current = setInterval(() => {
                setTimer(prev => {
                    if (prev >= 600) { // Increased to 10 minutes for dual mode
                        stopRecording();
                        return 600;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (err) {
            console.error('Recording error:', err);
            stopStream();
            toast.error('Failed to access camera/screen. Please check permissions.');
        }
    };

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (timerRef.current) clearInterval(timerRef.current);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setIsRecording(false);
    }, []);

    const resetRecording = () => {
        setRecordedBlob(null);
        setRecordedUrl(null);
        setTimer(0);
        if (previewRef.current) previewRef.current.srcObject = null;
        stopStream();
    };

    const handleSubmit = async () => {
        if (!recordedBlob) {
            toast.error('Please record a video first');
            return;
        }
        if (!selectedSkill) {
            toast.error('Please select a skill');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('video', recordedBlob, 'skill-recording.webm');
        formData.append('skillName', selectedSkill);
        formData.append('industry', selectedIndustry);
        formData.append('confidenceValue', String(confidenceValue));

        try {
            const { data } = await submitAssessment(formData);
            toast.success('Assessment complete!');
            if (data.badgeId) {
                toast.success('🏆 Badge earned!', { duration: 5000 });
            }
            navigate(`/results/${data.assessment._id}`);
        } catch (err) {
            const errorData = err.response?.data;
            const errorMsg = errorData?.error || errorData?.message || 'Assessment failed.';

            if (errorData?.retryable) {
                toast.error(errorMsg, { duration: 8000 });
                toast('You can try again in a few moments.', { icon: '💡', duration: 5000 });
            } else {
                toast.error(errorMsg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleSkillChange = (e) => {
        const skillName = e.target.value;
        setSelectedSkill(skillName);
        const skill = skills.find(s => s.name === skillName);
        if (skill) setSelectedIndustry(skill.industry);
    };

    return (
        <div className="recorder-container" id="record-task-page">
            <div className="recorder-card">
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                    Record Your Skill
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Choose a skill, record your task, and let AI evaluate your abilities
                </p>

                {/* Skill Selection */}
                <div className="skill-selector">
                    <div className="form-group" style={{ margin: 0 }}>
                        <label htmlFor="skill-select">Skill Category</label>
                        <select
                            id="skill-select"
                            className="form-select"
                            value={selectedSkill}
                            onChange={handleSkillChange}
                        >
                            {skills.map((skill) => (
                                <option key={skill.name} value={skill.name}>{skill.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Recording Mode</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                className={`role-option ${recordingMode === 'dual' ? 'selected' : ''}`}
                                onClick={() => setRecordingMode('dual')}
                                style={{ padding: '10px', fontSize: '0.85rem' }}
                            >
                                <Sparkles size={16} /> Dual
                            </button>
                            <button
                                className={`role-option ${recordingMode === 'screen' ? 'selected' : ''}`}
                                onClick={() => setRecordingMode('screen')}
                                style={{ padding: '10px', fontSize: '0.85rem' }}
                            >
                                <Monitor size={16} /> Screen
                            </button>
                            <button
                                className={`role-option ${recordingMode === 'camera' ? 'selected' : ''}`}
                                onClick={() => setRecordingMode('camera')}
                                style={{ padding: '10px', fontSize: '0.85rem' }}
                            >
                                <Camera size={16} /> Camera
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <ConfidenceSlider value={confidenceValue} onChange={setConfidenceValue} />
                </div>

                {/* Video Preview */}
                <div className="video-preview" id="video-preview">
                    {recordedUrl ? (
                        <video ref={videoRef} src={recordedUrl} controls style={{ width: '100%', height: '100%' }} />
                    ) : isRecording ? (
                        <>
                            <video ref={previewRef} autoPlay muted style={{ width: '100%', height: '100%' }} />
                            <div className="recording-timer">
                                <div className="recording-dot"></div>
                                REC {formatTime(timer)} / 05:00
                            </div>
                        </>
                    ) : (
                        <div className="video-placeholder">
                            <div className="icon">
                                {recordingMode === 'dual' ? (
                                    <div style={{ position: 'relative' }}>
                                        <Monitor size={48} />
                                        <Camera size={24} style={{ position: 'absolute', bottom: -5, right: -5, background: 'var(--bg-card)', borderRadius: '4px', padding: '2px' }} />
                                    </div>
                                ) : recordingMode === 'screen' ? (
                                    <Monitor size={48} />
                                ) : (
                                    <Camera size={48} />
                                )}
                            </div>
                            <p>Click "Start Recording" to begin your skill demonstration</p>
                            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Maximum {recordingMode === 'dual' ? '10' : '5'} minutes allowed</p>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="recorder-controls">
                    {!isRecording && !recordedUrl && (
                        <button className="btn btn-primary" onClick={startRecording} id="start-recording-btn">
                            <Video size={18} /> Start Recording
                        </button>
                    )}
                    {isRecording && (
                        <button className="btn btn-danger" onClick={stopRecording} id="stop-recording-btn">
                            <Square size={18} /> Stop Recording
                        </button>
                    )}
                    {recordedUrl && !isSubmitting && (
                        <>
                            <button className="btn btn-secondary" onClick={resetRecording}>
                                <Video size={18} /> Re-record
                            </button>
                            <button className="btn btn-gold" onClick={handleSubmit} id="submit-assessment-btn">
                                <Upload size={18} /> Submit for Assessment
                            </button>
                        </>
                    )}
                </div>

                {/* AI Analysis Overlay */}
                <AIAnalysisOverlay visible={isSubmitting} />

                {/* Tips */}
                {!isSubmitting && (
                    <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'rgba(99,102,241,0.05)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.1)' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-accent)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sparkles size={14} /> Pro Tips for Best Results
                        </p>
                        <ul style={{ fontSize: '0.82rem', color: 'var(--text-muted)', paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                            <li>Use <b>Dual Mode</b> for best assessment — captures your screen and face simultaneously</li>
                            <li>Narrate what you're doing — Gemini considers verbal explanations</li>
                            <li>Show your debug process, not just the final result</li>
                            <li>Keep recording under 10 minutes for best analysis</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
