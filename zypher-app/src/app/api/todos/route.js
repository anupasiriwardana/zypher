import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await fetch('http://127.0.0.1:8000/todos', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching scan data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch scan data' },
            { status: 500 }
        );
    }
}