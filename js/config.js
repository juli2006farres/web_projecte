console.log("Config loaded");
window.API_BASE = window.location.origin + "/api";

window.COGNITO_CONFIG = {
  region: 'us-east-1',
  userPoolId: 'us-east-1_eXOAp74KV',
  clientId: '5u259dphsi29sjqo8vj9fhv2me',
  domain: 'agenda-barata-auth-c44f17.auth.us-east-1.amazoncognito.com',
  redirectUri: window.location.origin + '/admin.html',
  logoutUri: window.location.origin + '/index.html',
  scope: 'openid email profile',
  identityProvider: ''
};

function getApiBase() {
  return API_BASE;
}


