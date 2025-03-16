import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import Card from './Card';
import Button from './Button';

const BonusQuestion = () => {
  const {
    showBonusQuestion,
    bonusQuestion,
    bonusOptions,
    selectedBonusOption,
    isBonusCorrect,
    selectBonusAnswer,
    collectedEmojis,
    nextQuestion,
  } = useGame();

  if (!showBonusQuestion || !bonusQuestion) {
    return null;
  }

  // Get the last 5 emojis
  const lastFiveEmojis = collectedEmojis.slice(-5);

  return (
    <AnimatePresence>
      {showBonusQuestion && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <Card className="max-w-2xl w-full">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Bonus Question!</h2>
                <p className="text-gray-600">
                  This is special question for u!
                </p>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-2">Your collected emojis:</p>
                <div className="flex justify-center">
                  {lastFiveEmojis.map((emoji, index) => (
                    <motion.span
                      key={index}
                      className="text-4xl mx-2 bg-gray-100 p-2 rounded-lg shadow-sm"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {emoji}
                    </motion.span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-3">{bonusQuestion.question}</h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {bonusOptions.map((option, index) => (
                  <Button
                    key={index}
                    variant={
                      selectedBonusOption === null
                        ? 'outline'
                        : index === bonusQuestion.correct_answer
                        ? 'secondary'
                        : index === selectedBonusOption && !isBonusCorrect
                        ? 'danger'
                        : 'outline'
                    }
                    className="justify-center text-center"
                    onClick={() => selectBonusAnswer(index)}
                    disabled={selectedBonusOption !== null}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {selectedBonusOption !== null && (
                <div
                  className={`mt-6 p-4 rounded-lg ${
                    isBonusCorrect ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2">
                    {isBonusCorrect ? (
                      <span className="text-green-700">
                        <span className="emoji-pop inline-block mr-2">🎉</span> Correct! +200 points
                      </span>
                    ) : (
                      <span className="text-red-700">
                        <span className="emoji-pop inline-block mr-2">😢</span> Incorrect!
                      </span>
                    )}
                  </h3>
                  <p>{bonusQuestion.explanation}</p>
                  
                  <div className="mt-4 text-center">
                    <Button 
                      onClick={nextQuestion} 
                      variant="primary"
                    >
                      Next Question
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BonusQuestion;
