import { useEffect } from 'react';

import { getNode } from '@udecode/plate-common';
import { type PlateEditor, useEditorRef } from '@udecode/plate-common/react';
import { toDOMNode } from '@udecode/plate-common/react';

import type { TPlatePlaywrightAdapter } from './types';

const EDITABLE_TO_EDITOR = new WeakMap<HTMLElement, PlateEditor>();

const platePlaywrightAdapter: TPlatePlaywrightAdapter = {
  EDITABLE_TO_EDITOR,
  getNode,
  toDOMNode,
};

export const usePlaywrightAdapter = () => {
  const editor = useEditorRef();

  useEffect(() => {
    window.platePlaywrightAdapter = platePlaywrightAdapter;

    const editable = toDOMNode(editor, editor)!;
    EDITABLE_TO_EDITOR.set(editable, editor);

    return () => {
      EDITABLE_TO_EDITOR.delete(editable);
    };
  }, [editor]);

  return null;
};
