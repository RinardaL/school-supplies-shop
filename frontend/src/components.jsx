import { useEffect, useState } from "react";

// Small shared pieces used by the storefront and the admin panel.

export function Toast({ toast }) {
  if (!toast) return null;
  return <div className={`toast ${toast.type || ""}`}>{toast.text}</div>;
}

export function useToast() {
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  return [toast, (text, type) => setToast({ text, type })];
}

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="overlay" onClick={onClose}>
      <div className={`modal ${wide ? "wide" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/** Emoji tile or real picture for a product. */
export function Pic({ product, className = "pic" }) {
  return (
    <div className={className} style={{ background: product.color || "#e0e7ff" }}>
      {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span>{product.emoji || "📦"}</span>}
    </div>
  );
}

export function StockLabel({ stock }) {
  if (stock <= 0) return <span className="stock out">Sold out</span>;
  if (stock <= 5) return <span className="stock low">Only {stock} left</span>;
  return <span className="stock">In stock</span>;
}

export const STATUS_STYLE = {
  NEW: "",
  PROCESSING: "warn",
  SHIPPED: "",
  DELIVERED: "success",
  CANCELLED: "danger",
};
