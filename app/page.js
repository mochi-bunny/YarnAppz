'use client';
import { useState } from 'react';

// Recursive component to render JSON data in a readable format
const RenderJson = ({ data }) => {
  if (typeof data === 'string' || typeof data === 'number') {
    return <p>{data}</p>;
  }

  if (Array.isArray(data)) {
    return (
      <ul>
        {data.map((item, index) => (
          <li key={index}>
            <RenderJson data={item} />
          </li>
        ))}
      </ul>
    );
  }

  if (typeof data === 'object' && data !== null) {
    return (
      <div style={{ marginLeft: '20px' }}>
        {Object.entries(data).map(([key, value], index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <strong>{key}:</strong>
            <RenderJson data={value} />
          </div>
        ))}
      </div>
    );
  }

  return null;
};

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
            <RenderJson data={summary} />
          </div>
        ) : (
          !loading && <p>No job descriptions found.</p>
        )}
      </div>
    </main>
  );
}

