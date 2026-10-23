import { useState, useEffect } from 'react';
import api from '../api/api.js';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const load = async () => {
    try { const { data } = await api.get('/products'); setProducts(data); } catch(e){ console.error(e); }
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/products', { name, price: parseFloat(price) });
    setName(''); setPrice(''); load();
  };

  return (
    <div style={{ padding: 24, color: '#000', background: '#fff', minHeight: '100vh' }}>
      <h2>Produtos - Senior CRUD</h2>
      <form onSubmit={create} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome produto" style={{ padding: 8, border: '1px solid #ccc', color: '#000' }} />
        <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Preço" type="number" step="0.01" style={{ padding: 8, border: '1px solid #ccc', color: '#000' }} />
        <button type="submit" style={{ padding: '8px 16px', background: '#000', color: '#fff', border: 0 }}>Criar</button>
      </form>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {products.map(p => <li key={p.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>{p.name} - R$ {p.price}</li>)}
      </ul>
    </div>
  );
}
