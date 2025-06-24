'use client'
import React, { useState } from 'react'

const Scan = () => {
    const [repoUrl, setRepoUrl] = useState('')
    const [yamlFiles, setYamlFiles] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setYamlFiles([])
        
        try {
            const res = await fetch('/api/scan-tool', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ repoUrl }),
            })
            
            if (!res.ok) {
                throw new Error(await res.text())
            }
            
            const data = await res.json()
            console.log('Fetched data:', data)
            // Fetch content for each YAML file
            const filesWithContent = await Promise.all(
                data.yaml_files.map(async (file) => {
                    const contentRes = await fetch(file.download_url)
                    const content = await contentRes.text()
                    return { ...file, content }
                })
            )
            setYamlFiles(filesWithContent)
        } catch (err) {
            console.error('Error:', err)
            setError(err.message || 'Failed to fetch repository')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">Fetch YAML filed from GitHub Repo</h1>
            
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="Enter GitHub repo URL (e.g., https://github.com/owner/repo)"
                        className="flex-1 p-2 border rounded"
                        required
                    />
                    <button 
                        type="submit" 
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Scanning...' : 'Scan Repo'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                    <p>{error}</p>
                </div>
            )}

            {yamlFiles.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-purple-700">
                        Found {yamlFiles.length} YAML file{yamlFiles.length !== 1 ? 's' : ''}
                    </h2>
                    {yamlFiles.map((file) => (
                        <div key={file.path} className="border border-purple-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="bg-purple-100 px-4 py-3 border-b border-purple-200">
                                <h3 className="font-mono text-sm text-purple-800">{file.path}</h3>
                            </div>
                            <pre className="p-4 bg-purple-50 overflow-x-auto text-sm text-purple-900">
                                {file.content}
                            </pre>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Scan