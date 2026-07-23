import type { NodeEntry, Range } from '@platejs/plite';

import {
  type BaseEditor,
  type EditableProps,
  getEditorPlugin,
} from '../../lib';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';

/**
 * @see {@link Decorate} .
 * Optimization: return undefined if empty list so Editable uses a memo.
 */
export const pipeDecorate = (
  editor: BaseEditor,
  decorateProp?:
    | ((ctx: { editor: BaseEditor; entry: NodeEntry }) => Range[] | undefined)
    | null
): EditableProps['decorate'] => {
  if (
    getPlateRuntime(editor).pluginCache.decorate.length === 0 &&
    !decorateProp
  )
    return;

  return (entry: NodeEntry) => {
    let ranges: Range[] = [];

    const addRanges = (newRanges?: Range[]) => {
      if (newRanges?.length) ranges = [...ranges, ...newRanges];
    };

    getPlateRuntime(editor).pluginCache.decorate.forEach((key) => {
      const plugin = editor.getPlugin({ key });
      addRanges(
        plugin.decorate!({
          ...getEditorPlugin(editor, plugin),
          entry,
        })
      );
    });

    if (decorateProp) {
      addRanges(
        decorateProp({
          editor,
          entry,
        })
      );
    }

    return ranges;
  };
};
