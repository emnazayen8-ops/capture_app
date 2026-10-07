import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        await register(username, password);
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Identifiants invalides ou service indisponible."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white rounded-lg shadow-md w-full max-w-sm p-6">
        <h1 className="text-xl font-bold text-slate-800 mb-1">Capture App</h1>
        <p className="text-sm text-slate-500 mb-6">
          {mode === "login" ? "Connectez-vous à votre compte" : "Créez un compte"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Nom d'utilisateur
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-60"
          >
            {loading
              ? "Veuillez patienter..."
              : mode === "login"
              ? "Se connecter"
              : "S'inscrire"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="w-full text-sm text-brand-600 hover:underline mt-4"
        >
          {mode === "login"
            ? "Pas encore de compte ? S'inscrire"
            : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </div>
  );
}
