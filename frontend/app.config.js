import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    API_URL: process.env.API_URL || 'http://127.0.0.1:8000',
  },
});
