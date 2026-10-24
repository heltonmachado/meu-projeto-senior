import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import api from '../api/api.js';

export default function Login() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const updateField = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isRegister && form.name.trim().length < 3) {
      return setError('Nome deve ter no minimo 3 caracteres');
    }
    if (form.password.length < 6) {
      return setError('Senha deve ter no minimo 6 caracteres');
    }
    setLoading(true);
    try {
      if (isRegister) {
        await api.post('/auth/register', form);
        setIsRegister(false);
        setForm(prev => ({ ...prev, password: '' }));
      } else {
        await login(form.email, form.password);
        navigate('/products', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form onSubmit={handleSubmit} className="login-card">
        <h2>{isRegister ? 'Criar conta' : 'Entrar'}</h2>
        {error && <div className="error-box">{error}</div>}
        {isRegister && <input value={form.name} onChange={updateField('name')} placeholder="Nome completo" required />}
        <input value={form.email} onChange={updateField('email')} placeholder="Email" type="email" required />
        
        <div className="password-field">
          <input 
            type={showPassword ? 'text' : 'password'}
            value={form.password} 
            onChange={updateField('password')} 
            placeholder="Senha" 
            required 
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle" tabIndex={-1}>
            {showPassword ? 'ocultar' : 'ver'}
          </button>
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Carregando...' : (isRegister ? 'Cadastrar' : 'Entrar')}
        </button>
        <button type="button" onClick={()=> setIsRegister(!isRegister)} disabled={loading} className="secondary">
          {isRegister ? 'Já tenho conta' : 'Criar conta'}
        </button>
      </form>
    </div>
  );
}