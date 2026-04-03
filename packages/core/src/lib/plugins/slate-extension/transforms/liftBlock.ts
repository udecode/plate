import { type EditorAboveOptions, combineMatchOptions } from '@platejs/slate';

import type { SlateEditor } from '../../../editor';

export type LiftBlockOptions = {
  at?: EditorAboveOptions['at'];
  match?: EditorAboveOptions['match'];
};

/**
 * Lift the current block out of the nearest matching ancestor container.
 *
 * This unwraps only the current block and splits the ancestor around it when
 * needed, so one keypress changes one structural level instead of exploding the
 * whole container.
 */
export const liftBlock = (
  editor: SlateEditor,
  { at, match }: LiftBlockOptions = {}
) => {
  const block = editor.api.block({ at });

  if (!block || !match) return;

  const [, blockPath] = block;
  const ancestor = editor.api.above({
    at: blockPath,
    match: combineMatchOptions(
      editor,
      (_node, path) => path.length < blockPath.length,
      { match }
    ),
  });

  if (!ancestor) return;

  editor.tf.unwrapNodes({
    at: blockPath,
    match,
    split: true,
  });

  return true;
};
