import { useEffect, useRef, useState } from 'react';
import type { ImageMetadata } from 'astro';
import { Image } from "@unpic/react";
import MarkdownText from './MarkdownText';

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
        
           <Image
            src={`${import.meta.env.PUBLIC_URL}/api/get-raw-image/?key=${image}`}
            layout="fullWidth"
            alt={imageAlt}
            fallback={import.meta.env.PUBLIC_LOCAL ? "astro" : "netlify"}
            className="w-full h-full object-cover"
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
          {image ? text : <MarkdownText text={text} />}
              
              </p>
        </div>
      </div>
      )}
    </div>
  );
} 