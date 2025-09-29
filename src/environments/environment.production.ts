export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:5000',
  oauth: {
    tokenUrl: '/connect/token',
    clientId: 'gateway',
    clientSecret: 'super-secreto',
    scope: 'mi-api offline_access'
  }
};
