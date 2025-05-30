# IPL Cricket Match Tracker

## Overview
This application provides real-time IPL cricket match tracking and display functionality, using Entity Sports API for live and upcoming match data.

## Features
- Real-time IPL cricket match updates
- Display of live scores and match details
- Upcoming match fixtures
- Team and player information

## Setup

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Entity Sports API key

### Installation
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Entity Sports API key:
     ```
     NEXT_PUBLIC_ENTITY_SPORTS_API_KEY=your_api_key_here
     ```

### Running the application
Development mode:
```
npm run dev
```

Build for production:
```
npm run build
npm start
```

## Implementation Details

### API Integration
The application uses Entity Sports API for real IPL cricket match data. The implementation includes:

1. **Proxy API endpoints**: To avoid CORS issues and protect API keys
   - `/api/cricket/matches` - All IPL matches
   - `/api/cricket/live` - Live IPL matches
   - `/api/cricket/match/[id]` - Specific match details
   - `/api/cricket/competition` - IPL competition info

2. **Data conversion**: Entity Sports data is converted to a consistent format

3. **Error handling**: Robust error handling with informative messages

## Further Documentation
See `ENTITY_SPORTS_SETUP.md` for detailed instructions on setting up the Entity Sports API integration.
