import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

export default function MarkdownText({ text }) {
  console.log(text);
  return (
    <div className="markdown-text" data-text={text}>
      <ReactMarkdown
        remarkPlugins={[remarkBreaks, remarkGfm]}
        rehypePlugins={[rehypeRaw]}
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
          table: ({ node, ...props }) => <table className="border-collapse border border-gray-300 mb-2" {...props} />,
          th: ({ node, ...props }) => <th className="border border-gray-300 px-4 py-2 bg-gray-100" {...props} />,
          td: ({ node, ...props }) => <td className="border border-gray-300 px-4 py-2" {...props} />,
          del: ({ node, ...props }) => <del className="line-through" {...props} />,
        }}
        skipHtml={false}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
} 