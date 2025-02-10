const CLIENT_ID = "344cia7nrt9p9vk32fqupf4s6m";
const SCOPE = "email openid profile";
const REDIRECT_URI = "http://localhost:3000";

const BASE_URL = `https://template.auth.ap-southeast-1.amazoncognito.com`;

const generateCodes = async () => {
  const encode = (arr) => {
    return window.btoa(String.fromCharCode.apply(null, arr))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  const verifier = encode(array);
  
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const challenge = encode(hashArray);

  return { code_challenge: challenge, code_verifier: verifier };
};

// Handle code exchange if code exists in URL
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
  const codeVerifier = localStorage.getItem('code_verifier');
  
  fetch(`${BASE_URL}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  })
  .then(response => response.json())
  .then(data => {
    localStorage.setItem('id_token', data.id_token);
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.removeItem('code_verifier');
    window.location.href = REDIRECT_URI;
    console.log('Tokens Saved', data);
  })
  .catch(error => {
    console.error('Error exchanging token:', error);
    window.location.href = REDIRECT_URI;
  });
}

export const cognito = {
  async login() {
    const { code_challenge, code_verifier } = await generateCodes();
    localStorage.setItem('code_verifier', code_verifier);
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: SCOPE,
      redirect_uri: REDIRECT_URI,
      code_challenge: code_challenge,
      code_challenge_method: 'S256',
    });
    
    window.location.href = `${BASE_URL}/oauth2/authorize?${params.toString()}`;
  },

  logout() {
    // Clear local storage
    localStorage.removeItem('id_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Redirect to Cognito logout endpoint
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      logout_uri: REDIRECT_URI,
    });
    
    window.location.href = `${BASE_URL}/logout?${params.toString()}`;
  },

  isAuthenticated() {
    return !!localStorage.getItem('id_token');
  }
};