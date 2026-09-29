import { useEffect, useState } from "react";
import { api } from "../../api.js";
import { Modal, Toast, useToast } from "../../components.jsx";
import { Field } from "../Storefront.jsx";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({});
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", emoji: "" });
  const [busy, setBusy] = useState(false);
  const [toast, showToast] = useToast();

  const load = () => {
    api("/categories").then(setCategories).catch(() => showToast("Could not load categories", "error"));
    api("/products").then((ps) => {
      const c = {};
      ps.forEach((p) => { if (p.category) c[p.category.id] = (c[p.category.id] || 0) + 1; });
      setCounts(c);
    }).catch(() => {});
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing.id) await api(`/categories/${editing.id}`, { method: "PUT", body: form, admin: true });
      else await api("/categories", { method: "POST", body: form, admin: true });
      showToast(editing.id ? "Category updated" : "Category added");
      setEditing(null);
      load();
    } catch (err) {
      showToast(err.message || "Could not save", "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    try {
      await api(`/categories/${c.id}`, { method: "DELETE", admin: true });
      showToast("Category deleted");
      load();
    } catch (err) {
      showToast(err.message || "Could not delete", "error");
    }
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Categories</h1><p>Group products so customers can browse faster.</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ name: "", emoji: "" }); setEditing({}); }}>+ Add category</button>
      </div>

      <div className="panel table-wrap">
        <table className="table">
          <thead><tr><th>Category</th><th>Slug</th><th>Products</th><th></th></tr></thead>
          <tbody>
            {categories.length === 0 && <tr><td colSpan="4" className="muted">No categories yet.</td></tr>}
            {categories.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.emoji} {c.name}</strong></td>
                <td className="muted">{c.slug}</td>
                <td>{counts[c.id] || 0}</td>
                <td>
                  <div className="actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => { setForm({ name: c.name, emoji: c.emoji || "" }); setEditing(c); }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(c)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing.id ? "Edit category" : "New category"} onClose={() => setEditing(null)}>
          <form onSubmit={save} style={{ display: "grid", gap: ".9rem" }}>
            <Field label="Name"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus /></Field>
            <Field label="Emoji"><input className="input" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} maxLength={8} placeholder="📓" /></Field>
            <div style={{ display: "flex", gap: ".6rem", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={busy}>{busy ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </Modal>
      )}
      <Toast toast={toast} />
    </>
  );
}
