import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Shopping cart kept in localStorage so it survives a page refresh.
const CartContext = createContext(null);
const KEY = "skolar_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const value = useMemo(() => {
    const add = (product, qty = 1) => {
      setItems((list) => {
        const found = list.find((i) => i.product.id === product.id);
        if (found) {
          return list.map((i) =>
            i.product.id === product.id ? { ...i, qty: Math.min(i.qty + qty, product.stock) } : i
          );
        }
        return [...list, { product, qty: Math.min(qty, product.stock) }];
      });
      setOpen(true);
    };
    const setQty = (productId, qty) =>
      setItems((list) =>
        qty <= 0
          ? list.filter((i) => i.product.id !== productId)
          : list.map((i) => (i.product.id === productId ? { ...i, qty: Math.min(qty, i.product.stock) } : i))
      );
    const remove = (productId) => setItems((list) => list.filter((i) => i.product.id !== productId));
    const clear = () => setItems([]);
    const count = items.reduce((n, i) => n + i.qty, 0);
    const total = items.reduce((n, i) => n + i.qty * Number(i.product.salePrice ?? i.product.price), 0);
    return { items, add, setQty, remove, clear, count, total, open, setOpen };
  }, [items, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
