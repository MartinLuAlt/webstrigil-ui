"use client";
import React, { useState } from 'react';
import axios from 'axios';
import HistoryEntry from './components/HistoryEntry';

const examples = [{
  "start_url": "https://admissions.berkeley.edu/",
  "user_instruction": "What are the application deadlines for UC Berkeley?",
  "max_depth": 1,
  "example_name": "UC Berkeley admission date",
}, {
  "start_url": "https://www.usgs.gov/centers/national-minerals-information-center",
  "user_instruction": "What is the current cost of copper?",
  "max_depth": 1,
  "example_name": "USGS copper cost",
}, {
  "start_url": "https://tradingeconomics.com/",
  "user_instruction": "What is the current cost of rubber?",
  "max_depth": 2,
  "example_name": "Rubber commodity cost",
}]

const WebStrigilPage = () => {
  const [url, setUrl] = useState(examples[0].start_url);
  const [prompt, setPrompt] = useState(examples[0].user_instruction);
  const [depth, setDepth] = useState(examples[0].max_depth);
  const [results, setResults] = useState<any>(null);

  const BACKEND_URL = "http://strigil-public-load-balancer-1010299699.us-east-2.elb.amazonaws.com";
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log("Making call")
      const response = await axios.post(`${BACKEND_URL}/crawl`, {
        start_url: url,
        user_instruction: prompt,
        max_depth: depth,
      });
      console.log('Crawl Results:', response.data);
      setResults(response.data); // store in state if needed
    } catch (error) {
      console.error('Error running crawl:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">WebStrigil Crawler</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        Example inputs: 
        {examples.map((example, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setUrl(example.start_url);
              setPrompt(example.user_instruction);
              setDepth(example.max_depth);
            }}
            className="bg-gray-700 hover:bg-gray-600 text-sm text-white px-3 py-1 rounded shadow-sm border border-gray-500 border-r-2"
          >
            {example.example_name}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-200">
              Starting URL
              {/* <span className="ml-1 cursor-pointer" title="Enter the URL to start crawling.">?</span> */}
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 block w-full bg-gray-800 border p-1 border-blue rounded-md shadow-sm focus:ring-purple-300 focus:border-purple-200 sm:text-sm"
              required
            />
          </div>
          <div className="w-1/5">
            <label className="block text-sm font-medium text-gray-200">
              Crawl Depth
              {/* <span className="ml-1 cursor-pointer" title="Set the maximum depth for crawling.">?</span> */}
            </label>
            <input
              type="number"
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
              onBlur={(e) => {
                let value = Number(e.target.value)
                if(value < 0) value = 0;
                if(value > 6) value = 6;
                setDepth(value)
              }}
              className="mt-1 block w-full border p-1 bg-gray-800 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              min="1"
              max="6"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200">
            User Prompt
            {/* <span className="ml-1 cursor-pointer" title="Provide instructions for the AI agent.">?</span> */}
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-1 block w-full  border p-1 rounded-md shadow-sm sm:text-sm focus:outline-0"
            required
          />
        </div>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400"
        >
          Run Crawl
        </button>
      </form>
      {isLoading}
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-3 text-white">Results</h2>

        <div className="bg-gray-500 p-1.5 rounded-md">
          {isLoading ? (
            <p>Loading...</p>
          ) : results ? (
            <>
              {results.history?.map((entry: any, index: number) => (
                <HistoryEntry key={index} entry={entry} />
              ))}
            </>
          ) : (
            <p>No results yet.</p>
          )}
        </div>

        <button
          className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
          disabled={!results}
          onClick={() => {
            const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'crawl_results.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          Download JSON
        </button>
      </div>
    </div>
  );
};

export default WebStrigilPage;
