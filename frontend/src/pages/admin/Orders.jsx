import { useEffect, useState } from "react";
import { api, money } from "../../api.js";
import { Modal, STATUS_STYLE, Toast, useToast } from "../../components.jsx";

const STATUSES = ["NEW", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [open, setOpen] = useState(null);
  const [toast, showToast] = useToast();

  const load = () => api("/orders", { admin: true }).then(setOrders).catch(() => showToast("Could not load orders", "error"));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setStatus = async (o, status) => {
    try {
      const updated = await api(`/orders/${o.id}/status`, { method: "PATCH", body: { status }, admin: true });
      setOrders((list) => list.map((x) => (x.id === o.id ? updated : x)));
      if (open?.id === o.id) setOpen(updated);
      showToast(`Order #${o.id} marked ${status.toLowerCase()}`);
    } catch (err) {
      showToast(err.message || "Could not update", "error");
    }
  };

  const visible = orders.filter((o) => filter === "ALL" || o.status === filter);

  return (
    <>
      <div className="page-head">
        <div><h1>Orders</h1><p>{orders.length} orders in total.</p></div>
        <div className="chips" style={{ margin: 0 }}>
          {["ALL", ...STATUSES].map((s) => (
            <button key={s} className={`chip ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()} ({s === "ALL" ? orders.length : orders.filter((o) => o.status === s).length})
            </button>
          ))}
        </div>
      </div>

      <div className="panel table-wrap">
        <table className="table">
          <thead><tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {visible.length === 0 && <tr><td colSpan="6" className="muted">No orders here.</td></tr>}
            {visible.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>
                  <strong>{o.customerName}</strong>
                  <div className="muted" style={{ fontSize: ".78rem" }}>{o.email} · {new Date(o.createdAt).toLocaleString()}</div>
                </td>
                <td>{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                <td>{money(o.total)}</td>
                <td>
                  <select className="select" style={{ width: "auto", padding: ".35rem .6rem" }} value={o.status} onChange={(e) => setStatus(o, e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td><div className="actions"><button className="btn btn-ghost btn-sm" onClick={() => setOpen(o)}>Details</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={`Order #${open.id}`} onClose={() => setOpen(null)}>
          <div style={{ display: "grid", gap: ".3rem", fontSize: ".92rem" }}>
            <div><span className={`badge ${STATUS_STYLE[open.status] || ""}`}>{open.status}</span> <span className="muted">· {new Date(open.createdAt).toLocaleString()}</span></div>
            <div><strong>{open.customerName}</strong></div>
            <div className="muted">{open.email}{open.phone ? ` · ${open.phone}` : ""}</div>
            <div className="muted">{open.address}</div>
            {open.note && <div className="muted">Note: {open.note}</div>}
          </div>
          <div className="order-items" style={{ borderTop: "1px solid var(--line)", paddingTop: ".8rem" }}>
            {open.items.map((i) => (
              <div key={i.id}><span>{i.quantity} × {i.productName}</span><span>{money(i.quantity * i.unitPrice)}</span></div>
            ))}
            <div className="total" style={{ borderTop: "1px solid var(--line)", paddingTop: ".5rem" }}><span>Total</span><span>{money(open.total)}</span></div>
          </div>
          <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
            {open.status === "NEW" && <button className="btn btn-primary btn-sm" onClick={() => setStatus(open, "PROCESSING")}>Start processing</button>}
            {open.status === "PROCESSING" && <button className="btn btn-primary btn-sm" onClick={() => setStatus(open, "SHIPPED")}>Mark shipped</button>}
            {open.status === "SHIPPED" && <button className="btn btn-primary btn-sm" onClick={() => setStatus(open, "DELIVERED")}>Mark delivered</button>}
            {open.status !== "CANCELLED" && open.status !== "DELIVERED" && <button className="btn btn-danger btn-sm" onClick={() => setStatus(open, "CANCELLED")}>Cancel order</button>}
          </div>
        </Modal>
      )}
      <Toast toast={toast} />
    </>
  );
}
