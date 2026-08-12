import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ initialMinutes = 5, onExpire }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }
    const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, onExpire]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ textAlign: 'center', margin: '15px 0', color: '#c62828', fontWeight: 'bold' }}>
      Time Remaining to Reset: {formatTime(secondsLeft)}
    </div>
  );
};

export default CountdownTimer;