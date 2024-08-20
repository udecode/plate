import type { TElement, TRange, Value } from '@udecode/slate';
import type { Path } from 'slate';

import {
  isSelectionAtBlockStart,
  removeSelectionMark,
} from '@udecode/slate-utils';

import { type WithOverride, createSlatePlugin } from '../../plugin';
import { resetEditor } from '../../transforms';
import { ParagraphPlugin } from '../paragraph';

export const withSlateNext: WithOverride = ({ editor }) => {
  const { apply, deleteBackward, deleteForward, deleteFragment } = editor;

  editor.prevSelection = null;
  editor.currentKeyboardEvent = null;

  const resetMarks = () => {
    if (isSelectionAtBlockStart(editor)) {
      removeSelectionMark(editor);
    }
  };

  editor.deleteBackward = (unit) => {
    deleteBackward(unit);

    resetMarks();
  };

  editor.deleteForward = (unit) => {
    deleteForward(unit);

    resetMarks();
  };

  editor.deleteFragment = (direction) => {
    deleteFragment(direction);

    resetMarks();
  };

  editor.apply = (operation) => {
    if (operation.type === 'set_selection') {
      const { properties } = operation;

      editor.prevSelection = properties as TRange | null;

      apply(operation);

      editor.currentKeyboardEvent = null;

      return;
    }

    apply(operation);
  };

  return editor;
};

/** Opinionated extension of slate default behavior. */
export const SlateNextPlugin = createSlatePlugin({
  key: 'slateNext',
  withOverrides: withSlateNext,
})
  .extendApi(({ editor }) => ({
    /** Default block fac tory. */
    blockFactory: (node?: Partial<TElement>, _path?: Path): TElement => ({
      children: [{ text: '' }],
      type: editor.getType(ParagraphPlugin),
      ...node,
    }),
  }))
  .extendApi(({ api }) => ({
    /** Editor childr en factory. */
    childrenFactory: (): Value => [api.blockFactory()],
  }))
  .extendApi(({ editor }) => ({
    reset: () => {
      resetEditor(editor);
    },
  }));
