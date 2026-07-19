import { useState } from "react";
import api from "../api/api";

export default function CompilePanel({ code, instruction }) {
  const [compiling, setCompiling] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleCompile = async () => {
    setCompiling(true);
    setResult(null);
    setError("");

    try {
      const res = await api.post("/compile/", { code, instruction });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Compilation request failed");
    } finally {
      setCompiling(false);
    }
  };

  const handleDownload = () => {
    window.open(
      `http://localhost:8000/compile/download/${result.file_id}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-4">

      {/* Compile button */}
      <button
        onClick={handleCompile}
        disabled={compiling || !code}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2"
      >
        {compiling ? (
          <>
            <span className="animate-spin">⚙️</span>
            Compiling with Clang...
          </>
        ) : (
          <>
            🔨 Compile to Binary
          </>
        )}
      </button>

      {/* Request error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-xl text-sm">
          ❌ {error}
        </div>
      )}

      {/* Compile result */}
      {result && (
        <div className={`border rounded-xl overflow-hidden ${
          result.success
            ? "border-green-700"
            : "border-red-700"
        }`}>

          {/* Result header */}
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
                {Math.round(result.binary_size / 1024)} KB
              </span>
            )}
          </div>

          {/* Logs */}
          <div className="bg-gray-950 px-4 py-3 font-mono text-xs text-gray-400 max-h-40 overflow-y-auto">
            <p className="text-gray-500 mb-1">// Compilation log</p>
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

          {/* Download button */}
          {result.success && result.file_id && (
            <div className="px-4 py-3 bg-gray-900 border-t border-gray-800">
              <button
                onClick={handleDownload}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-lg transition text-sm flex items-center justify-center gap-2"
              >
                ⬇️ Download Executable
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}