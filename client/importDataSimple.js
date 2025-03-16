// Import data script for Globetrotter
// This script imports city data from the DATACREATION directory to PocketBase

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PocketBase API URL
const POCKETBASE_URL = 'https://pocketbase-production-ad14.up.railway.app/api';

// Path to the city dataset
const datasetPath = path.resolve(__dirname, '../../DATACREATION/Data/city_dataset.json');

// Function to read and fix the JSON file
async function readAndFixJSON(filePath) {
  try {
    // Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Try to fix the JSON format by adding missing brackets and commas
    let fixedContent = '[' + fileContent
      .replace(/}\s*{/g, '},{')  // Add commas between objects
      .replace(/"\s*"/g, '","')  // Add commas between string properties
      .replace(/]\s*"/g, '],"')  // Add commas after arrays
      .replace(/"\s*{/g, '":{')  // Fix object properties
      .replace(/"\s*\[/g, '":[') // Fix array properties
      .replace(/}\s*"/g, '},"'); // Add commas after objects
    
    // Add closing bracket if missing
    if (!fixedContent.trim().endsWith(']')) {
      fixedContent = fixedContent + ']';
    }
    
    // Try to parse the fixed content
    try {
      return JSON.parse(fixedContent);
    } catch (parseError) {
      console.error('Error parsing fixed JSON:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error reading or fixing JSON file:', error);
    return [];
  }
}

// Function to import data to PocketBase
async function importDataToPocketBase(data) {
  console.log(`Importing ${data.length} cities to PocketBase...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const city of data) {
    try {
      // Check if the city already exists
      const response = await axios.get(`${POCKETBASE_URL}/collections/destinations/records`, {
        params: {
          filter: `city = "${city.city}"`,
        }
      });
      
      if (response.data.items.length > 0) {
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
        difficulty: city.difficulty.toLowerCase() === 'medium' ? 'Medium' : 
                   city.difficulty.toLowerCase() === 'easy' ? 'Easy' : 'Hard'
      };
      
      // Create the record in PocketBase
      await axios.post(`${POCKETBASE_URL}/collections/destinations/records`, destinationData);
      
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
    console.log('Starting data import process...');
    
    // Read and fix the JSON file
    const data = await readAndFixJSON(datasetPath);
    
    if (!data || data.length === 0) {
      console.error('No data found or parsing failed');
      return;
    }
    
    console.log(`Successfully parsed ${data.length} cities`);
    
    // Import data to PocketBase
    await importDataToPocketBase(data);
    
    console.log('Data import process completed');
  } catch (error) {
    console.error('Error in main process:', error);
  }
}

// Run the main function
main();
