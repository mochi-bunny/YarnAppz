'use client'
import { useState } from 'react';

export default function Home() {
  const [jobTitle, setJobTitle] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ content: jobTitle }]),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      if (typeof data !== 'object') {
        throw new Error('Unexpected response format');
      }

      setSummary(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Job Description Finder</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Enter job title"
          style={{ padding: '10px', width: '300px', marginRight: '10px' }}
          required
        />
        <button type="submit" style={{ padding: '10px 20px' }}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <div>
        {summary ? (
          <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd' }}>
            <h2>{summary.job_title}</h2>
            <p><strong>Description:</strong> {summary.job_description}</p>
            <p><strong>Qualifications:</strong> {summary.qualification}</p>
            <p><strong>Experience:</strong> {summary.experience}</p>
            <p><strong>Salary Range:</strong> {summary.salary_range}</p>
            <p><strong>Skills:</strong> {summary.skills}</p>
            <p><strong>Responsibilities:</strong> {summary.responsibilities}</p>
          </div>
        ) : (
          !loading && <p>No job descriptions found.</p>
        )}
      </div>
    </main>
  );
}
