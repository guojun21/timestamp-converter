import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const TIMEZONES = [
  { value: 'UTC', label: 'UTC', offset: 0 },
  { value: 'Asia/Shanghai', label: 'UTC+8', offset: 8 },
  { value: 'Asia/Tokyo', label: 'UTC+9', offset: 9 },
  { value: 'America/New_York', label: 'UTC-5', offset: -5 },
  { value: 'America/Los_Angeles', label: 'UTC-8', offset: -8 },
  { value: 'Europe/London', label: 'UTC+0', offset: 0 },
  { value: 'Europe/Paris', label: 'UTC+1', offset: 1 },
];

function App() {
  const [isRunning, setIsRunning] = useState(true);
  const [timezone, setTimezone] = useState('Asia/Shanghai');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [second, setSecond] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef(null);
  
  // 输入框 refs
  const yearRef = useRef(null);
  const monthRef = useRef(null);
  const dayRef = useRef(null);
  const hourRef = useRef(null);
  const minuteRef = useRef(null);
  const secondRef = useRef(null);

  // 获取当前时区的时间
  const getCurrentTimeInTimezone = (tz) => {
    const now = new Date();
    const options = {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    const formatter = new Intl.DateTimeFormat('zh-CN', options);
    const parts = formatter.formatToParts(now);
    
    const getPart = (type) => parts.find(p => p.type === type)?.value || '';
    
    return {
      year: getPart('year'),
      month: getPart('month'),
      day: getPart('day'),
      hour: getPart('hour'),
      minute: getPart('minute'),
      second: getPart('second'),
    };
  };

  // 计算时间戳
  const calculateTimestamp = () => {
    const y = parseInt(year) || 0;
    const m = parseInt(month) || 1;
    const d = parseInt(day) || 1;
    const h = parseInt(hour) || 0;
    const min = parseInt(minute) || 0;
    const s = parseInt(second) || 0;

    if (y < 1970 || y > 2100) return '';

    // 获取时区偏移
    const tz = TIMEZONES.find(t => t.value === timezone);
    const offsetHours = tz ? tz.offset : 0;

    // 创建 UTC 时间
    const utcDate = new Date(Date.UTC(y, m - 1, d, h - offsetHours, min, s));
    return Math.floor(utcDate.getTime() / 1000).toString();
  };

  // 实时更新时间
  useEffect(() => {
    if (isRunning) {
      const updateTime = () => {
        const time = getCurrentTimeInTimezone(timezone);
        setYear(time.year);
        setMonth(time.month);
        setDay(time.day);
        setHour(time.hour);
        setMinute(time.minute);
        setSecond(time.second);
      };
      
      updateTime();
      intervalRef.current = setInterval(updateTime, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timezone]);

  // 更新时间戳
  useEffect(() => {
    setTimestamp(calculateTimestamp());
  }, [year, month, day, hour, minute, second, timezone]);

  // 切换运行状态
  const toggleRunning = () => {
    setIsRunning(!isRunning);
  };

  // 复制时间戳
  const copyTimestamp = async () => {
    if (timestamp) {
      await navigator.clipboard.writeText(timestamp);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };


  return (
    <div className="container">
      <div className="header">
        <span className="title">TIMESTAMP</span>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="timezone-select"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      <div className="datetime-section">
        <div className="date-row">
          <input
            ref={yearRef}
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))}
            placeholder="YYYY"
            disabled={isRunning}
            style={{ width: '60px' }}
            className="time-input"
          />
          <span className="separator">/</span>
          <input
            ref={monthRef}
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value.replace(/\D/g, ''))}
            placeholder="MM"
            disabled={isRunning}
            style={{ width: '40px' }}
            className="time-input"
          />
          <span className="separator">/</span>
          <input
            ref={dayRef}
            type="text"
            value={day}
            onChange={(e) => setDay(e.target.value.replace(/\D/g, ''))}
            placeholder="DD"
            disabled={isRunning}
            style={{ width: '40px' }}
            className="time-input"
          />
        </div>
        
        <div className="time-row">
          <input
            ref={hourRef}
            type="text"
            value={hour}
            onChange={(e) => setHour(e.target.value.replace(/\D/g, ''))}
            placeholder="HH"
            disabled={isRunning}
            style={{ width: '40px' }}
            className="time-input"
          />
          <span className="separator">:</span>
          <input
            ref={minuteRef}
            type="text"
            value={minute}
            onChange={(e) => setMinute(e.target.value.replace(/\D/g, ''))}
            placeholder="mm"
            disabled={isRunning}
            style={{ width: '40px' }}
            className="time-input"
          />
          <span className="separator">:</span>
          <input
            ref={secondRef}
            type="text"
            value={second}
            onChange={(e) => setSecond(e.target.value.replace(/\D/g, ''))}
            placeholder="ss"
            disabled={isRunning}
            style={{ width: '40px' }}
            className="time-input"
          />
        </div>
      </div>

      <div className="timestamp-section">
        <div className="timestamp-display">
          <span className="timestamp-label">UNIX</span>
          <span className="timestamp-value">{timestamp || '—'}</span>
        </div>
        <button
          className={`copy-btn ${copied ? 'copied' : ''}`}
          onClick={copyTimestamp}
          disabled={!timestamp}
        >
          {copied ? '✓' : 'COPY'}
        </button>
      </div>

      <button
        className={`control-btn ${isRunning ? 'running' : 'stopped'}`}
        onClick={toggleRunning}
      >
        {isRunning ? 'STOP' : 'START'}
      </button>
    </div>
  );
}

export default App;

