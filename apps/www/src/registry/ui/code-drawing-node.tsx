'use client';

import * as React from 'react';

import { CodeDrawingElement as BaseCodeDrawingElement } from '@platejs/code-drawing/react';
import type {
  CodeDrawingType,
  TCodeDrawingElement,
  ViewMode,
} from '@platejs/code-drawing';
import type { PlateElementProps } from 'platejs/react';
import {
  useEditorRef,
  useEditorSelector,
  useElement,
  useFocusedLast,
  useReadOnly,
  useSelected,
} from 'platejs/react';
import { Trash2, DownloadIcon } from 'lucide-react';

import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import { useCodeDrawingElement } from '@platejs/code-drawing/react';
import { downloadImage } from '@platejs/code-drawing';
import { DOWNLOAD_FILENAME } from '@platejs/code-drawing';

import { CodeDrawingPreview } from './code-drawing-preview';

export function CodeDrawingElement(
  props: PlateElementProps<TCodeDrawingElement>
) {
  const isMobile = useIsMobile();
  const editor = useEditorRef();
  const readOnly = useReadOnly();
  const selected = useSelected();
  const isFocusedLast = useFocusedLast();
  const element = useElement<TCodeDrawingElement>();
  const { removeNode, image, loading } = useCodeDrawingElement({ element });

  const handleDownload = React.useCallback(() => {
    if (!image) return;
    downloadImage(image, DOWNLOAD_FILENAME);
  }, [image]);

  const handleCodeChange = React.useCallback(
    (code: string) => {
      const path = editor.api.findPath(element);
      if (path) {
        editor.tf.setNodes(
          {
            data: {
              ...element.data,
              code,
            },
          },
          { at: path }
        );
      }
    },
    [editor, element]
  );

  const handleDrawingTypeChange = React.useCallback(
    (drawingType: CodeDrawingType) => {
      const path = editor.api.findPath(element);
      if (path) {
        editor.tf.setNodes(
          {
            data: {
              ...element.data,
              drawingType,
            },
          },
          { at: path }
        );
      }
    },
    [editor, element]
  );

  const handleDrawingModeChange = React.useCallback(
    (drawingMode: ViewMode) => {
      const path = editor.api.findPath(element);
      if (path) {
        editor.tf.setNodes(
          {
            data: {
              ...element.data,
              drawingMode,
            },
          },
          { at: path }
        );
      }
    },
    [editor, element]
  );

  const code = element.data?.code ?? '';
  const drawingType = element.data?.drawingType ?? 'Mermaid';
  const drawingMode = element.data?.drawingMode ?? 'Both';

  const selectionCollapsed = useEditorSelector(
    (editor) => !editor.api.isExpanded(),
    []
  );

  const open = isFocusedLast && !readOnly && selected && selectionCollapsed;

  const content = (
    <BaseCodeDrawingElement {...props}>
      <div contentEditable={false}>
        <CodeDrawingPreview
          code={code}
          drawingType={drawingType}
          drawingMode={drawingMode}
          image={image}
          loading={loading}
          onCodeChange={handleCodeChange}
          onDrawingTypeChange={handleDrawingTypeChange}
          onDrawingModeChange={handleDrawingModeChange}
          readOnly={readOnly}
          isMobile={isMobile}
        />
      </div>
    </BaseCodeDrawingElement>
  );

  if (readOnly) {
    return content;
  }

  return (
    <Popover open={open} modal={false}>
      <PopoverAnchor asChild>{content}</PopoverAnchor>
      <PopoverContent
        className="w-auto p-1"
        contentEditable={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-1">
          {image && (
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={handleDownload}
              title="Export"
            >
              <DownloadIcon className="size-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={removeNode}
            title="Delete"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
