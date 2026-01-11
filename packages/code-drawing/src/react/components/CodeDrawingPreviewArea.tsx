'use client';

import * as React from 'react';

import type { ViewMode } from '../../lib';
import { VIEW_MODE } from '../../lib';

export type CodeDrawingPreviewAreaProps = {
  image: string;
  loading: boolean;
  code: string;
  viewMode: ViewMode;
  readOnly?: boolean;
  isMobile?: boolean;
  showBorder?: boolean;
  toolbar?: React.ReactNode;
};

export function CodeDrawingPreviewArea({
  image,
  loading,
  code,
  viewMode,
  readOnly: _readOnly = false,
  isMobile = false,
  showBorder = false,
  toolbar,
}: CodeDrawingPreviewAreaProps) {
  const showImage = viewMode === VIEW_MODE.Both || viewMode === VIEW_MODE.Image;

  return (
    <div
      className={`flex min-w-0 flex-1 flex-col ${isMobile ? '' : 'relative'} ${
        showBorder && isMobile ? 'border-b' : ''
      }`}
    >
      {/* Controls - Mobile: top, Desktop: absolute top-right */}
      {toolbar && (
        <div
          className={
            isMobile ? 'mb-2 flex justify-end px-2' : 'absolute right-2 z-10'
          }
        >
          {toolbar}
        </div>
      )}

      {/* Preview Content - Only show when showImage is true */}
      {showImage ? (
        <div
          className={
            'flex flex-1 items-center justify-center rounded-md bg-muted/30 p-4'
          }
        >
          {loading && <div className="text-muted-foreground">Loading...</div>}
          {!loading && image && (
            <img
              src={image}
              alt="Code drawing"
              className="max-h-full max-w-full object-contain"
            />
          )}
          {!loading && !image && (
            <div className="text-muted-foreground">
              {code.trim() ? 'Rendering...' : 'Preview will appear here'}
            </div>
          )}
        </div>
      ) : (
        <div className="pointer-events-none flex flex-1 items-center justify-center rounded-md border bg-muted/30 p-4 opacity-0">
          {/* Placeholder to maintain height */}
        </div>
      )}
    </div>
  );
}
