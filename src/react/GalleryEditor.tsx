import { useEffect, useState } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import Tile from './Tile';
import Toast from './Toast';
import TextEditor from './TextEditor';
import LinkEditor from './LinkEditor';
import FileUploader from './FileUploader';
import Auth from './Auth';
import type { Gallery, GalleryTile } from '../types/gallery';

interface Props {
  slug: string;
  gallery: Gallery | null;
}

interface CreateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, slug: string) => void;
}

function CreateGalleryModal({ isOpen, onClose, onCreate }: CreateGalleryModalProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(generateSlug(newTitle));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(title, slug);
    setTitle('');
    setSlug('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Create New Gallery</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Gallery Title</label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Gallery Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full p-2 border rounded bg-gray-50"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              The slug will be used in the URL. You can modify it if needed.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function GalleryEditorContent({ slug, gallery: initialGallery }: Props) {
  const [gallery, setGallery] = useState<Gallery | null>(initialGallery);
  const [layout, setLayout] = useState<GridLayout.Layout[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [rowHeight, setRowHeight] = useState(60);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);
  const [isLinkEditorOpen, setIsLinkEditorOpen] = useState(false);
  const [isFileUploaderOpen, setIsFileUploaderOpen] = useState(false);
  const [isCreateGalleryOpen, setIsCreateGalleryOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isBatchUploading, setIsBatchUploading] = useState(false);

  const isHomeGallery = slug === 'home';

  // Initialize layout from gallery data
  useEffect(() => {
    if (gallery) {
      // Convert gallery layout to react-grid-layout format
      const newLayout = gallery.layout.map((tile: GalleryTile) => ({
        i: tile.id,
        x: tile.x,
        y: tile.y,
        w: tile.w,
        h: tile.h,
        minW: 1,
        maxW: 12,
        minH: 1,
        maxH: 20,
      }));
      setLayout(newLayout);
    }
    console.log('gallery', gallery);
  }, [gallery]);

  
  // Update container width and row height on window resize
  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth - 24; // 32px for padding
      setContainerWidth(width);
      // Calculate row height to make tiles square (accounting for margins)
      const rowHeight = (width - (11 * 19)) / 12; // 11 gaps of 16px between 12 columns
      setRowHeight(rowHeight);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleLayoutChange = (newLayout: GridLayout.Layout[]) => {
    if (!gallery) return;
    setHasChanges(true);
    setLayout(newLayout);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragStop = (layout: GridLayout.Layout[], oldItem: GridLayout.Layout, newItem: GridLayout.Layout) => {
    setIsDragging(false);
    setHasChanges(true);
  };

  const handleResizeStop = (layout: GridLayout.Layout[], oldItem: GridLayout.Layout, newItem: GridLayout.Layout) => {
    setIsDragging(false);
    setHasChanges(true);
  };

  const handleTileClick = (e: React.MouseEvent, index: number) => {
    if (isDragging) return;
    
    if (selectedTileIndex === index) {
      setSelectedTileIndex(null);
    } else {
      setSelectedTileIndex(index);
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    
    // Only deselect if clicking the container itself, not its children
    if (e.target === e.currentTarget) {
      setSelectedTileIndex(null);
    }
  };

  const handleAddTile = async () => {
    if (!gallery) return;

    // Find the lowest y position in the current layout
    const maxY = Math.max(...layout.map(item => item.y + item.h), 0);
    
    // Create a new tile at the bottom
    const newTile: GalleryTile = {
      id: `tile-${Date.now()}`,
      imageUrl: '', // Start with no image
      altText: '',
      description: '',
      link: '',
      x: 0,
      y: maxY,
      w: 4,
      h: 4,
    };


    // Add to layout
    const newLayout = [
      ...layout,
      {
        i: newTile.id,
        x: newTile.x,
        y: newTile.y,
        w: newTile.w,
        h: newTile.h,
        minW: 1,
        maxW: 12,
        minH: 1,
        maxH: 20,
      }
    ];

    // Update layout
    setLayout(newLayout);
    
    // Update gallery layout
    const updatedGalleryLayout = [...gallery.layout, newTile];
    gallery.layout = updatedGalleryLayout;
    
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!gallery) return;
    
    try {
      const updatedLayout = layout.map(item => {
        const originalTile = gallery.layout.find(t => t.id === item.i);
        if (!originalTile) return null;

        return {
          ...originalTile,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        };
      }).filter((tile): tile is GalleryTile => tile !== null);

      const response = await fetch('/api/gallery', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: gallery.slug,
          title: gallery.title,
          layout: updatedLayout
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      const updatedGallery = await response.json();
      setGallery(updatedGallery);
      setHasChanges(false);
      setToast({ message: 'Changes saved successfully', type: 'success' });
      
      // Navigate back to the current page using window.location
      window.location.href = `/gallery/${slug}`;
    } catch (error) {
      setToast({ message: 'Failed to save changes', type: 'error' });
    }
  };

  const handleCancel = () => {
    // Simply reload the page to reset all changes
    window.location.href = `/gallery/${slug}`;
  };

  const handleUploadImage = () => {
    if (selectedTileIndex === null) return;
    setIsFileUploaderOpen(true);
  };

  const handleSaveImage = (imageUrl: string) => {
    if (!gallery || selectedTileIndex === null) return;
    
    const tile = gallery.layout.find(t => t.id === layout[selectedTileIndex].i);
    if (tile) {
      tile.imageUrl = imageUrl;
      setHasChanges(true);
      setToast({ message: 'Image updated', type: 'success' });
    }
  };

  const handleDeleteImage = () => {
    if (!gallery || selectedTileIndex === null) return;
    
    const tile = gallery.layout.find(t => t.id === layout[selectedTileIndex].i);
    if (tile) {
      tile.imageUrl = '';
      setHasChanges(true);
      setToast({ message: 'Image removed', type: 'info' });
    }
  };

  const handleEditText = () => {
    if (!gallery || selectedTileIndex === null) return;
    setIsTextEditorOpen(true);
  };

  const handleSaveText = (newText: string) => {
    if (!gallery || selectedTileIndex === null) return;
    
    const tile = gallery.layout.find(t => t.id === layout[selectedTileIndex].i);
    if (tile) {
      tile.description = newText;
      setHasChanges(true);
      setToast({ message: 'Text updated', type: 'success' });
    }
  };

  const handleEditLink = () => {
    if (!gallery || selectedTileIndex === null) return;
    setIsLinkEditorOpen(true);
  };

  const handleSaveLink = (newLink: string) => {
    if (!gallery || selectedTileIndex === null) return;
    
    const tile = gallery.layout.find(t => t.id === layout[selectedTileIndex].i);
    if (tile) {
      tile.link = newLink;
      setHasChanges(true);
      setToast({ message: 'Link updated', type: 'success' });
    }
  };

  const handleDeleteTile = async () => {
    if (!gallery || selectedTileIndex === null) return;
    
    const tileToDelete = gallery.layout.find(tile => tile.id === layout[selectedTileIndex].i);
    
    if (isHomeGallery && tileToDelete?.link) {
      // Extract gallery slug from the link
      const gallerySlug = tileToDelete.link.split('/').pop();
      if (gallerySlug) {
        try {
          // Delete the associated gallery
          const response = await fetch(`/api/gallery?slug=${gallerySlug}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete associated gallery');
          }
        } catch (error) {
          setToast({ message: 'Failed to delete associated gallery', type: 'error' });
          return;
        }
      }
    }
    
    // Remove the tile from the layout
    const updatedLayout = layout.filter(item => item.i !== layout[selectedTileIndex].i);
    setLayout(updatedLayout);
    
    // Update gallery layout
    const updatedGalleryLayout = gallery.layout.filter(tile => tile.id !== layout[selectedTileIndex].i);
    gallery.layout = updatedGalleryLayout;
    
    setHasChanges(true);
    setSelectedTileIndex(null);
    setToast({ message: 'Tile deleted', type: 'info' });
  };

  const handleCreateGallery = async (title: string, slug: string) => {
    if (!gallery || !isHomeGallery) return;

    try {
      // Create the new gallery
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          layout: []
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create gallery');
      }

      const newGallery = await response.json();

      // Find the lowest y position in the current layout
      const maxY = Math.max(...layout.map(item => item.y + item.h), 0);
      
      // Create a new tile linking to the gallery
      const newTile: GalleryTile = {
        id: `tile-${Date.now()}`,
        imageUrl: '', // Start with no image
        altText: title,
        description: title,
        link: `/gallery/${slug}`,
        x: 0,
        y: maxY,
        w: 4,
        h: 4,
      };

      // Add to layout
      const newLayout = [
        ...layout,
        {
          i: newTile.id,
          x: newTile.x,
          y: newTile.y,
          w: newTile.w,
          h: newTile.h,
          minW: 1,
          maxW: 12,
          minH: 1,
          maxH: 20,
        }
      ];

      // Update layout
      setLayout(newLayout);
      
      // Update gallery layout
      const updatedGalleryLayout = [...gallery.layout, newTile];
      gallery.layout = updatedGalleryLayout;
      
      setHasChanges(true);
      setIsCreateGalleryOpen(false);
      setToast({ message: 'Gallery created successfully', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to create gallery', type: 'error' });
    }
  };

  const handleBatchUpload = async (files: File[]) => {
    if (!gallery) return;
    setIsBatchUploading(true);

    try {
      // Find the lowest y position in the current layout
      // If there are no tiles, start from y=0
      const maxY = layout.length > 0 
        ? Math.max(...layout.map(item => item.y + item.h), 0)
        : 0;
      let currentY = maxY;
      let currentX = 0;
      const maxWidth = 12; // Maximum width of the grid

      // Create a new array to hold all the new tiles
      const newTiles: GalleryTile[] = [];
      let successfulUploads = 0;

      setToast({ 
        message: `Starting upload of ${files.length} images...`, 
        type: 'info' 
      });

      for (const [index, file] of files.entries()) {
        // Show progress
        setToast({ 
          message: `Uploading image ${index + 1} of ${files.length}: ${file.name}`, 
          type: 'info' 
        });

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setToast({ message: `Skipped ${file.name}: Not an image file`, type: 'error' });
          continue;
        }

        // Validate file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
          setToast({ message: `Skipped ${file.name}: File too large`, type: 'error' });
          continue;
        }

        // Get image dimensions
        const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
          const img = new Image();
          img.onload = () => {
            resolve({ width: img.width, height: img.height });
          };
          img.src = URL.createObjectURL(file);
        });

        // Determine tile dimensions based on image aspect ratio
        const isLandscape = dimensions.width > dimensions.height;
        const tileWidth = isLandscape ? 4 : 3;
        const tileHeight = isLandscape ? 3 : 4;

        // Check if we need to move to the next row
        if (currentX + tileWidth > maxWidth) {
          currentX = 0;
          // If there are no tiles in the current row, use the tile height
          const rowHeight = layout.length > 0
            ? Math.max(...layout.filter(item => item.x === 0).map(item => item.h), 0)
            : tileHeight;
          currentY += rowHeight;
        }

        try {
          // Create form data
          const formData = new FormData();
          formData.append('file', file);
          formData.append('slug', gallery.slug);

          // Upload file using the Astro endpoint
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Upload failed');
          }

          const { url } = await response.json();

          // Create new tile
          const newTile: GalleryTile = {
            id: `tile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            imageUrl: url,
            altText: file.name,
            description: '',
            x: currentX,
            y: currentY,
            w: tileWidth,
            h: tileHeight,
          };

          // Add to new tiles array
          newTiles.push(newTile);
          successfulUploads++;

          // Update position for next tile
          currentX += tileWidth;
        } catch (error) {
          setToast({ message: `Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`, type: 'error' });
          continue;
        }
      }

      // Update layouts with all new tiles at once
      const newLayout = [
        ...layout,
        ...newTiles.map(tile => ({
          i: tile.id,
          x: tile.x,
          y: tile.y,
          w: tile.w,
          h: tile.h,
          minW: 1,
          maxW: 12,
          minH: 1,
          maxH: 20,
        }))
      ];

      // Update layout
      setLayout(newLayout);
      
      // Update gallery layout
      gallery.layout = [...gallery.layout, ...newTiles];
      
      setHasChanges(true);
      setToast({ 
        message: `Successfully uploaded ${successfulUploads} of ${files.length} images`, 
        type: 'success' 
      });
    } catch (error) {
      console.error('Batch upload error:', error);
      setToast({ 
        message: `Failed to process batch upload: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        type: 'error' 
      });
    } finally {
      setIsBatchUploading(false);
    }
  };

  const handleDeleteAll = () => {
    if (!gallery) return;
    
    if (window.confirm('Are you sure you want to delete all tiles? This action cannot be undone.')) {
      // Clear layout
      setLayout([]);
      
      // Clear gallery layout
      gallery.layout = [];
      
      setHasChanges(true);
      setToast({ message: 'All tiles deleted', type: 'info' });
    }
  };

  if (!gallery) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Gallery Not Found
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Would you like to create a new gallery with the slug "{slug}"?
            </p>
          </div>
          <form 
            className="mt-8 space-y-6" 
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const response = await fetch('/api/gallery', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    title: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                    slug,
                    layout: []
                  }),
                });

                if (!response.ok) {
                  throw new Error('Failed to create gallery');
                }

                // Reload the page to show the new gallery
                window.location.reload();
              } catch (error) {
                setToast({ 
                  message: `Failed to create gallery: ${error instanceof Error ? error.message : 'Unknown error'}`, 
                  type: 'error' 
                });
              }
            }}
          >
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Gallery
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-2">
      <div 
        className="w-full min-h-[500px]" 
        onClick={handleContainerClick}
      >
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={rowHeight}
          autoSize={true}
          width={containerWidth}
          onLayoutChange={handleLayoutChange}
          onDragStart={handleDragStart}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
          isDraggable
          isResizable
          margin={[16, 16]}
          preventCollision={false}
          compactType="vertical"
          useCSSTransforms={false}
          draggableHandle=".tile-content"
          resizeHandles={['se', 'sw', 'ne', 'nw', 'e', 'w', 'n', 's']}
        >
          {gallery.layout.map((tile, index) => (
            <div 
              key={tile.id} 
              className={`h-full ${selectedTileIndex === index ? 'ring-2 ring-blue-500' : ''}`}
              onClick={(e) => handleTileClick(e, index)}
            >
              <div className="tile-content h-full">
                <Tile
                  image={tile.imageUrl}
                  imageAlt={tile.altText}
                  text={tile.description || ''}
                  className="h-full"
                />
              </div>
            </div>
          ))}
        </GridLayout>
      </div>

      {/* Fixed position buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-between shadow-lg">
        <div className="flex gap-2">
          <button
            onClick={handleAddTile}
            className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            title="Add New Tile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          {selectedTileIndex === null && (
            <>
              <label
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                title="Batch Upload Images"
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleBatchUpload(Array.from(e.target.files));
                    }
                  }}
                  disabled={isBatchUploading}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </label>
              <button
                onClick={handleDeleteAll}
                className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                title="Delete All Tiles"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              {isHomeGallery && (
                <button
                  onClick={() => setIsCreateGalleryOpen(true)}
                  className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  title="Create Gallery"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </button>
              )}
            </>
          )}
          {selectedTileIndex !== null && (
            <>
              <button
                onClick={handleUploadImage}
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                title="Upload Image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={handleEditText}
                className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                title="Edit Text"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleEditLink}
                className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                title="Edit Link"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </button>
              <button
                onClick={handleDeleteTile}
                className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                title="Delete Tile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Cancel Changes"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`p-2 rounded-md transition-colors ${
              hasChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title="Save Changes"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Text Editor Modal */}
      <TextEditor
        isOpen={isTextEditorOpen}
        onClose={() => setIsTextEditorOpen(false)}
        onSave={handleSaveText}
        initialText={selectedTileIndex !== null ? gallery?.layout.find(t => t.id === layout[selectedTileIndex]?.i)?.description || '' : ''}
      />

      {/* Link Editor Modal */}
      <LinkEditor
        isOpen={isLinkEditorOpen}
        onClose={() => setIsLinkEditorOpen(false)}
        onSave={handleSaveLink}
        initialLink={selectedTileIndex !== null ? gallery?.layout.find(t => t.id === layout[selectedTileIndex]?.i)?.link || '' : ''}
      />

      {/* File Uploader Modal */}
      <FileUploader
        isOpen={isFileUploaderOpen}
        onClose={() => setIsFileUploaderOpen(false)}
        onSave={handleSaveImage}
        onDelete={handleDeleteImage}
        hasImage={selectedTileIndex !== null ? gallery?.layout.find(t => t.id === layout[selectedTileIndex]?.i)?.imageUrl !== '' : false}
        slug={slug}
      />

      {/* Create Gallery Modal */}
      <CreateGalleryModal
        isOpen={isCreateGalleryOpen}
        onClose={() => setIsCreateGalleryOpen(false)}
        onCreate={handleCreateGallery}
      />
    </div>
  );
}

export default function GalleryEditor(props: Props) {
  return (
    <Auth>
      <GalleryEditorContent {...props} />
    </Auth>
  );
} 