import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const PORT = Number(process.env.PORT || 5000)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(cors())
app.use(express.json())

const products = [
  { id: 1, name: 'The Sunday Blazer', category: 'Women', type: 'Outerwear', price: 3890, color: 'Sand', tag: 'BESTSELLER', image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=900&q=85', description: 'A relaxed, beautifully tailored layer for days that move from coffee to cocktails.' },
  { id: 2, name: 'Everyday Form Shirt', category: 'Men', type: 'Shirts', price: 2190, color: 'Ivory', tag: 'NEW', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85', description: 'Clean lines, soft cotton and an easy silhouette. Your new everyday essential.' },
  { id: 3, name: 'The City Tote', category: 'Accessories', type: 'Bags', price: 2790, color: 'Chocolate', tag: 'JUST IN', image: 'https://images.unsplash.com/photo-1590873665628-3e6c5f4a6a9b?auto=format&fit=crop&w=900&q=85', description: 'Room for everything, with a little extra polish.' },
  { id: 4, name: 'Sculpted Knit Set', category: 'Women', type: 'Knitwear', price: 4290, color: 'Olive', tag: 'LIMITED', image: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=900&q=85', description: 'Soft structure and a flattering shape, designed to be worn together or apart.' },
  { id: 5, name: 'Weekend Denim', category: 'Men', type: 'Denim', price: 2990, color: 'Indigo', tag: '', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85', description: 'The perfect straight fit with just the right amount of give.' },
  { id: 6, name: 'Golden Hour Dress', category: 'Women', type: 'Dresses', price: 4590, color: 'Rust', tag: 'EDITOR’S PICK', image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=85', description: 'A little movement, a little drama. Made for memorable evenings.' },
  { id: 7, name: 'Weekend Cap', category: 'Accessories', type: 'Accessories', price: 990, color: 'Stone', tag: '', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=85', description: 'An understated finishing touch for off-duty days.' },
  { id: 8, name: 'Essential Polo', category: 'Men', type: 'Knitwear', price: 1890, color: 'Navy', tag: 'POPULAR', image: 'https://images.unsplash.com/photo-1625910513413-5fc45e2b2c1a?auto=format&fit=crop&w=900&q=85', description: 'A refined take on a classic, in a breathable cotton knit.' }
]

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'velora-api' }))
app.get('/api/products', (req, res) => {
  let result = products
  const { category, q } = req.query
  if (category && category !== 'All') result = result.filter(p => p.category === category)
  if (q) {
    const term = String(q).toLowerCase()
    result = result.filter(p => `${p.name} ${p.type} ${p.color} ${p.category}`.toLowerCase().includes(term))
  }
  res.json(result)
})
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id))
  if (!product) return res.status(404).json({ message: 'Product not found' })
  res.json(product)
})
app.post('/api/orders', (req, res) => {
  const { items, customer } = req.body
  if (!Array.isArray(items) || items.length === 0 || !customer?.email) {
    return res.status(400).json({ message: 'A valid cart and customer email are required.' })
  }
  return res.status(201).json({
    orderId: `VL-${Date.now().toString().slice(-8)}`,
    status: 'confirmed',
    message: 'Demo order created. No payment was collected.'
  })
})

// In production, Express also serves the compiled Vite website.
const distPath = path.resolve(__dirname, '../dist')
app.use(express.static(distPath))
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next()
  res.sendFile(path.join(distPath, 'index.html'), err => {
    if (err) next()
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`VÉLORA API running at http://localhost:${PORT}`)
})
