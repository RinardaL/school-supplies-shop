import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, money } from "../../api.js";
import { STATUS_STYLE } from "../../components.jsx";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api("/stats", { admin: true }).then(setStats).catch(() => {});
    api("/orders", { admin: true }).then((o) => setOrders(o.slice(0, 6))).catch(() => {});
    api("/products").then((p) => setProducts(p.filter((x) => x.stock <= 5))).catch(() => {});
  }, []);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>What is happening in the shop right now.</p>
        </div>
        <Link to="/admin/products" className="btn btn-primary">+ Add product</Link>
      </div>

      <div className="stats">
        <div className="stat"><div className="k">Products</div><div className="v">{stats?.products ?? "–"}</div></div>
        <div className="stat"><div className="k">On offer</div><div className="v">{stats?.onOffer ?? "–"}</div></div>
        <div className="stat"><div className="k">Low stock (≤ 5)</div><div className={`v ${stats?.lowStock ? "warn" : ""}`}>{stats?.lowStock ?? "–"}</div></div>
        <div className="stat"><div className="k">New orders</div><div className="v">{stats?.newOrders ?? "–"}</div></div>
        <div className="stat"><div className="k">Revenue</div><div className="v">{stats ? money(stats.revenue) : "–"}</div></div>
      </div>

      <div style={{ display: "grid", gap: "1.2rem", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))" }}>
        <div className="panel">
          <div className="panel-head"><h2>Latest orders</h2><Link to="/admin/orders" className="muted" style={{ fontSize: ".85rem" }}>View all →</Link></div>
          <table className="table">
            <thead><tr><th>#</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {orders.length === 0 && <tr><td colSpan="4" className="muted">No orders yet.</td></tr>}
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td><strong>{o.customerName}</strong><div className="muted" style={{ fontSize: ".78rem" }}>{new Date(o.createdAt).toLocaleString()}</div></td>
                  <td>{money(o.total)}</td>
                  <td><span className={`badge ${STATUS_STYLE[o.status] || ""}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-head"><h2>Running low</h2><Link to="/admin/products" className="muted" style={{ fontSize: ".85rem" }}>Manage stock →</Link></div>
          <table className="table">
            <thead><tr><th>Product</th><th>Stock</th></tr></thead>
            <tbody>
              {products.length === 0 && <tr><td colSpan="2" className="muted">Everything is well stocked.</td></tr>}
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.emoji} {p.name}</td>
                  <td><span className={`badge ${p.stock === 0 ? "danger" : "warn"}`}>{p.stock === 0 ? "Sold out" : `${p.stock} left`}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
