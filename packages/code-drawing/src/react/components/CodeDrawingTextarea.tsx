'use client';

import * as React from 'react';

import type { ViewMode } from '../../lib';
import { VIEW_MODE, DEFAULT_MIN_HEIGHT } from '../../lib';

export interface CodeDrawingTextareaProps {
  code: string;
  viewMode: ViewMode;
  readOnly?: boolean;
  isMobile?: boolean;
  showBorder?: boolean;
  onCodeChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  renderTextarea?: (props: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  }) => React.ReactNode;
  toolbar?: React.ReactNode;
}

export function CodeDrawingTextarea({
  code,
  viewMode,
  readOnly = false,
  isMobile = false,
  showBorder = false,
  onCodeChange,
  renderTextarea,
  toolbar,
}: CodeDrawingTextareaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const isCodeOnlyMode = viewMode === VIEW_MODE.Code;
  
  // Use internal state to manage textarea value to prevent re-renders from losing focus
  const [internalCode, setInternalCode] = React.useState(code);
  // Track the last external code value to detect external updates (e.g., undo/redo)
  const lastExternalCodeRef = React.useRef(code);

  // Sync external code changes to internal state only when external code actually changes
  // This handles external updates (e.g., undo/redo) without interfering with user input
  React.useEffect(() => {
    if (code !== lastExternalCodeRef.current) {
      lastExternalCodeRef.current = code;
      setInternalCode(code);
    }
  }, [code]);

  // Handle change with internal state update
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setInternalCode(newValue);
      onCodeChange(e);
    },
    [onCodeChange]
  );

  return (
    <div
      className={`${
        isCodeOnlyMode ? 'w-full' : 'min-w-0 flex-1'
      } flex flex-col ${isCodeOnlyMode && !isMobile ? 'relative' : ''} ${
        showBorder && !isMobile ? 'border-r' : ''
      }`}
    >
      {/* Toolbar - Show on code editor when in code mode */}
      {toolbar && isCodeOnlyMode && (
        <div
          className={
            isMobile ? 'mb-2 flex justify-end px-2' : 'absolute right-2 z-10'
          }
        >
          {toolbar}
        </div>
      )}

      {renderTextarea ? (
        renderTextarea({
          value: internalCode,
          onChange: handleChange,
        })
      ) : (
        <div className="relative flex-1 rounded-md">
          <pre
            className={
              'm-0 overflow-x-auto p-8 pr-4 font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid'
            }
            style={{ minHeight: `${DEFAULT_MIN_HEIGHT}px`, height: '100%' }}
          >
            <code className="block h-full w-full">
              <textarea
                ref={textareaRef}
                value={internalCode}
                onChange={handleChange}
                readOnly={readOnly}
                className="m-0 h-full w-full resize-none overflow-auto border-0 bg-transparent p-0 font-mono text-sm outline-none"
                style={{ minHeight: `${DEFAULT_MIN_HEIGHT}px` }}
                placeholder="Enter your code here..."
                spellCheck={false}
              />
            </code>
          </pre>
        </div>
      )}
    </div>
  );
}
