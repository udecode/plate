import type { TDescendant, TElement, TRange, Value } from '@udecode/slate';
import type { Path } from 'slate';

import {
  isSelectionAtBlockStart,
  removeSelectionMark,
  replaceNodeChildren,
  toggleMark,
} from '@udecode/slate-utils';
import { type OmitFirst, bindFirst } from '@udecode/utils';

import {
  type ExtendEditor,
  type PluginConfig,
  createTSlatePlugin,
} from '../../plugin';
import { resetEditor, toggleBlock } from '../../transforms';
import { BaseParagraphPlugin } from '../paragraph';

export type SlateNextConfig = PluginConfig<
  'slateNext',
  {},
  {
    create: {
      block: (node?: Partial<TElement>, path?: Path) => TElement;
      value: () => Value;
    };
    reset: () => void;
  },
  {
    toggle: {
      block: OmitFirst<typeof toggleBlock>;
      mark: OmitFirst<typeof toggleMark>;
    };
  }
>;

export const withSlateNext: ExtendEditor<SlateNextConfig> = ({ editor }) => {
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
  extendEditor: withSlateNext,
  key: 'slateNext',
})
  .extendEditorApi(({ editor }) => ({
    create: {
      /** Default block factory. */
      block: (node?: Partial<TElement>, _path?: Path): TElement => ({
        children: [{ text: '' }],
        type: editor.getType(BaseParagraphPlugin),
        ...node,
      }),
    },
  }))
  .extendEditorApi(({ api }) => ({
    create: {
      /** Editor children factory. */
      value: (): Value => [api.create.block()],
    },
  }))
  .extendEditorTransforms(({ editor }) => ({
    reset: () => {
      resetEditor(editor);
    },
    setValue: <V extends Value>(value?: V | string) => {
      let children: TDescendant[] = value as any;

      if (typeof value === 'string') {
        children = editor.api.html.deserialize({
          element: value,
        });
      } else if (!value || value.length === 0) {
        children = editor.api.create.value();
      }

      replaceNodeChildren(editor, {
        at: [],
        nodes: children,
      });
    },
    toggle: {
      block: bindFirst(toggleBlock, editor),
      mark: bindFirst(toggleMark, editor),
    },
  }));
