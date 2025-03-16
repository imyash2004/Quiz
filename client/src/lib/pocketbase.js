import PocketBase from 'pocketbase';

// Initialize PocketBase
const pb = new PocketBase('https://pocketbase-production-ad14.up.railway.app');

// Superuser credentials
const EMAIL = 'agarwalyash041@gmail.com';
const PASSWORD = 'Yash@244221';

// Function to safely parse 'JSON' string and convert it to an empty array or object
function parseJson(value) {
  if (value === "JSON") {
    return []; // Return empty array for 'JSON' string
  }
  return value; // If it's not 'JSON', return the original value
}

// Function to authenticate the superuser
export const authenticate = async () => {
  try {
    // Authenticate the superuser
    const authData = await pb.collection('_superusers').authWithPassword(EMAIL, PASSWORD);
    console.log('Authentication successful');
    
    // Log authentication data (optional)
    console.log('Is Auth Valid:', pb.authStore.isValid);
    console.log('Auth Token:', pb.authStore.token);
    console.log('User ID:', pb.authStore.record.id);
    
    return true;
  } catch (error) {
    console.error('Authentication failed:', error.message);
    return false;
  }
};

// Authenticate on initialization
authenticate().catch(err => console.error('Initial authentication failed:', err));

// Destinations collection functions
export const getRandomDestination = async (count = 1) => {
  try {
    // Get a larger list to ensure we have enough destinations to choose from
    const result = await pb.collection('destinations').getList(1, 50, {
      sort: 'created', // Sort by creation date to get a consistent list
    });
    
    if (!result.items || result.items.length === 0) {
      throw new Error('No destinations found');
    }
    
    // Shuffle the items and take the requested count
    const shuffled = [...result.items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error fetching random destination:', error);
    throw error;
  }
};

export const getDestinationById = async (id) => {
  try {
    return await pb.collection('destinations').getOne(id);
  } catch (error) {
    console.error('Error fetching destination by ID:', error);
    throw error;
  }
};

// Players collection functions
export const getOrCreatePlayer = async (username) => {
  try {
    // Try to find existing player
    const result = await pb.collection('players').getList(1, 1, {
      filter: `username = "${username}"`,
    });
    
    if (result.items.length > 0) {
      return result.items[0];
    }
    
    // Create new player if not found
    return await pb.collection('players').create({
      username,
      total_score: 0,
      games_played: 0,
      correct_answers: 0,
      recent_emojis: []
    });
  } catch (error) {
    console.error('Error getting/creating player:', error);
    throw error;
  }
};

export const updatePlayerScore = async (playerId, score, correctAnswers) => {
  try {
    const player = await pb.collection('players').getOne(playerId);
    
    return await pb.collection('players').update(playerId, {
      total_score: player.total_score + score,
      correct_answers: player.correct_answers + correctAnswers,
      games_played: player.games_played + 1
    });
  } catch (error) {
    console.error('Error updating player score:', error);
    throw error;
  }
};

// Games collection functions
export const createGame = async (playerUsername) => {
  try {
    return await pb.collection('games').create({
      player_username: playerUsername,
      score: 0,
      destinations_played: [],
      correct_answers: [],
      emojis_collected: [],
      bonus_questions_answered: 0,
      bonus_questions_correct: 0
    });
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
};

export const updateGame = async (gameId, data) => {
  try {
    return await pb.collection('games').update(gameId, data);
  } catch (error) {
    console.error('Error updating game:', error);
    throw error;
  }
};

export const recordCorrectAnswer = async (gameId, destination) => {
  try {
    const game = await pb.collection('games').getOne(gameId);
    
    const updatedGame = {
      destinations_played: [...game.destinations_played, destination.city],
      correct_answers: [...game.correct_answers, destination.city],
      emojis_collected: [...game.emojis_collected, destination.emoji],
      score: game.score + 100 // Basic scoring
    };
    
    return await pb.collection('games').update(gameId, updatedGame);
  } catch (error) {
    console.error('Error recording correct answer:', error);
    throw error;
  }
};

// Challenges collection functions
export const createChallenge = async (creatorUsername, destinations) => {
  try {
    // Generate a random 6-character challenge code
    const challengeCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Set expiration date to 7 days from now
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + 7);
    
    return await pb.collection('challenges').create({
      challenge_code: challengeCode,
      creator_username: creatorUsername,
      status: 'active',
      destinations: destinations,
      participants: [{ username: creatorUsername, score: 0 }],
      expires: expiresDate.toISOString()
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    throw error;
  }
};

export const getChallengeByCode = async (challengeCode) => {
  try {
    const result = await pb.collection('challenges').getList(1, 1, {
      filter: `challenge_code = "${challengeCode}"`,
    });
    
    if (result.items.length > 0) {
      return result.items[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching challenge by code:', error);
    throw error;
  }
};

export const joinChallenge = async (challengeId, username) => {
  try {
    const challenge = await pb.collection('challenges').getOne(challengeId);
    
    // Check if user is already a participant
    const existingParticipant = challenge.participants.find(p => p.username === username);
    if (existingParticipant) {
      return challenge;
    }
    
    // Add user to participants
    const updatedParticipants = [...challenge.participants, { username, score: 0 }];
    
    return await pb.collection('challenges').update(challengeId, {
      participants: updatedParticipants
    });
  } catch (error) {
    console.error('Error joining challenge:', error);
    throw error;
  }
};

export const updateChallengeScore = async (challengeId, username, score) => {
  try {
    const challenge = await pb.collection('challenges').getOne(challengeId);
    
    // Update participant's score
    const updatedParticipants = challenge.participants.map(p => {
      if (p.username === username) {
        return { ...p, score: p.score + score };
      }
      return p;
    });
    
    return await pb.collection('challenges').update(challengeId, {
      participants: updatedParticipants
    });
  } catch (error) {
    console.error('Error updating challenge score:', error);
    throw error;
  }
};

// Bonus questions collection functions
export const getBonusQuestion = async (emojiSet) => {
  try {
    // Try to find a question specifically for this emoji set
    const result = await pb.collection('bonus_questions').getList(1, 1, {
      filter: `emoji_set ~ '${JSON.stringify(emojiSet)}'`,
    });
    
    if (result.items.length > 0) {
      return result.items[0];
    }
    
    // If no specific question exists, get a random one
    const randomResult = await pb.collection('bonus_questions').getList(1, 1, {
      sort: 'random',
    });
    
    if (randomResult.items.length > 0) {
      return randomResult.items[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching bonus question:', error);
    throw error;
  }
};

export default pb;
