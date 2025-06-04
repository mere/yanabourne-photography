import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const processText = (text) => {
    let alignment = 'text-center';
    let processedText = text;
  
    // Handle alignment
    if (text.startsWith(':::left')) {
      alignment = 'text-left';
      processedText = text.replace(':::left', '').trim();
    } else if (text.startsWith(':::right')) {
      alignment = 'text-right';
      processedText = text.replace(':::right', '').trim();
    } else if (text.startsWith(':::center')) {
      alignment = 'text-center';
      processedText = text.replace(':::center', '').trim();
    }
  
    // Handle padding and newlines
    const parts = processedText.split(/(:::padding\s+\d+|\n)/).map((part, i) => {
      if (part.startsWith(':::padding')) {
        const padding = parseInt(part.split(/\s+/)[1]) || 0;
        return <span key={`padding-${i}`} className='block' style={{ height: `${padding}px` }} />;
      } else if (part === '\n') {
        return <br key={`br-${i}`} />;
      }
      return <span key={`text-${i}`}>{part}</span>;
    });
  
    return { alignment, parts };
  };

export default function MarkdownText({ text }) {
    console.log(text);
  return (
    <div className="markdown-text whitespace-pre-wrap" data-text={text}>

    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
          h1: ({ node, ...props }) => <h1 className="text-4xl font-bold mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-3xl font-bold mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-2xl font-bold mb-2" {...props} />,
          p: ({...props}) => {
            const text = props.children?.toString() || '';
            const { alignment, parts } = processText(text);
            return <p className={`m-0 whitespace-pre-wrap ${alignment}`}>{parts}</p>;
          },
          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          a: ({ node, ...props }) => <a className="text-blue-500 hover:underline" {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-2 whitespace-pre-wrap" {...props} />,
          code: ({ node, ...props }) => <code className="bg-gray-100 rounded px-1" {...props} />,
          pre: ({ node, ...props }) => <pre className="bg-gray-100 rounded p-2 mb-2 overflow-x-auto whitespace-pre" {...props} />,
        }}
        allowedElements={['br', 'h1', 'h2', 'h3', 'p', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre']}
        skipHtml={false}
        children={text}
        >
      
    </ReactMarkdown>
        </div>
  );
}
