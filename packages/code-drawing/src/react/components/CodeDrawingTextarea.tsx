'use client';

import * as React from 'react';

import type { CodeDrawingType, ViewMode } from '../../lib';
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

  return (
    <div
      className={`${
        isCodeOnlyMode ? 'w-full' : 'flex-1 min-w-0'
      } flex flex-col ${isCodeOnlyMode && !isMobile ? 'relative' : ''} ${
        showBorder && !isMobile ? 'border-r' : ''
      }`}
    >
      {/* Toolbar - Show on code editor when in code mode */}
      {toolbar && isCodeOnlyMode && (
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

      {renderTextarea ? (
        renderTextarea({
          value: code,
          onChange: onCodeChange,
        })
      ) : (
        <div className="relative rounded-md flex-1">
          <pre
            className={`overflow-x-auto p-8 pr-4 font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid m-0`}
            style={{ minHeight: `${DEFAULT_MIN_HEIGHT}px`, height: '100%' }}
          >
            <code className="block w-full h-full">
              <textarea
                ref={textareaRef}
                value={code}
                onChange={onCodeChange}
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
  );
}
