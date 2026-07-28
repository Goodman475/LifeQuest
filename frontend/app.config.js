import 'dotenv/config';

const isDev = process.env.NODE_ENV !== 'production';

const defaultApiUrl = process.env.EXPO_PUBLIC_API_URL
  || process.env.API_URL
  || (isDev ? 'http://127.0.0.1:8000' : 'https://lifequest-4tc4.onrender.com');

export default ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins || []),
    "expo-font",
  ],
  extra: {
    ...(config.extra || {}),
    API_URL: defaultApiUrl,
  },
});