import { useState, useEffect, useRef } from 'react';
import { Camera, Monitor, Clock, AlertTriangle, Send, X } from 'lucide-react';

export default function TestTaskbar({ 
    skillName, 
    timeLimitMinutes, 
    isRecording, 
    hasWebcam, 
    hasScreen, 
    onSubmit, 
    onCancel,
    webcamStream,
    screenStream
}) {
    const [timeLeft, setTimeLeft] = useState(timeLimitMinutes * 60);
    const [isWarning, setIsWarning] = useState(false);
    const [isCritical, setIsCritical] = useState(false);
    const webcamPreviewRef = useRef(null);
    const screenPreviewRef = useRef(null);

    useEffect(() => {
        if (webcamStream && webcamPreviewRef.current) {
            webcamPreviewRef.current.srcObject = webcamStream;
        }
    }, [webcamStream]);

    useEffect(() => {
        if (screenStream && screenPreviewRef.current) {
            screenPreviewRef.current.srcObject = screenStream;
        }
    }, [screenStream]);

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        onSubmit();
                        return 0;
                    }
                    const next = prev - 1;
                    setIsWarning(next <= 120); // 2 min warning
                    setIsCritical(next <= 60);  // 1 min critical
                    return next;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRecording, onSubmit]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const getTimerClass = () => {
        if (isCritical) return 'taskbar-timer taskbar-timer-critical';
        if (isWarning) return 'taskbar-timer taskbar-timer-warning';
        return 'taskbar-timer';
    };

    return (
        <div className="test-taskbar" id="test-taskbar">
            {/* Live Media Previews */}
            <div className="taskbar-previews-container">
                <div className="taskbar-preview-box">
                    <span className="preview-label">LIVE: Screen</span>
                    {screenStream ? (
                        <video ref={screenPreviewRef} autoPlay muted className="taskbar-preview-video" />
                    ) : (
                        <div className="taskbar-preview-placeholder">
                            <Monitor size={16} />
                        </div>
                    )}
                </div>
                <div className="taskbar-preview-box">
                    <span className="preview-label">LIVE: Camera</span>
                    {webcamStream ? (
                        <video ref={webcamPreviewRef} autoPlay muted className="taskbar-preview-video" />
                    ) : (
                        <div className="taskbar-preview-placeholder">
                            <Camera size={16} />
                        </div>
                    )}
                </div>
            </div>

            {/* Skill Name */}
            <div className="taskbar-skill">
                <span className="taskbar-skill-label">Skill</span>
                <span className="taskbar-skill-name">{skillName}</span>
            </div>

            {/* Recording Status */}
            <div className="taskbar-status">
                <div className={`taskbar-indicator ${hasScreen ? 'active' : ''}`}>
                    <Monitor size={14} />
                    <span>{hasScreen ? 'Screen' : 'No Screen'}</span>
                    {hasScreen && <div className="recording-dot-mini"></div>}
                </div>
                <div className={`taskbar-indicator ${hasWebcam ? 'active' : ''}`}>
                    <Camera size={14} />
                    <span>{hasWebcam ? 'Camera' : 'No Cam'}</span>
                    {hasWebcam && <div className="recording-dot-mini"></div>}
                </div>
            </div>

            {/* Timer */}
            <div className={getTimerClass()}>
                <Clock size={16} />
                <span className="taskbar-timer-display">{formatTime(timeLeft)}</span>
                {isWarning && (
                    <AlertTriangle size={14} className="taskbar-timer-warn-icon" />
                )}
            </div>

            {/* Actions */}
            <div className="taskbar-actions">
                <button className="taskbar-btn taskbar-btn-cancel" onClick={onCancel} title="Cancel Test">
                    <X size={16} />
                </button>
                <button className="taskbar-btn taskbar-btn-submit" onClick={onSubmit} title="Submit Now">
                    <Send size={16} />
                    <span>Submit</span>
                </button>
            </div>
        </div>
    );
}
