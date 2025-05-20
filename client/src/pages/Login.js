import './Login.css';
import { useState } from 'react';
import { supabase } from '../superbaseClient';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    let response;

    if (isRegistering) {
      response = await supabase.auth.signUp({ email, password });
    } else {
      response = await supabase.auth.signInWithPassword({ email, password });
    }

    const { error } = response;

    if (error) {
      setError(error.message);
    } else {
      setSuccess(isRegistering ? 'Registered! Now login.' : 'Login successful!');
      if (!isRegistering && onLogin) onLogin();
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
          <p className="toggle-auth" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering
              ? 'Already have an account? Login here'
              : "Don't have an account? Register here"}
          </p>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;
