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
    <main style={{ paddingTop:'10rem',fontFamily: 'Arial, sans-serif', 
     display: 'flex', alignItems:'center', flexDirection:'column', whiteSpace: 'pre-wrap',
     background :`url(https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDZneW5la3Q4am9hcWMzb3RuM2c2bHgwaGxzaWI2c3p5ZmdtZGw2eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/FlodpfQUBSp20/giphy.webp)`,
    
     }}>
    
      <h1  style={{ padding: '20px'}}>Job Description Finder</h1>
      <h3  style={{ padding: '20px', fontSize:'15px'}}>Enter your desired career to obtain the latest trends within the industry.</h3>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
       
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Enter job title"
          style={{ padding: '20px', width: '50rem', border:'2px solid', borderColor: 'wheat',borderRadius: '10px'  }}
          required
        />  <p style={{padding:'10px'}}></p> 
         <div className='a'  style={{alignItems:'center', paddingLeft:'40%'}}>

        <button type="submit" style={{  backgroundColor:'grey',padding: '10px 30px' ,borderRadius: '10px'}}>
          {loading ? 'Loading...' : 'Search'}
        </button>

        </div>
        
      </form>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
   
        {summary ? (
          <div style={{ marginBottom: '20px', padding: '20px', width: '50rem', border: '1px solid #ddd' }}>
             < RenderJson data= {summary['Summary']} />
          </div>
        ) : (
          !loading && <p></p>
        )}
     
    </main>
  );
}

