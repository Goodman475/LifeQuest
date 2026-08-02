import 'dotenv/config';

const defaultApiUrl = process.env.EXPO_PUBLIC_API_URL
  || process.env.API_URL
  || 'https://lifequest-4tc4.onrender.com';

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