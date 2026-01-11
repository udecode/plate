import React from 'react';
import { useEditorRef, useReadOnly } from 'platejs/react';

import type { TCodeDrawingElement, CodeDrawingData } from '../../lib';
import { renderCodeDrawing } from '../../lib/utils/renderers';

export const useCodeDrawingElement = ({
  element,
}: {
  element: TCodeDrawingElement;
}) => {
  const editor = useEditorRef();
  const readOnly = useReadOnly();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [image, setImage] = React.useState<string>('');

  const lastRequestRef = React.useRef(0);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Debounced render when code or type changes
  React.useEffect(() => {
    const drawingType = element.data?.drawingType;
    const code = element.data?.code;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for rendering
    timeoutRef.current = setTimeout(async () => {
      lastRequestRef.current += 1;
      const requestId = lastRequestRef.current;

      if (!code || !code.trim() || !drawingType) {
        setImage('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const imageData = await renderCodeDrawing(drawingType as any, code);

        // Only update if this is still the latest request
        if (lastRequestRef.current === requestId) {
          setImage(imageData);
          setError(null);
        }
      } catch (err) {
        if (lastRequestRef.current === requestId) {
          setError(err instanceof Error ? err.message : 'Rendering failed');
          setImage('');
        }
      } finally {
        if (lastRequestRef.current === requestId) {
          setLoading(false);
        }
      }
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [element.data?.code, element.data?.drawingType]);

  // Update node data - following excalidraw pattern with single callback
  const updateNode = React.useCallback(
    (data: Partial<CodeDrawingData>) => {
      if (readOnly) return;

      const path = editor.api.findPath(element);
      if (path) {
        editor.tf.setNodes(
          {
            data: {
              ...element.data,
              ...data,
            },
          },
          { at: path }
        );
      }
    },
    [editor, element, readOnly]
  );


  const removeNode = () => {
    if (readOnly) return;

    const path = editor.api.findPath(element);
    if (path) {
      editor.tf.removeNodes({ at: path });
    }
  };

  return {
    loading,
    error,
    image,
    updateNode,
    removeNode,
  };
};
