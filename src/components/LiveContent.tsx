import React from 'react';

const LiveContent: React.FC = () => {
  // Example live events data - in a real app this would come from an API
  const liveEvents = [
    {
      id: 1,
      title: 'Manchester United vs Liverpool',
      category: 'Football',
      league: 'Premier League',
      time: '32:15',
      score: '1-1',
      status: 'In Progress',
      odds: [
        { name: 'Home', value: 2.5 },
        { name: 'Draw', value: 3.4 },
        { name: 'Away', value: 2.1 }
      ]
    },
    {
      id: 2,
      title: 'Lakers vs Celtics',
      category: 'Basketball',
      league: 'NBA',
      time: 'Q3 4:28',
      score: '72-68',
      status: 'In Progress',
      odds: [
        { name: 'Home', value: 1.8 },
        { name: 'Away', value: 2.2 }
      ]
    },
    {
      id: 3,
      title: 'India vs Australia',
      category: 'Cricket',
      league: 'Test Match',
      time: 'Day 2',
      score: '245-6',
      status: 'In Progress',
      odds: [
        { name: 'Home', value: 2.1 },
        { name: 'Draw', value: 3.2 },
        { name: 'Away', value: 2.4 }
      ]
    },
    {
      id: 4,
      title: 'Nadal vs Djokovic',
      category: 'Tennis',
      league: 'French Open',
      time: 'Set 3',
      score: '6-4, 3-6, 4-3',
      status: 'In Progress',
      odds: [
        { name: 'Nadal', value: 1.9 },
        { name: 'Djokovic', value: 1.8 }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Live Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {liveEvents.map((event) => (
          <div key={event.id} className="bg-[#1a1f2c] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between bg-[#2a3040] px-4 py-2">
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                <span className="text-sm font-medium">{event.category} • {event.league}</span>
              </div>
              <span className="text-sm text-purple-400">{event.time}</span>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold mb-2">{event.title}</h3>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">{event.score}</span>
                <span className="text-xs px-2 py-1 bg-purple-600/20 text-purple-400 rounded">{event.status}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-4">
                {event.odds.map((odd, index) => (
                  <button 
                    key={index}
                    className="bg-[#2a3040] hover:bg-[#343b4f] text-white py-2 px-3 rounded transition-colors text-center"
                  >
                    <div className="text-xs text-gray-400 mb-1">{odd.name}</div>
                    <div className="font-semibold">{odd.value.toFixed(2)}</div>
                  </button>
                ))}
              </div>
              
              <button className="w-full mt-4 text-center py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                View All Markets
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveContent; 