import React, { useState } from 'react';

interface CodeBlockProps {
  children: string;
  language?: string;
  title?: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ 
  children, 
  language = 'typescript', 
  title,
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <span className="text-sm text-gray-300 font-medium">{title}</span>
          <span className="text-xs text-gray-500 uppercase">{language}</span>
        </div>
      )}
      
      <div className="relative">
        <button
          onClick={copyToClipboard}
          className="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors z-10"
          title="Copy to clipboard"
        >
          {copied ? (
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
        
        <pre className="p-4 pr-16 text-sm text-gray-300 overflow-x-auto">
          <code className={`language-${language}`}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
};

// Inline code component
interface InlineCodeProps {
  children: string;
  copyable?: boolean;
}

export const InlineCode: React.FC<InlineCodeProps> = ({ children, copyable = false }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (!copyable) return;
    
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <span 
      className={`bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono ${
        copyable ? 'cursor-pointer hover:bg-gray-200 transition-colors' : ''
      }`}
      onClick={copyable ? copyToClipboard : undefined}
      title={copyable ? (copied ? 'Copied!' : 'Click to copy') : undefined}
    >
      {children}
      {copyable && copied && (
        <span className="ml-1 text-green-600">✓</span>
      )}
    </span>
  );
};
