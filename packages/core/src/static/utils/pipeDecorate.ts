import type { NodeEntry, Range } from '@platejs/plite';

import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import type { BaseEditor, EditableProps } from '../../lib';
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
  ) {
    return undefined;
  }

  const pluginDecorators = getPlateRuntime(editor).pluginCache.decorate.flatMap(
    (name) => {
      const plugin = getCompiledPlatePlugin(editor, name);

      return plugin && typeof plugin.decorate === 'function'
        ? [
            {
              context: createPluginContext(editor, plugin),
              decorate: plugin.decorate,
            },
          ]
        : [];
    }
  );

  return (entry: NodeEntry) => {
    let ranges: Range[] = [];

    const addRanges = (newRanges?: Range[]) => {
      if (newRanges?.length) ranges = [...ranges, ...newRanges];
    };

    pluginDecorators.forEach(({ context, decorate }) => {
      const nextRanges: unknown = Reflect.apply(decorate, undefined, [
        Object.assign(Object.create(context), { entry }),
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
