'use client'
import React, { useEffect, useState } from 'react'

const Todos = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/todos', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                
                const result = await res.json();
                setData(result);
            } catch (err) {
                console.error('Error fetching scan data:', err);
                setError('Failed to fetch scan data');
            }
        };
        
        fetchData();
    }, []);

    return (
        <div>
            {error && <p>Error: {error}</p>}
            {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
        </div>
    )
}

export default Todos;