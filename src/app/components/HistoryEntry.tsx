import React, { useState } from 'react';
import { HistoryEntry as HistoryEntryType } from '../types';

interface Props {
  entry: HistoryEntryType;
}

const HistoryEntry: React.FC<Props> = ({ entry }) => {
  const [expanded, setExpanded] = useState(false);

  const bodyTextPreview = entry.details.body_text.split('\n').slice(0, 3).join('\n');

  return (
    <div className="bg-gray-700 p-4 rounded-md mb-4 text-gray-100">
      <div className="text-sm text-purple-300 mb-1">Depth: {entry.depth}</div>
      <div className="text-lg font-semibold text-white">{entry.details.title}</div>
      <div className="text-sm text-gray-300 mb-2">{entry.details.url}</div>

      <div className="mb-2">
        <span className="font-semibold">Summary:</span>
        <p className="text-gray-200">{entry.summary}</p>
      </div>

      <div className="mb-2">
        <span className="font-semibold">Page Text:</span>
        <pre className="whitespace-pre-wrap text-gray-300 text-sm max-h-96 overflow-auto resize-y p-2 bg-gray-800 rounded-md border border-gray-700 mt-1 mb-1">
          {expanded ? entry.details.body_text : bodyTextPreview + '...'}
        </pre>
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-blue-400 hover:underline text-sm"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      </div>

      <div className="mb-2">
        <span className="font-semibold">Actions:</span>
        <ul className="list-disc list-inside text-gray-200 text-sm">
          {entry.actions.map((action, idx) => (
            <li key={idx}>
              <strong>{action.action}</strong> <em>{action.target}</em> – {action.reason}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HistoryEntry;
