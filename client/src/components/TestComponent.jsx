import React, { useState } from 'react';
import { sampleCities } from '../sampleData';

const TestComponent = () => {
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  
  // Get a random city from the sample data
  const destination = sampleCities[currentCityIndex];
  
  const handleNextCity = () => {
    setCurrentCityIndex((prevIndex) => (prevIndex + 1) % sampleCities.length);
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Sample Destination Data</h2>
      <div className="bg-blue-100 p-3 rounded-lg mb-4">
        <p className="text-blue-700 font-semibold">
          Using sample data since PocketBase collections need to be populated
        </p>
      </div>
      
      <h3 className="text-lg font-semibold mb-2">Destination Information:</h3>
      <div className="bg-gray-100 p-3 rounded-lg">
        <p><span className="font-semibold">City:</span> {destination.city}</p>
        <p><span className="font-semibold">Country:</span> {destination.country}</p>
        <p><span className="font-semibold">Emoji:</span> {destination.emoji}</p>
        <p><span className="font-semibold">Difficulty:</span> {destination.difficulty}</p>
        
        <div className="mt-2">
          <p className="font-semibold">Clues:</p>
          <ul className="list-disc pl-5">
            {destination.clues.map((clue, index) => (
              <li key={index}>{clue}</li>
            ))}
          </ul>
        </div>
        
        <div className="mt-2">
          <p className="font-semibold">Fun Facts:</p>
          <ul className="list-disc pl-5">
            {destination.fun_fact.map((fact, index) => (
              <li key={index}>{fact}</li>
            ))}
          </ul>
        </div>
        
        <div className="mt-2">
          <p className="font-semibold">Travel Tips:</p>
          <p><span className="font-semibold">Best Time to Visit:</span> {destination.travel_info.best_time_to_visit}</p>
          <p><span className="font-semibold">Major Attractions:</span> {destination.travel_info.major_attractions.join(', ')}</p>
          <p><span className="font-semibold">Tip:</span> {destination.travel_info.travel_tips}</p>
        </div>
      </div>
      
      <button 
        onClick={handleNextCity}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Show Next Destination
      </button>
    </div>
  );
};

export default TestComponent;
