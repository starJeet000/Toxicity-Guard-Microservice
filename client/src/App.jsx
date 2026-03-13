import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'clean', 'toxic', 'error', 'waking'
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!inputText.trim()) {
      setStatus('idle');
      setDetails(null);
      return;
    }

    const validateText = async () => {
      setStatus('loading');

      // 1. Setup AbortController for a long timeout (90s for Render cold start)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      // 2. Alert user if it takes more than 5 seconds (Server is likely waking up)
      const wakingTimer = setTimeout(() => {
        setStatus((prev) => (prev === 'loading' ? 'waking' : prev));
      }, 5000);

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';

        const response = await fetch(`${API_URL}/api/validate-comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment: inputText }),
          signal: controller.signal
        });

        const data = await response.json();

        if (response.ok && data.approved) {
          setStatus('clean');
          setDetails(data);
        } else if (response.status === 403) {
          setStatus('toxic');
          setDetails(data);
        } else {
          setStatus('error');
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.error("Request timed out after 90 seconds.");
        } else {
          console.error("API Error:", error);
        }
        setStatus('error');
      } finally {
        clearTimeout(timeoutId);
        clearTimeout(wakingTimer);
      }
    };

    const debounceId = setTimeout(() => {
      validateText();
    }, 800);

    return () => clearTimeout(debounceId);
  }, [inputText]);

  return (
    <div className="dashboard-container">
      <h1>🛡️ Toxicity Guard</h1>
      <p>Type a comment below. The AI will analyze it in real-time.</p>

      <textarea
        className={`text-input ${status}`}
        placeholder="Type something here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        rows="5"
      />

      <div className="status-panel">
        {status === 'loading' && <p>🧠 AI is thinking...</p>}
        {status === 'waking' && <p>⏳ Server is waking up (this may take a minute on Render)...</p>}
        {status === 'error' && <p className="error-text">❌ Connection failed. Please try again in a moment.</p>}
        {status === 'clean' && (
          <p className="clean-text">✅ Looks good! Confidence: {(details?.confidence * 100).toFixed(1)}%</p>
        )}
        {status === 'toxic' && (
          <p className="toxic-text">
            ⚠️ <strong>Blocked:</strong> Flagged for <em>{details?.reason}</em>.
            Confidence: {(details?.confidence * 100).toFixed(1)}%
          </p>
        )}
      </div>
    </div>
  );
}

export default App;