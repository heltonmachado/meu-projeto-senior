import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import api from '../api/api.js';

// PÁGINA DE LOGIN/REGISTRO - Staff Level
// Fluxo: register -> login -> /products
// Usa AuthContext para salvar token e user no localStorage + cookie httpOnly (refresh)
export default function Login() {
  const [email, setEmail] = useState('teste@teste.com');
  const [password, setPassword] = useState('123456');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        // Validação Staff antes de enviar
        if (name.length < 3) throw new Error('Nome mínimo 3 caracteres');
        if (password.length < 6) throw new Error('Senha mínimo 6 caracteres');
        
        await api.post('/auth/register', { name, email, password });
        alert('Cadastro OK! Agora faça login.');
        setIsRegister(false);
      } else {
        // login vem do AuthContext: salva accessToken + user
        await login(email, password);
        navigate('/products');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erro';
      setError(msg);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f5f5f5' }}>
      <form onSubmit={handle} style={{ padding:30, background:'#fff', borderRadius:12, width:360, display:'flex', flexDirection:'column', gap:12, boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color:'#111', margin:0 }}>{isRegister ? 'Cadastro Senior' : 'Login Senior'}</h2>
        
        {error && <div style={{ background:'#fee', color:'#c00', padding:10, borderRadius:6, fontSize:13 }}>{error}</div>}
        
        {isRegister && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome (min 3)" required style={{ padding:10, border:'1px solid #ccc', borderRadius:6 }} />}
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" required style={{ padding:10, border:'1px solid #ccc', borderRadius:6 }} />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Senha (min 6)" required style={{ padding:10, border:'1px solid #ccc', borderRadius:6 }} />
        
        <button type="submit" disabled={loading} style={{ padding:10, background: loading ? '#888' : '#111', color:'#fff', border:0, borderRadius:6, cursor:'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Carregando...' : (isRegister ? 'Cadastrar' : 'Entrar')}
        </button>
        
        <button type="button" onClick={()=>{ setIsRegister(!isRegister); setError(''); }} style={{ padding:10, background:'#eee', color:'#111', border:0, borderRadius:6, cursor:'pointer' }}>
          {isRegister ? 'Já tenho conta' : 'Criar conta'}
        </button>
      </form>
    </div>
  );
}
