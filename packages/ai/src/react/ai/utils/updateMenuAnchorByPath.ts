import type { PlateEditor } from '@udecode/plate-core/react';
import type { Path } from 'slate';

import { getAncestorNode } from '@udecode/plate-common';
import { toDOMNode } from '@udecode/plate-common/react';

import { AIPlugin } from '../AIPlugin';

export const updateMenuAnchorByPath = (editor: PlateEditor, path: Path) => {
  // FIX: replace make the anchor disappear
  editor.setOptions(AIPlugin, {
    openEditorId: editor.id,
  });

  const nodeEntry = getAncestorNode(editor, path);

  if (nodeEntry) {
    setTimeout(() => {
      const dom = toDOMNode(editor, nodeEntry[0]);

      if (dom) {
        editor.getApi(AIPlugin).ai.setAnchorElement(dom);
        editor.setOption(AIPlugin, 'curNodeEntry', nodeEntry);
      }
    }, 0);
  }
};
