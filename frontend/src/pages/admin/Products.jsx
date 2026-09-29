import { useEffect, useState } from "react";
import { api, money, ApiError } from "../../api.js";
import { Modal, Pic, Toast, useToast } from "../../components.jsx";
import { Field } from "../Storefront.jsx";

const COLORS = ["#E0E7FF", "#FDE68A", "#BBF7D0", "#FBCFE8", "#BFDBFE", "#FED7AA", "#D9F99D", "#E9D5FF", "#FECACA", "#A7F3D0", "#CCFBF1", "#FEF3C7"];

const empty = () => ({ name: "", description: "", price: "", stock: "", emoji: "📦", color: COLORS[0], imageUrl: "", featured: false, discountPercent: 0, categoryId: "" });

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null); // null | {} (new) | product
  const [form, setForm] = useState(empty());
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [toast, showToast] = useToast();

  const load = () => {
    api("/products").then(setProducts).catch(() => showToast("Could not load products", "error"));
    api("/categories").then(setCategories).catch(() => {});
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openNew = () => { setForm(empty()); setErrors({}); setEditing({}); };
  const openEdit = (p) => {
    setForm({
      name: p.name, description: p.description || "", price: p.price, stock: p.stock, emoji: p.emoji || "📦",
      color: p.color || COLORS[0], imageUrl: p.imageUrl || "", featured: !!p.featured, discountPercent: p.discountPercent || 0, categoryId: p.category?.id || "",
    });
    setErrors({});
    setEditing(p);
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const body = { ...form, price: Number(form.price), stock: Number(form.stock), discountPercent: Number(form.discountPercent) || 0, categoryId: form.categoryId ? Number(form.categoryId) : null };
    try {
      if (editing.id) {
        await api(`/products/${editing.id}`, { method: "PUT", body, admin: true });
        showToast("Product updated");
      } else {
        await api("/products", { method: "POST", body, admin: true });
        showToast("Product added");
      }
      setEditing(null);
      load();
    } catch (err) {
      if (err instanceof ApiError) { setErrors(err.fields); showToast(err.message, "error"); }
      else showToast("Could not save", "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await api(`/products/${p.id}`, { method: "DELETE", admin: true });
      showToast("Product deleted");
      load();
    } catch (err) {
      showToast(err.message || "Could not delete", "error");
    }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.category?.name?.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="page-head">
        <div><h1>Products</h1><p>{products.length} products in the catalogue.</p></div>
        <div style={{ display: "flex", gap: ".6rem" }}>
          <input className="input" placeholder="Filter..." value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 220 }} />
          <button className="btn btn-primary" onClick={openNew}>+ Add product</button>
        </div>
      </div>

      <div className="panel table-wrap">
        <table className="table">
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Offer</th><th>Stock</th><th>Featured</th><th></th></tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan="7" className="muted">No products.</td></tr>}
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="prod-cell">
                    <Pic product={p} className="thumb" />
                    <div><strong>{p.name}</strong><span>{p.description?.slice(0, 60)}</span></div>
                  </div>
                </td>
                <td>{p.category?.name || <span className="muted">–</span>}</td>
                <td>{p.discountPercent > 0 ? <><strong style={{ color: "var(--sale)" }}>{money(p.salePrice)}</strong> <span className="muted" style={{ textDecoration: "line-through", fontSize: ".8rem" }}>{money(p.price)}</span></> : money(p.price)}</td>
                <td>{p.discountPercent > 0 ? <span className="badge sale">-{p.discountPercent}%</span> : <span className="muted">–</span>}</td>
                <td><span className={`badge ${p.stock === 0 ? "danger" : p.stock <= 5 ? "warn" : "muted"}`}>{p.stock}</span></td>
                <td>{p.featured ? "⭐" : ""}</td>
                <td>
                  <div className="actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(p)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing.id ? "Edit product" : "New product"} onClose={() => setEditing(null)} wide>
          <form onSubmit={save} style={{ display: "grid", gap: ".9rem" }}>
            <Field label="Name" error={errors.name}><input className="input" value={form.name} onChange={set("name")} required /></Field>
            <Field label="Description" error={errors.description}><textarea className="textarea" value={form.description} onChange={set("description")} /></Field>
            <div className="grid-2">
              <Field label="Price (€)" error={errors.price}><input className="input" type="number" step="0.01" min="0" value={form.price} onChange={set("price")} required /></Field>
              <Field label="Stock" error={errors.stock}><input className="input" type="number" min="0" value={form.stock} onChange={set("stock")} required /></Field>
            </div>
            <Field label="Offer: discount in % (0 = no offer)" error={errors.discountPercent}><input className="input" type="number" min="0" max="90" value={form.discountPercent} onChange={set("discountPercent")} /></Field>
            <div className="grid-2">
              <Field label="Category">
                <select className="select" value={form.categoryId} onChange={set("categoryId")}>
                  <option value="">No category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                </select>
              </Field>
              <Field label="Emoji (product picture)" error={errors.emoji}><input className="input" value={form.emoji} onChange={set("emoji")} maxLength={8} /></Field>
            </div>
            <Field label="Card colour">
              <div className="swatches">
                {COLORS.map((c) => (
                  <button type="button" key={c} className={`swatch ${form.color === c ? "active" : ""}`} style={{ background: c }} onClick={() => setForm({ ...form, color: c })} aria-label={c} />
                ))}
              </div>
            </Field>
            <Field label="Image URL (optional, replaces the emoji)" error={errors.imageUrl}><input className="input" value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://..." /></Field>
            <label style={{ display: "flex", gap: ".5rem", alignItems: "center", fontSize: ".9rem" }}>
              <input type="checkbox" checked={form.featured} onChange={set("featured")} /> Show in "Featured" on the home page
            </label>
            <div style={{ display: "flex", gap: ".6rem", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={busy}>{busy ? "Saving..." : "Save product"}</button>
            </div>
          </form>
        </Modal>
      )}

      <Toast toast={toast} />
    </>
  );
}
