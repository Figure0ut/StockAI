import { useState, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'

const EMPTY_FORM = { name: '', quantity: '', price: '', category: '' }
const LOW_STOCK = 5

function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [query, setQuery] = useState('')

  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL

  // 1. READ (GET)
  const fetchItems = () => {
    setLoading(true)
    fetch(`${API_URL}/items`)
      .then((response) => response.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching items:', error)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // 2 & 3. CREATE (POST) or UPDATE (PUT)
  const handleSubmit = (e) => {
    e.preventDefault()
    const method = editingId ? 'PUT' : 'POST'
    const url = editingId ? `${API_URL}/items/${editingId}` : `${API_URL}/items`

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        category: formData.category,
      }),
    })
      .then((res) => {
        if (res.ok) {
          setFormData(EMPTY_FORM)
          setEditingId(null)
          fetchItems()
        }
      })
      .catch((error) => console.error('Error saving item:', error))
  }

  // 4. DELETE
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    fetch(`${API_URL}/items/${id}`, { method: 'DELETE' })
      .then((res) => {
        if (res.ok) fetchItems()
      })
      .catch((error) => console.error('Error deleting item:', error))
  }

  const handleEditClick = (item) => {
    setEditingId(item.id)
    setFormData({
      name: item.name,
      quantity: String(item.quantity),
      price: String(item.price),
      category: item.category,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData(EMPTY_FORM)
  }

  // AI Analysis
  const handleAnalyzeStock = () => {
    setAnalyzing(true)
    fetch(`${API_URL}/analyze-stock`, { method: 'POST' })
      .then((response) => response.json())
      .then((data) => {
        setAiAnalysis(data.analysis)
        setAnalyzing(false)
      })
      .catch((error) => {
        console.error('Error analyzing with AI:', error)
        setAnalyzing(false)
      })
  }

  const stats = useMemo(() => {
    const totalValue = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0)
    const units = items.reduce((sum, i) => sum + Number(i.quantity), 0)
    const lowStock = items.filter((i) => Number(i.quantity) <= LOW_STOCK).length
    return { totalValue, units, lowStock }
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (i) =>
        i.name?.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q)
    )
  }, [items, query])

  const inputClass =
    'w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/25'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(34,211,238,0.18),transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        {/* Header */}
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-2xl shadow-lg shadow-cyan-500/30">
              📦
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Stock
                <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  AI
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Your inventory, understood by artificial intelligence.
              </p>
            </div>
          </div>

          <button
            onClick={handleAnalyzeStock}
            disabled={analyzing || items.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {analyzing ? '⏳ Analyzing inventory…' : '🧠 Analyze with AI'}
          </button>
        </header>

        {/* Stats */}
        <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Products" value={items.length} icon="🗂️" />
          <StatCard label="Units in stock" value={stats.units} icon="📊" />
          <StatCard
            label="Inventory value"
            value={`$${stats.totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
            icon="💵"
            tone="text-emerald-400"
          />
          <StatCard
            label="Low stock"
            value={stats.lowStock}
            icon="⚠️"
            tone={stats.lowStock > 0 ? 'text-amber-400' : 'text-slate-100'}
          />
        </section>

        {/* AI report */}
        {aiAnalysis && (
          <section className="mt-8 rounded-2xl border border-cyan-500/40 bg-slate-900/70 p-6 shadow-lg shadow-cyan-500/10 md:p-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-cyan-300">
                ✨ Strategic AI report
              </h2>
              <button
                onClick={() => setAiAnalysis(null)}
                aria-label="Close report"
                className="rounded-lg px-2 py-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
              >
                ✕
              </button>
            </div>
            <div className="prose prose-invert prose-sm max-w-none prose-a:text-cyan-300">
              <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
            </div>
          </section>
        )}

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Form */}
          <aside className="h-fit rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/60 p-6 shadow-xl lg:sticky lg:top-8">
            <h2 className="text-xl font-semibold">
              {editingId ? '✏️ Edit product' : '➕ New product'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {editingId
                ? 'Update the details and save your changes.'
                : 'Add an item to your inventory.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
                  Name
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Mechanical keyboard"
                  className={inputClass}
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
                    Quantity
                  </span>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="0"
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
                    Price ($)
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className={inputClass}
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
                  Category
                </span>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Electronics"
                  className={inputClass}
                />
              </label>

              <div className="mt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-2.5 font-semibold text-slate-950 transition hover:-translate-y-0.5"
                >
                  {editingId ? 'Update' : 'Save'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 font-semibold text-slate-200 transition hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </aside>

          {/* List */}
          <section className="lg:col-span-2">
            <div className="relative mb-5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                🔍
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or category…"
                className={`${inputClass} pl-10`}
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-44 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 px-6 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-2xl">
                  📦
                </div>
                <h3 className="text-lg font-semibold">
                  {items.length === 0 ? 'Your inventory is empty' : 'No results found'}
                </h3>
                <p className="max-w-sm text-sm text-slate-400">
                  {items.length === 0
                    ? 'Add your first product using the form to start analyzing your stock with AI.'
                    : 'Try a different name or category.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {filtered.map((item) => {
                  const low = Number(item.quantity) <= LOW_STOCK
                  return (
                    <article
                      key={item.id}
                      className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/60 p-5 shadow-lg transition hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-cyan-500/10"
                    >
                      <div>
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <h3 className="truncate text-lg font-semibold">{item.name}</h3>
                          <span className="shrink-0 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-slate-300">
                            {item.category}
                          </span>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-xs text-slate-400">Stock</p>
                            <p
                              className={`text-xl font-semibold ${low ? 'text-amber-400' : 'text-slate-100'}`}
                            >
                              {item.quantity}
                              {low && (
                                <span className="ml-2 align-middle text-[11px] font-medium text-amber-400">
                                  low
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400">Price</p>
                            <p className="text-xl font-bold text-emerald-400">
                              ${Number(item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex justify-end gap-2 border-t border-slate-800 pt-4">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-400 transition hover:bg-red-500/15"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, tone = 'text-slate-100' }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/60 p-5 shadow-lg">
      <div className="flex items-center gap-2 text-slate-400">
        <span>{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p>
    </div>
  )
}

export default App
