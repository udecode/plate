import { getBlockAboveSelection, isBlockTextEmpty } from 'common/queries';
import { DEFAULT_ELEMENT } from 'element/types';
import { Editor, Transforms } from 'slate';

/**
 * On insert break at the start of an empty block in types,
 * replace it with a new paragraph.
 */
export const withBreakEmptyReset = ({
  types,
  typeP = DEFAULT_ELEMENT,
  onUnwrap,
}: {
  types: string[];
  typeP?: string;
  onUnwrap?: any;
}) => <T extends Editor>(editor: T) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    const blockEntry = getBlockAboveSelection(editor);

    if (blockEntry) {
      const [block] = blockEntry;

      if (isBlockTextEmpty(block)) {
        const parent = Editor.above(editor, {
          match: (n) => types.includes(n.type as string),
        });

        if (parent) {
          Transforms.setNodes(editor, { type: typeP });

          onUnwrap?.();

          return;
        }
      }
    }

    insertBreak();
  };

  return editor;
};
