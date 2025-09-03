import type { PlateEditor } from 'platejs/react';

import { MarkdownPlugin } from '@platejs/markdown';
import { BlockSelectionPlugin } from '@platejs/selection/react';

/** Get the document */
export const getBlockDocument = (editor: PlateEditor, prompt: string) => {
  const blockSelection = editor
    .getApi(BlockSelectionPlugin)
    .blockSelection.getNodes({ sort: true });

  const selectionNodes =
    blockSelection.length > 0
      ? blockSelection
      : editor.api.blocks({ mode: 'highest' });

  const commentDocument = editor.getApi(MarkdownPlugin).markdown.serialize({
    value: selectionNodes.map(([node]) => node),
    withBlockId: true,
  });
};
