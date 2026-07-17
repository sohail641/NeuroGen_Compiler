import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">

        {/* Logo */}
        <h1 className="text-2xl font-bold text-white mb-1">
          Neuro<span className="text-purple-400">Gen</span>
        </h1>
        <p className="text-gray-400 text-sm mb-6">Create your account</p>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm px-4 py-2.5 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">Full Name</label>
            <input
              name="name"
              type="text"
              required
              onChange={handleChange}
              placeholder="Sohail"
              className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              onChange={handleChange}
              placeholder="you@email.com"
              className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-gray-500 text-sm text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}