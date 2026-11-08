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
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('The server returned an unexpected response. If the site was idle, wait a minute and try again.');
      }
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <h1>Find out what your resume is missing for the job</h1>
        <p>
          Attach your resume, add the job posting, and get the missing keywords
          plus rewrites for your bullets.
        </p>
      </header>

      <section className="workspace">
        <div className="upload">
          <p>Attach your resume as a PDF</p>
          <input
            className="file-input"
            type="file"
            accept="application/pdf"
            onChange={(e) => setResumeFile(e.target.files[0])}
          />
        </div>

        <div className="sheet">
          <label className="sheet-title" htmlFor="job-url">Job posting</label>
          <input
            id="job-url"
            type="url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            placeholder="Paste a link to the posting"
          />
          <textarea
            value={jobPosting}
            onChange={(e) => setJobPosting(e.target.value)}
            placeholder="Or paste the posting text here if the link doesn't work"
          />
        </div>
      </section>

      <div className="actions">
        <button onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze resume'}
        </button>
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      {results && (
        <section className="results" aria-live="polite">
          <p className="results-summary">{results.summary}</p>

          <div>
            <h2>Keywords to add</h2>
            <ul className="keywords">
              {results.missing_keywords.map((keyword, i) => (
                <li key={i}>{keyword}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2>Suggested rewrites</h2>
            {results.bullet_suggestions.map((b, i) => (
              <div key={i} className="suggestion">
                <p className="before">{b.original}</p>
                <p className="after"><span>{b.improved}</span></p>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="footer">
        <span>Built by Albert Tedjo</span>
        <a href="https://github.com/ated194-eng/resume-analyzer-frontend">Frontend code</a>
        <a href="https://github.com/ated194-eng/resume-analyzer-backend">Backend code</a>
      </footer>
    </div>
  );
}

export default App;