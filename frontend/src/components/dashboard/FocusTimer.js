import React, { useState, useEffect, useRef } from 'react';
import { 
  MdPlayArrow, 
  MdPause, 
  MdRefresh,
  MdSettings,
  MdClose
} from 'react-icons/md';
import { useDarkMode } from '../../contexts/DarkModeContext'; // Adjust the import path as needed
import '../../css/dashboard/FocusTimer.css';

const FocusTimer = () => {
  // Get darkMode from context
  const { darkMode } = useDarkMode();
  
  // State variables
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [focusTime, setFocusTime] = useState(25);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Refs
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  // Constants
  const circumference = 2 * Math.PI * 90; // r = 90 (size of circle)

  // Format time for display
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress for the ring
  const calculateProgress = () => {
    const progress = 1 - (timeLeft / totalTime);
    return circumference * progress;
  };

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // Handle timer completion
  const handleTimerComplete = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setSessions(prev => prev + 1);
    displayToast("Time's up! Great job focusing.");
    createConfetti();
    resetTimer();
  };

  // Toggle timer start/pause
  const toggleTimer = () => {
    if (isRunning) {
      clearInterval(timerRef.current);
    }
    setIsRunning(!isRunning);
  };

  // Reset timer
  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setTimeLeft(focusTime * 60);
  };

  // Apply settings
  const applySettings = () => {
    const newTime = focusTime * 60;
    setTimeLeft(newTime);
    setTotalTime(newTime);
    setShowSettings(false);
    displayToast('Settings applied successfully!');
  };

  // Display toast notification
  const displayToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Create confetti effect
  const createConfetti = () => {
    const colors = ['#4338ca', '#06b6d4', '#8b5cf6', '#3b82f6'];
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = darkMode ? 'confetti-dark' : 'confetti-light';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 1.5}s`;
      containerRef.current.appendChild(confetti);
      
      // Remove confetti after animation completes
      setTimeout(() => {
        confetti.remove();
      }, 3000);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`container ${darkMode ? 'darkMode' : ''}`}
    >
      {/* Header section */}
      <div className="header">
        <h1 className="title">Focus Timer</h1>
        <div className="sessionCount">
          {sessions}
        </div>
      </div>
      
      {/* Timer display */}
      <div className="timerDisplay">
        <div className="progressRing">
          <svg width="100%" height="100%" viewBox="0 0 200 200">
            <circle className="progressBg" cx="100" cy="100" r="90" fill="none" />
            <circle 
              className="progressFill" 
              cx="100" 
              cy="100" 
              r="90" 
              fill="none" 
              strokeDasharray={circumference} 
              strokeDashoffset={calculateProgress()} 
            />
          </svg>
          <div className="time">{formatTime(timeLeft)}</div>
          <div className={`statusIndicator ${isRunning ? 'pulseAnimation' : ''}`}></div>
        </div>
      </div>
      
      {/* Timer controls */}
      <div className="controls">
        <button 
          className="controlButton"
          onClick={resetTimer}
        >
          Reset
        </button>
        <button 
          className="controlButton playPauseButton"
          onClick={toggleTimer}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button 
          className="controlButton"
          onClick={() => setShowSettings(!showSettings)}
        >
          Settings
        </button>
      </div>
      
      {/* Settings panel */}
      {showSettings && (
        <div className="settingsPanel">
          <div className="settingGroup">
            <div className="settingHeader">
              <label htmlFor="focusTime">Focus Time (minutes)</label>
            </div>
            <input 
              type="number" 
              id="focusTime" 
              className="timeInput" 
              value={focusTime}
              onChange={(e) => setFocusTime(Math.max(1, Math.min(120, parseInt(e.target.value) || 1)))}
              min="1" 
              max="120" 
            />
          </div>
          
          <button 
            className="applyButton"
            onClick={applySettings}
          >
            Apply Settings
          </button>
        </div>
      )}
      
      {/* Toast notification */}
      {showToast && (
        <div className="toast">
          {toastMessage}
          <button 
            className="closeToast"
            onClick={() => setShowToast(false)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default FocusTimer;