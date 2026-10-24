import { useState, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import api from '../api/api.js';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function Login() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const criteria = useMemo(() => ({
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
    symbol: /[^A-Za-z0-9]/.test(form.password),
    valid: PASSWORD_REGEX.test(form.password),
  }), [form.password]);

  const setField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const isRegister = mode === 'register';

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    if (isRegister && form.name.trim().length < 3) return setError({ message: 'Nome mínimo 3 chars' });
    if (isRegister && !criteria.valid) return setError({ message: 'Senha não atende política de segurança' });

    setLoading(true);
    try {
      if (isRegister) {
        await api.post('/auth/register', form);
        setMode('login');
        setField('password', '');
      } else {
        await login(form.email, form.password);
        navigate('/products', { replace: true });
      }
    } catch (err) {
      setError({ message: err.response?.data?.message || 'Erro inesperado' });
    } finally {
      setLoading(false);
    }
  }, [form, isRegister, criteria.valid, login, navigate, setField]);

  return (
    <div className="login-wrapper">
      <form onSubmit={handleSubmit} className="login-card" noValidate>
        <h2>{isRegister ? 'Criar conta' : 'Entrar'}</h2>
        {error && <div className="error-box">{error.message}</div>}
        {isRegister && <input value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Nome completo" disabled={loading} />}
        <input value={form.email} onChange={e => setField('email', e.target.value)} placeholder="Email" type="email" disabled={loading} />
        
        <div className="password-field">
          <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setField('password', e.target.value)} placeholder="Senha" disabled={loading} />
          <button type="button" onClick={() => setShowPassword(v => !v)} className="password-toggle" tabIndex={-1}>
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        {isRegister && form.password && (
          <div className="password-criteria">
            <span className={criteria.length ? 'ok' : ''}>8+ chars</span>
            <span className={criteria.upper ? 'ok' : ''}>Maiúscula</span>
            <span className={criteria.lower ? 'ok' : ''}>Minúscula</span>
            <span className={criteria.number ? 'ok' : ''}>Número</span>
            <span className={criteria.symbol ? 'ok' : ''}>Símbolo</span>
          </div>
        )}
        
        <button type="submit" disabled={loading || (isRegister && !criteria.valid)}>
          {loading ? 'Processando...' : (isRegister ? 'Cadastrar' : 'Entrar')}
        </button>
        <button type="button" onClick={() => setMode(m => m === 'login' ? 'register' : 'login')} disabled={loading} className="secondary">
          {isRegister ? 'Já tenho conta' : 'Criar conta'}
        </button>
      </form>
    </div>
  );
}