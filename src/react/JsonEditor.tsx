import { useState, useEffect } from 'react';
import type { Gallery } from '../types/gallery';

export default function JsonEditor() {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentGallery, setCurrentGallery] = useState<Gallery | null>(null);

  useEffect(() => {
    const handleOpenEditor = (event: CustomEvent) => {
      const gallery = event.detail as Gallery;
      setCurrentGallery(gallery);
      setJsonText(JSON.stringify(gallery, null, 2));
      setIsOpen(true);
    };

    window.addEventListener('openJsonEditor', handleOpenEditor as EventListener);
    return () => {
      window.removeEventListener('openJsonEditor', handleOpenEditor as EventListener);
    };
  }, []);

  const handleSave = async () => {
    try {
      const parsedData = JSON.parse(jsonText);
      
      const response = await fetch('/api/gallery', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save gallery');
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[800px] max-h-[90vh] flex flex-col">
        <h2 className="text-xl font-bold mb-4">Edit Gallery JSON</h2>
        <div className="flex-1 overflow-auto mb-4">
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full h-[500px] font-mono text-sm p-4 border rounded"
            spellCheck={false}
          />
        </div>
        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
} 