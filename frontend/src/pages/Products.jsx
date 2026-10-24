import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api.js';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('accessToken');
    navigate('/login', { replace: true });
  }, [navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch { setError('Erro ao carregar produtos'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(term));
  }, [products, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => sortAsc ? Number(a.price) - Number(b.price) : Number(b.price) - Number(a.price));
  }, [filtered, sortAsc]);

  const total = useMemo(() => filtered.reduce((acc, p) => acc + Number(p.price), 0), [filtered]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) return setError('Preencha nome e preço');
    try {
      const payload = { name: form.name.trim(), price: parseFloat(form.price) };
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        setEditingId(null);
      } else {
        await api.post('/products', payload);
      }
      setForm({ name: '', price: '' });
      setError('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar');
    }
  };

  const remove = async (id) => {
    if (!confirm('Excluir este produto?')) return;
    try { await api.delete(`/products/${id}`); load(); }
    catch { setError('Erro ao excluir'); }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({ name: p.name, price: String(p.price) });
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h2>Produtos {editingId && '(Editando)'}</h2>
        <button onClick={handleLogout}>Sair</button>
      </div>
      {error && <div className="error-box">{error}</div>}

      <div className="products-total">
        <span>Total: R$ {total.toFixed(2)}</span>
        <span>{filtered.length} / {products.length} itens</span>
      </div>

      <div className="products-filters">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..." className="search-input" />
        <button onClick={() => setSortAsc(v => !v)} className="btn-cancel">Preço {sortAsc ? '↑' : '↓'}</button>
      </div>

      <form onSubmit={handleSubmit} className="products-form">
        <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nome produto" />
        <input value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="Preço" type="number" step="0.01" />
        <button type="submit" className={editingId ? 'btn-save' : ''}>{editingId ? 'Salvar' : 'Criar'}</button>
        {editingId && <button type="button" onClick={()=> {setEditingId(null); setForm({name:'',price:''})}} className="btn-cancel">Cancelar</button>}
      </form>
      
      {loading ? <p>Carregando...</p> : (
        <ul className="products-list">
          {sorted.map(p => (
            <li key={p.id} className="product-item">
              <span>{p.name} - R$ {Number(p.price).toFixed(2)}</span>
              <div className="product-actions">
                <button onClick={() => startEdit(p)} className="btn-edit">Editar</button>
                <button onClick={() => remove(p.id)} className="btn-delete">Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}