console.log("Config loaded");
window.API_BASE = "https://api.agenda.ianordonez.cat";

window.COGNITO_CONFIG = {
  region: 'us-east-1',
  userPoolId: 'us-east-1_ZaFuS8zCL',
  clientId: '66fknmggfir2b3mh3nv1cpi7kc',
  domain: 'restricted-ecs-project-auth.auth.us-east-1.amazoncognito.com',
  redirectUri: window.location.origin + '/admin.html',
  logoutUri: window.location.origin + '/index.html',
  scope: 'openid email profile',
  identityProvider: ''
};

function getApiBase() {
  return API_BASE;
}


