import type { PlateEditor } from '@udecode/plate-common/react';
import type { Path } from 'slate';

import { getEndPoint, insertNodes, withMerging } from '@udecode/plate-common';

import { AIPlugin } from '../AIPlugin';

export const insertAINodes = (
  editor: PlateEditor,
  text: string,
  {
    isFirst,
    target,
  }: {
    target: Path;
    isFirst?: boolean;
  }
) => {
  const insert = () => {
    insertNodes(
      editor,
      { [AIPlugin.key]: true, text },
      {
        at: getEndPoint(editor, target),
      }
    );
  };

  if (isFirst) {
    insert();
  } else {
    withMerging(editor, insert);
  }
};
