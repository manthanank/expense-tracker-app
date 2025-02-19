export const environment = {
  production: true,
  apiUrl:
    window.location.hostname === 'localhost'
      ? 'http://localhost:5000/api'
      : 'https://expense-tracker-api-app.vercel.app/api',
};
