import type { TElement, TRange, Value } from '@udecode/slate';
import type { Path } from 'slate';

import {
  isSelectionAtBlockStart,
  removeSelectionMark,
  toggleMark,
} from '@udecode/slate-utils';
import { type OmitFirst, bindFirst } from '@udecode/utils';

import {
  type PluginConfig,
  type WithOverride,
  createTSlatePlugin,
} from '../../plugin';
import { resetEditor, toggleBlock } from '../../transforms';
import { ParagraphPlugin } from '../paragraph';

export type SlateNextConfig = PluginConfig<
  'slateNext',
  {},
  {
    blockFactory: (node?: Partial<TElement>, path?: Path) => TElement;
    childrenFactory: () => Value;
    reset: () => void;
  },
  {
    toggle: {
      block: OmitFirst<typeof toggleBlock>;
      mark: OmitFirst<typeof toggleMark>;
    };
  }
>;

export const withSlateNext: WithOverride<SlateNextConfig> = ({ editor }) => {
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
export const SlateNextPlugin = createTSlatePlugin<SlateNextConfig>({
  key: 'slateNext',
  withOverrides: withSlateNext,
})
  .extendEditorApi(({ editor }) => ({
    /** Default block fac tory. */
    blockFactory: (node?: Partial<TElement>, _path?: Path): TElement => ({
      children: [{ text: '' }],
      type: editor.getType(ParagraphPlugin),
      ...node,
    }),
  }))
  .extendEditorApi(({ api }) => ({
    /** Editor childr en factory. */
    childrenFactory: (): Value => [api.blockFactory()],
  }))
  .extendEditorApi(({ editor }) => ({
    reset: () => {
      resetEditor(editor);
    },
  }))
  .extendEditorTransforms(({ editor }) => ({
    toggle: {
      block: bindFirst(toggleBlock, editor),
      mark: bindFirst(toggleMark, editor),
    },
  }));
