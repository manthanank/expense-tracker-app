export const environment = {
  production: false,
  apiUrl:
    window.location.hostname === 'localhost'
      ? 'https://expense-tracker-app-8y8i.vercel.app/api'
      : 'https://expense-tracker-app-8y8i.vercel.app/api',
};
