import fs from 'fs';
import path from 'path';
import PocketBase from 'pocketbase';

// Initialize PocketBase
const pb = new PocketBase('https://pocketbase-production-ad14.up.railway.app');

// Path to the city dataset
const datasetPath = path.resolve('../DATACREATION/Data/city_dataset.json');

// Function to fix and parse the JSON file
async function fixAndParseJSON(filePath) {
  try {
    // Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Try to fix the JSON format
    // First, check if it starts with a bracket
    let fixedContent = fileContent;
    if (!fixedContent.trim().startsWith('[')) {
      fixedContent = '[' + fixedContent;
    }
    if (!fixedContent.trim().endsWith(']')) {
      fixedContent = fixedContent + ']';
    }
    
    // Replace missing commas and brackets
    fixedContent = fixedContent
      .replace(/}\s*{/g, '},{')  // Add commas between objects
      .replace(/"\s*"/g, '","')  // Add commas between string properties
      .replace(/]\s*"/g, '],"')  // Add commas after arrays
      .replace(/"\s*{/g, '":{')  // Fix object properties
      .replace(/"\s*\[/g, '":[') // Fix array properties
      .replace(/}\s*"/g, '},"'); // Add commas after objects
    
    // Try to parse the fixed content
    try {
      return JSON.parse(fixedContent);
    } catch (parseError) {
      console.error('Error parsing fixed JSON:', parseError);
      
      // If parsing fails, try a different approach
      // Split the content by city objects and manually reconstruct
      const cityObjects = fileContent.split(/}\s*{/).map((obj, index) => {
        if (index === 0) return obj + '}';
        if (index === cityObjects.length - 1) return '{' + obj;
        return '{' + obj + '}';
      });
      
      // Process each city object individually
      const cities = [];
      for (const cityObj of cityObjects) {
        try {
          // Add missing brackets and fix format
          let fixedObj = '{' + cityObj + '}';
          fixedObj = fixedObj
            .replace(/"\s*"/g, '","')
            .replace(/]\s*"/g, '],"')
            .replace(/"\s*{/g, '":{')
            .replace(/"\s*\[/g, '":[')
            .replace(/}\s*"/g, '},');
          
          const city = JSON.parse(fixedObj);
          cities.push(city);
        } catch (objError) {
          console.error('Error parsing city object:', objError);
          // Skip this city and continue
        }
      }
      
      return cities;
    }
  } catch (error) {
    console.error('Error reading or fixing JSON file:', error);
    throw error;
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
        difficulty: city.difficulty.toLowerCase() === 'medium' ? 'Medium' : 
                   city.difficulty.toLowerCase() === 'easy' ? 'Easy' : 'Hard'
      };
      
      // Create the record in PocketBase
      await pb.collection('destinations').create(destinationData);
      
      successCount++;
      console.log(`Imported ${city.city} (${successCount}/${data.length})`);
    } catch (error) {
      errorCount++;
      console.error(`Error importing ${city.city}:`, error);
    }
  }
  
  console.log(`Import completed: ${successCount} successful, ${errorCount} errors`);
}

// Main function
async function main() {
  try {
    console.log('Starting data import process...');
    
    // Fix and parse the JSON file
    const data = await fixAndParseJSON(datasetPath);
    
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
