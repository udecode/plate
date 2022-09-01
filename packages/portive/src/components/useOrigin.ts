import { PlateEditor, useEditorRef } from '@udecode/plate-core';
import { PortiveEditor } from 'slate-portive';

/**
 * Takes an `element` (which it only needs for its `id`) and returns the
 * origin from it.
 */
export function useOrigin(originKey?: string) {
  const editor = useEditorRef() as PlateEditor & PortiveEditor;
  const originFromStore = editor.portive.useStore((state) =>
    originKey ? state.origins[originKey] : undefined
  );

  if (originKey?.includes('/')) {
    return {
      status: 'complete',
      url: originKey,
    };
  }

  return originFromStore;
}
