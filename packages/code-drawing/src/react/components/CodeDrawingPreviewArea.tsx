'use client';

import * as React from 'react';

import type { ViewMode } from '../../lib';
import { VIEW_MODE } from '../../lib';

export interface CodeDrawingPreviewAreaProps {
  image: string;
  loading: boolean;
  code: string;
  viewMode: ViewMode;
  readOnly?: boolean;
  isMobile?: boolean;
  showBorder?: boolean;
  toolbar?: React.ReactNode;
}

export function CodeDrawingPreviewArea({
  image,
  loading,
  code,
  viewMode,
  readOnly = false,
  isMobile = false,
  showBorder = false,
  toolbar,
}: CodeDrawingPreviewAreaProps) {
  const showImage = viewMode === VIEW_MODE.Both || viewMode === VIEW_MODE.Image;

  return (
    <div
      className={`flex-1 min-w-0 flex flex-col ${!isMobile ? 'relative' : ''} ${
        showBorder && isMobile ? 'border-b' : ''
      }`}
    >
      {/* Controls - Mobile: top, Desktop: absolute top-right */}
      {toolbar && (
        <div
          className={
            isMobile
              ? 'flex justify-end mb-2 px-2'
              : 'absolute right-2 z-10'
          }
        >
          {toolbar}
        </div>
      )}

      {/* Preview Content - Only show when showImage is true */}
      {showImage ? (
        <div
          className={`flex items-center justify-center flex-1 rounded-md bg-muted/30 p-4`}
        >
          {loading && (
            <div className="text-muted-foreground">Loading...</div>
          )}
          {!loading && image && (
            <img
              src={image}
              alt="Code drawing"
              className="max-w-full max-h-full object-contain"
            />
          )}
          {!loading && !image && (
            <div className="text-muted-foreground">
              {code.trim() ? 'Rendering...' : 'Preview will appear here'}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center flex-1 rounded-md border bg-muted/30 p-4 opacity-0 pointer-events-none">
          {/* Placeholder to maintain height */}
        </div>
      )}
    </div>
  );
}
