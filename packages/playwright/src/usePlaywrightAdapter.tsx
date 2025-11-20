import { NodeApi } from 'platejs';
import { type PlateEditor, useEditorRef } from 'platejs/react';
import { useEffect } from 'react';

import type { TPlatePlaywrightAdapter } from './types';

const EDITABLE_TO_EDITOR = new WeakMap<HTMLElement, PlateEditor>();

const platePlaywrightAdapter: TPlatePlaywrightAdapter = {
  EDITABLE_TO_EDITOR,
  getNode: NodeApi.get,
};

export const usePlaywrightAdapter = () => {
  const editor = useEditorRef();

  useEffect(() => {
    window.platePlaywrightAdapter = platePlaywrightAdapter;

    const editable = editor.api.toDOMNode(editor)!;
    EDITABLE_TO_EDITOR.set(editable, editor);

    return () => {
      EDITABLE_TO_EDITOR.delete(editable);
    };
  }, [editor]);

  return null;
};
