import { useEffect, useRef, useState } from 'react';
import type { ImageMetadata } from 'astro';
import { Image } from "@unpic/react";

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
          `mx-auto p-2 md:p-4 z-100 absolute bottom-0 left-0 right-0 text-white user-select-none
           ${image ? "" : "h-full"}`}
      >
        <div className="flex items-center justify-center">
          <p className="inline-block bg-black/20 backdrop-blur-xs px-0.5 md:px-4 py-0 rounded text-center text-sm md:text-3xl font-karla">{text}</p>
        </div>
      </div>
      )}
    </div>
  );
} 