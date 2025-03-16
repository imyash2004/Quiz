// Test script for PocketBase connection
import PocketBase from 'pocketbase';

// Initialize PocketBase
const pb = new PocketBase('https://pocketbase-production-ad14.up.railway.app');

// Test function to check if we can connect to PocketBase
async function testConnection() {
  try {
    console.log('Testing connection to PocketBase...');
    
    // Try to get the collections list
    const collections = await pb.collections.getList();
    console.log('Successfully connected to PocketBase!');
    console.log('Available collections:', collections.items.map(c => c.name));
    
    // Try to get destinations
    console.log('\nTrying to fetch destinations...');
    try {
      const destinations = await pb.collection('destinations').getList(1, 10);
      console.log(`Found ${destinations.totalItems} destinations`);
      
      if (destinations.items.length > 0) {
        console.log('Sample destination:', destinations.items[0]);
      }
    } catch (error) {
      console.error('Error fetching destinations:', error.message);
    }
    
    // Try to get players
    console.log('\nTrying to fetch players...');
    try {
      const players = await pb.collection('players').getList(1, 10);
      console.log(`Found ${players.totalItems} players`);
      
      if (players.items.length > 0) {
        console.log('Sample player:', players.items[0]);
      }
    } catch (error) {
      console.error('Error fetching players:', error.message);
    }
    
    // Try to get games
    console.log('\nTrying to fetch games...');
    try {
      const games = await pb.collection('games').getList(1, 10);
      console.log(`Found ${games.totalItems} games`);
      
      if (games.items.length > 0) {
        console.log('Sample game:', games.items[0]);
      }
    } catch (error) {
      console.error('Error fetching games:', error.message);
    }
    
    // Try to get challenges
    console.log('\nTrying to fetch challenges...');
    try {
      const challenges = await pb.collection('challenges').getList(1, 10);
      console.log(`Found ${challenges.totalItems} challenges`);
      
      if (challenges.items.length > 0) {
        console.log('Sample challenge:', challenges.items[0]);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error.message);
    }
    
    // Try to get bonus questions
    console.log('\nTrying to fetch bonus questions...');
    try {
      const bonusQuestions = await pb.collection('bonus_questions').getList(1, 10);
      console.log(`Found ${bonusQuestions.totalItems} bonus questions`);
      
      if (bonusQuestions.items.length > 0) {
        console.log('Sample bonus question:', bonusQuestions.items[0]);
      }
    } catch (error) {
      console.error('Error fetching bonus questions:', error.message);
    }
    
  } catch (error) {
    console.error('Error connecting to PocketBase:', error.message);
  }
}

// Run the test
testConnection();
