import ReactMarkdown from 'react-markdown';

export default function MarkdownText({ text }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => <h1 className="text-4xl font-bold mb-4" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-3xl font-bold mb-3" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-2xl font-bold mb-2" {...props} />,
        p: ({ node, ...props }) => <p className="text-base mb-2" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        a: ({ node, ...props }) => <a className="text-blue-500 hover:underline" {...props} />,
        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-2" {...props} />,
        code: ({ node, ...props }) => <code className="bg-gray-100 rounded px-1" {...props} />,
        pre: ({ node, ...props }) => <pre className="bg-gray-100 rounded p-2 mb-2 overflow-x-auto" {...props} />,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
