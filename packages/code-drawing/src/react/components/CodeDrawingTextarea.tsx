'use client';

import * as React from 'react';

import type { ViewMode } from '../../lib';
import { VIEW_MODE, DEFAULT_MIN_HEIGHT } from '../../lib';

export type CodeDrawingTextareaProps = {
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
};

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
          value: code,
          onChange: onCodeChange,
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
                value={code}
                onChange={onCodeChange}
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
