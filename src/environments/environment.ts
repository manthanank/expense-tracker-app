export const environment = {
  production: false,
  apiUrl:
    window.location.hostname === 'localhost'
      ? 'http://localhost:5000/api'
      : 'https://expense-tracker-api-app.vercel.app/api',
  trackingApiUrl: 'https://visitor-tracking-api.vercel.app/api/visit',
};
