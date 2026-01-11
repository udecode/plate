'use client';

import * as React from 'react';

import type { CodeDrawingType, ViewMode } from '../../lib';
import { VIEW_MODE, DEFAULT_MIN_HEIGHT } from '../../lib';
import { CodeDrawingTextarea } from './CodeDrawingTextarea';
import { CodeDrawingPreviewArea } from './CodeDrawingPreviewArea';
import { CodeDrawingToolbar } from './CodeDrawingToolbar';

export type CodeDrawingPreviewProps = {
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
  renderDrawingTypeSelect?: (props: {
    value: CodeDrawingType;
    onChange: (value: CodeDrawingType) => void;
    onOpenChange?: (open: boolean) => void;
  }) => React.ReactNode;
  renderDrawingModeSelect?: (props: {
    value: ViewMode;
    onChange: (value: ViewMode) => void;
    onOpenChange?: (open: boolean) => void;
  }) => React.ReactNode;
  renderTextarea?: (props: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  }) => React.ReactNode;
};

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
  renderDrawingTypeSelect,
  renderDrawingModeSelect,
  renderTextarea,
}: CodeDrawingPreviewProps) {
  const viewMode = drawingMode;
  const showCode = viewMode === VIEW_MODE.Both || viewMode === VIEW_MODE.Code;
  const showBorder = viewMode === VIEW_MODE.Both; // Only show border in Both mode

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
      renderDrawingTypeSelect={renderDrawingTypeSelect}
      renderDrawingModeSelect={renderDrawingModeSelect}
    />
  );

  return (
    <div
      className={`flex ${isMobile ? 'flex-col-reverse' : 'flex-col'} group my-4 w-full items-stretch border bg-muted/50 md:flex-row`}
      style={{
        minHeight: `${DEFAULT_MIN_HEIGHT}px`,
      }}
    >
      {/* Code Editor - Left (Desktop) / Bottom (Mobile) */}
      {showCode && (
        <CodeDrawingTextarea
          code={code}
          viewMode={viewMode}
          readOnly={readOnly}
          isMobile={isMobile}
          showBorder={showBorder}
          onCodeChange={handleCodeChange}
          renderTextarea={renderTextarea}
          toolbar={viewMode === VIEW_MODE.Code ? toolbar : null}
        />
      )}

      {/* Preview Area - Right (Desktop) / Top (Mobile) */}
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
