console.log("Config loaded");
window.API_BASE = window.location.origin + "/api";

window.COGNITO_CONFIG = {
  region: 'us-east-1',
  userPoolId: 'us-east-1_uGeXJQSnO',
  clientId: '536rm4p7t8qju151o0s8isj30p',
  domain: 'agenda-barata-auth-c84835.auth.us-east-1.amazoncognito.com',
  redirectUri: window.location.origin + '/admin.html',
  logoutUri: window.location.origin + '/index.html',
  scope: 'openid email profile',
  identityProvider: ''
};

function getApiBase() {
  return API_BASE;
}


