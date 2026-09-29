import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, auth } from "../../api.js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    auth.set(username, password);
    try {
      await api("/auth/me", { admin: true });
      navigate("/admin", { replace: true });
    } catch (err) {
      auth.clear();
      setError(err.status === 401 ? "Wrong username or password" : "Could not reach the API");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-box" onSubmit={submit}>
        <Link to="/" className="brand"><span className="mark">🎒</span> Skolar</Link>
        <div>
          <h1>Admin sign in</h1>
          <p>Manage products, categories and orders.</p>
        </div>
        <div className="field">
          <label>Username</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
        </div>
        <div className="field">
          <label>Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p style={{ color: "var(--danger)", fontSize: ".9rem" }}>{error}</p>}
        <button className="btn btn-primary" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
        <Link to="/" className="muted" style={{ fontSize: ".85rem", textAlign: "center" }}>← Back to the shop</Link>
      </form>
    </div>
  );
}
