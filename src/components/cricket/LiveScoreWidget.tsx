import React from 'react';
import { CricketFixture, CRICKET_TEAM_NAMES } from '@/services/cricketApi';

interface LiveScoreWidgetProps {
  match: CricketFixture;
}

const LiveScoreWidget: React.FC<LiveScoreWidgetProps> = ({ match }) => {
  const isLive = match.status === 'live';
  const teamAName = CRICKET_TEAM_NAMES[match.localteam_id] || `Team ${match.localteam_id}`;
  const teamBName = CRICKET_TEAM_NAMES[match.visitorteam_id] || `Team ${match.visitorteam_id}`;
  
  // Format match time
  const matchTime = new Date(match.starting_at);
  const formattedTime = matchTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = matchTime.toLocaleDateString([], { day: 'numeric', month: 'short' });
  
  // Calculate time remaining or elapsed
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - matchTime.getTime()) / (1000 * 60));
  const timeStatus = diffInMinutes < 0 
    ? `Starts in ${Math.abs(diffInMinutes)} min` 
    : `${diffInMinutes} min elapsed`;

  return (
    <div className="bg-[#0a0d14] rounded-lg overflow-hidden border border-[#1a2030]">
      {/* Match header */}
      <div className="bg-black p-4 border-b border-[#1a2030]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">{formattedDate} • {formattedTime}</span>
          {isLive && (
            <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full flex items-center">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></span>
              LIVE
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#25b95f]/10 rounded-full flex items-center justify-center mr-3">
              <span className="text-lg font-bold text-[#25b95f]">{teamAName.substring(0, 2)}</span>
            </div>
            <div>
              <h3 className="font-bold text-white">{teamAName}</h3>
              {match.localteam_score && (
                <span className="text-white">{match.localteam_score}</span>
              )}
            </div>
          </div>
          <span className="text-gray-400 mx-3">vs</span>
          <div className="flex items-center">
            <div>
              <h3 className="font-bold text-white text-right">{teamBName}</h3>
              {match.visitorteam_score && (
                <span className="text-white">{match.visitorteam_score}</span>
              )}
            </div>
            <div className="w-12 h-12 bg-[#e53935]/10 rounded-full flex items-center justify-center ml-3">
              <span className="text-lg font-bold text-[#e53935]">{teamBName.substring(0, 2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Match details */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-black p-3 rounded-lg">
            <h4 className="text-xs uppercase text-gray-400 mb-1">Venue</h4>
            <p className="text-white">{match.venue_name}, {match.venue_city}</p>
          </div>
          <div className="bg-black p-3 rounded-lg">
            <h4 className="text-xs uppercase text-gray-400 mb-1">Status</h4>
            <p className="text-white">{isLive ? 'In Progress' : 'Not Started'} • {timeStatus}</p>
          </div>
        </div>
        
        {/* Live score details (only shown when match is live) */}
        {isLive && match.live_score && (
          <div className="bg-black p-3 rounded-lg mb-4">
            <div className="flex justify-between mb-2">
              <div>
                <h4 className="text-xs uppercase text-gray-400 mb-1">Run Rate</h4>
                <p className="text-white text-lg font-semibold">{match.live_score.run_rate.toFixed(2)}</p>
              </div>
              <div>
                <h4 className="text-xs uppercase text-gray-400 mb-1">Overs</h4>
                <p className="text-white text-lg font-semibold">{match.live_score.overs.toFixed(1)}</p>
              </div>
              <div>
                <h4 className="text-xs uppercase text-gray-400 mb-1">Required Rate</h4>
                <p className="text-white text-lg font-semibold">8.45</p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-[#1a2030]">
              <h4 className="text-xs uppercase text-gray-400 mb-2">Last 5 Overs</h4>
              <div className="flex space-x-2">
                {[6, 1, 'W', 4, 2].map((run, idx) => (
                  <div 
                    key={idx} 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                      ${run === 'W' ? 'bg-red-500/20 text-red-500' : 'bg-[#25b95f]/20 text-[#25b95f]'}`
                    }
                  >
                    {run}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Partnership info (only shown when match is live) */}
        {isLive && (
          <div className="bg-black p-3 rounded-lg">
            <h4 className="text-xs uppercase text-gray-400 mb-2">Current Partnership</h4>
            <div className="flex justify-between text-white">
              <div className="flex items-center">
                <span className="font-semibold mr-2">V. Kohli</span>
                <span className="text-[#25b95f]">32 (28)</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">R. Sharma</span>
                <span className="text-[#25b95f]">47 (35)</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-400">Partnership</span>
                <span className="text-xs text-white">76 runs (8.2 overs)</span>
              </div>
              <div className="w-full h-2 bg-[#1a2030] rounded-full overflow-hidden">
                <div className="h-full bg-[#25b95f]" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveScoreWidget; 