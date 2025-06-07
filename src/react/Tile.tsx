import { useEffect, useRef, useState } from 'react';
import { Image } from "@unpic/react";
import TypographyWrapper from './TypographyWrapper';
import { ResponsiveImage } from './ResponsiveImage';

interface Props {
  image?: string;
  imageAlt?: string;
  text?: string;
  className?: string;
  link?: string;
  id?: string;
  
}

export default function Tile({ 
  image, 
  imageAlt = '', 
  text = '', 
  className = '',
  
  id
}: Props) {
  
  return (
    <div 
      className={`relative overflow-hidden bg-gray-200 shadow-lg ${className}`}
      
      data-id={id}
    >
      {image && (
          <ResponsiveImage
            id={image}
            w={1000}
            alt={imageAlt}
            h={1000}
            site={import.meta.env.PUBLIC_URL}
          />
           
        
      )}
      {text && (
        <div
        className={
          `mx-auto p-2 md:p-4 z-100 absolute bottom-0 left-0 right-0  user-select-none pointer-events-none
           ${image ? "" : "top-0"}`}
      >
        <div className="flex">
          <p className={`preserve-whitespace inline-block ${image ? "bg-black/20 backdrop-blur-[1px] text-white text-sm md:text-3xl" : "text-black text-lg"} 
            px-0.5 md:px-4 py-0 rounded font-karla ${text.length > 100 ? "text-sm md:text-base" : ""}`}>
          {image ? text : (
            <TypographyWrapper html={text} />
          )}
              
              </p>
        </div>
      </div>
      )}
    </div>
  );
} 