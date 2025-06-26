import { useState } from "react";
import type { Gallery, GalleryTile } from "~/types/gallery";
import type { UploadWithStatus } from "~/types/upload";
import { ResponsiveImage } from "./ResponsiveImage";
import JsonEditor from "./JsonEditor";
import Toast from "./Toast";

interface GalleryAdminProps {
  gallery: Gallery;
  uploadsWithStatus: UploadWithStatus[];
  unusedImages: UploadWithStatus[];
}

export function GalleryAdmin({
  gallery,
  uploadsWithStatus,
  unusedImages,
}: GalleryAdminProps) {
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const setLoading = (key: string, isLoading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [key]: isLoading }));
  };

  const generateThumbnail = async (imageKey: string, shouldReload = true) => {
    setLoading(imageKey, true);
    try {
      const response = await fetch("/api/update-thumbnail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: imageKey }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to generate thumbnail");
      }

      setToast({ message: "Thumbnail generated successfully", type: "success" });
      if (shouldReload) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      setToast({ 
        message: "Failed to generate thumbnail: " + (error instanceof Error ? error.message : String(error)),
        type: "error"
      });
    } finally {
      setLoading(imageKey, false);
    }
  };

  const generateAllThumbnails = async () => {
    if (
      !confirm(
        "Are you sure you want to generate thumbnails for all images? This may take a while."
      )
    ) {
      return;
    }

    setLoading("allThumbnails", true);
    let successCount = 0;
    let failureCount = 0;

    try {
      const imagesNeedingThumbnails = gallery.layout
        .map((tile) => {
          const image = uploadsWithStatus.find((u) => u.key === tile.imageUrl);
          const thumbKey = image ? `${gallery.slug}/thumb/${image.name}` : null;
          const thumb = thumbKey
            ? uploadsWithStatus.find((u) => u.key === thumbKey)
            : null;
          const needsThumbnail =
            !thumb ||
            thumb.metadata?.tileW !== tile.w ||
            thumb.metadata?.tileH !== tile.h;
          return needsThumbnail ? tile.imageUrl : null;
        })
        .filter((key): key is string => key !== null);

      // Process thumbnails sequentially with a delay
      for (const imageKey of imagesNeedingThumbnails) {
        try {
          await generateThumbnail(imageKey, false); // Don't reload after each thumbnail
          successCount++;
          setToast({ 
            message: `Generated ${successCount} of ${imagesNeedingThumbnails.length} thumbnails`,
            type: "info"
          });
          // Add a small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          failureCount++;
          console.error(`Failed to generate thumbnail for ${imageKey}:`, error);
          setToast({ 
            message: `Failed to generate thumbnail for ${imageKey}`,
            type: "error"
          });
          // Continue with the next image even if one fails
          continue;
        }
      }

      setToast({ 
        message: `Completed: ${successCount} succeeded, ${failureCount} failed`,
        type: successCount > 0 ? "success" : "error"
      });
      window.location.reload(); // Only reload after all thumbnails are processed
    } catch (error) {
      console.error("Error generating thumbnails:", error);
      setToast({ 
        message: "Failed to generate thumbnails: " + (error instanceof Error ? error.message : String(error)),
        type: "error"
      });
    } finally {
      setLoading("allThumbnails", false);
    }
  };

  const deleteImage = async (imageKey: string) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }

    setLoading(imageKey, true);
    try {
      const response = await fetch("/api/delete-image", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageKey }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error deleting image:", error);
      alert(
        "Failed to delete image: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setLoading(imageKey, false);
    }
  };

  const deleteAllUnused = async () => {
    if (!confirm("Are you sure you want to delete all unused images?")) {
      return;
    }

    setLoading("deleteAllUnused", true);
    try {
      const response = await fetch("/api/delete-unused", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gallerySlug: gallery.slug }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete unused images");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error deleting unused images:", error);
      alert(
        "Failed to delete unused images: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setLoading("deleteAllUnused", false);
    }
  };

  const LoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <a
          href="/admin/galleries"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Back to Galleries
        </a>
        <div className="flex gap-4">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-flex items-center"
            onClick={generateAllThumbnails}
            disabled={loadingStates["allThumbnails"]}
          >
            {loadingStates["allThumbnails"] && <LoadingSpinner />}
            Generate All Thumbnails
          </button>
          <button
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
            onClick={() => setShowJsonEditor(true)}
          >
            Edit JSON
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gallery: {gallery.title}</h2>
        <div className="flex gap-4">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => (window.location.href = `/gallery/${gallery.slug}`)}
          >
            View Gallery
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            onClick={() =>
              (window.location.href = `/gallery/${gallery.slug}/edit`)
            }
          >
            Edit Layout
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Layout Contents</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Image
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Position
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Size
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Description
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {gallery.layout.map((tile) => {
                const image = uploadsWithStatus.find(
                  (u) => u.key === tile.imageUrl
                );
                const thumbKey = image
                  ? `${gallery.slug}/thumb/${image.name}`
                  : null;
                const thumb = thumbKey
                  ? uploadsWithStatus.find((u) => u.key === thumbKey)
                  : null;
                const needsThumbnail =
                  !thumb ||
                  thumb.metadata?.tileW !== tile.w ||
                  thumb.metadata?.tileH !== tile.h;

                return (
                  <tr key={tile.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {tile.id}
                    </td>

                    <td className="px-4 py-2">
                      {thumb && thumbKey ? (
                        <div className="w-20 h-20">
                          <ResponsiveImage
                            id={thumbKey}
                            w={300}
                            h={300}
                            site={import.meta.env.PUBLIC_URL}
                            alt={tile.id}
                            thumbUrl={thumb && thumbKey ? thumbKey : undefined}
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-gray-500 text-sm">
                            No thumbnail
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      x: {tile.x}, y: {tile.y}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {tile.w}x{tile.h}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {tile.description || "-"}
                    </td>
                    <td className="px-4 py-2">
                      {needsThumbnail && (
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm inline-flex items-center"
                          onClick={() => generateThumbnail(tile.imageUrl)}
                          disabled={loadingStates[tile.imageUrl]}
                        >
                          {loadingStates[tile.imageUrl] && <LoadingSpinner />}
                          Generate Thumbnail
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Unused Images</h3>
          {unusedImages.length > 0 && (
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              onClick={deleteAllUnused}
              disabled={loadingStates["deleteAllUnused"]}
            >
              {loadingStates["deleteAllUnused"] && <LoadingSpinner />}
              Delete All Unused
            </button>
          )}
        </div>
        {unusedImages.length === 0 ? (
          <p className="text-gray-500">No unused images found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Preview
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Size
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Last Modified
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {unusedImages.map((image) => (
                  <tr key={image.key}>
                    <td className="px-4 py-2">
                      <div className="w-20 h-20">
                        <ResponsiveImage
                          id={image.key}
                          w={300}
                          h={300}
                          site={import.meta.env.PUBLIC_URL}
                          alt={image.name}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {image.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {Math.round((image.size / 1024 / 1024) * 100) / 100} MB
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {image.type}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {image.lastModified.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => deleteImage(image.key)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showJsonEditor && (
        <JsonEditor
          initialData={gallery}
          onClose={() => setShowJsonEditor(false)}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
