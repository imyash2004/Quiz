import { useGame } from '../contexts/GameContext';

const Header = () => {
  const { username, score, isLoggedIn, logout } = useGame();

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">🌍 Globetrotter</h1>
          {isLoggedIn && (
            <div className="ml-8 flex items-center">
              <span className="mr-4">
                <span className="font-bold">Player:</span> {username}
              </span>
              <span>
                <span className="font-bold">Score:</span> {score}
              </span>
            </div>
          )}
        </div>
        
        {isLoggedIn && (
          <button
            onClick={logout}
            className="bg-white text-blue-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
