import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowDown, ArrowRight, ArrowUpRight, Check, Heart, Menu, Search,
  ShoppingBag, SlidersHorizontal, Sparkles, X, Clock3, PackageCheck
} from 'lucide-react'
import './styles.css'

const money = n => `₹${Number(n || 0).toLocaleString('en-IN')}`

function App() {
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('featured')
  const [maxPrice, setMaxPrice] = useState(20000)
  const [showFavs, setShowFavs] = useState(false)
  const [cart, setCart] = useState([])
  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('velora-favs') || '[]') } catch { return [] }
  })
  const [recent, setRecent] = useState([])
  const [active, setActive] = useState(null)
  const [selectedSize, setSelectedSize] = useState('M')
  const [cartOpen, setCartOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const [checkout, setCheckout] = useState(false)
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [lastOrder, setLastOrder] = useState(null)

  useEffect(() => {
    fetch('/api/products')
      .then(r => { if (!r.ok) throw new Error('Product request failed'); return r.json() })
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setNotice('Product API unavailable. Start the app using npm run dev.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    localStorage.setItem('velora-favs', JSON.stringify(favs))
  }, [favs])

  const filtered = useMemo(() => {
    let list = products.filter(p =>
      (category === 'All' || p.category === category) &&
      (!showFavs || favs.includes(p.id)) &&
      Number(p.price) <= maxPrice &&
      `${p.name} ${p.type} ${p.color}`.toLowerCase().includes(search.toLowerCase())
    )
    if (sort === 'price-low') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'price-high') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [products, category, search, sort, maxPrice, showFavs, favs])

  const count = cart.reduce((n, x) => n + x.qty, 0)
  const total = cart.reduce((n, x) => n + x.price * x.qty, 0)

  const flash = message => {
    setNotice(message)
    window.clearTimeout(window.veloraToastTimer)
    window.veloraToastTimer = window.setTimeout(() => setNotice(''), 3000)
  }

  const viewProduct = product => {
    setActive(product)
    setSelectedSize('M')
    setRecent(old => [product, ...old.filter(p => p.id !== product.id)].slice(0, 4))
  }

  const add = (product, size = 'M') => {
    const itemId = `${product.id}-${size}`
    setCart(current => {
      const existing = current.find(x => x.itemId === itemId)
      return existing
        ? current.map(x => x.itemId === itemId ? { ...x, qty: x.qty + 1 } : x)
        : [...current, { ...product, itemId, size, qty: 1 }]
    })
    flash(`${product.name} (${size}) added to your bag`)
  }

  const order = async e => {
    e.preventDefault()
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, customer: { email } })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Order could not be placed')
      setLastOrder({ id: data.orderId, email, date: new Date().toLocaleString('en-IN') })
      setCart([])
      setCheckout(false)
      setCartOpen(false)
      setEmail('')
      flash(`Order ${data.orderId} confirmed`)
    } catch (error) {
      flash(error.message)
    }
  }

  return <div className="app">
    <div className="announcement">A LITTLE SOMETHING FOR YOUR EVERYDAY <span>— FREE SHIPPING ON ORDERS OVER ₹4,000</span></div>
    <header className="header">
      <button className="icon-btn mobile-menu" onClick={() => setMenu(!menu)}><Menu /></button>
      <nav className={menu ? 'nav nav-open' : 'nav'}>
        {['New In', 'Women', 'Men', 'Accessories'].map((item, index) =>
          <button key={item} onClick={() => {
            setCategory(index ? item : 'All')
            setShowFavs(false)
            setMenu(false)
            document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
          }}>{item}</button>
        )}
      </nav>
      <a className="logo" href="#" onClick={e => { e.preventDefault(); setCategory('All'); setShowFavs(false); setSearch('') }}>VÉLORA<span>®</span></a>
      <div className="header-actions">
        <label className="search-box"><Search size={17} /><input value={search} onChange={e => {
          setSearch(e.target.value)
          document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
        }} placeholder="Search pieces" /></label>
        <button className="icon-btn" title="Wishlist" onClick={() => {
          setShowFavs(v => !v)
          document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
        }}><Heart size={19} /><span>{favs.length}</span></button>
        <button className="icon-btn bag-button" onClick={() => setCartOpen(true)}><ShoppingBag /><span>{count}</span></button>
      </div>
    </header>

    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><i /> THE NEW EVERYDAY / 2026</div>
          <h1>Wear your<br /><em>own story.</em></h1>
          <p>Thoughtful pieces. Effortless days. A wardrobe that feels like you, wherever the day takes you.</p>
          <a className="primary-btn" href="#shop">Explore the collection <ArrowUpRight size={17} /></a>
          <div className="hero-foot"><span>01 — 08</span><span>CONSIDERED STYLE, MADE TO LIVE IN</span></div>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1500&q=90" alt="Fashion editorial" />
          <div className="image-stamp"><Sparkles size={15} /> NEW SEASON<br />NEW PERSPECTIVE</div>
          <div className="vertical-note">VÉLORA STUDIO — EST. 2026</div>
        </div>
        <div className="hero-scroll">SCROLL TO DISCOVER <ArrowDown size={15} /></div>
      </section>

      <section className="manifesto">
        <span className="eyebrow">A BETTER KIND OF BASIC</span>
        <p>Less noise. More <em>you.</em> Pieces made to be worn on repeat, styled your way, and loved for a long time.</p>
        <span className="manifesto-mark">V.</span>
      </section>

      <section className="shop-section" id="shop">
        <div className="section-top">
          <div><span className="eyebrow">THE VÉLORA EDIT</span><h2>{showFavs ? <>Your <em>wishlist.</em></> : <>Find your <em>favourite.</em></>}</h2></div>
          <div className="section-note">GOOD THINGS, MADE TO GO PLACES <ArrowUpRight size={15} /></div>
        </div>
        <div className="filters">
          <div className="category-tabs">
            {['All', 'Women', 'Men', 'Accessories'].map(c =>
              <button className={category === c ? 'active' : ''} key={c} onClick={() => { setCategory(c); setShowFavs(false) }}>{c}</button>
            )}
            <button className={showFavs ? 'active' : ''} onClick={() => setShowFavs(v => !v)}>♥ Wishlist ({favs.length})</button>
          </div>
          <div className="shop-controls">
            <label className="sort-control">SORT
              <select value={sort} onChange={e => setSort(e.target.value)}>
                <option value="featured">Featured</option><option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option><option value="name">Name</option>
              </select>
            </label>
            <label className="sort-control">UP TO {money(maxPrice)}
              <input aria-label="Maximum price" type="range" min="1000" max="20000" step="500" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} />
            </label>
            <span className="result-count"><SlidersHorizontal size={14} /> {filtered.length} PIECES</span>
          </div>
        </div>
        {loading ? <div className="loading">Curating your collection…</div> :
          <div className="product-grid">
            {filtered.map((p, i) => <article className="product-card" key={p.id} style={{ animationDelay: `${i * 70}ms` }}>
              <div className="product-image" onClick={() => viewProduct(p)}>
                <img src={p.image} alt={p.name} loading="lazy" />
                {p.tag && <span className="product-tag">{p.tag}</span>}
                <button className={`heart-btn ${favs.includes(p.id) ? 'liked' : ''}`} aria-label="Toggle wishlist" onClick={e => {
                  e.stopPropagation()
                  setFavs(a => a.includes(p.id) ? a.filter(x => x !== p.id) : [...a, p.id])
                }}><Heart size={17} fill={favs.includes(p.id) ? 'currentColor' : 'none'} /></button>
                <button className="quick-add" onClick={e => { e.stopPropagation(); viewProduct(p) }}>QUICK VIEW <b>+</b></button>
              </div>
              <div className="product-info" onClick={() => viewProduct(p)}>
                <div><h3>{p.name}</h3><span>{p.color} / {p.type}</span></div><strong>{money(p.price)}</strong>
              </div>
            </article>)}
          </div>}
        {!loading && !filtered.length && <div className="empty">{showFavs ? 'Your wishlist is waiting for its first favourite.' : 'No pieces found. Try another search or price range.'}</div>}
      </section>

      {recent.length > 0 && <section className="recent-section">
        <div className="section-top"><div><span className="eyebrow">A SECOND LOOK</span><h2>Recently <em>viewed.</em></h2></div><Clock3 size={20} /></div>
        <div className="recent-grid">{recent.map(p => <button className="recent-item" key={p.id} onClick={() => viewProduct(p)}>
          <img src={p.image} alt={p.name} /><span>{p.name}</span><strong>{money(p.price)}</strong>
        </button>)}</div>
      </section>}

      {lastOrder && <section className="order-status">
        <PackageCheck size={25} /><div><span className="eyebrow">LATEST DEMO ORDER</span><h3>Order {lastOrder.id}</h3>
          <p>Order request submitted on {lastOrder.date}. This demo store does not yet have live courier tracking.</p></div>
      </section>}

      <section className="story">
        <div className="story-image"><img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85" alt="Vélora editorial" /></div>
        <div className="story-copy"><span className="eyebrow">THE WAY WE SEE IT</span><h2>Style is not<br />a rulebook.<br /><em>It's a feeling.</em></h2>
          <p>We believe getting dressed should be the easiest part of your day. So we make considered, versatile pieces that leave room for your personality.</p>
          <a href="#shop" className="text-link">GET TO KNOW THE EDIT <ArrowRight size={16} /></a></div>
      </section>

      <section className="newsletter"><span className="eyebrow">A NOTE FROM US</span><h2>Good things, <em>occasionally.</em></h2>
        <p>New drops, thoughtful edits and 10% off your first order.</p>
        <form onSubmit={e => { e.preventDefault(); flash('You’re on the list. Welcome to VÉLORA!'); e.currentTarget.reset() }}>
          <input type="email" required placeholder="Your email address" /><button><ArrowRight /></button>
        </form>
      </section>
    </main>

    <footer><a className="logo" href="#">VÉLORA<span>®</span></a><span>CONSIDERED STYLE, MADE TO LIVE IN.</span><span>© 2026 VÉLORA STUDIO</span></footer>

    {active && <div className="modal-backdrop" onClick={() => setActive(null)}>
      <div className="product-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={() => setActive(null)}><X /></button>
        <img src={active.image} alt={active.name} />
        <div className="modal-info"><span className="eyebrow">{active.category} / {active.type}</span><h2>{active.name}</h2>
          <strong>{money(active.price)}</strong><p>{active.description}</p><p className="color-line">COLOUR — {active.color}</p>
          <label className="size-picker">SELECT SIZE
            <div>{['XS', 'S', 'M', 'L', 'XL'].map(size => <button type="button" className={selectedSize === size ? 'selected' : ''} key={size} onClick={() => setSelectedSize(size)}>{size}</button>)}</div>
          </label>
          <button className="primary-btn full" onClick={() => { add(active, selectedSize); setActive(null) }}>Add to bag <ShoppingBag size={17} /></button>
        </div>
      </div>
    </div>}

    {cartOpen && <div className="drawer-backdrop" onClick={() => setCartOpen(false)}>
      <aside className="cart-drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-head"><h2>Your bag <span>({count})</span></h2><button className="icon-btn" onClick={() => setCartOpen(false)}><X /></button></div>
        {cart.length === 0 ? <div className="empty-cart"><ShoppingBag size={34} /><h3>Your bag is taking a breather.</h3><p>Find something that feels like you.</p><button className="primary-btn" onClick={() => setCartOpen(false)}>Explore pieces <ArrowRight size={16} /></button></div> :
          <><div className="cart-items">{cart.map(item => <div className="cart-item" key={item.itemId}>
            <img src={item.image} alt={item.name} /><div className="cart-item-info"><h3>{item.name}</h3><span>{item.color} / Size {item.size}</span><strong>{money(item.price)}</strong>
              <div className="qty"><button onClick={() => setCart(c => c.map(x => x.itemId === item.itemId ? { ...x, qty: Math.max(1, x.qty - 1) } : x))}>−</button><span>{item.qty}</span>
                <button onClick={() => setCart(c => c.map(x => x.itemId === item.itemId ? { ...x, qty: x.qty + 1 } : x))}>+</button>
                <button className="remove" onClick={() => setCart(c => c.filter(x => x.itemId !== item.itemId))}>Remove</button></div>
            </div></div>)}</div>
            <div className="cart-bottom"><div className="subtotal"><span>Subtotal</span><strong>{money(total)}</strong></div><small>Shipping and taxes calculated at checkout.</small>
              <button className="primary-btn full" onClick={() => setCheckout(true)}>Continue to checkout <ArrowRight size={17} /></button></div></>}
        {checkout && <form className="checkout-form" onSubmit={order}><button type="button" className="close-btn" onClick={() => setCheckout(false)}><X /></button>
          <span className="eyebrow">DEMO CHECKOUT</span><h2>Almost yours.</h2><p>Enter an email to create a test order. No payment will be collected.</p>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" />
          <button className="primary-btn full">Place demo order <Check size={17} /></button></form>}
      </aside>
    </div>}
    {notice && <div className="toast"><Check size={16} />{notice}</div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App />)