/**
 * Fake Authentication Context (Demo Only)
 * 
 * Shows how auth-gated tools would work in a real application.
 * NO REAL SECURITY - for demonstration purposes only.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

interface FakeAuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  login: (username: string) => void;
  logout: () => void;
}

const FakeAuthContext = createContext<FakeAuthContextType>({
  isLoggedIn: false,
  username: null,
  login: () => {},
  logout: () => {},
});

export function FakeAuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  // Load from localStorage on mount (persistence for demo)
  useEffect(() => {
    const stored = localStorage.getItem('demo-auth');
    if (stored) {
      const data = JSON.parse(stored);
      setIsLoggedIn(data.isLoggedIn);
      setUsername(data.username);
    }
  }, []);

  const login = (user: string) => {
    setIsLoggedIn(true);
    setUsername(user);
    localStorage.setItem('demo-auth', JSON.stringify({ isLoggedIn: true, username: user }));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername(null);
    localStorage.removeItem('demo-auth');
  };

  return (
    <FakeAuthContext.Provider value={{ isLoggedIn, username, login, logout }}>
      {children}
    </FakeAuthContext.Provider>
  );
}

export function useFakeAuth() {
  return useContext(FakeAuthContext);
}

/**
 * Simple Login/Logout Button Component
 */
export function FakeAuthButton() {
  const { isLoggedIn, username, login, logout } = useFakeAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [inputUsername, setInputUsername] = useState('');

  const handleLogin = () => {
    if (inputUsername.trim()) {
      login(inputUsername.trim());
      setShowLoginPrompt(false);
      setInputUsername('');
    }
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">
          👤 {username}
        </span>
        <button
          data-tool-id="logout-button"
          onClick={logout}
          className="px-3 py-1 text-xs text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        data-tool-id="login-button"
        onClick={() => setShowLoginPrompt(true)}
        className="px-3 py-1 text-xs text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
      >
        Login (Demo)
      </button>

      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Demo Login</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter any username - no password needed (demo only)
            </p>
            <input
              type="text"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="demo_user"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLogin}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


