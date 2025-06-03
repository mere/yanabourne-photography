import { useState } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import Tile from './Tile';
import type { Gallery } from '../types/gallery';

interface Props {
  gallery: Gallery;
}

export default function Gallery({ gallery }: Props) {
  const [containerWidth, setContainerWidth] = useState(1200);
  const [rowHeight, setRowHeight] = useState(60);

  // Update container width and row height on window resize
  useState(() => {
    const updateWidth = () => {
      const width = Math.min(window.innerWidth - 32, 1200); // 32px for padding
      setContainerWidth(width);
      // Calculate row height to make tiles square (accounting for margins)
      const columnWidth = (width - (11 * 10)) / 12; // 11 gaps of 10px between 12 columns
      setRowHeight(columnWidth);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  });

  // Convert gallery layout to react-grid-layout format
  const layout = gallery.layout.map((tile) => ({
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

  return (
    <div className="w-full px-4 py-16">
      <h1 className="text-3xl font-bold my-8">{gallery.title}</h1>
      <div className="w-full min-h-[500px]">
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={rowHeight}
          autoSize={true}
          width={containerWidth}
          margin={[10, 10]}
          preventCollision={false}
          compactType="vertical"
          useCSSTransforms={false}
          isDraggable={false}
          isResizable={false}
        >
          {gallery.layout.map((tile) => (
            <div key={tile.id} className="h-full">
              <div className="tile-content h-full">
                <Tile
                  image={tile.imageUrl}
                  imageAlt={tile.altText}
                  text={tile.description || ''}
                  link={tile.link}
                  className="h-full"
                />
              </div>
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
} 