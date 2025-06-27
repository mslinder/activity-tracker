import React, { useState, useEffect, useRef } from 'react';

interface ExerciseTimerProps {
  duration: string; // e.g., "2:30" or "45"
  onComplete: () => void;
}

const ExerciseTimer: React.FC<ExerciseTimerProps> = ({ duration, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Parse duration string to seconds
  const parseDuration = (dur: string): number => {
    if (dur.includes(':')) {
      const [minutes, seconds] = dur.split(':').map(Number);
      return minutes * 60 + seconds;
    }
    return parseInt(dur);
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Play bell sound using Web Audio API
  const playBell = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Bell-like frequencies
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  // Initialize timer
  useEffect(() => {
    const initialTime = parseDuration(duration);
    setTimeLeft(initialTime);
  }, [duration]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            playBell();
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, onComplete]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setTimeLeft(parseDuration(duration));
  };

  const progress = timeLeft / parseDuration(duration);

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '12px',
      background: isCompleted ? '#f0f9ff' : '#fff',
      marginBottom: '8px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        {/* Timer Display */}
        <div style={{
          position: 'relative',
          width: '60px',
          height: '60px'
        }}>
          {/* Progress Ring */}
          <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="30"
              cy="30"
              r="25"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="4"
            />
            <circle
              cx="30"
              cy="30"
              r="25"
              fill="none"
              stroke={isCompleted ? '#10b981' : '#3b82f6'}
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 25}`}
              strokeDashoffset={`${2 * Math.PI * 25 * (1 - progress)}`}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          {/* Time Text */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: isCompleted ? '#10b981' : '#333'
          }}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Controls */}
        <div style={{
          display: 'flex',
          gap: '6px',
          flex: 1
        }}>
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={isCompleted && timeLeft === 0}
              style={{
                padding: '4px 8px',
                fontSize: '0.8rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '2px',
                cursor: 'pointer',
                opacity: (isCompleted && timeLeft === 0) ? 0.5 : 1
              }}
            >
              ▶️ Start
            </button>
          ) : (
            <button
              onClick={handlePause}
              style={{
                padding: '4px 8px',
                fontSize: '0.8rem',
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
            >
              ⏸️ Pause
            </button>
          )}
          
          <button
            onClick={handleReset}
            style={{
              padding: '4px 8px',
              fontSize: '0.8rem',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer'
            }}
          >
            🔄 Reset
          </button>
        </div>

        {/* Completion Status */}
        {isCompleted && (
          <div style={{
            fontSize: '0.8rem',
            color: '#10b981',
            fontWeight: 600
          }}>
            ✅ Done!
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseTimer;