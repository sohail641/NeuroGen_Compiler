import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import c from "react-syntax-highlighter/dist/esm/languages/hljs/c";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

SyntaxHighlighter.registerLanguage("c", c);

export default function CodeEditor({ code }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-gray-400 text-xs ml-2">generated.c</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-white text-xs transition"
        >
          Copy
        </button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language="c"
        style={atomOneDark}
        customStyle={{
          margin: 0,
          padding: "1.25rem",
          fontSize: "0.875rem",
          background: "#1a1a2e",
          minHeight: "200px",
          maxHeight: "420px",
          overflowY: "auto"
        }}
        showLineNumbers={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}