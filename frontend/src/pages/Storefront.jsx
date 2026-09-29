import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, money, ApiError } from "../api.js";
import { useCart } from "../cart.jsx";
import { Modal, Pic, StockLabel, Toast, useToast } from "../components.jsx";

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [checkout, setCheckout] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [toast, showToast] = useToast();
  const cart = useCart();

  useEffect(() => {
    api("/categories").then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (q) params.set("q", q);
      api(`/products?${params}`)
        .then(setProducts)
        .catch(() => showToast("Could not reach the shop API. Is the backend running?", "error"))
        .finally(() => setLoading(false));
    }, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [category, q]); // eslint-disable-line react-hooks/exhaustive-deps

  const featured = useMemo(() => products.filter((p) => p.featured), [products]);

  const addToCart = (p, qty = 1) => {
    if (p.stock <= 0) return;
    cart.add(p, qty);
    showToast(`${p.name} added to cart`);
  };

  return (
    <>
      <header className="topbar">
        <div className="container">
          <Link to="/" className="brand" onClick={() => { setCategory(""); setQ(""); }}>
            <span className="mark">🎒</span> Skolar
          </Link>
          <div className="search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input className="input" placeholder="Search notebooks, pens, backpacks..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Link to="/admin" className="admin-link">Admin</Link>
          <button className="btn btn-ghost cart-btn" onClick={() => cart.setOpen(true)}>
            🛒 Cart
            {cart.count > 0 && <span className="count">{cart.count}</span>}
          </button>
        </div>
      </header>

      <main className="container">
        {!q && !category && (
          <section className="hero">
            <div>
              <span className="badge" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>Back to school 2026</span>
              <h1 style={{ marginTop: ".8rem" }}>Everything for a great school year.</h1>
              <p>Notebooks, pens, art supplies and backpacks, picked for students and delivered to your door.</p>
              <div className="cta">
                <a href="#products" className="btn btn-light">Shop all products</a>
                <button className="btn btn-outline" onClick={() => setCategory("bags")}>Backpacks</button>
              </div>
            </div>
            <div className="stack">
              {["📓", "✏️", "🎨", "🎒", "📐", "🗂️"].map((e) => (
                <div className="tile" key={e}>{e}</div>
              ))}
            </div>
          </section>
        )}

        <div className="chips" id="products">
          <button className={`chip ${category === "" ? "active" : ""}`} onClick={() => setCategory("")}>All</button>
          {categories.map((c) => (
            <button key={c.id} className={`chip ${category === c.slug ? "active" : ""}`} onClick={() => setCategory(c.slug)}>
              {c.emoji} {c.name}
            </button>
          ))}
        </div>

        {!q && !category && featured.length > 0 && (
          <>
            <div className="section-title"><h2>Featured</h2><span>Our most popular picks</span></div>
            <div className="grid" style={{ marginBottom: "1rem" }}>
              {featured.map((p) => <ProductCard key={p.id} p={p} onOpen={setSelected} onAdd={addToCart} />)}
            </div>
          </>
        )}

        <div className="section-title">
          <h2>{category ? categories.find((c) => c.slug === category)?.name : q ? `Results for "${q}"` : "All products"}</h2>
          <span>{products.length} items</span>
        </div>

        {loading ? (
          <div className="empty">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty">No products found. Try another search or category.</div>
        ) : (
          <div className="grid">
            {products.map((p) => <ProductCard key={p.id} p={p} onOpen={setSelected} onAdd={addToCart} />)}
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="container">
          <span>© {new Date().getFullYear()} Skolar · School supplies for every student</span>
          <span>Built with Spring Boot, React and MySQL</span>
        </div>
      </footer>

      {selected && <ProductModal p={selected} onClose={() => setSelected(null)} onAdd={addToCart} />}

      {cart.open && (
        <CartDrawer onCheckout={() => { cart.setOpen(false); setCheckout(true); }} />
      )}

      {checkout && (
        <CheckoutModal
          onClose={() => setCheckout(false)}
          onPlaced={(order) => { setCheckout(false); setPlaced(order); cart.clear(); }}
        />
      )}

      {placed && (
        <Modal title="Order placed" onClose={() => setPlaced(null)}>
          <div className="success-box">
            <div className="check">✓</div>
            <h3>Thank you, {placed.customerName.split(" ")[0]}!</h3>
            <p className="muted" style={{ marginTop: ".5rem" }}>
              Order <strong>#{placed.id}</strong> for <strong>{money(placed.total)}</strong> is confirmed. We sent the details to {placed.email}.
            </p>
            <button className="btn btn-primary" style={{ marginTop: "1.2rem" }} onClick={() => setPlaced(null)}>Continue shopping</button>
          </div>
        </Modal>
      )}

      <Toast toast={toast} />
    </>
  );
}

function ProductCard({ p, onOpen, onAdd }) {
  return (
    <article className="card" onClick={() => onOpen(p)}>
      <Pic product={p}>
        {p.featured && <span className="badge tag">Popular</span>}
      </Pic>
      <div className="body">
        <span className="cat">{p.category?.name || "General"}</span>
        <h3>{p.name}</h3>
        <p className="desc">{p.description}</p>
        <div className="foot">
          <div>
            <div className="price">{money(p.price)}</div>
            <StockLabel stock={p.stock} />
          </div>
          <button
            className="btn btn-primary btn-sm"
            disabled={p.stock <= 0}
            onClick={(e) => { e.stopPropagation(); onAdd(p); }}
          >
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductModal({ p, onClose, onAdd }) {
  const [qty, setQty] = useState(1);
  return (
    <Modal title={p.name} onClose={onClose} wide>
      <div className="product-detail">
        <Pic product={p} />
        <div>
          <span className="cat badge muted">{p.category?.name || "General"}</span>
          <div className="price">{money(p.price)}</div>
          <p className="muted">{p.description}</p>
          <div style={{ margin: "1rem 0 .5rem" }}><StockLabel stock={p.stock} /></div>
          <div style={{ display: "flex", gap: ".8rem", alignItems: "center", flexWrap: "wrap" }}>
            <div className="qty">
              <button onClick={() => setQty((n) => Math.max(1, n - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((n) => Math.min(p.stock, n + 1))}>+</button>
            </div>
            <button className="btn btn-primary" disabled={p.stock <= 0} onClick={() => { onAdd(p, qty); onClose(); }}>
              Add {qty > 1 ? `${qty} ` : ""}to cart · {money(qty * p.price)}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function CartDrawer({ onCheckout }) {
  const cart = useCart();
  return (
    <>
      <div className="drawer-overlay" onClick={() => cart.setOpen(false)} />
      <aside className="drawer">
        <div className="drawer-head">
          <h2 style={{ fontSize: "1.15rem" }}>Your cart ({cart.count})</h2>
          <button className="close" onClick={() => cart.setOpen(false)}>×</button>
        </div>
        <div className="drawer-body">
          {cart.items.length === 0 && <div className="empty">Your cart is empty.</div>}
          {cart.items.map(({ product, qty }) => (
            <div className="line" key={product.id}>
              <Pic product={product} className="thumb" />
              <div className="info">
                <strong>{product.name}</strong>
                <span>{money(product.price)} each</span>
              </div>
              <div className="qty">
                <button onClick={() => cart.setQty(product.id, qty - 1)}>−</button>
                <span>{qty}</span>
                <button onClick={() => cart.setQty(product.id, qty + 1)}>+</button>
              </div>
              <button className="close" onClick={() => cart.remove(product.id)} title="Remove">×</button>
            </div>
          ))}
        </div>
        <div className="drawer-foot">
          <div className="total"><span>Total</span><span>{money(cart.total)}</span></div>
          <button className="btn btn-primary" disabled={cart.items.length === 0} onClick={onCheckout}>Checkout</button>
        </div>
      </aside>
    </>
  );
}

function CheckoutModal({ onClose, onPlaced }) {
  const cart = useCart();
  const [form, setForm] = useState({ customerName: "", email: "", phone: "", address: "", note: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setErrors({});
    try {
      const order = await api("/orders", {
        method: "POST",
        body: { ...form, items: cart.items.map((i) => ({ productId: i.product.id, quantity: i.qty })) },
      });
      onPlaced(order);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields);
        setError(err.message);
      } else {
        setError("Could not place the order. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Checkout" onClose={onClose}>
      <form onSubmit={submit} style={{ display: "grid", gap: ".9rem" }}>
        <div className="grid-2">
          <Field label="Full name" error={errors.customerName}><input className="input" value={form.customerName} onChange={set("customerName")} required /></Field>
          <Field label="Email" error={errors.email}><input className="input" type="email" value={form.email} onChange={set("email")} required /></Field>
        </div>
        <Field label="Phone (optional)" error={errors.phone}><input className="input" value={form.phone} onChange={set("phone")} /></Field>
        <Field label="Delivery address" error={errors.address}><textarea className="textarea" value={form.address} onChange={set("address")} required /></Field>
        <Field label="Note for the shop (optional)"><input className="input" value={form.note} onChange={set("note")} /></Field>

        <div className="order-items">
          {cart.items.map((i) => (
            <div key={i.product.id}><span>{i.qty} × {i.product.name}</span><span>{money(i.qty * i.product.price)}</span></div>
          ))}
          <div className="total" style={{ borderTop: "1px solid var(--line)", paddingTop: ".5rem" }}><span>Total</span><span>{money(cart.total)}</span></div>
        </div>

        {error && <p className="error" style={{ color: "var(--danger)", fontSize: ".9rem" }}>{error}</p>}
        <button className="btn btn-primary" disabled={busy || cart.items.length === 0}>{busy ? "Placing order..." : `Place order · ${money(cart.total)}`}</button>
        <p className="muted" style={{ fontSize: ".8rem", textAlign: "center" }}>Payment on delivery. No account needed.</p>
      </form>
    </Modal>
  );
}

export function Field({ label, error, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {error && <span className="error">{error}</span>}
    </div>
  );
}
