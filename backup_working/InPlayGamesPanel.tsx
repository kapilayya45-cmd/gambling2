import React, { useState } from 'react';
import { useLeagueStatus } from '@/hooks/useLeagueStatus';
import { useBasketballStatus } from '@/hooks/useBasketballStatus';

type Tab = 'in-play' | 'today' | 'tomorrow';

// Simplified InPlayGamesPanel component
const InPlayGamesPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('in-play');
  
  // Static mock data to display
  const mockMatches = [
    {
      id: "match1",
      sport: "cricket",
      league: "Indian Premier League",
      teamA: "Mumbai Indians",
      teamB: "Chennai Super Kings",
      time: "Live",
      isLive: true,
      score: "142/3 - 0/0",
      odds: {
        teamA: 1.85,
        draw: 3.5,
        teamB: 2.0
      }
    },
    {
      id: "match2",
      sport: "football",
      league: "Premier League",
      teamA: "Manchester United",
      teamB: "Liverpool",
      time: "Live",
      isLive: true,
      score: "1 - 0",
      odds: {
        teamA: 2.2,
        draw: 3.0,
        teamB: 1.9
      }
    },
    {
      id: "match3",
      sport: "basketball",
      league: "NBA",
      teamA: "Lakers",
      teamB: "Warriors",
      time: "Live",
      isLive: true,
      score: "86 - 92",
      odds: {
        teamA: 1.75,
        teamB: 2.1
      }
    }
  ];
  
  const todayMatches = [
    {
      id: "match4",
      sport: "cricket",
      league: "Indian Premier League",
      teamA: "Royal Challengers Bangalore",
      teamB: "Kolkata Knight Riders",
      time: "19:30",
      isLive: false,
      odds: {
        teamA: 1.65,
        draw: 3.8,
        teamB: 2.2
      }
    },
    {
      id: "match5",
      sport: "football",
      league: "La Liga",
      teamA: "Barcelona",
      teamB: "Real Madrid",
      time: "20:00",
      isLive: false,
      odds: {
        teamA: 1.95,
        draw: 3.2,
        teamB: 1.85
      }
    }
  ];
  
  const tomorrowMatches = [
    {
      id: "match6",
      sport: "cricket",
      league: "Indian Premier League",
      teamA: "Delhi Capitals",
      teamB: "Punjab Kings",
      time: "15:30",
      isLive: false,
      odds: {
        teamA: 1.75,
        draw: 3.6,
        teamB: 2.1
      }
    },
    {
      id: "match7",
      sport: "tennis",
      league: "ATP Tour",
      teamA: "Djokovic",
      teamB: "Nadal",
      time: "16:00",
      isLive: false,
      odds: {
        teamA: 1.9,
        teamB: 1.95
      }
    }
  ];
  
  // Get matches based on active tab
  const getMatches = () => {
    switch(activeTab) {
      case 'in-play':
        return mockMatches;
      case 'today':
        return todayMatches;
      case 'tomorrow':
        return tomorrowMatches;
      default:
        return [];
    }
  };
  
  const matches = getMatches();
  
  // Group matches by sport
  const matchesByCategory = matches.reduce((acc, match) => {
    if (!acc[match.sport]) {
      acc[match.sport] = [];
    }
    acc[match.sport].push(match);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
      {/* Tab Bar */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'in-play'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('in-play')}
        >
          In-Play
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'today'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('today')}
        >
          Today
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'tomorrow'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('tomorrow')}
        >
          Tomorrow
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {matches.length === 0 ? (
          <div className="text-center text-gray-500 p-8">
            <p>No matches available for this selection.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Group by sport */}
            {Object.entries(matchesByCategory).map(([sport, sportMatches]) => (
              <div key={sport} className="space-y-2">
                {/* Sport Header */}
                <div className="bg-blue-600 px-4 py-3 uppercase text-base font-semibold text-white shadow-sm">
                  {sport === 'football' ? 'Soccer' : 
                   sport.charAt(0).toUpperCase() + sport.slice(1)}
                </div>
                
                {/* Match List */}
                <div className="space-y-2">
                  {sportMatches.map(match => (
                    <div key={match.id} className="bg-gray-50 rounded-md p-3 flex items-center justify-between border border-gray-200">
                      {/* Match Info */}
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${match.isLive ? 'text-red-600' : 'text-gray-700'}`}>
                            {match.isLive ? 'LIVE' : match.time}
                          </span>
                          <span className="mx-2 text-gray-500">•</span>
                          <span className="text-xs text-gray-700">{match.league}</span>
                        </div>
                        <div className="mt-1 font-medium text-gray-800">{match.teamA} v {match.teamB}</div>
                        {match.score && (
                          <div className="mt-1 text-sm text-gray-700">
                            {match.score}
                          </div>
                        )}
                      </div>
                      
                      {/* Odds */}
                      <div className="flex space-x-2">
                        <div className="bg-blue-50 px-3 py-2 rounded border border-blue-200">
                          <div className="text-xs text-gray-600 mb-1">1</div>
                          <div className="text-blue-700 font-bold">{match.odds.teamA.toFixed(2)}</div>
                        </div>
                        
                        {match.odds.draw !== undefined && (
                          <div className="bg-blue-50 px-3 py-2 rounded border border-blue-200">
                            <div className="text-xs text-gray-600 mb-1">X</div>
                            <div className="text-blue-700 font-bold">{match.odds.draw.toFixed(2)}</div>
                          </div>
                        )}
                        
                        <div className="bg-blue-50 px-3 py-2 rounded border border-blue-200">
                          <div className="text-xs text-gray-600 mb-1">2</div>
                          <div className="text-blue-700 font-bold">{match.odds.teamB.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InPlayGamesPanel; 