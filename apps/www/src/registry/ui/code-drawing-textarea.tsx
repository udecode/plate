'use client';

import * as React from 'react';

import {
  VIEW_MODE,
  DEFAULT_MIN_HEIGHT,
  type ViewMode,
} from '@platejs/code-drawing';

export function CodeDrawingTextarea({
  code,
  viewMode,
  readOnly = false,
  isMobile = false,
  showBorder = false,
  onCodeChange,
  toolbar,
}: {
  code: string;
  viewMode: ViewMode;
  readOnly?: boolean;
  isMobile?: boolean;
  showBorder?: boolean;
  onCodeChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  toolbar?: React.ReactNode;
}) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const isCodeOnlyMode = viewMode === VIEW_MODE.Code;

  const [internalCode, setInternalCode] = React.useState(code);
  const lastExternalCodeRef = React.useRef(code);

  React.useEffect(() => {
    if (code !== lastExternalCodeRef.current) {
      lastExternalCodeRef.current = code;
      setInternalCode(code);
    }
  }, [code]);

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
      {toolbar && isCodeOnlyMode && (
        <div
          className={
            isMobile ? 'mb-2 flex justify-end px-2' : 'absolute right-2 z-10'
          }
        >
          {toolbar}
        </div>
      )}

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
    </div>
  );
}
