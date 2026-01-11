'use client';

import * as React from 'react';

import {
  CodeDrawingElement as BaseCodeDrawingElement,
} from '@platejs/code-drawing/react';
import { VIEW_MODE, type CodeDrawingType, type TCodeDrawingElement, type ViewMode } from '@platejs/code-drawing';
import type { PlateElementProps } from 'platejs/react';
import { Trash2, DownloadIcon } from 'lucide-react';

import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CodeDrawingElement(
  props: PlateElementProps<TCodeDrawingElement>
) {
  const isMobile = useIsMobile();
  const [languageSelectOpen, setLanguageSelectOpen] = React.useState(false);
  const [viewModeSelectOpen, setViewModeSelectOpen] = React.useState(false);

  return (
    <BaseCodeDrawingElement
      {...props}
      isMobile={isMobile}
      renderToolbar={({
        children,
        onRemove,
        onDownload,
        open,
      }: {
        children: React.ReactNode;
        onRemove: () => void;
        onDownload?: () => void;
        open: boolean;
      }) => (
        <Popover open={open} modal={false}>
          <PopoverAnchor asChild>{children}</PopoverAnchor>
          <PopoverContent
            className="w-auto p-1"
            contentEditable={false}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-1">
              {onDownload && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  onClick={onDownload}
                  title="Export"
                >
                  <DownloadIcon className="size-4" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="size-8"
                onClick={onRemove}
                title="Delete"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
      renderDrawingTypeSelect={({ value, onChange, onOpenChange }: {
        value: CodeDrawingType;
        onChange: (value: CodeDrawingType) => void;
        onOpenChange?: (open: boolean) => void;
      }) => (
        <Select 
          value={value} 
          onValueChange={onChange} 
          open={languageSelectOpen} 
          onOpenChange={(open) => {
            setLanguageSelectOpen(open);
            onOpenChange?.(open);
          }}
        >
          <SelectTrigger className="w-[120px] bg-background h-8 text-xs border-0 shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[100]">
            <SelectItem value="PlantUml">PlantUml</SelectItem>
            <SelectItem value="Graphviz">Graphviz</SelectItem>
            <SelectItem value="Flowchart">Flowchart</SelectItem>
            <SelectItem value="Mermaid">Mermaid</SelectItem>
          </SelectContent>
        </Select>
      )}
      renderDrawingModeSelect={({ value, onChange, onOpenChange }: {
        value: ViewMode;
        onChange: (value: ViewMode) => void;
        onOpenChange?: (open: boolean) => void;
      }) => (
        <Select 
          value={value} 
          onValueChange={onChange} 
          open={viewModeSelectOpen} 
          onOpenChange={(open) => {
            setViewModeSelectOpen(open);
            onOpenChange?.(open);
          }}
        >
          <SelectTrigger className="w-[80px] bg-background h-8 text-xs border-0 shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[100]">
            <SelectItem value={VIEW_MODE.Both}>Both</SelectItem>
            <SelectItem value={VIEW_MODE.Code}>Code</SelectItem>
            <SelectItem value={VIEW_MODE.Image}>Image</SelectItem>
          </SelectContent>
        </Select>
      )}
    />
  );
}
