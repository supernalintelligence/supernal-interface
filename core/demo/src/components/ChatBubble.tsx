/**
 * Persistent Chat Bubble Component
 * 
 * Fixed position chat bubble in lower right corner that:
 * - Appears on every page
 * - Expands/collapses without blocking content
 * - Provides AI interface for tool execution
 */

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'ai' | 'system';
  timestamp: string;
}

interface ChatBubbleProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onClearChat?: () => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  messages, 
  onSendMessage, 
  onClearChat 
}) => {
  const [isExpanded, setIsExpanded] = useState(true); // Auto-open on load
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isExpanded) {
      scrollToBottom();
    }
  }, [messages, isExpanded]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Expanded Chat Panel */}
        {isExpanded && (
          <div className="mb-4 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50 rounded-t-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Demo Interface</h3>
                  <p className="text-xs text-gray-600">Simulates AI tool execution</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {onClearChat && (
                  <button
                    onClick={onClearChat}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Clear chat"
                    data-testid="clear-chat-button"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={handleToggle}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Minimize chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col">
                  <div className={`inline-block px-3 py-2 rounded-lg max-w-xs text-sm ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white ml-auto' 
                      : message.type === 'ai'
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800 text-xs'
                  }`}>
                    {message.text}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 px-1">
                    {typeof window !== 'undefined' ? new Date(message.timestamp).toLocaleTimeString() : ''}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Try: toggle notifications"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  data-testid="chat-input"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  data-testid="chat-send-button"
                >
                  Execute
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <strong>Demo:</strong> Commands execute @Tool methods and update widgets above
              </div>
            </form>
          </div>
        )}

        {/* Chat Bubble Button */}
        <button
          onClick={handleToggle}
          className={`w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${
            isExpanded ? 'rotate-180' : ''
          }`}
          data-testid="chat-bubble-toggle"
          title={isExpanded ? 'Minimize chat' : 'Open AI chat'}
        >
          {isExpanded ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </button>

        {/* Unread indicator */}
        {!isExpanded && messages.length > 0 && messages[messages.length - 1].type !== 'user' && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">!</span>
          </div>
        )}
      </div>
    </>
  );
};
