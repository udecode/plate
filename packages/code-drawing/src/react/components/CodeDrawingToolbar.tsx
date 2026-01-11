'use client';

import * as React from 'react';

import type { CodeDrawingType, ViewMode } from '../../lib';
import { CODE_DRAWING_TYPE_ARRAY, VIEW_MODE_ARRAY, VIEW_MODE } from '../../lib';

export interface CodeDrawingToolbarProps {
  drawingType: CodeDrawingType;
  viewMode: ViewMode;
  readOnly?: boolean;
  isMobile?: boolean;
  onDrawingTypeChange: (type: CodeDrawingType) => void;
  onDrawingModeChange: (mode: ViewMode) => void;
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
}

export function CodeDrawingToolbar({
  drawingType,
  viewMode,
  readOnly = false,
  isMobile = false,
  onDrawingTypeChange,
  onDrawingModeChange,
  renderDrawingTypeSelect,
  renderDrawingModeSelect,
}: CodeDrawingToolbarProps) {
  const [toolbarVisible, setToolbarVisible] = React.useState(false);
  const [selectOpen, setSelectOpen] = React.useState(false);

  // Mobile: always visible, Desktop: show on hover
  const opacityClass =
    isMobile || toolbarVisible || selectOpen
      ? 'opacity-100'
      : 'opacity-0 group-hover:opacity-100';

  // Mobile: normal positioning, Desktop: absolute positioning
  const positionClass = isMobile
    ? 'flex items-center gap-2'
    : 'absolute right-2 z-10 flex items-center gap-2';

  return (
    <div
      className={`${positionClass} transition-opacity ${opacityClass}`}
      onMouseEnter={() => setToolbarVisible(true)}
      onMouseLeave={() => {
        if (!selectOpen) {
          setToolbarVisible(false);
        }
      }}
    >
      {/* Language Selector */}
      {!readOnly && renderDrawingTypeSelect ? (
        <div className="pointer-events-auto">
          {renderDrawingTypeSelect({
            value: drawingType,
            onChange: onDrawingTypeChange,
            onOpenChange: setSelectOpen,
          })}
        </div>
      ) : !readOnly ? (
        <select
          value={drawingType}
          onChange={(e) => onDrawingTypeChange(e.target.value as CodeDrawingType)}
          onFocus={() => setSelectOpen(true)}
          onBlur={() => setSelectOpen(false)}
          className={`rounded-md bg-muted/50 px-2 py-1 text-sm border-0 ${
            !isMobile ? 'hover:bg-zinc-200 transition-colors' : ''
          }`}
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
        <div className="pointer-events-auto">
          {renderDrawingModeSelect({
            value: viewMode,
            onChange: onDrawingModeChange,
            onOpenChange: setSelectOpen,
          })}
        </div>
      ) : !readOnly ? (
        <select
          value={viewMode}
          onChange={(e) => onDrawingModeChange(e.target.value as ViewMode)}
          onFocus={() => setSelectOpen(true)}
          onBlur={() => setSelectOpen(false)}
          className={`rounded-md bg-muted/50 px-2 py-1 text-xs border-0 ${
            !isMobile ? 'hover:bg-zinc-200 transition-colors' : ''
          }`}
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
}
