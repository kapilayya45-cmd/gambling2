import React, { useState } from 'react';

const CasinoContent: React.FC = () => {
  // Example casino games data
  const categories = [
    { id: 'featured', name: 'Featured Games' },
    { id: 'slots', name: 'Slots' },
    { id: 'table', name: 'Table Games' },
    { id: 'live', name: 'Live Casino' },
    { id: 'jackpot', name: 'Jackpot Games' }
  ];
  
  const games = [
    { id: 1, name: 'Lucky 7', category: 'slots', image: '/placeholder-game.jpg', isNew: true, isHot: false },
    { id: 2, name: 'Blackjack Pro', category: 'table', image: '/placeholder-game.jpg', isNew: false, isHot: true },
    { id: 3, name: 'Live Roulette', category: 'live', image: '/placeholder-game.jpg', isNew: false, isHot: false },
    { id: 4, name: 'Royal Flush', category: 'table', image: '/placeholder-game.jpg', isNew: false, isHot: false },
    { id: 5, name: 'Golden Treasure', category: 'slots', image: '/placeholder-game.jpg', isNew: true, isHot: false },
    { id: 6, name: 'Mega Fortune', category: 'jackpot', image: '/placeholder-game.jpg', isNew: false, isHot: true },
    { id: 7, name: 'Lightning Dice', category: 'live', image: '/placeholder-game.jpg', isNew: true, isHot: false },
    { id: 8, name: 'Wild West', category: 'slots', image: '/placeholder-game.jpg', isNew: false, isHot: false },
    { id: 9, name: 'Diamond Rush', category: 'jackpot', image: '/placeholder-game.jpg', isNew: false, isHot: true },
    { id: 10, name: 'European Roulette', category: 'table', image: '/placeholder-game.jpg', isNew: false, isHot: false },
    { id: 11, name: "Joker's Wild", category: 'slots', image: '/placeholder-game.jpg', isNew: false, isHot: false },
    { id: 12, name: 'Live Baccarat', category: 'live', image: '/placeholder-game.jpg', isNew: false, isHot: false }
  ];

  const [activeCategory, setActiveCategory] = useState('featured');

  // Filter games based on active category
  const filteredGames = activeCategory === 'featured' 
    ? games.filter(game => game.isNew || game.isHot) 
    : games.filter(game => game.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Categories Tabs */}
      <div className="flex overflow-x-auto pb-2 space-x-2 no-scrollbar">
        {categories.map(category => (
          <button
            key={category.id}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              activeCategory === category.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* Games Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredGames.map(game => (
          <div key={game.id} className="bg-white rounded-lg overflow-hidden hover:bg-gray-50 transition-colors cursor-pointer group shadow border border-gray-200">
            {/* Game image (using placeholder color since we don't have actual images) */}
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-white relative">
              {/* Game labels */}
              {game.isNew && (
                <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded">NEW</span>
              )}
              {game.isHot && (
                <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded">HOT</span>
              )}
              
              {/* Play button that appears on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full font-medium transition-colors">
                  Play Now
                </button>
              </div>
            </div>
            
            {/* Game name */}
            <div className="p-3">
              <h3 className="font-medium truncate text-gray-800">{game.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CasinoContent; 