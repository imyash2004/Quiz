// Import sample data script for Globetrotter using PocketBase SDK
// This script imports sample city data to PocketBase

import PocketBase from 'pocketbase';
import { sampleCities } from './sampleData.js';

// Initialize PocketBase
const pb = new PocketBase('https://pocketbase-production-ad14.up.railway.app');

// Function to import data to PocketBase
async function importDataToPocketBase(data) {
  console.log(`Importing ${data.length} cities to PocketBase...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const city of data) {
    try {
      // Check if the city already exists
      const existingCities = await pb.collection('destinations').getList(1, 1, {
        filter: `city = "${city.city}"`,
      });
      
      if (existingCities.items.length > 0) {
        console.log(`City ${city.city} already exists, skipping...`);
        continue;
      }
      
      // Format the data according to the PocketBase schema
      const destinationData = {
        city: city.city,
        country: city.country,
        clues: JSON.stringify(city.clues),
        fun_fact: JSON.stringify(city.fun_fact),
        trivia: JSON.stringify(city.trivia),
        emoji: city.emoji,
        cultural_elements: JSON.stringify(city.cultural_elements),
        travel_info: JSON.stringify(city.travel_info),
        coordinates: JSON.stringify(city.coordinates),
        difficulty: city.difficulty
      };
      
      // Create the record in PocketBase
      await pb.collection('destinations').create(destinationData);
      
      successCount++;
      console.log(`Imported ${city.city} (${successCount}/${data.length})`);
    } catch (error) {
      errorCount++;
      console.error(`Error importing ${city.city}:`, error.message);
    }
  }
  
  console.log(`Import completed: ${successCount} successful, ${errorCount} errors`);
}

// Main function
async function main() {
  try {
    console.log('Starting sample data import process...');
    
    // Import data to PocketBase
    await importDataToPocketBase(sampleCities);
    
    console.log('Sample data import process completed');
  } catch (error) {
    console.error('Error in main process:', error);
  }
}

// Run the main function
main();
