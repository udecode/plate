'use client';

import * as React from 'react';

import type { CodeDrawingType, TCodeDrawingElement, ViewMode } from '../lib';
import type { PlateElementProps } from 'platejs/react';

import { PlateElement, useEditorRef, useReadOnly } from 'platejs/react';

import { useCodeDrawingElement } from './hooks/useCodeDrawingElement';
import { CodeDrawingFloatingToolbar } from './components/CodeDrawingFloatingToolbar';
import { CodeDrawingPreview } from './components/CodeDrawingPreview';
import { downloadImage } from '../lib/utils/download';
import { DOWNLOAD_FILENAME } from '../lib/constants';

export interface CodeDrawingElementProps
  extends PlateElementProps<TCodeDrawingElement> {
  renderPopover?: (props: {
    children: React.ReactNode;
    onRemove: () => void;
    onDownload?: () => void;
    open: boolean;
  }) => React.ReactNode;
  renderDrawingTypeSelect?: (props: {
    value: CodeDrawingType;
    onChange: (value: CodeDrawingType) => void;
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
  isMobile?: boolean;
}

function CodeDrawingElementBase(props: CodeDrawingElementProps) {
  const {
    children,
    element,
    renderPopover,
    renderDrawingTypeSelect,
    renderDrawingModeSelect,
    renderTextarea,
    isMobile,
  } = props;
  const editor = useEditorRef();
  const readOnly = useReadOnly();
  const { removeNode, image, loading } = useCodeDrawingElement({
    element,
  });

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

  const handleDownload = React.useCallback(() => {
    if (!image) return;
    downloadImage(image, DOWNLOAD_FILENAME);
  }, [image]);

  const code = element.data?.code ?? '';
  const drawingType = element.data?.drawingType ?? 'Mermaid';
  const drawingMode = element.data?.drawingMode ?? 'Both';

  return (
    <PlateElement {...props}>
      <CodeDrawingFloatingToolbar
        element={element}
        onRemove={removeNode}
        onDownload={handleDownload}
        renderPopover={renderPopover}
      >
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
            renderDrawingTypeSelect={renderDrawingTypeSelect}
            renderDrawingModeSelect={renderDrawingModeSelect}
            renderTextarea={renderTextarea}
          />
        </div>
      </CodeDrawingFloatingToolbar>
      {children}
    </PlateElement>
  );
}

export const CodeDrawingElement: React.FC<CodeDrawingElementProps> =
  CodeDrawingElementBase;
