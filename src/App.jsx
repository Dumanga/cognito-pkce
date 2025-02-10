import { useEffect, useState } from 'react';
import { cognito } from './modules/cognito';


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('id_token'));
  }, []);

  return (
    <div>
      {isLoggedIn ? (
        <><h1 style={{marginLeft: 50}}>Home</h1>
        <p style={{marginLeft: 50}}>Access Token: {localStorage.getItem('access_token')}</p>
        <p style={{marginLeft: 50}}>ID Token: {localStorage.getItem('id_token')}</p>
        <p style={{marginLeft: 50}}>Refresh Token: {localStorage.getItem('refresh_token')}</p>
        
        <button style={{marginLeft: 50, backgroundColor: "red"}} onClick={() => cognito.logout()}>Logout</button>
        </>
      ) : (
        <button onClick={() => cognito.login()}>
          Login with Cognito
        </button>
      )}
    </div>
  );
}