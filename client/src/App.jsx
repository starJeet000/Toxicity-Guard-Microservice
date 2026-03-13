import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'clean', 'toxic', 'error'
  const [details, setDetails] = useState(null);

  useEffect(() => {
    // 1. If input is empty, reset the UI
    if (!inputText.trim()) {
      setStatus('idle');
      setDetails(null);
      return;
    }

    // 2. The API Call logic
    const validateText = async () => {
      setStatus('loading');
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';
        const response = await fetch(`${API_URL}/api/validate-comment`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment: inputText })
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
        console.error("API Error:", error);
        setStatus('error');
      }
    };

    // 3. Debounce: Wait 800ms after the last keystroke before firing
    const timeoutId = setTimeout(() => {
      validateText();
    }, 800);

    // 4. Cleanup: If the user types again before 800ms, cancel the previous timer
    return () => clearTimeout(timeoutId);
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
        {status === 'clean' && (
          <p className="clean-text">✅ Looks good! Confidence: {(details?.confidence * 100).toFixed(1)}%</p>
        )}
        {status === 'toxic' && (
          <p className="toxic-text">
            ⚠️ <strong>Blocked:</strong> Flagged for <em>{details?.reason}</em>.
            Confidence: {(details?.confidence * 100).toFixed(1)}%
          </p>
        )}
        {status === 'error' && <p className="toxic-text">❌ Error connecting to server.</p>}
      </div>
    </div>
  );
}

export default App;
