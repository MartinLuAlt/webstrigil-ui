"use client";
/* eslint-disable  @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import axios from 'axios';
import HistoryEntry from './components/HistoryEntry';
import { CrawlResponse, UiError } from './types';

const examples = [{
  "start_url": "https://admissions.berkeley.edu/",
  "user_instruction": "What are the application deadlines for UC Berkeley?",
  "max_depth": 1,
  "example_name": "UC Berkeley admission date",
}, {
  "start_url": "https://www.usgs.gov/centers/national-minerals-information-center",
  "user_instruction": "What is the current cost of copper?",
  "max_depth": 2,
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
  const [depth, setDepth] = useState<string|number>(examples[0].max_depth);
  const [results, setResults] = useState<any>(null);

  const BACKEND_URL = "http://strigil-public-load-balancer-1010299699.us-east-2.elb.amazonaws.com";
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<UiError | null>(null);



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults(null);
  
    try {
      const response = await axios.post<CrawlResponse>(
        `${BACKEND_URL}/crawl`,
        {
          start_url: url,
          user_instruction: prompt,
          max_depth: Number(depth),
        }
      );
  
      const data = response.data;
  
      if (!data.success) {
        setError({
          kind: 'api',
          message: data.message || 'The API returned an unsuccessful response.',
          errors: data.errors ?? undefined,
        });
        return;
      }
  
      setResults(data)
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        // 504 Gateway Timeout or other HTTP errors
        if (err.code === 'ECONNABORTED' || err.response?.status === 504) {
          setError({
            kind: 'network',
            message: 'Gateway Timeout (504). The server took too long to respond.',
          });
        } else if (err.response) {
          const message = err.response.data?.message || 'An error occurred while calling the API.';
          setError({
            kind: 'api',
            message,
            errors: err.response.data?.errors,
          });
        } else {
          setError({
            kind: 'network',
            message: 'Network error occurred. Please check your connection or try again later.',
          });
        }
      } else {
        setError({
          kind: 'unknown',
          message: 'An unexpected error occurred.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  
  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-1 text-white">
        WebStrigil Crawler – AI driven web crawler
      </h1>
      <p className="text-gray-400 text-sm mb-2">
        Crawl websites from a starting URL, leveraging LLMs to interact with the page and intelligently drill down through subpages to find info relevant to your prompt.
      </p>
      <ul className="text-gray-400 text-sm mb-4 space-y-1">
        <li>– See the full history of the crawl, including AI-generated page summaries and reasoning</li>
        <li>– Handles dynamic content and JavaScript-heavy pages</li>
      </ul>

      
      <div className="mb-4 flex flex-wrap gap-2 text-white">
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
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 block w-full bg-gray-800 text-white border border-gray-600 p-1 rounded-md shadow-sm focus:ring-purple-300 focus:border-purple-400 sm:text-sm"
              required
            />
          </div>
          <div className="w-1/5">
            <label className="block text-sm font-medium text-gray-200">
              Crawl Depth
            </label>
            <input
              type="number"
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
              onBlur={(e) => {
                let value = Number(e.target.value);
                if (value < 0) value = 0;
                if (value > 6) value = 6;
                setDepth(value);
              }}
              className="mt-1 block w-full bg-gray-800 text-white border border-gray-600 p-1 rounded-md shadow-sm focus:ring-purple-300 focus:border-purple-400 sm:text-sm"
              min="1"
              max="6"
            />
          </div>
        </div>
        <div>
        <label className="block text-sm font-medium text-gray-200">
          User Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="mt-1 block w-full bg-gray-800 text-white border border-gray-600 p-1 rounded-md shadow-sm sm:text-sm focus:ring-purple-300 focus:border-purple-400"
          required
        />
      </div>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 mb-5 mt-2"
        >
          Run Crawl
        </button>
      </form>
  
      {error && (
        <div className="mt-4 bg-red-700 text-white text-sm p-3 rounded border border-red-500 mb-2">
          <strong>Error:</strong> {error.message}
          {error.kind === 'api' && error.errors && (
            <ul className="mt-2 space-y-1 pl-5 text-red-200">
              {error.errors.map((e, i) => (
                <li key={i} className="flex justify-between items-start">
                  <span>{e.error_type}: {e.message}</span>
                  {e.details?.url && (
                    <span className="text-xs text-red-300 whitespace-nowrap ml-2">
                      {e.details.url}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
  
      <div className="bg-gray-500 p-1.5 rounded-md">
        {isLoading ? (
          <div className="flex justify-center items-center space-x-2">
            <div className="loader border-t-4 border-b-4 border-gray-300 rounded-full w-8 h-8 animate-spin"></div>
            <p className="text-white">Loading...</p>
          </div>
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
  );
  
};

export default WebStrigilPage;
