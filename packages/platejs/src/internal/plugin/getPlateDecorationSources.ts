import type {
  NodeEntry,
  PliteDecoration,
  PliteDecorationRefresh,
} from '../../facade';
import type { Editor } from '../../lib/editor';
import { createPluginContext } from '../../lib/plugin/createPluginContext.internal';
import { failInvariant } from '../failInvariant';
import { mergePlateRenderedAttributes } from '../mergePlateRenderedAttributes';
import { getCompiledPlatePlugin, getPlateRuntime } from './compilePlateModel';

type PlateDecorationSource = Readonly<{
  id: string;
  observe?: (context: {
    editor?: object;
    refresh: (input: PliteDecorationRefresh) => void;
  }) => () => void;
  read: (context: {
    editor?: object;
    entry: NodeEntry;
  }) => readonly PliteDecoration[];
}>;

export const getPlateDecorationSources = (
  editor: Editor
): readonly PlateDecorationSource[] =>
  getPlateRuntime(editor).pluginCache.decorate.map((name) => {
    const plugin =
      getCompiledPlatePlugin(editor, name) ??
      failInvariant('Expected value to be defined');
    const decorate =
      plugin.decorate ?? failInvariant('Expected value to be defined');
    const contextFor = (view: object = editor) =>
      createPluginContext(view as Editor, plugin);
    const { attributes, observe } = decorate;

    return {
      id: name,
      ...(observe
        ? {
            observe: ({ editor: view, refresh }) =>
              Reflect.apply(observe, undefined, [
                Object.assign(Object.create(contextFor(view)), { refresh }),
              ]),
          }
        : {}),
      read: ({ editor: view, entry }) => {
        const pluginContext = contextFor(view);
        const context = Object.assign(Object.create(pluginContext), {
          entry,
        });
        const decorations: readonly PliteDecoration[] = Reflect.apply(
          decorate.read,
          undefined,
          [context]
        );

        if (!attributes || decorations.length === 0) return decorations;

        return decorations.map((decoration) => ({
          ...decoration,
          attributes: mergePlateRenderedAttributes(
            decoration.attributes,
            typeof attributes === 'function'
              ? attributes({
                  __proto__: pluginContext,
                  decoration,
                  entry,
                } as never)
              : attributes
          ),
        }));
      },
    };
  });
