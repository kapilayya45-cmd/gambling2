# ODDS-API Setup for IPL Cricket Matches

This guide explains how to set up ODDS-API via Rapid API for fetching IPL cricket match data with betting odds.

## Prerequisites

- A Rapid API account (sign up at [rapidapi.com](https://rapidapi.com))
- Subscription to the ODDS-API on Rapid API
- Basic knowledge of Node.js and Next.js

## Setup Steps

### 1. API Key Configuration

1. Sign up for a Rapid API account at [rapidapi.com](https://rapidapi.com)
2. Subscribe to the ODDS-API (search for "odds api" in the marketplace)
3. Copy your API key from the Rapid API dashboard
4. Add the following to your `.env.local` file in the project root:

```
NEXT_PUBLIC_RAPID_API_KEY=your_rapidapi_key_here
```

### 2. Verify Endpoints

The integration provides the following API endpoints that proxy to ODDS-API:

- `/api/cricket/matches` - Get all IPL matches with betting odds
- `/api/cricket/live` - Get live IPL matches only
- `/api/cricket/match/[id]` - Get details for a specific match with odds

Test these endpoints after adding your API key to ensure they're working correctly.

### 3. Using Betting Odds

The API returns betting odds in the following format:

```json
{
  "betting_odds": {
    "match_winner": {
      "Team A": 1.85,
      "Team B": 2.10
    },
    "toss_winner": {
      "Team A": 1.95,
      "Team B": 1.95
    },
    "totals": {
      "over": {
        "value": 165.5,
        "price": 1.90
      },
      "under": {
        "value": 165.5,
        "price": 1.90
      }
    }
  }
}
```

You can access these odds in your components to display betting information.

## Troubleshooting

1. **401 Unauthorized errors**: Check that your Rapid API key is correctly set in the `.env.local` file
2. **No matches found**: Verify that there are current IPL matches in the API's database
3. **CORS errors**: These should not occur as our API endpoints proxy the requests server-side

## Rate Limiting

Be aware that ODDS-API via Rapid API has rate limits depending on your subscription plan. The free tier typically allows:

- 500 requests per month
- 5 requests per second

Implement caching if you expect high traffic to avoid hitting these limits.

## Response Structure

All endpoints return data in the following format:

```json
{
  "status": true,
  "message": "Success message",
  "data": [
    // Response data
  ]
}
```

Error responses follow this pattern:

```json
{
  "status": false,
  "message": "Error message",
  "error": "Detailed error information"
}
``` 