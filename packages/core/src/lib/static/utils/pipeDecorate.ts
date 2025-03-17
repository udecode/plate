import type { NodeEntry, TRange } from '@udecode/slate';

import type { SlateEditor } from '../../editor';
import type { EditableProps } from '../../types/EditableProps';

import { getEditorPlugin } from '../../plugin';

/**
 * @see {@link Decorate} .
 * Optimization: return undefined if empty list so Editable uses a memo.
 */
export const pipeDecorate = (
  editor: SlateEditor,
  decorateProp?:
    | ((ctx: { editor: SlateEditor; entry: NodeEntry }) => TRange[] | undefined)
    | null
): EditableProps['decorate'] => {
  const relevantPlugins = editor.pluginList.filter((plugin) => plugin.decorate);

  if (relevantPlugins.length === 0 && !decorateProp) return;

  return (entry: NodeEntry) => {
    let ranges: TRange[] = [];

    const addRanges = (newRanges?: TRange[]) => {
      if (newRanges?.length) ranges = [...ranges, ...newRanges];
    };

    relevantPlugins.forEach((plugin) => {
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
