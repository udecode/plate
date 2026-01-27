'use client';

import * as React from 'react';

import {
  CODE_DRAWING_TYPE_ARRAY,
  VIEW_MODE_ARRAY,
  type CodeDrawingType,
  type ViewMode,
} from '@platejs/code-drawing';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CodeDrawingToolbar({
  drawingType,
  viewMode,
  readOnly = false,
  isMobile = false,
  onDrawingTypeChange,
  onDrawingModeChange,
}: {
  drawingType: CodeDrawingType;
  viewMode: ViewMode;
  readOnly?: boolean;
  isMobile?: boolean;
  onDrawingTypeChange: (type: CodeDrawingType) => void;
  onDrawingModeChange: (mode: ViewMode) => void;
}) {
  const [toolbarVisible, setToolbarVisible] = React.useState(false);
  const [languageSelectOpen, setLanguageSelectOpen] = React.useState(false);
  const [viewModeSelectOpen, setViewModeSelectOpen] = React.useState(false);

  const opacityClass =
    isMobile || toolbarVisible || languageSelectOpen || viewModeSelectOpen
      ? 'opacity-100'
      : 'opacity-0 group-hover:opacity-100';

  const positionClass = isMobile
    ? 'flex items-center gap-2'
    : 'absolute right-2 z-10 flex items-center gap-2';

  return (
    <div
      role="toolbar"
      className={`${positionClass} transition-opacity ${opacityClass}`}
      onMouseEnter={() => setToolbarVisible(true)}
      onMouseLeave={() => {
        if (!languageSelectOpen && !viewModeSelectOpen) {
          setToolbarVisible(false);
        }
      }}
    >
      {!readOnly && (
        <Select
          value={drawingType}
          onValueChange={onDrawingTypeChange}
          open={languageSelectOpen}
          onOpenChange={setLanguageSelectOpen}
        >
          <SelectTrigger
            className={`h-8 w-[120px] border-0 bg-muted/50 text-xs shadow-none ${
              isMobile ? '' : 'transition-colors hover:bg-zinc-200'
            }`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[100]">
            {CODE_DRAWING_TYPE_ARRAY.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!readOnly && (
        <Select
          value={viewMode}
          onValueChange={onDrawingModeChange}
          open={viewModeSelectOpen}
          onOpenChange={setViewModeSelectOpen}
        >
          <SelectTrigger
            className={`h-8 w-[80px] border-0 bg-muted/50 text-xs shadow-none ${
              isMobile ? '' : 'transition-colors hover:bg-zinc-200'
            }`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[100]">
            {VIEW_MODE_ARRAY.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
