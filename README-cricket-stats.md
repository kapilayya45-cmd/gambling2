# Cricket Match Statistics Feature

## Overview

The Cricket Match Statistics feature enhances the Foxxy betting platform by providing users with detailed statistics and historical data to help them make more informed betting decisions. This feature displays team performance metrics, head-to-head comparisons, and venue-specific statistics for each cricket match.

## Components

### 1. CricketMatchStats Component
- Displays statistical data for a specific cricket match
- Includes collapsible UI to save screen space
- Features three main tabs:
  - **Head to Head**: Shows historical performance between the two teams
  - **Team Stats**: Displays individual team performance metrics
  - **Venue Analysis**: Provides venue-specific statistics

### 2. Cricket Match Detail Page
- Comprehensive match page with:
  - Live match scores and status
  - Match information (venue, time, etc.)
  - Statistics section powered by CricketMatchStats
  - Betting markets for the match
  - Integration with BetSlip for seamless betting experience

## Features

### Basic Statistics (Available to All Users)
- Team win percentages
- Recent form display (W/L for last 5 matches)
- Head-to-head record between teams
- Basic venue statistics (average scores)

### Premium Statistics (Available to Logged-in Users)
- Detailed batting metrics (avg run rate, power play performance)
- Advanced venue analysis (chase success rates, highest/lowest scores)
- Detailed innings statistics for head-to-head matches

## Data Structure

The component uses the following mock data structures:

1. **Team Performance Data**:
   - Win percentage
   - Recent form (last 5 matches)
   - Average run rate
   - Power play average
   - Death overs average

2. **Head-to-Head Data**:
   - Total matches played
   - Wins by each team
   - Last five results
   - Average first innings score
   - Average second innings score

3. **Venue Data**:
   - Average first innings score
   - Average second innings score
   - Chase success rate
   - Highest score at venue
   - Lowest score at venue

## Implementation

The statistics feature is implemented using React with TypeScript and styled using Tailwind CSS. The component uses the `useAuth` context to determine whether to show premium statistics based on user login status.

## Future Enhancements

1. **Real API Integration**: Replace mock data with real cricket statistics API
2. **Personalized Analysis**: Add personalized betting recommendations based on statistics
3. **Interactive Charts**: Implement visual charts for better data representation
4. **Trend Analysis**: Add ML-based trend analysis for predictive insights
5. **Historical Betting Performance**: Show how different statistical factors have influenced betting outcomes in the past 