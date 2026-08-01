import { useState } from 'react';
import './App.css';

function App() {
  const [resume, setResume] = useState('');
  const [jobPosting, setJobPosting] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch('http://localhost:3001/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jobPosting })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>Resume Analyzer</h1>

      <div className="input-section">
        <label>
          Resume
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            rows={10}
            placeholder="Paste your resume text here..."
          />
        </label>

        <label>
          Job Posting
          <textarea
            value={jobPosting}
            onChange={(e) => setJobPosting(e.target.value)}
            rows={10}
            placeholder="Paste the job posting text here..."
          />
        </label>

        <button onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {results && (
        <div className="results">
          <h2>Missing Keywords</h2>
          <ul>
            {results.missing_keywords.map((keyword, i) => (
              <li key={i}>{keyword}</li>
            ))}
          </ul>

          <h2>Bullet Suggestions</h2>
          {results.bullet_suggestions.map((b, i) => (
            <div key={i} className="bullet-suggestion">
              <p><strong>Original:</strong> {b.original}</p>
              <p><strong>Improved:</strong> {b.improved}</p>
            </div>
          ))}

          <h2>Summary</h2>
          <p>{results.summary}</p>
        </div>
      )}
    </div>
  );
}

export default App;