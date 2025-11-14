export const environment = {
  production: true,
  apiBaseUrl: 'https://foodies-gateway.onrender.com',
  oauth: {
    tokenUrl: '/connect/token',
    clientId: 'gateway',
    clientSecret: 'super-secreto',
    scope: 'mi-api offline_access'
  }
};
