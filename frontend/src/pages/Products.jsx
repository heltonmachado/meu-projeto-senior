import { useState, useEffect } from 'react';
import api from '../api/api.js';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState(null); // controla se está editando

  const load = async () => {
    try { 
      const { data } = await api.get('/products'); 
      setProducts(data); 
    } catch(e){ console.error(e); }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!name || !price) return alert('Preencha nome e preço');
    
    if (editingId) {
      // MODO EDITAR
      await api.put(`/products/${editingId}`, { name, price: parseFloat(price) });
      setEditingId(null);
    } else {
      // MODO CRIAR
      await api.post('/products', { name, price: parseFloat(price) });
    }
    
    setName(''); 
    setPrice(''); 
    load();
  };

  // NOVA FUNÇÃO: DELETAR
  const remove = async (id) => {
    if (!window.confirm('Tem certeza que quer excluir?')) return;
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch(e) { console.error(e); }
  };

  // NOVA FUNÇÃO: PREPARAR EDIÇÃO
  const startEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price);
    window.scrollTo(0, 0);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setPrice('');
  };

  return (
    <div style={{ padding: 24, color: '#000', background: '#fff', minHeight: '100vh' }}>
      <h2>Produtos - Senior CRUD {editingId ? '(Editando)' : ''}</h2>
      
      <form onSubmit={create} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome produto" style={{ padding: 8, border: '1px solid #ccc', color: '#000' }} />
        <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Preço" type="number" step="0.01" style={{ padding: 8, border: '1px solid #ccc', color: '#000' }} />
        
        <button type="submit" style={{ padding: '8px 16px', background: editingId ? '#2563eb' : '#000', color: '#fff', border: 0 }}>
          {editingId ? 'Salvar' : 'Criar'}
        </button>

        {editingId && (
          <button type="button" onClick={cancelEdit} style={{ padding: '8px 16px', background: '#ccc', color: '#000', border: 0 }}>
            Cancelar
          </button>
        )}
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {products.map(p => (
          <li key={p.id} style={{ padding: '12px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{p.name} - R$ {p.price}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => startEdit(p)} style={{ padding: '6px 12px', background: '#f59e0b', color: '#fff', border: 0, cursor: 'pointer' }}>Editar</button>
              <button onClick={() => remove(p.id)} style={{ padding: '6px 12px', background: '#dc2626', color: '#fff', border: 0, cursor: 'pointer' }}>Excluir</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}