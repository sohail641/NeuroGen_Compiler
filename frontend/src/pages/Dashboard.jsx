import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          Neuro<span className="text-purple-400">Gen</span> Compiler
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">👋 {user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-1.5 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Body */}
      <div className="flex items-center justify-center h-[85vh]">
        <div className="text-center space-y-4">
          <div className="text-6xl">⚡</div>
          <h2 className="text-3xl font-bold">You're in, {user?.name}!</h2>
          <p className="text-gray-400 max-w-sm mx-auto">
            Phase 3 coming next — type a natural language instruction
            and watch NeuroGen generate real code.
          </p>
          <div className="inline-block bg-purple-900/30 border border-purple-700 text-purple-400 text-sm px-4 py-2 rounded-full">
            Authentication ✅ Complete
          </div>
        </div>
      </div>

    </div>
  );
}