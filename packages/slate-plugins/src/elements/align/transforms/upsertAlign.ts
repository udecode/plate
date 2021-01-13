import { Editor } from 'slate';
import { unwrapNodes } from '../../../common/transforms/unwrapNodes';
import { wrapNodes } from '../../../common/transforms/wrapNodes';
import {
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_JUSTIFY,
  ELEMENT_ALIGN_LEFT,
  ELEMENT_ALIGN_RIGHT,
} from '../defaults';

export const upsertAlign = (
  editor: Editor,
  {
    type,
    unwrapTypes = [
      ELEMENT_ALIGN_LEFT,
      ELEMENT_ALIGN_CENTER,
      ELEMENT_ALIGN_RIGHT,
      ELEMENT_ALIGN_JUSTIFY,
    ],
  }: { type?: string; unwrapTypes?: string[] }
) => {
  if (!editor.selection) return;

  unwrapNodes(editor, { match: { type: unwrapTypes } });

  if (!type) return;

  wrapNodes(
    editor,
    {
      type,
      children: [],
    },
    { mode: 'lowest' }
  );
};
