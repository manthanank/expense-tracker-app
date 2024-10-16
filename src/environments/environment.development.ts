export const environment = {
  production: true,
  apiUrl:
    window.location.hostname === 'localhost'
      ? 'https://expense-tracker-app-8y8i.vercel.app/api'
      : 'https://expense-tracker-app-8y8i.vercel.app/api',
};
