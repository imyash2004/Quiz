# Globetrotter Challenge

The Globetrotter Challenge is a fun and interactive travel guessing game where players are presented with clues about famous destinations around the world and must guess the correct city.

## Features

- 🌍 Guess destinations from cryptic clues
- 🎮 Score tracking and game progression
- 🏆 Challenge friends to beat your score
- 🎯 Bonus questions for extra points
- 🎉 Animated feedback and fun facts about destinations

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Framer Motion
- **Backend**: PocketBase (hosted on Railway)
- **Data**: AI-generated dataset of 100+ destinations with clues, facts, and travel information

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/globetrotter.git
   cd globetrotter
   ```

2. Install dependencies:
   ```
   cd client
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the `client` directory
   - Add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```
   - You can use the `.env.example` file as a template

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

### Data Import

The application uses a PocketBase backend hosted on Railway. The city data has been pre-imported, but if you need to re-import or update the data:

1. Run the data import script:
   ```
   npm run import-data
   ```

This will process the city dataset and upload it to the PocketBase instance.

## Project Structure

```
globetrotter/
├── client/                 # Frontend React application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── assets/         # Images and other assets
│   │   ├── components/     # React components
│   │   ├── contexts/       # React context providers
│   │   ├── lib/            # Utility functions and API clients
│   │   ├── App.jsx         # Main application component
│   │   └── main.jsx        # Application entry point
│   ├── importData.js       # Data import script
│   └── package.json        # Frontend dependencies
└── DATACREATION/           # Data generation scripts and source data
    └── Data/               # Generated city dataset
```

## Game Flow

1. User enters a username to start
2. User is presented with clues about a destination
3. User selects from multiple city options
4. Feedback is provided (correct/incorrect)
5. Fun facts and information about the destination are revealed
6. User continues to the next question
7. After 10 questions, the game ends and the final score is displayed
8. User can play again or challenge friends

## Challenge Feature

The "Challenge a Friend" feature allows users to:
1. Create a unique challenge code
2. Share the challenge via a link or QR code
3. Friends can join using the link and compete for the highest score

## Deployment

The application is deployed using:
- Frontend: Vercel
- Backend: Railway (PocketBase)

## Credits

- City data generated using OpenAI's API
- Icons and animations from various open-source libraries
- Inspiration from popular geography games and quizzes
