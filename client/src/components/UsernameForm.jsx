import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import Button from './Button';
import Card from './Card';

const UsernameForm = () => {
  const { login } = useGame();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    if (username.length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }
    
    // Clear error and login
    setError('');
    login(username);
  };

  return (
    <Card className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Welcome to Globetrotter!</h2>
      <p className="text-gray-600 mb-6 text-center">
        Enter a username to start your journey around the world.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            id="username"
            className="input w-full"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
        
        <Button type="submit" variant="primary" fullWidth>
          Start Playing
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>No account needed! Just pick a username and start playing.</p>
      </div>
    </Card>
  );
};

export default UsernameForm;
