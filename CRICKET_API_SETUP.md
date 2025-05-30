# Setting up the Cricket API

To get real IPL match data instead of mock data, you need to sign up for a Cricket Data API key:

1. Visit https://cricketdata.org/ and create an account
2. After signing up, go to your dashboard to get your API key
3. Create a .env.local file in the root of your project with the following content:

```
NEXT_PUBLIC_CRICKET_API_KEY=your_api_key_here
```

4. Restart your development server with 'npm run dev'

The app will now try to fetch real IPL match data from Cricket Data API.
