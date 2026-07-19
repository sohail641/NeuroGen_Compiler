import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import CodeEditor from "../components/CodeEditor";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [instruction, setInstruction] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleBuild = async () => {
    if (!instruction.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await api.post("/compiler/build", {
        instruction: instruction.trim()
      });
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Build failed. Make sure Ollama and Clang are running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    window.open(
      `http://localhost:8000/compiler/download/${result.file_id}`,
      "_blank"
    );
  };

  const handleReset = () => {
    setResult(null);
    setInstruction("");
    setCharCount(0);
    setError("");
  };

  const examples = [
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

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">
            Natural Language{" "}
            <span className="text-purple-400">→</span>{" "}
            Machine Code
          </h2>
          <p className="text-gray-400">
            Describe what you want. NeuroGen generates, validates, and compiles it.
          </p>
        </div>

        {/* Pipeline steps indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <span className="bg-gray-800 px-3 py-1 rounded-full">1. Understand</span>
          <span>→</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full">2. Generate</span>
          <span>→</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full">3. Validate</span>
          <span>→</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full">4. Compile</span>
          <span>→</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full">5. Download</span>
        </div>

        {/* Input section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <label className="text-gray-300 text-sm font-medium block">
            Your Instruction
          </label>
          <textarea
            value={instruction}
            onChange={(e) => {
              setInstruction(e.target.value);
              setCharCount(e.target.value.length);
            }}
            placeholder="e.g. Find the largest number in an array..."
            maxLength={500}
            rows={3}
            disabled={loading}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500 transition resize-none placeholder-gray-600 disabled:opacity-50"
          />
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-xs">{charCount}/500</span>
            <div className="flex gap-3">
              {result && (
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  Reset
                </button>
              )}
              <button
                onClick={handleBuild}
                disabled={loading || !instruction.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-8 py-2.5 rounded-xl transition flex items-center gap-2"
              >
                {loading ? (
                  <><span className="animate-spin">⚙️</span> Building...</>
                ) : (
                  <>⚡ Build Binary</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Examples */}
        {!result && !loading && (
          <div className="space-y-3">
            <p className="text-gray-500 text-sm">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex, i) => (
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

        {/* Loading */}
        {loading && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center space-y-4">
            <div className="text-4xl animate-pulse">🧠</div>
            <p className="text-gray-300 font-medium">NeuroGen is building your binary...</p>
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <span className="animate-pulse">⚡ Generating code</span>
              <span>→</span>
              <span className="animate-pulse">🔍 Validating</span>
              <span>→</span>
              <span className="animate-pulse">🔨 Compiling</span>
            </div>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="space-y-4">

            {/* Validation error */}
            {result.validation_error && (
              <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-400 px-4 py-3 rounded-xl text-sm">
                ⚠️ Validation failed: {result.validation_error}
              </div>
            )}

            {/* Generated code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-300 font-medium">Generated C Code</h3>
                <span className="text-xs text-gray-500">
                  Qwen2.5-Coder 3B
                </span>
              </div>
              <CodeEditor code={result.code} />
            </div>

            {/* Compile result */}
            <div className={`border rounded-xl overflow-hidden ${
              result.success ? "border-green-700" : "border-red-700"
            }`}>

              {/* Status header */}
              <div className={`px-4 py-3 flex items-center justify-between ${
                result.success ? "bg-green-900/30" : "bg-red-900/30"
              }`}>
                <span className={`font-medium text-sm ${
                  result.success ? "text-green-400" : "text-red-400"
                }`}>
                  {result.success ? "✅ " : "❌ "}{result.message}
                </span>
                {result.success && (
                  <span className="text-gray-400 text-xs">
                    {result.binary_size_kb} KB
                  </span>
                )}
              </div>

              {/* Logs */}
              <div className="bg-gray-950 px-4 py-3 font-mono text-xs text-gray-400 max-h-40 overflow-y-auto">
                <p className="text-gray-600 mb-1">// Compilation log</p>
                {result.success ? (
                  <p className="text-green-400">
                    {result.logs || "No warnings. Clean compile."}
                  </p>
                ) : (
                  <p className="text-red-400 whitespace-pre-wrap">
                    {result.errors}
                  </p>
                )}
              </div>

              {/* Download */}
              {result.success && result.file_id && (
                <div className="px-4 py-3 bg-gray-900 border-t border-gray-800">
                  <button
                    onClick={handleDownload}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-lg transition text-sm flex items-center justify-center gap-2"
                  >
                    ⬇️ Download Executable ({result.binary_size_kb} KB)
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}