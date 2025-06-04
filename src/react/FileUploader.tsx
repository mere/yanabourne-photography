import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageUrl: string) => void;
  onDelete: () => void;
  hasImage: boolean;
  slug: string;
}

export default function FileUploader({ isOpen, onClose, onSave, onDelete, hasImage, slug }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      // Check file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Check file size (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }

      // Get admin secret from cookie
      const cookies = document.cookie.split(';');
      const adminSecretCookie = cookies.find(cookie => cookie.trim().startsWith('admin_secret='));
      const secret = adminSecretCookie ? adminSecretCookie.split('=')[1] : '';

      if (!secret) {
        throw new Error('Admin secret not found');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('slug', slug);

      console.log("Form data:", formData);
      console.log("slug:", slug);
      console.log("slug validation:", {
        length: slug.length,
        containsSpaces: slug.includes(' '),
        containsSpecialChars: /[^a-z0-9-]/.test(slug),
        startsWithHyphen: slug.startsWith('-'),
        endsWithHyphen: slug.endsWith('-'),
        hasMultipleHyphens: /-{2,}/.test(slug)
      });
      // Upload file using the Astro endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      console.log('response:', response);
      if (!response.ok) {
        const data = await response.json();
        console.error('/api/upload response error:', data);
        throw new Error(data.error || 'Upload failed');
      }

      const { url } = await response.json();
      console.log('Upload successful:', url);

      onSave(url);
      console.log('onSave done');
      onClose();
      console.log('onClose done');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1000">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Upload Image</h2>
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
            disabled={isUploading}
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm mb-4">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2">
          {hasImage && (
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              disabled={isUploading}
            >
              Delete Image
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className={`px-4 py-2 rounded ${
              selectedFile && !isUploading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
} 