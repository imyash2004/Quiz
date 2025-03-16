import { createContext, useContext, useState, useEffect } from "react";
import {
  getRandomDestination,
  createGame,
  recordCorrectAnswer,
  getBonusQuestion,
  authenticate,
  updateGame,
  getOrCreatePlayer,
} from "../lib/pocketbase";
// Keep sampleCities as fallback for development
import { sampleCities } from "../sampleData";
// Import OpenAI functions
import {
  generateDynamicClue,
  generateBonusQuestion,
  generateFunFact,
  rateLimitedCall,
} from "../lib/openai";

// Create the context
const GameContext = createContext();

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

// Game provider component
export const GameProvider = ({ children }) => {
  // Player state
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Game state
  const [gameId, setGameId] = useState(null);
  const [score, setScore] = useState(0);
  const [currentDestination, setCurrentDestination] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Timer state
  const [timer, setTimer] = useState(30); // 30-second default
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerBonus, setTimerBonus] = useState(0);

  // Emoji and bonus question state
  const [collectedEmojis, setCollectedEmojis] = useState([]);
  const [showBonusQuestion, setShowBonusQuestion] = useState(false);
  const [bonusQuestion, setBonusQuestion] = useState(null);
  const [bonusOptions, setBonusOptions] = useState([]);
  const [selectedBonusOption, setSelectedBonusOption] = useState(null);
  const [isBonusCorrect, setIsBonusCorrect] = useState(null);

  // Stats
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Login function
  const login = (name) => {
    setUsername(name);
    setIsLoggedIn(true);
    localStorage.setItem("globetrotter_username", name);
  };

  // Logout function
  const logout = () => {
    setUsername("");
    setIsLoggedIn(false);
    setGameId(null);
    setScore(0);
    setCollectedEmojis([]);
    setCorrectAnswers(0);
    setTotalQuestions(0);
    setGameOver(false);
    localStorage.removeItem("globetrotter_username");
  };

  // Helper function to get random cities (fallback if API fails)
  const getRandomCities = (count) => {
    // Shuffle the sample cities and take the first 'count' cities
    return [...sampleCities].sort(() => Math.random() - 0.5).slice(0, count);
  };

  // Start a new game
  const startGame = async () => {
    setLoading(true);

    try {
      // Ensure we're authenticated
      await authenticate();

      // Create or get player
      const player = await getOrCreatePlayer(username);

      // Create a new game in PocketBase
      const newGame = await createGame(username);
      setGameId(newGame.id);

      // Reset game state
      setScore(0);
      setCollectedEmojis([]);
      setCorrectAnswers(0);
      setTotalQuestions(1); // Start with 1 since we're loading the first question
      setGameOver(false);

      // Reset timer
      setTimer(30);
      setTimerRunning(false);
      setTimerBonus(0);

      // Load the first destination
      await loadNextDestination();
    } catch (error) {
      console.error("Error starting game:", error);
      // Fallback to local game if PocketBase fails
      const localGameId = `local_game_${Date.now()}`;
      setGameId(localGameId);

      // Reset game state
      setScore(0);
      setCollectedEmojis([]);
      setCorrectAnswers(0);
      setTotalQuestions(1); // Start with 1 since we're loading the first question
      setGameOver(false);

      // Reset timer
      setTimer(30);
      setTimerRunning(false);
      setTimerBonus(0);

      // Load the first destination using sample data
      loadNextDestinationFallback();
    } finally {
      setLoading(false);
    }
  };

  // Load the next destination from PocketBase
  const loadNextDestination = async () => {
    setLoading(true);
    setShowAnswer(false);
    setSelectedOption(null);
    setIsCorrect(null);

    try {
      // Ensure we're authenticated
      await authenticate();

      // Get 4 random destinations from PocketBase
      const destinations = await getRandomDestination(4);

      if (!destinations || destinations.length < 4) {
        console.warn(
          "Not enough destinations returned, falling back to sample data"
        );
        throw new Error("Not enough destinations returned");
      }

      console.log("Successfully loaded destinations from PocketBase");

      // Set the current destination (first one)
      setCurrentDestination(destinations[0]);

      // Create options (first one is correct, others are distractors)
      const shuffledOptions = [
        destinations[0].city,
        ...destinations.slice(1).map((d) => d.city),
      ].sort(() => Math.random() - 0.5);

      setOptions(shuffledOptions);
      
      // Reset and start timer
      setTimer(30);
      setTimerBonus(0);
      setTimerRunning(true);
      
      // Increment total questions counter (only when loading a new question, not during initialization)
      if (totalQuestions > 0) {
        setTotalQuestions(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error loading destination from PocketBase:", error);
      console.log("Falling back to sample data");
      // Fallback to sample data
      loadNextDestinationFallback();
    } finally {
      setLoading(false);
    }
  };

  // Fallback function using sample data
  const loadNextDestinationFallback = () => {
    // Get random destinations from sample data
    const destinations = getRandomCities(4);

    // Set the current destination (first one)
    setCurrentDestination(destinations[0]);

    // Create options (first one is correct, others are distractors)
    const shuffledOptions = [
      destinations[0].city,
      ...destinations.slice(1).map((d) => d.city),
    ].sort(() => Math.random() - 0.5);
    
    // Set the options in the state
    setOptions(shuffledOptions);

    // Reset and start timer
    setTimer(30);
    setTimerBonus(0);
    setTimerRunning(true);
  };

  // Handle answer selection
  const selectAnswer = async (option) => {
    if (showAnswer || loading) return;

    // Stop the timer
    setTimerRunning(false);

    setSelectedOption(option);
    const correct = option === currentDestination.city;
    setIsCorrect(correct);
    setShowAnswer(true);

    if (correct) {
      // Calculate time-based bonus
      let bonus = 0;
      if (timer >= 20) {
        bonus = 50; // Fast answer bonus
      } else if (timer >= 10) {
        bonus = 25; // Medium speed bonus
      }
      setTimerBonus(bonus);

      // Update score for correct answer (base + time bonus)
      const newScore = score + 100 + bonus;
      setScore(newScore);
      setCorrectAnswers((prev) => prev + 1);

      // Add emoji to collected emojis
      const newEmojis = [...collectedEmojis, currentDestination.emoji];
      setCollectedEmojis(newEmojis);

      try {
        // Record the correct answer in PocketBase
        if (gameId && !gameId.startsWith("local_")) {
          await recordCorrectAnswer(gameId, currentDestination);
        }
      } catch (error) {
        console.error("Error recording correct answer:", error);
        // Continue with local state even if PocketBase update fails
      }
    } else {
      // Update score for incorrect answer (small penalty)
      const newScore = Math.max(0, score - 20); // Subtract 20 points, but don't go below 0
      setScore(newScore);

      try {
        // Update game score in PocketBase
        if (gameId && !gameId.startsWith("local_")) {
          await updateGame(gameId, { score: newScore });
        }
      } catch (error) {
        console.error("Error updating game score:", error);
        // Continue with local state even if PocketBase update fails
      }

      setShowAnswer(true);
      // We'll handle the auto-advance in the DestinationCard component
    }

    // No longer incrementing totalQuestions here, it's now done in loadNextDestination
  };

  // Handle time up (when timer reaches 0)
  const handleTimeUp = () => {
    if (showAnswer || loading) return;

    setTimerRunning(false);
    setShowAnswer(true);
    setIsCorrect(false);

    // Select a random wrong answer
    const wrongOptions = options.filter(
      (option) => option !== currentDestination.city
    );
    const randomWrongOption =
      wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
    setSelectedOption(randomWrongOption);

    // Update score for incorrect answer (small penalty)
    const newScore = Math.max(0, score - 20); // Subtract 20 points, but don't go below 0
    setScore(newScore);

    try {
      // Update game score in PocketBase
      if (gameId && !gameId.startsWith("local_")) {
        updateGame(gameId, { score: newScore });
      }
    } catch (error) {
      console.error("Error updating game score:", error);
    }

    // Increment total questions counter
    setTotalQuestions((prev) => prev + 1);
  };

  // Load a bonus question
  const loadBonusQuestion = async (emojiSet) => {
    try {
      // Try to get a bonus question from OpenAI first
      try {
        // Get the cities from the collected emojis
        const cities =
          collectedEmojis.length > 0
            ? collectedEmojis.map((_, index) => {
                const questionIndex =
                  totalQuestions - collectedEmojis.length + index;
                return sampleCities[questionIndex % sampleCities.length].city;
              })
            : ["Paris", "Tokyo", "New York", "Sydney", "Cairo"];

        const aiQuestion = await rateLimitedCall(
          generateBonusQuestion,
          emojiSet,
          cities
        );

        if (aiQuestion) {
          setBonusQuestion(aiQuestion);
          setBonusOptions(aiQuestion.options);
          setShowBonusQuestion(true);
          return;
        }
      } catch (aiError) {
        console.error("Error generating AI bonus question:", aiError);
      }

      // Fall back to PocketBase if OpenAI fails
      const question = await getBonusQuestion(emojiSet);

      if (question) {
        setBonusQuestion(question);
        setBonusOptions(question.options);
        setShowBonusQuestion(true);
      } else {
        // Fallback to a sample question if none found
        const fallbackQuestion = {
          question:
            "Which continent has the most countries represented in your collection?",
          options: ["Asia", "Europe", "Africa", "North America"],
          correct_answer: 1, // Europe (index 1)
        };

        setBonusQuestion(fallbackQuestion);
        setBonusOptions(fallbackQuestion.options);
        setShowBonusQuestion(true);
      }
    } catch (error) {
      console.error("Error loading bonus question:", error);
      // Fallback to a sample question
      const fallbackQuestion = {
        question:
          "Which continent has the most countries represented in your collection?",
        options: ["Asia", "Europe", "Africa", "North America"],
        correct_answer: 1, // Europe (index 1)
      };

      setBonusQuestion(fallbackQuestion);
      setBonusOptions(fallbackQuestion.options);
      setShowBonusQuestion(true);
    }
  };

  // Handle bonus answer selection
  const selectBonusAnswer = async (index) => {
    if (selectedBonusOption !== null) return;

    setSelectedBonusOption(index);
    const correct = index === bonusQuestion.correct_answer;
    setIsBonusCorrect(correct);

    if (correct) {
      // Bonus points for correct bonus answer
      const newScore = score + 200;
      setScore(newScore);

      try {
        // Update game score in PocketBase
        if (gameId && !gameId.startsWith("local_")) {
          await updateGame(gameId, {
            score: newScore,
            bonus_questions_correct: bonusQuestion.bonus_questions_correct + 1,
          });
        }
      } catch (error) {
        console.error("Error updating bonus question score:", error);
        // Continue with local state even if PocketBase update fails
      }
    } else {
      try {
        // Update bonus questions answered in PocketBase
        if (gameId && !gameId.startsWith("local_")) {
          await updateGame(gameId, {
            bonus_questions_answered:
              bonusQuestion.bonus_questions_answered + 1,
          });
        }
      } catch (error) {
        console.error("Error updating bonus questions answered:", error);
      }
    }
  };

  // Continue to next question
  const nextQuestion = async () => {
    // If bonus question is showing, close it first and load next destination
    if (showBonusQuestion) {
      setShowBonusQuestion(false);
      setSelectedBonusOption(null);
      setIsBonusCorrect(null);
      setBonusQuestion(null);
      setBonusOptions([]);
      
      // Then load next destination
      await loadNextDestination();
      return;
    }
    
    if (totalQuestions >= 10) {
      // End game after 10 questions
      setGameOver(true);

      try {
        // Update final game state in PocketBase
        if (gameId && !gameId.startsWith("local_")) {
          await updateGame(gameId, {
            score: score,
            correct_answers: correctAnswers,
            emojis_collected: collectedEmojis,
          });
        }
      } catch (error) {
        console.error("Error updating final game state:", error);
      }
    } else {
      // Check if we need to show a bonus question (every 5 questions)
      if (totalQuestions % 5 === 0 && totalQuestions > 0) {
        // Get the last 5 emojis or fewer if not enough
        const emojiSet =
          collectedEmojis.length > 0
            ? collectedEmojis.slice(-Math.min(5, collectedEmojis.length))
            : ["🌍", "🧭", "🗺️"]; // Default emojis if none collected

        await loadBonusQuestion(emojiSet);
      } else {
        await loadNextDestination();
      }
    }
  };

  // End game early and show final score
  const endGame = async () => {
    try {
      // Update final game state in PocketBase
      if (gameId && !gameId.startsWith("local_")) {
        await updateGame(gameId, {
          score: score,
          correct_answers: correctAnswers,
          emojis_collected: collectedEmojis,
        });
      }

      // Set game over to true to show the final score
      setGameOver(true);
    } catch (error) {
      console.error("Error ending game:", error);
      // Still end the game even if PocketBase update fails
      setGameOver(true);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerRunning && timer > 0 && !showAnswer) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && timerRunning && !showAnswer) {
      // Time's up - auto-select wrong answer
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [timer, timerRunning, showAnswer]);

  // Check for saved username on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("globetrotter_username");
    if (savedUsername) {
      setUsername(savedUsername);
      setIsLoggedIn(true);
    }
  }, []);

  // Context value
  const value = {
    // Player state
    username,
    isLoggedIn,
    login,
    logout,

    // Game state
    gameId,
    score,
    currentDestination,
    options,
    selectedOption,
    isCorrect,
    showAnswer,
    loading,
    gameOver,

    // Timer state
    timer,
    timerRunning,
    timerBonus,

    // Emoji and bonus question state
    collectedEmojis,
    showBonusQuestion,
    bonusQuestion,
    bonusOptions,
    selectedBonusOption,
    isBonusCorrect,

    // Stats
    correctAnswers,
    totalQuestions,

    // Functions
    startGame,
    selectAnswer,
    selectBonusAnswer,
    nextQuestion,
    endGame,
    handleTimeUp,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameContext;
