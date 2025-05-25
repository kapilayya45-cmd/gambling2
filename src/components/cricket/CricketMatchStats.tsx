import React, { useState, useEffect } from 'react';
import { CricketFixture, CRICKET_TEAM_NAMES } from '@/services/cricketApi';
import { useAuth } from '@/contexts/AuthContext';

// Historical team performance data (mock)
const teamPerformanceData: Record<number, { 
  winPercentage: number; 
  recentForm: string[]; 
  avgRunRate: number;
  powerPlayAvg: number;
  deathOversAvg: number;
}> = {
  101: { winPercentage: 68, recentForm: ['W', 'W', 'L', 'W', 'W'], avgRunRate: 8.9, powerPlayAvg: 9.7, deathOversAvg: 11.2 },
  102: { winPercentage: 65, recentForm: ['W', 'W', 'W', 'L', 'W'], avgRunRate: 8.5, powerPlayAvg: 8.9, deathOversAvg: 10.5 },
  103: { winPercentage: 52, recentForm: ['L', 'W', 'W', 'L', 'W'], avgRunRate: 9.2, powerPlayAvg: 9.5, deathOversAvg: 12.1 },
  104: { winPercentage: 55, recentForm: ['W', 'L', 'L', 'W', 'W'], avgRunRate: 8.3, powerPlayAvg: 8.8, deathOversAvg: 9.8 },
  105: { winPercentage: 48, recentForm: ['L', 'L', 'W', 'W', 'L'], avgRunRate: 8.4, powerPlayAvg: 9.2, deathOversAvg: 10.3 },
  106: { winPercentage: 51, recentForm: ['W', 'L', 'W', 'L', 'W'], avgRunRate: 8.6, powerPlayAvg: 9.0, deathOversAvg: 10.8 },
  107: { winPercentage: 53, recentForm: ['L', 'W', 'W', 'W', 'L'], avgRunRate: 8.2, powerPlayAvg: 8.5, deathOversAvg: 10.1 },
  108: { winPercentage: 45, recentForm: ['L', 'L', 'W', 'L', 'W'], avgRunRate: 8.7, powerPlayAvg: 9.3, deathOversAvg: 11.0 }
};

// Head-to-head data (mock)
const headToHeadData: Record<string, { 
  totalMatches: number; 
  team1Wins: number; 
  team2Wins: number;
  lastFiveResults: string[];
  avgFirstInningsScore: number;
  avgSecondInningsScore: number;
}> = {
  '101-102': { 
    totalMatches: 28, 
    team1Wins: 15, 
    team2Wins: 13, 
    lastFiveResults: ['1', '2', '1', '1', '2'],
    avgFirstInningsScore: 176,
    avgSecondInningsScore: 168
  },
  '103-104': { 
    totalMatches: 25, 
    team1Wins: 12, 
    team2Wins: 13, 
    lastFiveResults: ['2', '1', '2', '2', '1'],
    avgFirstInningsScore: 184,
    avgSecondInningsScore: 172
  },
  '105-106': { 
    totalMatches: 22, 
    team1Wins: 10, 
    team2Wins: 12, 
    lastFiveResults: ['1', '2', '2', '1', '2'],
    avgFirstInningsScore: 168,
    avgSecondInningsScore: 159
  }
};

// Venue performance data (mock)
const venueData: Record<string, {
  avgFirstInningsScore: number;
  avgSecondInningsScore: number;
  chaseSuccessRate: number;
  highScore: number;
  lowScore: number;
}> = {
  'Wankhede Stadium': {
    avgFirstInningsScore: 181,
    avgSecondInningsScore: 172,
    chaseSuccessRate: 61,
    highScore: 235,
    lowScore: 118
  },
  'M. Chinnaswamy Stadium': {
    avgFirstInningsScore: 190,
    avgSecondInningsScore: 183,
    chaseSuccessRate: 58,
    highScore: 248,
    lowScore: 125
  },
  'Feroz Shah Kotla': {
    avgFirstInningsScore: 165,
    avgSecondInningsScore: 157,
    chaseSuccessRate: 48,
    highScore: 215,
    lowScore: 128
  },
  'Punjab Cricket Association Stadium': {
    avgFirstInningsScore: 172,
    avgSecondInningsScore: 165,
    chaseSuccessRate: 53,
    highScore: 226,
    lowScore: 119
  }
};

interface CricketMatchStatsProps {
  match: CricketFixture;
}

const CricketMatchStats: React.FC<CricketMatchStatsProps> = ({ match }) => {
  const [activeTab, setActiveTab] = useState<'head-to-head' | 'team-stats' | 'venue'>('head-to-head');
  const { currentUser } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const team1Id = match.localteam_id;
  const team2Id = match.visitorteam_id;
  const team1Name = CRICKET_TEAM_NAMES[team1Id] || `Team ${team1Id}`;
  const team2Name = CRICKET_TEAM_NAMES[team2Id] || `Team ${team2Id}`;
  const h2hKey = `${team1Id}-${team2Id}`;
  const h2hData = headToHeadData[h2hKey] || {
    totalMatches: 0,
    team1Wins: 0,
    team2Wins: 0,
    lastFiveResults: [],
    avgFirstInningsScore: 0,
    avgSecondInningsScore: 0
  };

  const team1Stats = teamPerformanceData[team1Id] || {
    winPercentage: 0,
    recentForm: [],
    avgRunRate: 0,
    powerPlayAvg: 0,
    deathOversAvg: 0
  };

  const team2Stats = teamPerformanceData[team2Id] || {
    winPercentage: 0,
    recentForm: [],
    avgRunRate: 0,
    powerPlayAvg: 0,
    deathOversAvg: 0
  };

  const venue = match.venue_name || '';
  const venueStats = venueData[venue] || {
    avgFirstInningsScore: 0,
    avgSecondInningsScore: 0,
    chaseSuccessRate: 0,
    highScore: 0,
    lowScore: 0
  };

  // Only show premium stats for logged in users
  const isPremiumUser = !!currentUser;

  return (
    <div className="bg-[#0f121a] rounded-lg overflow-hidden shadow-lg mb-4">
      <div className="flex justify-between items-center p-4 bg-[#1a1f2c] border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Match Statistics</h3>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
        >
          {isExpanded ? 'Hide' : 'Show'} Stats
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <>
          <div className="flex border-b border-gray-700">
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'head-to-head' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('head-to-head')}
            >
              Head to Head
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'team-stats' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('team-stats')}
            >
              Team Stats
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'venue' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('venue')}
            >
              Venue Analysis
            </button>
          </div>

          <div className="p-4">
            {activeTab === 'head-to-head' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-center px-4">
                    <div className="text-2xl font-bold text-white">{h2hData.team1Wins}</div>
                    <div className="text-xs text-gray-400">{team1Name}</div>
                  </div>
                  <div className="text-center px-8 py-2 bg-[#1a1f2c] rounded-lg">
                    <div className="text-sm text-gray-400">Total Matches</div>
                    <div className="text-xl font-bold text-white">{h2hData.totalMatches}</div>
                  </div>
                  <div className="text-center px-4">
                    <div className="text-2xl font-bold text-white">{h2hData.team2Wins}</div>
                    <div className="text-xs text-gray-400">{team2Name}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1a1f2c] p-3 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Last 5 Encounters</div>
                    <div className="flex space-x-2">
                      {h2hData.lastFiveResults.map((result, i) => (
                        <div 
                          key={i} 
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            result === '1' 
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500' 
                              : 'bg-purple-500/20 text-purple-400 border border-purple-500'
                          }`}
                        >
                          {result === '1' ? '1' : '2'}
                        </div>
                      ))}
                    </div>
                  </div>

                  {isPremiumUser ? (
                    <div className="bg-[#1a1f2c] p-3 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">Avg Innings Score</div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-white font-medium">1st: </span>
                          <span className="text-green-400">{h2hData.avgFirstInningsScore}</span>
                        </div>
                        <div>
                          <span className="text-sm text-white font-medium">2nd: </span>
                          <span className="text-yellow-400">{h2hData.avgSecondInningsScore}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#1a1f2c] p-3 rounded-lg flex items-center justify-center">
                      <div className="text-sm text-gray-400 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Premium Stats
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'team-stats' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1a1f2c] p-3 rounded-lg">
                  <div className="text-sm font-medium text-white mb-2">{team1Name}</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Win Rate:</span>
                      <span className="text-sm text-green-400 font-medium">{team1Stats.winPercentage}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Recent Form:</span>
                      <div className="flex space-x-1">
                        {team1Stats.recentForm.map((result, i) => (
                          <div 
                            key={i} 
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                              result === 'W' 
                                ? 'bg-green-500/20 text-green-400 border border-green-500' 
                                : 'bg-red-500/20 text-red-400 border border-red-500'
                            }`}
                          >
                            {result}
                          </div>
                        ))}
                      </div>
                    </div>
                    {isPremiumUser && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Avg Run Rate:</span>
                          <span className="text-sm text-blue-400 font-medium">{team1Stats.avgRunRate}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Power Play Avg:</span>
                          <span className="text-sm text-yellow-400 font-medium">{team1Stats.powerPlayAvg}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-[#1a1f2c] p-3 rounded-lg">
                  <div className="text-sm font-medium text-white mb-2">{team2Name}</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Win Rate:</span>
                      <span className="text-sm text-green-400 font-medium">{team2Stats.winPercentage}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Recent Form:</span>
                      <div className="flex space-x-1">
                        {team2Stats.recentForm.map((result, i) => (
                          <div 
                            key={i} 
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                              result === 'W' 
                                ? 'bg-green-500/20 text-green-400 border border-green-500' 
                                : 'bg-red-500/20 text-red-400 border border-red-500'
                            }`}
                          >
                            {result}
                          </div>
                        ))}
                      </div>
                    </div>
                    {isPremiumUser && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Avg Run Rate:</span>
                          <span className="text-sm text-blue-400 font-medium">{team2Stats.avgRunRate}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Power Play Avg:</span>
                          <span className="text-sm text-yellow-400 font-medium">{team2Stats.powerPlayAvg}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'venue' && (
              <div className="space-y-4">
                <div className="bg-[#1a1f2c] p-3 rounded-lg">
                  <div className="text-sm font-medium text-white mb-2">{venue || 'Unknown Venue'}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Avg 1st Innings</div>
                      <div className="text-lg font-bold text-green-400">{venueStats.avgFirstInningsScore}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Avg 2nd Innings</div>
                      <div className="text-lg font-bold text-blue-400">{venueStats.avgSecondInningsScore}</div>
                    </div>
                  </div>
                </div>

                {isPremiumUser ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#1a1f2c] p-3 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">Chase Success</div>
                      <div className="text-lg font-bold text-orange-400">{venueStats.chaseSuccessRate}%</div>
                    </div>
                    <div className="bg-[#1a1f2c] p-3 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">Highest Score</div>
                      <div className="text-lg font-bold text-green-400">{venueStats.highScore}</div>
                    </div>
                    <div className="bg-[#1a1f2c] p-3 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">Lowest Score</div>
                      <div className="text-lg font-bold text-red-400">{venueStats.lowScore}</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#1a1f2c] p-3 rounded-lg text-center">
                    <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center justify-center w-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Sign in to unlock premium venue statistics
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CricketMatchStats; 