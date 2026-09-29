import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, money, ApiError } from "../api.js";
import { useCart } from "../cart.jsx";
import { Modal, Pic, StockLabel, Toast, useToast } from "../components.jsx";

const unit = (p) => Number(p.salePrice ?? p.price);

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [offersOnly, setOffersOnly] = useState(false);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [checkout, setCheckout] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [toast, showToast] = useToast();
  const cart = useCart();

  const browsing = !q && !category && !offersOnly;

  useEffect(() => {
    api("/categories").then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (q) params.set("q", q);
      if (offersOnly) params.set("offers", "true");
      api(`/products?${params}`)
        .then(setProducts)
        .catch(() => showToast("Could not reach the shop API. Is the backend running?", "error"))
        .finally(() => setLoading(false));
    }, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [category, q, offersOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  const featured = useMemo(() => products.filter((p) => p.featured), [products]);
  const offers = useMemo(() => products.filter((p) => p.discountPercent > 0), [products]);
  const maxOff = offers.reduce((m, p) => Math.max(m, p.discountPercent), 0);

  const addToCart = (p, qty = 1) => {
    if (p.stock <= 0) return;
    cart.add(p, qty);
    showToast(`${p.name} added to cart`);
  };

  const goOffers = () => { setCategory(""); setQ(""); setOffersOnly(true); document.getElementById("products")?.scrollIntoView(); };
  const goAll = () => { setCategory(""); setQ(""); setOffersOnly(false); };
  const pickCategory = (slug) => { setOffersOnly(false); setCategory(slug); };

  const heading = offersOnly
    ? "Offers"
    : category
    ? categories.find((c) => c.slug === category)?.name
    : q
    ? `Results for "${q}"`
    : "All products";

  return (
    <>
      <div className="announce">
        <div className="container">
          <span>Free delivery on orders over €30 · Pay on delivery</span>
          <button className="nav" style={{ background: "none", border: 0, color: "var(--accent)", fontWeight: 700, cursor: "pointer" }} onClick={goOffers}>
            Back-to-school offers{maxOff ? ` · up to ${maxOff}% off` : ""} →
          </button>
        </div>
      </div>

      <header className="topbar">
        <div className="container">
          <Link to="/" className="brand" onClick={goAll}><span className="mark">S</span> Skolar</Link>
          <nav className="nav">
            <button onClick={goAll}>Shop</button>
            <button className="hot" onClick={goOffers}>Offers</button>
            <a href="#categories">Categories</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input className="input" placeholder="Search products..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Link to="/admin" className="admin-link">Admin</Link>
          <button className="btn btn-primary cart-btn" onClick={() => cart.setOpen(true)}>
            Cart
            {cart.count > 0 && <span className="count">{cart.count}</span>}
          </button>
        </div>
      </header>

      <main className="container">
        {browsing && (
          <>
            <section className="hero">
              <div className="hero-main">
                <span className="eyebrow">Back to school 2026 / 27</span>
                <h1>Quality school supplies at student prices.</h1>
                <p>Notebooks, pens, art supplies, backpacks and calculators, chosen with teachers and delivered within 2 working days across Kosovo.</p>
                <div className="cta">
                  <a href="#products" className="btn btn-accent">Shop the catalogue</a>
                  <button className="btn btn-outline" onClick={goOffers}>See offers</button>
                </div>
              </div>
              <div className="hero-side">
                <div className="promo sky">
                  <div>
                    <span className="eyebrow" style={{ color: "var(--navy)" }}>Limited offer</span>
                    <div className="big">{maxOff ? `-${maxOff}%` : "Offers"}</div>
                    <div className="small">on selected back-to-school essentials</div>
                  </div>
                  <button className="nav" style={{ background: "none", border: 0, textAlign: "left", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }} onClick={goOffers}>View all offers</button>
                  <span className="emoji">🎒</span>
                </div>
                <div className="promo">
                  <div>
                    <span className="eyebrow">Free delivery</span>
                    <div className="big">€30+</div>
                    <div className="small">Free shipping on every order over €30. Pay on delivery.</div>
                  </div>
                  <a href="#products">Start shopping</a>
                  <span className="emoji">🚚</span>
                </div>
              </div>
            </section>

            <section className="features">
              <Feature ico="🚚" title="Free delivery over €30" sub="2 working days, all of Kosovo" />
              <Feature ico="↩" title="30-day returns" sub="Unused items, no questions" />
              <Feature ico="💶" title="Pay on delivery" sub="No card or account needed" />
              <Feature ico="☎" title="Support Mon–Sat" sub="08:00–18:00, +383 44 000 000" />
            </section>

            {offers.length > 0 && (
              <>
                <div className="section-head">
                  <div><h2>Offers of the week</h2><p className="sub">Discounted prices, while stock lasts</p></div>
                  <button className="link" onClick={goOffers}>All offers →</button>
                </div>
                <div className="grid">
                  {offers.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} onOpen={setSelected} onAdd={addToCart} />)}
                </div>
              </>
            )}

            {featured.length > 0 && (
              <>
                <div className="section-head">
                  <div><h2>Best sellers</h2><p className="sub">The products students buy most</p></div>
                </div>
                <div className="grid">
                  {featured.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} onOpen={setSelected} onAdd={addToCart} />)}
                </div>
              </>
            )}
          </>
        )}

        <div className="section-head" id="categories">
          <div><h2>{heading}</h2><p className="sub">{products.length} products</p></div>
          {!browsing && <button className="link" onClick={goAll}>Clear filters ×</button>}
        </div>

        <div className="chips" id="products">
          <button className={`chip ${browsing ? "active" : ""}`} onClick={goAll}>All</button>
          <button className={`chip offer ${offersOnly ? "active" : ""}`} onClick={goOffers}>% Offers</button>
          {categories.map((c) => (
            <button key={c.id} className={`chip ${category === c.slug ? "active" : ""}`} onClick={() => pickCategory(c.slug)}>
              {c.emoji} {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty" style={{ marginTop: "1rem" }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty" style={{ marginTop: "1rem" }}>No products found. Try another search or category.</div>
        ) : (
          <div className="grid" style={{ marginTop: "1rem" }}>
            {products.map((p) => <ProductCard key={p.id} p={p} onOpen={setSelected} onAdd={addToCart} />)}
          </div>
        )}

        <section className="newsletter" id="contact">
          <div>
            <h2>Get the next offers first.</h2>
            <p>One email a month with new arrivals and discounts for students and teachers.</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); showToast("Thanks! You are on the list."); e.target.reset(); }}>
            <input className="input" type="email" placeholder="Your email address" required />
            <button className="btn btn-primary">Subscribe</button>
          </form>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="cols">
            <div>
              <div className="brand"><span className="mark">S</span> Skolar</div>
              <p style={{ marginTop: ".8rem", maxWidth: "34ch" }}>School supplies for students, parents and teachers. Fair prices, fast delivery, real support.</p>
            </div>
            <div>
              <h4>Shop</h4>
              <ul>
                {categories.map((c) => <li key={c.id}><a href="#products" onClick={() => pickCategory(c.slug)}>{c.name}</a></li>)}
                <li><a href="#products" onClick={goOffers}>Offers</a></li>
              </ul>
            </div>
            <div>
              <h4>Help</h4>
              <ul>
                <li><a href="#contact">Delivery & returns</a></li>
                <li><a href="#contact">Payment on delivery</a></li>
                <li><a href="#contact">Orders for schools</a></li>
                <li><Link to="/admin">Admin panel</Link></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li>Rr. Nëna Terezë 12, Prishtinë</li>
                <li>+383 44 000 000</li>
                <li>hello@skolar.shop</li>
                <li>Mon–Sat 08:00–18:00</li>
              </ul>
            </div>
          </div>
          <div className="bottom">
            <span>© {new Date().getFullYear()} Skolar. All rights reserved.</span>
            <span>Built with Spring Boot, React and MySQL</span>
          </div>
        </div>
      </footer>

      {selected && <ProductModal p={selected} onClose={() => setSelected(null)} onAdd={addToCart} />}
      {cart.open && <CartDrawer onCheckout={() => { cart.setOpen(false); setCheckout(true); }} />}
      {checkout && (
        <CheckoutModal onClose={() => setCheckout(false)} onPlaced={(order) => { setCheckout(false); setPlaced(order); cart.clear(); }} />
      )}
      {placed && (
        <Modal title="Order confirmed" onClose={() => setPlaced(null)}>
          <div className="success-box">
            <div className="check">✓</div>
            <h3>Thank you, {placed.customerName.split(" ")[0]}.</h3>
            <p className="muted" style={{ marginTop: ".5rem" }}>
              Order <strong>#{placed.id}</strong> for <strong>{money(placed.total)}</strong> has been received. A confirmation was sent to {placed.email}.
            </p>
            <button className="btn btn-primary" style={{ marginTop: "1.2rem" }} onClick={() => setPlaced(null)}>Continue shopping</button>
          </div>
        </Modal>
      )}
      <Toast toast={toast} />
    </>
  );
}

function Feature({ ico, title, sub }) {
  return (
    <div className="feature">
      <div className="ico">{ico}</div>
      <div><strong>{title}</strong><span>{sub}</span></div>
    </div>
  );
}

function Price({ p, className = "" }) {
  const onOffer = p.discountPercent > 0;
  return (
    <span className={`price ${onOffer ? "sale" : ""} ${className}`}>
      {money(unit(p))}
      {onOffer && <span className="old">{money(p.price)}</span>}
    </span>
  );
}

function ProductCard({ p, onOpen, onAdd }) {
  return (
    <article className="card" onClick={() => onOpen(p)}>
      <Pic product={p}>
        {p.featured && <span className="badge dark tag">Best seller</span>}
        {p.discountPercent > 0 && <span className="badge sale off">-{p.discountPercent}%</span>}
      </Pic>
      <div className="body">
        <span className="cat">{p.category?.name || "General"}</span>
        <h3>{p.name}</h3>
        <p className="desc">{p.description}</p>
        <div className="foot">
          <div>
            <Price p={p} />
            <StockLabel stock={p.stock} />
          </div>
          <button className="btn btn-primary btn-sm" disabled={p.stock <= 0} onClick={(e) => { e.stopPropagation(); onAdd(p); }}>
            Add to cart
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
          <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
            <span className="badge muted">{p.category?.name || "General"}</span>
            {p.discountPercent > 0 && <span className="badge sale">Save {p.discountPercent}%</span>}
          </div>
          <Price p={p} />
          <p className="muted">{p.description}</p>
          <div style={{ margin: "1rem 0 .6rem" }}><StockLabel stock={p.stock} /></div>
          <div style={{ display: "flex", gap: ".8rem", alignItems: "center", flexWrap: "wrap" }}>
            <div className="qty">
              <button onClick={() => setQty((n) => Math.max(1, n - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((n) => Math.min(p.stock, n + 1))}>+</button>
            </div>
            <button className="btn btn-primary" disabled={p.stock <= 0} onClick={() => { onAdd(p, qty); onClose(); }}>
              Add to cart · {money(qty * unit(p))}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function CartDrawer({ onCheckout }) {
  const cart = useCart();
  const savings = cart.items.reduce((n, i) => n + i.qty * (Number(i.product.price) - unit(i.product)), 0);
  return (
    <>
      <div className="drawer-overlay" onClick={() => cart.setOpen(false)} />
      <aside className="drawer">
        <div className="drawer-head">
          <h2>Your cart ({cart.count})</h2>
          <button className="close" onClick={() => cart.setOpen(false)}>×</button>
        </div>
        <div className="drawer-body">
          {cart.items.length === 0 && <div className="empty">Your cart is empty.</div>}
          {cart.items.map(({ product, qty }) => (
            <div className="line" key={product.id}>
              <Pic product={product} className="thumb" />
              <div className="info">
                <strong>{product.name}</strong>
                <span>{money(unit(product))} each{product.discountPercent > 0 ? ` · -${product.discountPercent}%` : ""}</span>
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
          {savings > 0 && <div className="savings"><span>You save</span><span>{money(savings)}</span></div>}
          <div className="total"><span>Total</span><span>{money(cart.total)}</span></div>
          {cart.total > 0 && cart.total < 30 && <span className="muted" style={{ fontSize: ".8rem" }}>Add {money(30 - cart.total)} more for free delivery.</span>}
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
      if (err instanceof ApiError) { setErrors(err.fields); setError(err.message); }
      else setError("Could not place the order. Please try again.");
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
            <div key={i.product.id}><span>{i.qty} × {i.product.name}</span><span>{money(i.qty * unit(i.product))}</span></div>
          ))}
          <div className="total" style={{ borderTop: "1px solid var(--line-strong)", paddingTop: ".5rem" }}><span>Total</span><span>{money(cart.total)}</span></div>
        </div>

        {error && <p style={{ color: "var(--danger)", fontSize: ".9rem" }}>{error}</p>}
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
