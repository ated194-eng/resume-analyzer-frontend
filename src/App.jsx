import { useState } from 'react';
import './App.css';

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobPosting, setJobPosting] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobUrl, setJobUrl] = useState('');

  const handleAnalyze = async () => {
    if (!resumeFile) {
    setError('Please attach your resume as a PDF');
    return;
    }
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      if (jobPosting.trim()) {
        formData.append('jobPosting', jobPosting);
      } else if (jobUrl.trim()) {
        formData.append('jobUrl', jobUrl);
      }

      const res = await fetch('https://resume-analyzer-backend-sy6a.onrender.com/analyze', {
        method: 'POST',
        body: formData
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
        <div className="textarea-row">
          <label>
            Resume (PDF)
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setResumeFile(e.target.files[0])}
            />
          </label>

          <label>
            Job Posting Link
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://..."
            />
          </label>
          <p>Or paste the text below if the link doesn't work</p>
          <label>
            Job Posting
            <textarea
              value={jobPosting}
              onChange={(e) => setJobPosting(e.target.value)}
              rows={16}
              placeholder="Paste the job posting text here..."
            />
          </label>
        </div>

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