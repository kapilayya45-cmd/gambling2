// src/components/Sidebar.tsx
import React, { useCallback, memo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
// Mock implementation to fix missing module issue
const fetchLeagueEvents = async () => [];
const fetchMatches = async () => [];
const TENNIS_LEAGUES = [
  { id: '4464', name: 'ATP Tour' },
  { id: '4517', name: 'WTA Tour' },
  { id: '4491', name: 'Davis Cup' },
  { id: '4506', name: 'Fed Cup' },
  { id: '4481', name: 'Grand Slams' },
  { id: '4478', name: 'ATP Masters' },
  { id: '4489', name: 'Exhibition Matches' }
];
import { useLeagueStatus } from '@/hooks/useLeagueStatus';
import { CRICKET_LEAGUES, FOOTBALL_LEAGUES } from '@/constants/leagues';
import { BASKETBALL_LEAGUES as NEW_BASKETBALL_LEAGUES } from '@/constants/basketballLeagues';
import { useBasketballStatus } from '@/hooks/useBasketballStatus';
import { fetchCricketLivescores, CRICKET_TEAM_NAMES } from '@/services/cricketApi';

// Helper function to slugify text for URLs
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim();
};

// Icons for navigation items
const FeedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 8l-7 5-7-5M5 19h14a2 2 0 002-2V9a2 2 0 00-2-2h-1" />
  </svg>
);

const LiveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CasinoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const BetslipIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const PromotionsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
);

const AdminIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

// Sport Icons
const SportsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" />
  </svg>
);

const ChevronIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const NewsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
  </svg>
);

const CricketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const FootballIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6l4 4 4-4M6 12h12M8 18l4-4 4 4" />
  </svg>
);

const BasketballIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
  </svg>
);

const TennisIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.5 2 2 6.5 2 12M12 2c5.5 0 10 4.5 10 10M12 22c5.5 0 10-4.5 10-10M12 22C6.5 22 2 17.5 2 12" />
  </svg>
);

const HorseRacingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20l-6-2-6 2V4l6-2 6 2 6-2v16l-6-2z" />
  </svg>
);

const GreyhoundIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const LotteryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
  </svg>
);

const MultiMarketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const AirplaneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  href: string;
  isLive?: boolean;
}

interface SportCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  href: string;
  isLive?: boolean;
  count?: number;
}

// Updated navigation items in the requested order
const navigationItems: NavigationItem[] = [
  { id: 'feed', name: 'My Feed', icon: <FeedIcon />, href: '/feed' },
  { id: 'casino', name: 'Casino', icon: <CasinoIcon />, href: '/casino' },
  { id: 'wallet', name: 'My Wallet', icon: <WalletIcon />, href: '/wallet' },
  { id: 'betslip', name: 'Betslip', icon: <BetslipIcon />, href: '/betslip' },
  { id: 'news', name: 'News', icon: <NewsIcon />, href: '/news' },
];

const sportsCategories: SportCategory[] = [
  { id: 'cricket', name: 'Cricket', icon: <CricketIcon />, href: '/cricket', count: 24 },
  { id: 'football', name: 'Football', icon: <FootballIcon />, href: '/football', count: 48 },
  { id: 'basketball', name: 'Basketball', icon: <BasketballIcon />, href: '/basketball', count: 16 },
  { id: 'tennis', name: 'Tennis', icon: <TennisIcon />, href: '/tennis', count: 12 },
  { id: 'horse-racing', name: 'Horse Racing', icon: <HorseRacingIcon />, href: '/horse-racing', count: 8 },
  { id: 'greyhound', name: 'Greyhound Racing', icon: <GreyhoundIcon />, href: '/greyhound', count: 6 },
  { id: 'lottery', name: 'Lottery', icon: <LotteryIcon />, href: '/lottery', count: 4 },
  { id: 'multi-markets', name: 'Multi Markets', icon: <MultiMarketIcon />, href: '/multi-markets', count: 20 },
];

// Legacy league constants - can be removed after full migration to Entity Sports API
const OLD_CRICKET_LEAGUES = [
  { id: '4328', name: 'Ball by Ball' },
  { id: '4387', name: 'IPL' },
  { id: '4418', name: 'PSL' },
  { id: '4419', name: 'County Championship' },
  { id: '4422', name: 'ICC World Cup' },
  { id: '4435', name: 'Inter-Provincial' },
  { id: '4415', name: 'Test Matches' }
];

const OLD_FOOTBALL_LEAGUES = [
  { id: '4422', name: 'Romanian Soccer' },
  { id: '4332', name: 'Italian Soccer' },
  { id: '4426', name: 'Saudi Soccer' },
  { id: '4428', name: 'Danish Soccer' },
  { id: '4339', name: 'Turkish Soccer' },
  { id: '4347', name: 'Swedish Soccer' },
  { id: '4422', name: 'Polish Ekstraklasa' },
  { id: '4335', name: 'Spanish Soccer' },
  { id: '4328', name: 'English Soccer' },
  { id: '4351', name: 'Brazilian Soccer' },
  { id: '4400', name: 'Argentinian Soccer' }
];

// Other legacy league constants - keep for now
const BASKETBALL_LEAGUES = [
  { id: '4487', name: 'French ProA League' },
  { id: '4387', name: 'NBA' }
];

const HORSE_RACING_LEAGUES = [
  { id: '4510', name: 'AUS' },
  { id: '4512', name: 'RSA' },
  { id: '4498', name: 'FRA' },
  { id: '4497', name: 'GB' },
  { id: '4499', name: 'IRE' }
];

const GREYHOUND_LEAGUES = [
  { id: '4520', name: 'AUS' },
  { id: '4523', name: 'GB' }
];

// Interface for legacy league status
interface LegacyLeagueStatus {
  [key: string]: {
    inSeason: boolean;
    live: boolean;
  };
}

const Sidebar: React.FC = () => {
  const router = useRouter();
  const { isAdmin } = useAdmin();
  const { currentUser } = useAuth();
  const { status: entitySportsStatus } = useLeagueStatus();
  const basketballStatus = useBasketballStatus();
  const [expandedSport, setExpandedSport] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSport = (sportId: string) => {
    setExpandedSport(expandedSport === sportId ? null : sportId);
  };

  // Load upcoming cricket matches
  useEffect(() => {
    async function loadMatches() {
      try {
        const matches = await fetchMatches(); // returns [{teamA, teamB, date, sport}, …]
        const upcoming = matches.filter(m =>
          m.sport === 'cricket' &&
          (m.date === 'Today' || m.date === 'Tomorrow')
        );

        // If no matches from API, use fixtures from cricket API
        if (upcoming.length === 0) {
          const fixtures = await fetchCricketLivescores();
          
          // Filter for IPL matches (assuming league_id 1 is IPL)
          const iplFixtures = fixtures.filter(match => match.league_id === 1);
          
          // Create match labels in "Team A vs Team B" format
          const labels = iplFixtures.map(match => {
            const teamA = CRICKET_TEAM_NAMES[match.localteam_id] || `Team ${match.localteam_id}`;
            const teamB = CRICKET_TEAM_NAMES[match.visitorteam_id] || `Team ${match.visitorteam_id}`;
            return `${teamA} vs ${teamB}`;
          });
          
          // Get unique labels and limit to 4
          const uniqueLabels = Array.from(new Set(labels)).slice(0, 4);
          
          setCricketMatches(uniqueLabels.length > 0 ? uniqueLabels : [
            'Mumbai Indians vs Chennai Super Kings',
            'Royal Challengers Bangalore vs Kolkata Knight Riders',
            'Delhi Capitals vs Rajasthan Royals',
            'Sunrisers Hyderabad vs Punjab Kings'
          ]);
        } else {
          // Build unique "Team A vs Team B" labels
          const labels = upcoming.map(m => `${m.teamA} vs ${m.teamB}`);
          const uniqueLabels = Array.from(new Set(labels)).slice(0, 4);
          setCricketMatches(uniqueLabels);
        }
      } catch (error) {
        console.error('Error fetching cricket matches:', error);
        // Fallback to sample matches if API fails
        setCricketMatches([
          'Mumbai Indians vs Chennai Super Kings',
          'Royal Challengers Bangalore vs Kolkata Knight Riders',
          'Delhi Capitals vs Rajasthan Royals',
          'Sunrisers Hyderabad vs Punjab Kings'
        ]);
      }
    }
    loadMatches();
  }, []);

  // Load legacy league statuses with mock data instead of API calls
  useEffect(() => {
    // Mock data for legacy leagues
    const mockStatus: typeof legacyLeagueStatus = {};
    
    // Add mock status for legacy cricket leagues
    OLD_CRICKET_LEAGUES.forEach(lg => {
      mockStatus[lg.id] = {
        inSeason: true,
        live: lg.id === '4387', // Make IPL "live" for demonstration
      };
    });
    
    // Add mock status for legacy football leagues
    OLD_FOOTBALL_LEAGUES.forEach(lg => {
      mockStatus[lg.id] = {
        inSeason: true,
        live: lg.id === '4328', // Make English Soccer "live" for demonstration
      };
    });
    
    // Add mock status for other leagues
    BASKETBALL_LEAGUES.forEach(lg => {
      mockStatus[lg.id] = {
        inSeason: true,
        live: lg.id === '4387', // Make NBA "live" for demonstration
      };
    });
    
    TENNIS_LEAGUES.forEach(lg => {
      mockStatus[lg.id] = {
        inSeason: true,
        live: lg.id === '4464', // Make ATP "live" for demonstration
      };
    });
    
    HORSE_RACING_LEAGUES.forEach(lg => {
      mockStatus[lg.id] = {
        inSeason: true,
        live: lg.id === '4497', // Make GB "live" for demonstration
      };
    });
    
    GREYHOUND_LEAGUES.forEach(lg => {
      mockStatus[lg.id] = {
        inSeason: true,
        live: lg.id === '4520', // Make AUS "live" for demonstration
      };
    });
    
    setLegacyLeagueStatus(mockStatus);
  }, []);

  // League IDs to check (example IDs for demonstration)
  const leagueIds = {
    cricket: {
      'ball-by-ball': '4328',
      'ipl': '4387',
      'psl': '4418',
      'county-championship': '4419',
      'icc-world-cup-league': '4422',
      'inter-provincial': '4435',
      'test-matches': '4415'
    },
    football: {
      'romanian-soccer': '4422',
      'italian-soccer': '4332',
      'saudi-soccer': '4426',
      'danish-soccer': '4428',
      'turkish-soccer': '4339',
      'swedish-soccer': '4347',
      'polish-ekstraklasa': '4422',
      'spanish-soccer': '4335',
      'english-soccer': '4328',
      'brazilian-soccer': '4351',
      'argentinian-soccer': '4400'
    },
    basketball: {
      'french-proa-league': '4487',
      'nba': '4387'
    },
    tennis: {
      'atp-tour': '4464',
      'wta-tour': '4517',
      'davis-cup': '4491',
      'fed-cup': '4506',
      'grand-slams': '4481',
      'atp-masters': '4478',
      'exhibition-matches': '4489'
    },
    'horse-racing': {
      'aus': '4510',
      'rsa': '4512',
      'fra': '4498',
      'gb': '4497',
      'ire': '4499'
    },
    'greyhound': {
      'aus': '4520',
      'gb': '4523'
    }
  };

  // Get display name or email for header
  const userDisplayName = currentUser ? (currentUser.displayName || currentUser.email || 'User') : 'Guest';
  
  // Get first letter of username for avatar
  const userInitial = userDisplayName ? userDisplayName.charAt(0).toUpperCase() : 'G';
  
  // Determine active item based on current route
  const activeItem = router.pathname.substring(1) || 'feed';
  
  // Check if any sport is active
  const isSportActive = Object.keys(leagueIds).some(sport => sport === activeItem);

  // Helper function to render cricket league links from Entity Sports API
  const renderCricketLeague = (lg) => (
    <li key={lg.id} className="flex items-center px-3 py-2 rounded hover:bg-[#2a3040]">
      <Link href={lg.id === 1 ? '/cricket/ipl/bet' : `/cricket/${lg.id}`} legacyBehavior>
        <a className="flex-1 text-gray-300 hover:text-white text-sm">
          {lg.name}
        </a>
      </Link>
      {entitySportsStatus[lg.id]?.live && (
        <span className="ml-auto bg-red-500 text-xs text-white px-1 rounded">LIVE</span>
      )}
      {!entitySportsStatus[lg.id]?.live && entitySportsStatus[lg.id]?.inSeason && (
        <span className="ml-auto bg-green-500 text-xs text-white px-1 rounded">IN SEASON</span>
      )}
    </li>
  );

  // Helper function to render football league links from SportMonks API
  const renderFootballLeague = (lg) => (
    <li key={lg.id} className="flex items-center px-3 py-2 rounded hover:bg-[#2a3040]">
      <Link href={`/football/${lg.id}`} legacyBehavior>
        <a className="flex-1 text-gray-300 hover:text-white text-sm">
          {lg.name}
        </a>
      </Link>
      {entitySportsStatus[lg.id]?.live && (
        <span className="ml-auto bg-red-500 text-xs text-white px-1 rounded">LIVE</span>
      )}
      {!entitySportsStatus[lg.id]?.live && entitySportsStatus[lg.id]?.inSeason && (
        <span className="ml-auto bg-green-500 text-xs text-white px-1 rounded">IN SEASON</span>
      )}
    </li>
  );

  // Legacy helper - maintain for backward compatibility for now
  const getLeagueStatus = (sport: string, leagueKey: string) => {
    const id = leagueIds[sport]?.[leagueKey];
    return id ? legacyLeagueStatus[id] : { inSeason: false, live: false };
  };

  // Legacy helper - maintain for backward compatibility for now
  const renderLeagueLink = (sport: string, leagueKey: string, leagueName: string) => {
    const status = getLeagueStatus(sport, leagueKey);
    
    return (
      <li key={leagueKey} className="flex items-center px-3 py-2 rounded hover:bg-[#2a3040]">
        <Link href={`/${sport}/${leagueKey}`} legacyBehavior>
          <a className="flex-1 text-gray-300 hover:text-white text-sm">
            {leagueName}
          </a>
        </Link>
        {status?.live && (
          <span className="ml-auto bg-red-500 text-xs text-white px-1 rounded">LIVE</span>
        )}
        {!status?.live && status?.inSeason && (
          <span className="ml-auto bg-green-500 text-xs text-white px-1 rounded">IN SEASON</span>
        )}
      </li>
    );
  };

  // Helper function to render basketball league links
  const renderBasketballLeague = (lg) => (
    <li key={lg.id} className="flex items-center px-3 py-2 hover:bg-[#2a3040] rounded">
      <Link href={`/basketball/${lg.id}`} legacyBehavior>
        <a className="flex-1 text-gray-300 hover:text-white text-sm">{lg.name}</a>
      </Link>
      {basketballStatus[lg.id]?.live ? (
        <span className="ml-auto bg-red-600 text-xs px-2 py-0.5 rounded">LIVE</span>
      ) : basketballStatus[lg.id]?.inSeason ? (
        <span className="ml-auto bg-green-500 text-xs px-2 py-0.5 rounded">IN SEASON</span>
      ) : null}
    </li>
  );

  // Memoized navigation handlers
  const handleProfileClick = useCallback(() => {
    router.push('/');
  }, [router]);

  // State for Cricket matches
  const [cricketMatches, setCricketMatches] = useState<string[]>([]);
  
  // Legacy status for backward compatibility
  const [legacyLeagueStatus, setLegacyLeagueStatus] = useState<LegacyLeagueStatus>({});

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Mobile Header - Only visible on mobile */}
      <div className="md:hidden px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {/* Main Navigation Items */}
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                router.pathname === item.href
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </div>

        {/* Sports Categories */}
        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Sports
          </h3>
          <div className="mt-2 space-y-1">
            {sportsCategories.map((sport) => (
              <div key={sport.id}>
                <button
                  onClick={() => toggleSport(sport.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    expandedSport === sport.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{sport.icon}</span>
                    <span>{sport.name}</span>
                  </div>
                  {sport.count && (
                    <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {sport.count}
                    </span>
                  )}
                </button>

                {/* Sport-specific leagues */}
                {expandedSport === sport.id && (
                  <div className="ml-8 mt-1 space-y-1">
                    {sport.id === 'cricket' && CRICKET_LEAGUES.map(lg => renderCricketLeague(lg))}
                    {sport.id === 'football' && FOOTBALL_LEAGUES.map(lg => renderFootballLeague(lg))}
                    {sport.id === 'basketball' && NEW_BASKETBALL_LEAGUES.map(lg => renderBasketballLeague(lg))}
                    {sport.id === 'tennis' && TENNIS_LEAGUES.map(lg => (
                      <Link
                        key={lg.id}
                        href={`/tennis/${slugify(lg.name)}`}
                        className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                      >
                        {lg.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Admin
            </h3>
            <div className="mt-2">
              <Link
                href="/admin"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
              >
                <AdminIcon />
                <span className="ml-3">Admin Dashboard</span>
              </Link>
            </div>
          </div>
        )}

        {/* Mobile-only additional sections */}
        <div className="md:hidden mt-8">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Quick Links
          </h3>
          <div className="mt-2 space-y-1">
            <Link
              href="/promotions"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
            >
              <PromotionsIcon />
              <span className="ml-3">Promotions</span>
            </Link>
            <Link
              href="/live"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
            >
              <LiveIcon />
              <span className="ml-3">Live Events</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

// Memoize the entire component to prevent unnecessary re-renders
export default memo(Sidebar);