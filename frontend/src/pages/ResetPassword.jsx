import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/api.js';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const criteria = useMemo(() => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
    valid: PASSWORD_REGEX.test(password),
  }), [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!criteria.valid) return setMessage({ type: 'error', text: 'Senha não atende política de segurança' });
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setMessage({ type: 'success', text: 'Senha redefinida! Redirecionando...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Token inválido ou expirado' });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="error-box">Token não encontrado na URL. Use o link enviado por email.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrapper">
      <form onSubmit={handleSubmit} className="login-card">
        <h2>Nova senha</h2>
        {message && <div className={message.type === 'error' ? 'error-box' : 'success-box'}>{message.text}</div>}
        
        <div className="password-field">
          <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Nova senha" required disabled={loading} />
          <button type="button" onClick={() => setShowPassword(v => !v)} className="password-toggle" tabIndex={-1}>
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        {password && (
          <div className="password-criteria">
            <span className={criteria.length ? 'ok' : ''}>8+ chars</span>
            <span className={criteria.upper ? 'ok' : ''}>Maiúscula</span>
            <span className={criteria.lower ? 'ok' : ''}>Minúscula</span>
            <span className={criteria.number ? 'ok' : ''}>Número</span>
            <span className={criteria.symbol ? 'ok' : ''}>Símbolo</span>
          </div>
        )}
        
        <button type="submit" disabled={loading || !criteria.valid}>{loading ? 'Salvando...' : 'Redefinir senha'}</button>
      </form>
    </div>
  );
}
