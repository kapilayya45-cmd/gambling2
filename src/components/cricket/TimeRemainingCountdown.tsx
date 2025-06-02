import React, { useEffect, useState } from 'react';

interface TimeRemainingCountdownProps {
  matchTime: string; // ISO date string or time string
  matchDate: string; // Date string in YYYY-MM-DD format
  matchId?: string; // Match ID for fetching live scores
}

// Score interface to hold live score data
interface LiveScore {
  teamAName: string;
  teamAScore: string;
  teamAOvers: string;
  teamBName: string;
  teamBScore: string;
  teamBOvers: string;
}

const TimeRemainingCountdown: React.FC<TimeRemainingCountdownProps> = ({ 
  matchTime, 
  matchDate, 
  matchId 
}) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const [isLive, setIsLive] = useState(false);
  const [isPast, setIsPast] = useState(false);
  const [liveScore, setLiveScore] = useState<LiveScore | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);

  // Function to fetch live scores
  const fetchLiveScores = async () => {
    if (!matchId) return;
    
    setIsLoadingScore(true);
    setScoreError(null);
    
    try {
      // This will be replaced with the actual API endpoint you provide later
      // For now, we're using a mock endpoint that would fetch scores for a specific match
      const mockEndpoint = `/api/live-scores/${matchId}`;
      
      // In a real implementation, this would be:
      // const response = await fetch(mockEndpoint);
      // const data = await response.json();
      
      // For now, just mock the data
      // This simulates a successful API response
      const mockResponse = {
        teamAName: "Royal Challengers Bengaluru",
        teamAScore: "155/6",
        teamAOvers: "18.2",
        teamBName: "Punjab Kings",
        teamBScore: "120/4",
        teamBOvers: "15.1"
      };
      
      // In a real implementation, we would validate the response data
      setLiveScore(mockResponse);
    } catch (error) {
      console.error("Failed to fetch live scores:", error);
      setScoreError("Could not load live scores");
    } finally {
      setIsLoadingScore(false);
    }
  };

  useEffect(() => {
    // Function to calculate time remaining
    const calculateTimeRemaining = () => {
      // Create a date object from the match time
      const matchDateTime = new Date(`${matchDate}T${matchTime}`);
      const now = new Date();
      
      // Calculate the difference in milliseconds
      const diff = matchDateTime.getTime() - now.getTime();
      
      // If match time is in the past, show completed
      if (diff <= 0) {
        // If less than 3 hours after start time, consider it live
        if (Math.abs(diff) < 3 * 60 * 60 * 1000) {
          setIsLive(true);
          setIsPast(false);
        } else {
          setIsLive(false);
          setIsPast(true);
        }
        
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
        return;
      }
      
      // Calculate days, hours, minutes, seconds
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining({ days, hours, minutes, seconds });
      setIsLive(false);
      setIsPast(false);
    };
    
    // Calculate immediately
    calculateTimeRemaining();
    
    // Then update every second
    const intervalId = setInterval(calculateTimeRemaining, 1000);
    
    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
  }, [matchTime, matchDate]);

  // Effect to fetch live scores when match is live
  useEffect(() => {
    if (isLive) {
      // Initial fetch
      fetchLiveScores();
      
      // Set up polling for score updates every 30 seconds
      const scoreIntervalId = setInterval(fetchLiveScores, 30000);
      
      // Clean up interval
      return () => clearInterval(scoreIntervalId);
    }
  }, [isLive, matchId]);

  // Helper to add leading zeros
  const padZero = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  // Render different displays based on match status
  if (isLive) {
    return (
      <div className="bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded">
        <div className="flex items-center font-medium mb-2">
          <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-2"></span>
          LIVE NOW
        </div>
        
        {/* Live Score Display */}
        {isLoadingScore && !liveScore ? (
          <div className="text-center py-2">
            <div className="animate-pulse flex space-x-4 justify-center">
              <div className="h-4 w-20 bg-red-200 rounded"></div>
              <div className="h-4 w-4 bg-red-200 rounded-full"></div>
              <div className="h-4 w-20 bg-red-200 rounded"></div>
            </div>
          </div>
        ) : scoreError ? (
          <div className="text-center text-red-600 text-sm">{scoreError}</div>
        ) : liveScore ? (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="text-right">
              <div className="font-medium text-sm">{liveScore.teamAName}</div>
              <div className="font-bold">{liveScore.teamAScore}</div>
              <div className="text-xs">({liveScore.teamAOvers} overs)</div>
            </div>
            <div className="flex items-center justify-center text-lg font-bold">
              vs
            </div>
            <div className="text-left">
              <div className="font-medium text-sm">{liveScore.teamBName}</div>
              <div className="font-bold">{liveScore.teamBScore}</div>
              <div className="text-xs">({liveScore.teamBOvers} overs)</div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            Waiting for live scores...
          </div>
        )}
      </div>
    );
  }
  
  if (isPast) {
    return (
      <div className="bg-gray-100 border border-gray-300 text-gray-600 px-3 py-2 rounded">
        Match Completed
      </div>
    );
  }
  
  // Show countdown for upcoming matches
  return (
    <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded">
      <div className="font-medium mb-1">Match Starts In:</div>
      <div className="grid grid-cols-4 gap-1 text-center">
        <div className="flex flex-col">
          <span className="text-lg font-bold">{timeRemaining.days}</span>
          <span className="text-xs">Days</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold">{padZero(timeRemaining.hours)}</span>
          <span className="text-xs">Hours</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold">{padZero(timeRemaining.minutes)}</span>
          <span className="text-xs">Mins</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold">{padZero(timeRemaining.seconds)}</span>
          <span className="text-xs">Secs</span>
        </div>
      </div>
    </div>
  );
};

export default TimeRemainingCountdown; 