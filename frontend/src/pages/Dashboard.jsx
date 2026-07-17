import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import CodeEditor from "../components/CodeEditor";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [instruction, setInstruction] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleGenerate = async () => {
    if (!instruction.trim()) return;
    setLoading(true);
    setError("");
    setCode("");

    try {
      const res = await api.post("/generate/", {
        instruction: instruction.trim()
      });
      setCode(res.data.code);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Generation failed. Is Ollama running?"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInstructionChange = (e) => {
    setInstruction(e.target.value);
    setCharCount(e.target.value.length);
  };

  const exampleInstructions = [
    "Find the largest number in an array",
    "Check if a string is a palindrome",
    "Calculate factorial of a number",
    "Implement bubble sort on an array",
    "Search for an element using binary search",
  ];

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

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">
            Natural Language{" "}
            <span className="text-purple-400">→</span>{" "}
            Machine Code
          </h2>
          <p className="text-gray-400">
            Describe what you want in plain English. NeuroGen will write the code.
          </p>
        </div>

        {/* Input section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <label className="text-gray-300 text-sm font-medium block">
            Your Instruction
          </label>

          <textarea
            value={instruction}
            onChange={handleInstructionChange}
            placeholder="e.g. Find the largest number in an array..."
            maxLength={500}
            rows={3}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500 transition resize-none placeholder-gray-600"
          />

          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-xs">{charCount}/500</span>
            <button
              onClick={handleGenerate}
              disabled={loading || !instruction.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-8 py-2.5 rounded-xl transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  Generating...
                </>
              ) : (
                <>
                  ⚡ Generate Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Example instructions */}
        {!code && !loading && (
          <div className="space-y-3">
            <p className="text-gray-500 text-sm">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {exampleInstructions.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInstruction(ex);
                    setCharCount(ex.length);
                  }}
                  className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-full transition"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-xl text-sm">
            ❌ {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center space-y-3">
            <div className="text-4xl animate-pulse">🧠</div>
            <p className="text-gray-400">NeuroGen is thinking...</p>
            <p className="text-gray-600 text-sm">
              Analyzing instruction and generating optimized C code
            </p>
          </div>
        )}

        {/* Generated code */}
        {code && !loading && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-300 font-medium">Generated Code</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-900/40 border border-green-700 text-green-400 px-3 py-1 rounded-full">
                  ✅ Code ready
                </span>
                <button
                  onClick={() => {
                    setCode("");
                    setInstruction("");
                    setCharCount(0);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-300 transition"
                >
                  Clear
                </button>
              </div>
            </div>

            <CodeEditor code={code} />

            {/* Next step hint */}
            <div className="bg-purple-900/20 border border-purple-800 rounded-xl px-4 py-3 text-sm text-purple-300">
              ⚡ Phase 4 coming next — hit <strong>Compile</strong> to turn this into a real executable binary
            </div>
          </div>
        )}

      </div>
    </div>
  );
}