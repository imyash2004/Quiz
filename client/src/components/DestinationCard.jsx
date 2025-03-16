import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useGame } from '../contexts/GameContext';
import Card from './Card';
import Button from './Button';

const DestinationCard = () => {
  const { 
    currentDestination, 
    options, 
    selectedOption, 
    isCorrect, 
    showAnswer, 
    selectAnswer, 
    nextQuestion,
    endGame,
    score,
    timer,
    timerRunning,
    timerBonus
  } = useGame();
  
  const [showAllClues, setShowAllClues] = useState(false);
  const [showCuisineClue, setShowCuisineClue] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  // Handle window resize for confetti
  React.useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Auto-advance for wrong answers
  React.useEffect(() => {
    let timer;
    if (showAnswer && !isCorrect) {
      timer = setTimeout(() => {
        nextQuestion();
      }, 3000); // 3 second delay to show the correct answer
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showAnswer, isCorrect, nextQuestion]);
  
  if (!currentDestination) {
    return (
      <Card className="max-w-2xl mx-auto mt-8 text-center">
        <p>Loading destination...</p>
      </Card>
    );
  }
  
  // Show only the first clue initially
  const visibleClues = showAllClues 
    ? currentDestination.clues 
    : [currentDestination.clues[0]];
  
  return (
    <Card className="max-w-2xl mx-auto mt-8">
      {isCorrect && showAnswer && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.15}
        />
      )}
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Guess the Destination</h2>
          <div className="flex items-center">
            <span className="mr-2 font-semibold">Score: {score}</span>
            <Button 
              variant="danger" 
              size="sm"
              onClick={endGame}
            >
              End Game
            </Button>
          </div>
        </div>
        
        {/* Timer display */}
        {!showAnswer && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Time Remaining:</span>
              <span 
                className={`font-bold ${
                  timer > 20 ? 'text-green-600' : 
                  timer > 10 ? 'text-yellow-600' : 
                  'text-red-600'
                }`}
              >
                {timer} seconds
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  timer > 20 ? 'bg-green-600' : 
                  timer > 10 ? 'bg-yellow-600' : 
                  'bg-red-600'
                }`}
                style={{ width: `${(timer / 30) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h3 className="font-semibold mb-2">Clues:</h3>
          <ul className="list-disc pl-5 space-y-2">
            {visibleClues.map((clue, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {clue}
              </motion.li>
            ))}
          </ul>
          
          <div className="flex mt-3 space-x-2">
            {!showAllClues && currentDestination.clues.length > 1 && !showAnswer && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAllClues(true)}
              >
                <span className="mr-1">🔍</span> More Clues
              </Button>
            )}
            
            {!showCuisineClue && !showAnswer && (
              <Button 
                variant="accent" 
                size="sm"
                onClick={() => setShowCuisineClue(true)}
              >
                <span className="mr-1">🍽️</span> Food Clue
              </Button>
            )}
            
            {showCuisineClue && !showAnswer && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCuisineClue(false)}
              >
                <span className="mr-1">❌</span> Hide Food Clue
              </Button>
            )}
          </div>
          
          {/* Cuisine clue */}
          {showCuisineClue && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 p-3 bg-yellow-50 rounded-lg"
            >
              <p className="font-semibold">
                <span className="text-yellow-600">🍽️ Local Cuisine:</span>{' '}
                {currentDestination.cultural_elements.cuisine.join(', ')}
              </p>
            </motion.div>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Select the correct destination:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options && options.length > 0 ? (
            options.map((option, index) => (
              <Button
                key={index}
                variant={
                  showAnswer
                    ? option === currentDestination.city
                      ? 'secondary'
                      : option === selectedOption && !isCorrect
                      ? 'danger'
                      : 'outline'
                    : 'outline'
                }
                className="justify-center text-center"
                onClick={() => selectAnswer(option)}
                disabled={showAnswer}
              >
                {option}
              </Button>
            ))
          ) : (
            <p className="col-span-2 text-center text-gray-500">Loading options...</p>
          )}
        </div>
      </div>
      
      {showAnswer && (
        <div className="mt-6">
          <div className={`p-4 rounded-lg mb-4 ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
            <h3 className="font-bold text-lg mb-2">
              {isCorrect ? (
                <span className="text-green-700">
                  <span className="emoji-pop inline-block mr-2">🎉</span> Correct!
                </span>
              ) : (
                <span className="text-red-700">
                  <span className="emoji-pop inline-block mr-2">😢</span> Incorrect!
                </span>
              )}
            </h3>
            
            {isCorrect ? (
              <div>
                <p className="mb-2">
                  <span className="font-semibold">Country:</span> {currentDestination.country}
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Fun Fact:</span> {currentDestination.fun_fact[0]}
                </p>
                
                {/* Time bonus display */}
                {timerBonus > 0 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-2 p-2 bg-blue-100 rounded-lg text-blue-800"
                  >
                    <p className="font-semibold">
                      <span className="emoji-pop inline-block mr-2">⏱️</span>
                      Speed Bonus: +{timerBonus} points!
                    </p>
                  </motion.div>
                )}
                
                {/* Emoji display */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">You earned:</p>
                  <span className="text-5xl emoji-pop inline-block">{currentDestination.emoji}</span>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-2">
                  <span className="font-semibold">The correct answer was:</span> {currentDestination.city}, {currentDestination.country}
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Fun Fact:</span> {currentDestination.fun_fact[0]}
                </p>
              </div>
            )}
          </div>
          
          {/* Cultural and Travel Info (shown only for correct answers) */}
          {isCorrect && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-2">Cultural Corner</h4>
                <p className="mb-2">
                  <span className="font-semibold">Local Greeting:</span> {currentDestination.cultural_elements.greeting}
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Local Phrase:</span> {currentDestination.cultural_elements.local_phrase}
                </p>
                <p>
                  <span className="font-semibold">Local Cuisine:</span>{' '}
                  {currentDestination.cultural_elements.cuisine.join(', ')}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-800 mb-2">Travel Tips</h4>
                <p className="mb-2">
                  <span className="font-semibold">Best Time to Visit:</span>{' '}
                  {currentDestination.travel_info.best_time_to_visit}
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Top Attractions:</span>{' '}
                  {currentDestination.travel_info.major_attractions.join(', ')}
                </p>
                <p>
                  <span className="font-semibold">Tip:</span>{' '}
                  {currentDestination.travel_info.travel_tips}
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Button onClick={nextQuestion} variant="primary" size="lg">
              Next Question
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DestinationCard;
