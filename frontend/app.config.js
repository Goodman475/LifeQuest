import 'dotenv/config';

const defaultApiUrl = process.env.EXPO_PUBLIC_API_URL
  || process.env.API_URL
  || (__DEV__ ? 'http://127.0.0.1:8000' : 'https://lifequest-4tc4.onrender.com');

export default ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins || []),
    "expo-router",
    "expo-font",
  ],
  extra: {
    ...(config.extra || {}),
    API_URL: defaultApiUrl,
  },
});