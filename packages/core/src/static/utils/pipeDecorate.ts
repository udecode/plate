import type { NodeEntry, Range } from '@platejs/plite';

import {
  type EditableProps,
  type BasePlateEditor,
  getEditorPlugin,
} from '../../lib';

/**
 * @see {@link Decorate} .
 * Optimization: return undefined if empty list so Editable uses a memo.
 */
export const pipeDecorate = (
  editor: BasePlateEditor,
  decorateProp?:
    | ((ctx: {
        editor: BasePlateEditor;
        entry: NodeEntry;
      }) => Range[] | undefined)
    | null
): EditableProps['decorate'] => {
  if (editor.meta.pluginCache.decorate.length === 0 && !decorateProp) return;

  return (entry: NodeEntry) => {
    let ranges: Range[] = [];

    const addRanges = (newRanges?: Range[]) => {
      if (newRanges?.length) ranges = [...ranges, ...newRanges];
    };

    editor.meta.pluginCache.decorate.forEach((key) => {
      const plugin = editor.getPlugin({ key });
      addRanges(
        plugin.decorate!({
          ...(getEditorPlugin(editor, plugin) as any),
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
