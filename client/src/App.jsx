import { useState } from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import Header from './components/Header';
import UsernameForm from './components/UsernameForm';
import DestinationCard from './components/DestinationCard';
import Challenge from './components/Challenge';
import BonusQuestion from './components/BonusQuestion';
import './App.css';

// Main Game Component
const GameContent = () => {
  const { 
    isLoggedIn, 
    gameId, 
    startGame, 
    showBonusQuestion,
    gameOver,
    score,
    correctAnswers,
    totalQuestions
  } = useGame();
  
  const [showChallenge, setShowChallenge] = useState(false);
  
  // If not logged in, show username form
  if (!isLoggedIn) {
    return <UsernameForm />;
  }
  
  // If game over, show results and options
  if (gameOver) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6">Game Over!</h2>
        
        <div className="text-center mb-8">
          <p className="text-xl mb-2">Your final score: <span className="font-bold text-blue-600">{score} points</span></p>
          <p className="text-lg">You got {correctAnswers} out of {totalQuestions} questions correct!</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => startGame()}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Play Again
          </button>
          
          <button 
            onClick={() => setShowChallenge(true)}
            className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
          >
            Challenge a Friend
          </button>
        </div>
        
        {showChallenge && (
          <div className="mt-8">
            <Challenge />
          </div>
        )}
      </div>
    );
  }
  
  // If no game started, show start button
  if (!gameId) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <h2 className="text-2xl font-bold mb-6">Ready to test your geography knowledge?</h2>
        <p className="mb-8 text-gray-600">
          You'll be shown clues about famous destinations around the world.
          Can you guess which city they're describing?
        </p>
        <button 
          onClick={() => startGame()}
          className="bg-blue-600 text-white py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-colors"
        >
          Start Game
        </button>
      </div>
    );
  }
  
  // Show bonus question if available
  if (showBonusQuestion) {
    return <BonusQuestion />;
  }
  
  // Show the main game
  return <DestinationCard />;
};

// Main App Component
function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-50 pb-12">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <GameContent />
        </main>
      </div>
    </GameProvider>
  );
}

export default App;
