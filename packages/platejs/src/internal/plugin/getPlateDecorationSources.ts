import {
  type NodeEntry,
  type Decoration,
  type DecorationRefresh,
  withDocumentViewRead,
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
    refresh: (input: DecorationRefresh) => void;
  }) => () => void;
  read: (context: {
    editor?: object;
    entry: NodeEntry;
  }) => readonly Decoration[];
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
    // A read runs once per node. Its context resolves the plugin context's
    // accessors once per view and published model instead of through the
    // context proxy on every property read.
    let readBase:
      | { context: object; runtime: object; view: object }
      | undefined;
    const readContextFor = (view: object) => {
      const runtime = getPlateRuntime(view);

      if (readBase?.view === view && readBase.runtime === runtime) {
        return readBase.context;
      }

      const pluginContext = contextFor(view);
      // Another editor may not install this plugin, so its context keeps
      // resolving lazily through the proxy.
      const context: object =
        runtime === getPlateRuntime(editor)
          ? Object.fromEntries(
              Reflect.ownKeys(pluginContext).map((key) => [
                key,
                Reflect.get(pluginContext, key),
              ])
            )
          : pluginContext;

      readBase = { context, runtime, view };

      return context;
    };
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
      read: ({ editor: view = editor, entry }) => {
        const context = Object.create(readContextFor(view));

        context.entry = entry;

        // Attribute callbacks read the same document as `read`, so they run
        // under the same guard.
        return withDocumentViewRead(view as Editor, () => {
          const decorations: readonly Decoration[] = Reflect.apply(
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
                    __proto__: readContextFor(view),
                    decoration,
                    entry,
                  } as never)
                : attributes
            ),
          }));
        });
      },
    };
  });
