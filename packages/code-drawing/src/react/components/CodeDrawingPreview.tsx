'use client';

import * as React from 'react';
import debounce from 'lodash/debounce.js';

import type { CodeDrawingType, ViewMode } from '../../lib';
import { CODE_DRAWING_TYPE_ARRAY, VIEW_MODE_ARRAY, VIEW_MODE, DEFAULT_MIN_HEIGHT, RENDER_DEBOUNCE_DELAY } from '../../lib';
import { renderCodeDrawing } from '../../lib/utils/renderers';

export interface CodeDrawingPreviewProps {
  code: string;
  drawingType: CodeDrawingType;
  drawingMode: ViewMode;
  onCodeChange: (code: string) => void;
  onDrawingTypeChange: (type: CodeDrawingType) => void;
  onDrawingModeChange: (mode: ViewMode) => void;
  readOnly?: boolean;
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
}

export function CodeDrawingPreview({
  code,
  drawingType,
  drawingMode,
  onCodeChange,
  onDrawingTypeChange,
  onDrawingModeChange,
  readOnly = false,
  renderDrawingTypeSelect,
  renderDrawingModeSelect,
  renderTextarea,
}: CodeDrawingPreviewProps) {
  const viewMode = drawingMode;
  const [loading, setLoading] = React.useState(false);
  const [image, setImage] = React.useState<string>('');
  const lastRequestRef = React.useRef(0);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Debounced render when code or type changes
  const debouncedRender = React.useMemo(
    () =>
      debounce(async (codeValue: string, type: CodeDrawingType) => {
        lastRequestRef.current += 1;
        const requestId = lastRequestRef.current;

        if (!codeValue || !codeValue.trim() || !type) {
          setImage('');
          setLoading(false);
          return;
        }

        setLoading(true);

        try {
          const imageData = await renderCodeDrawing(type as any, codeValue);

          if (lastRequestRef.current === requestId) {
            setImage(imageData);
          }
        } catch (err) {
          if (lastRequestRef.current === requestId) {
            setImage('');
          }
        } finally {
          if (lastRequestRef.current === requestId) {
            setLoading(false);
          }
        }
      }, RENDER_DEBOUNCE_DELAY),
    []
  );

  React.useEffect(() => {
    debouncedRender(code, drawingType);

    return () => {
      debouncedRender.cancel();
    };
  }, [code, drawingType, debouncedRender]);

  const handleCodeChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onCodeChange(e.target.value);
      // Auto-resize textarea
      
    },
    [onCodeChange]
  );



  const showCode = viewMode === VIEW_MODE.Both || viewMode === VIEW_MODE.Code;
  const showImage = viewMode === VIEW_MODE.Both || viewMode === VIEW_MODE.Image;
  const [toolbarVisible, setToolbarVisible] = React.useState(false);
  const [selectOpen, setSelectOpen] = React.useState(false);

  // Render toolbar controls (language selector and view mode selector)
  const renderToolbarControls = React.useCallback(
    (position: 'code' | 'preview') => {
      const isCodeMode = position === 'code' && viewMode === VIEW_MODE.Code;
      const isPreviewMode = position === 'preview' && viewMode !== VIEW_MODE.Code;

      if (!isCodeMode && !isPreviewMode) return null;

      return (
        <div
          className={`absolute top-2 right-2 z-10 flex items-center gap-2 transition-opacity ${
            toolbarVisible || selectOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          onMouseEnter={() => setToolbarVisible(true)}
          onMouseLeave={() => {
            if (!selectOpen) {
              setToolbarVisible(false);
            }
          }}
        >
          {/* Language Selector */}
          {!readOnly && renderDrawingTypeSelect ? (
            renderDrawingTypeSelect({
              value: drawingType,
              onChange: onDrawingTypeChange,
              onOpenChange: setSelectOpen,
            })
          ) : !readOnly ? (
            <select
              value={drawingType}
              onChange={(e) => onDrawingTypeChange(e.target.value as CodeDrawingType)}
              onFocus={() => setSelectOpen(true)}
              onBlur={() => setSelectOpen(false)}
              className="rounded-md bg-background px-2 py-1 text-sm border-0"
            >
              {CODE_DRAWING_TYPE_ARRAY.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          ) : null}

          {/* View Mode Select */}
          {!readOnly && renderDrawingModeSelect ? (
            renderDrawingModeSelect({
              value: viewMode,
              onChange: onDrawingModeChange,
              onOpenChange: setSelectOpen,
            })
          ) : !readOnly ? (
            <select
              value={viewMode}
              onChange={(e) => onDrawingModeChange(e.target.value as ViewMode)}
              onFocus={() => setSelectOpen(true)}
              onBlur={() => setSelectOpen(false)}
              className="rounded-md bg-background px-2 py-1 text-xs border-0"
            >
              {VIEW_MODE_ARRAY.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      );
    },
    [
      viewMode,
      toolbarVisible,
      selectOpen,
      readOnly,
      renderDrawingTypeSelect,
      drawingType,
      onDrawingTypeChange,
      renderDrawingModeSelect,
      onDrawingModeChange,
    ]
  );

  return (
    <div className="flex flex-col md:flex-row w-full my-4 group" style={{ 
        minHeight: `${DEFAULT_MIN_HEIGHT}px`,
    }}>
      {/* Code Editor - Left (Desktop) / Top (Mobile) */}
      {showCode && (
        <div className={`${viewMode === VIEW_MODE.Code ? 'w-full' : 'flex-1 min-w-0'} flex flex-col relative`} >
          {/* Toolbar - Show on code editor when in code mode */}
          {renderToolbarControls('code')}
          
          {renderTextarea ? (
            renderTextarea({
              value: code,
              onChange: handleCodeChange,
            })
          ) : (
            <div className="relative rounded-md bg-muted/50">
              <pre className="overflow-x-auto p-8 pr-4 font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid m-0" style={{ minHeight: `${DEFAULT_MIN_HEIGHT}px`, height: '100%' }}>
                <code className="block w-full h-full">
                  <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={handleCodeChange}
                    readOnly={readOnly}
                    className="w-full h-full resize-none bg-transparent border-0 p-0 m-0 font-mono text-sm outline-none overflow-auto"
                    style={{ minHeight: `${DEFAULT_MIN_HEIGHT}px` }}
                    placeholder="Enter your code here..."
                    spellCheck={false}
                  />
                </code>
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Preview Area - Right (Desktop) / Bottom (Mobile) - Only render when not in code mode */}
      {viewMode !== VIEW_MODE.Code && (
        <div className="flex-1 min-w-0 relative" >
          {/* Controls - Top Right */}
          {renderToolbarControls('preview')}

          {/* Preview Content - Only show when showImage is true */}
          {showImage ? (
            <div className="flex items-center justify-center h-full rounded-md border bg-muted/30 p-4" >
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
            <div className="flex items-center justify-center h-full rounded-md border bg-muted/30 p-4 opacity-0 pointer-events-none">
              {/* Placeholder to maintain height */}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

