import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage({ type: 'success', text: data.message });
      if (data.resetLink) {
        console.log('DEV LINK:', data.resetLink);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao enviar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form onSubmit={handleSubmit} className="login-card">
        <h2>Recuperar senha</h2>
        {message && <div className={message.type === 'error' ? 'error-box' : 'success-box'}>{message.text}</div>}
        <p style={{ fontSize: '13px', color: '#666' }}>Digite seu email para receber o link de recuperação.</p>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Seu email" type="email" required disabled={loading} />
        <button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar link'}</button>
        <Link to="/login" className="secondary" style={{ textAlign: 'center', textDecoration: 'none', padding: '10px', display: 'block' }}>Voltar ao login</Link>
      </form>
    </div>
  );
}
