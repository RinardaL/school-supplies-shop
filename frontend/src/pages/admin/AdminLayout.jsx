import { Link, NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { auth } from "../../api.js";

export default function AdminLayout() {
  const navigate = useNavigate();
  if (!auth.isLoggedIn()) return <Navigate to="/admin/login" replace />;

  const username = (() => {
    try { return atob(auth.get()).split(":")[0]; } catch { return "admin"; }
  })();

  return (
    <div className="admin">
      <aside className="sidebar">
        <Link to="/" className="brand"><span className="mark">🎒</span> Skolar</Link>
        <NavLink to="/admin" end>📊 Dashboard</NavLink>
        <NavLink to="/admin/products">📦 Products</NavLink>
        <NavLink to="/admin/categories">🏷️ Categories</NavLink>
        <NavLink to="/admin/orders">🧾 Orders</NavLink>
        <Link to="/">🛍️ View shop</Link>
        <div className="spacer" />
        <div className="user">Signed in as {username}</div>
        <button className="nav" onClick={() => { auth.clear(); navigate("/admin/login"); }}>🚪 Sign out</button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
