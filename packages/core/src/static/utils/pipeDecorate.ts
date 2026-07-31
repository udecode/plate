import type { NodeEntry, Range } from '@platejs/plite';

import type { BaseEditor, EditableProps } from '../../lib';
import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { createPluginContext } from '../../lib/plugin/createPluginContext.internal';

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

    getPlateRuntime(editor).pluginCache.decorate.forEach((pluginName) => {
      const plugin = getCompiledPlatePlugin(editor, pluginName)!;
      if (typeof plugin.decorate !== 'function') return;
      const nextRanges: unknown = Reflect.apply(plugin.decorate, undefined, [
        {
          ...createPluginContext(editor, plugin),
          entry,
        },
      ]);

      if (Array.isArray(nextRanges)) addRanges(nextRanges);
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
