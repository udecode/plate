'use client';

import * as React from 'react';

import {
  VIEW_MODE,
  DEFAULT_MIN_HEIGHT,
  type CodeDrawingType,
  type ViewMode,
} from '@platejs/code-drawing';

import { CodeDrawingToolbar } from './code-drawing-toolbar';
import { CodeDrawingTextarea } from './code-drawing-textarea';
import { CodeDrawingPreviewArea } from './code-drawing-preview-area';

export function CodeDrawingPreview({
  code,
  drawingType,
  drawingMode,
  image,
  loading,
  onCodeChange,
  onDrawingTypeChange,
  onDrawingModeChange,
  readOnly = false,
  isMobile = false,
}: {
  code: string;
  drawingType: CodeDrawingType;
  drawingMode: ViewMode;
  image: string;
  loading: boolean;
  onCodeChange: (code: string) => void;
  onDrawingTypeChange: (type: CodeDrawingType) => void;
  onDrawingModeChange: (mode: ViewMode) => void;
  readOnly?: boolean;
  isMobile?: boolean;
}) {
  const viewMode = drawingMode;
  const showCode = viewMode === VIEW_MODE.Both || viewMode === VIEW_MODE.Code;
  const showBorder = viewMode === VIEW_MODE.Both;

  const handleCodeChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onCodeChange(e.target.value);
    },
    [onCodeChange]
  );

  const toolbar = readOnly ? null : (
    <CodeDrawingToolbar
      drawingType={drawingType}
      viewMode={viewMode}
      readOnly={readOnly}
      isMobile={isMobile}
      onDrawingTypeChange={onDrawingTypeChange}
      onDrawingModeChange={onDrawingModeChange}
    />
  );

  return (
    <div
      className={`flex ${isMobile ? 'flex-col-reverse' : 'flex-col'} group my-4 w-full items-stretch border bg-muted/50 md:flex-row`}
      style={{
        minHeight: `${DEFAULT_MIN_HEIGHT}px`,
      }}
    >
      {showCode && (
        <CodeDrawingTextarea
          code={code}
          viewMode={viewMode}
          readOnly={readOnly}
          isMobile={isMobile}
          showBorder={showBorder}
          onCodeChange={handleCodeChange}
          toolbar={viewMode === VIEW_MODE.Code ? toolbar : null}
        />
      )}

      {viewMode !== VIEW_MODE.Code && (
        <CodeDrawingPreviewArea
          image={image}
          loading={loading}
          code={code}
          viewMode={viewMode}
          readOnly={readOnly}
          isMobile={isMobile}
          showBorder={showBorder}
          toolbar={toolbar}
        />
      )}
    </div>
  );
}
