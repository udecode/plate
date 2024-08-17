import type { Path } from 'slate';

import {
  type AncestorOf,
  type GetAboveNodeOptions,
  type TEditor,
  type TElement,
  type TRange,
  type Value,
  getAboveNode,
  getMarks,
  isExpanded,
  isStartPoint,
  removeEditorMark,
} from '@udecode/slate';

import type { WithOverride } from '../../plugin/SlatePlugin';

import { createPlugin } from '../../plugin';
import { resetEditor } from '../../transforms';
import { ParagraphPlugin } from '../paragraph';

const getBlockAbove = <N extends AncestorOf<E>, E extends TEditor = TEditor>(
  editor: E,
  options: GetAboveNodeOptions<E> = {}
) =>
  getAboveNode<N, E>(editor, {
    ...options,
    block: true,
  });

const isSelectionAtBlockStart = <E extends TEditor>(
  editor: E,
  options?: GetAboveNodeOptions<E>
) => {
  const { selection } = editor;

  if (!selection) return false;

  const path = getBlockAbove(editor, options)?.[1];

  if (!path) return false;

  return (
    isStartPoint(editor, selection.focus, path) ||
    (isExpanded(editor.selection) &&
      isStartPoint(editor, selection.anchor, path))
  );
};

const removeSelectionMark = (editor: TEditor) => {
  const marks = getMarks(editor);

  if (!marks) return;

  // remove all marks
  Object.keys(marks).forEach((key) => {
    removeEditorMark(editor, key);
  });
};

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

// TODO react
/** Opinionated extension of slate default behavior. */
export const SlateNextPlugin = createPlugin({
  // handlers: {
  //   onKeyDown: ({ editor, event }: any) => {
  //     // React 16.x needs this event to be persistented due to it's event pooling implementation.
  //     // https://reactjs.org/docs/legacy-event-pooling.html
  //     event.persist();
  //     editor.currentKeyboardEvent = event;
  //   },
  // },
  key: 'slateNext',
  withOverrides: withSlateNext,
})
  .extendApi(({ editor }) => ({
    /** Default block factory. */
    blockFactory: (node?: Partial<TElement>, _path?: Path): TElement => ({
      children: [{ text: '' }],
      type: editor.getType(ParagraphPlugin),
      ...node,
    }),
  }))
  .extendApi(({ api }) => ({
    /** Editor children factory. */
    childrenFactory: (): Value => [api.blockFactory()],
  }))
  .extendApi(({ editor }) => ({
    reset: () => {
      resetEditor(editor);
    },
  }));
