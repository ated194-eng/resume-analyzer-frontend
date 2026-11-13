import { useState } from 'react';
import './App.css';

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobPosting, setJobPosting] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobUrl, setJobUrl] = useState('');

  const handleGenerate = async () => {
    if (!resumeFile) {
      setError('Please attach your resume as a PDF');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      if (jobPosting.trim()) {
        formData.append('jobPosting', jobPosting);
      } else if (jobUrl.trim()) {
        formData.append('jobUrl', jobUrl);
      }

      const res = await fetch('https://resume-analyzer-backend-sy6a.onrender.com/tailor', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = 'Could not generate the resume.';
        try { msg = JSON.parse(text).error || msg; } catch {}
        throw new Error(msg);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tailored-resume.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <h1>Get a version of your resume tailored to the job</h1>
        <p>
          Attach your resume and add the job posting. You'll get a one-page PDF
          reworded for that role, using only what's already in your resume.
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
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Building your resume...' : 'Generate tailored resume'}
        </button>
        {loading && (
          <p className="status">This usually takes 15 to 30 seconds. The first request after a quiet period can take longer.</p>
        )}
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      <footer className="footer">
        <span>Built by Albert Tedjo</span>
        <a href="https://github.com/ated194-eng/resume-analyzer-frontend">Frontend code</a>
        <a href="https://github.com/ated194-eng/resume-analyzer-backend">Backend code</a>
      </footer>
    </div>
  );
}

export default App;