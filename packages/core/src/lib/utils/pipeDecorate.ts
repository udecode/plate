import type { TNodeEntry } from '@udecode/slate';
import type { TEditableProps } from '@udecode/slate-react';
import type { Range } from 'slate';

import type { PlateEditor } from '../editor';

import { getPluginContext } from '../plugin';

/**
 * @see {@link Decorate} .
 * Optimization: return undefined if empty list so Editable uses a memo.
 */
export const pipeDecorate = (
  editor: PlateEditor,
  decorateProp?:
    | ((ctx: { editor: PlateEditor; entry: TNodeEntry }) => Range[] | undefined)
    | null
): TEditableProps['decorate'] => {
  const relevantPlugins = editor.pluginList.filter((plugin) => plugin.decorate);

  if (relevantPlugins.length === 0 && !decorateProp) return;

  return (entry: TNodeEntry) => {
    let ranges: Range[] = [];

    const addRanges = (newRanges?: Range[]) => {
      if (newRanges?.length) ranges = [...ranges, ...newRanges];
    };

    relevantPlugins.forEach((plugin) => {
      addRanges(
        plugin.decorate!({
          ...getPluginContext(editor, plugin),
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
