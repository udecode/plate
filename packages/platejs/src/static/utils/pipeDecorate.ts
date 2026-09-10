import type { Descendant, NodeEntry, Range } from '../../facade';
import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import type { PlateRuntime } from '../../internal/plugin/plateRuntime';
import type { Editor, EditableProps } from '../../lib';
import { createPluginContext } from '../../lib/plugin/createPluginContext.internal';
import type { EditableProps as PliteEditableProps } from '../internal/plite-react';

/**
 * @see {@link Decorate} .
 * Optimization: return undefined if empty list so Editable uses a memo.
 */
export function pipeDecorate(
  editor: Editor,
  decorateProp?:
    | ((ctx: { editor: Editor; entry: NodeEntry }) => Range[] | undefined)
    | null,
  editableDecorate?: undefined,
  rendering?: Pick<PlateRuntime, 'plugins' | 'pluginCache'>
): EditableProps['decorate'];
export function pipeDecorate(
  editor: Editor,
  decorateProp:
    | ((ctx: { editor: Editor; entry: NodeEntry }) => Range[] | undefined)
    | null
    | undefined,
  editableDecorate: PliteEditableProps['decorate'],
  rendering?: Pick<PlateRuntime, 'plugins' | 'pluginCache'>
): PliteEditableProps['decorate'];
export function pipeDecorate(
  editor: Editor,
  decorateProp?:
    | ((ctx: { editor: Editor; entry: NodeEntry }) => Range[] | undefined)
    | null,
  editableDecorate?: PliteEditableProps['decorate'],
  rendering?: Pick<PlateRuntime, 'plugins' | 'pluginCache'>
) {
  if (
    (rendering ?? getPlateRuntime(editor)).pluginCache.decorate.length === 0 &&
    !decorateProp &&
    !editableDecorate
  ) {
    return undefined;
  }

  const pluginDecorators = (
    rendering ?? getPlateRuntime(editor)
  ).pluginCache.decorate.flatMap((name) => {
    const plugin =
      rendering?.plugins[name] ?? getCompiledPlatePlugin(editor, name);

    return plugin && typeof plugin.decorate === 'function'
      ? [
          {
            context: createPluginContext(editor, plugin.name),
            decorate: plugin.decorate,
          },
        ]
      : [];
  });

  return (entry: NodeEntry) => {
    let ranges: Array<
      | Range
      | Exclude<
          ReturnType<NonNullable<PliteEditableProps['decorate']>>[number],
          Range
        >
    > = [];

    const addRanges = (
      newRanges?: ReadonlyArray<
        | Range
        | Exclude<
            ReturnType<NonNullable<PliteEditableProps['decorate']>>[number],
            Range
          >
      >
    ) => {
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

    if (editableDecorate) {
      addRanges(editableDecorate([entry[0] as Descendant, entry[1]], editor));
    }

    return ranges;
  };
}
