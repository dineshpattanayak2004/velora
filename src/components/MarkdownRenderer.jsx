import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function MarkdownRenderer({ content }) {
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={language}
                PreTag="div"
                className="rounded-lg my-2"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code 
                className="bg-slate-800 px-1.5 py-0.5 rounded text-sm text-cyan-400"
                {...props}
              >
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className="mb-2 last:mb-0">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-sm md:text-base">{children}</li>;
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-3 mt-4">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-2 mt-3">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-bold mb-2 mt-2">{children}</h3>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-cyan-400 pl-4 italic my-2 text-slate-300">
                {children}
              </blockquote>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}