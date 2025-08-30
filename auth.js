// auth.js

// Save token with expiry (7 days)
export function storeToken(tokenId) {
    const now = new Date();
    const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const tokenData = {
      value: tokenId,
      expiry: expiry.toISOString()
    };
    localStorage.setItem('token_id', JSON.stringify(tokenData));
  }
  
  // Check validity of token
  export function isTokenValid() {
    const tokenData = JSON.parse(localStorage.getItem('token_id'));
    if (!tokenData) return false;
  
    const now = new Date();
    const expiry = new Date(tokenData.expiry);
    if (now > expiry) {
      localStorage.removeItem('token_id');
      return false;
    }
    return true;
  }
  
  // Redirect on valid token
  export function checkAndRedirect() {
    if (isTokenValid()) {
      window.location.href = 'dashboard.html';
    }
  }