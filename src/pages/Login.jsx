import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-6 md:p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
            VELORA
          </h1>
          <p className="text-slate-400">Welcome back! Please login to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-slate-400 text-sm mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-cyan-400 hover:text-cyan-300">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-slate-400 hover:text-cyan-400">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}