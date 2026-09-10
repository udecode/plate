import {
  getCompiledPlateModelBinding,
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../internal/plugin/compilePlateModel';
import type { PlateRuntime } from '../internal/plugin/plateRuntime';
import {
  getPluginDescriptorMetadata,
  mergePlugins,
} from '../internal/utils/mergePlugins';
import type {
  AnyBasePlugin,
  BasePluginInput,
  NodeComponent,
  NodeComponents,
} from '../lib';
import type { Editor } from '../lib/editor';

type StaticRenderer = Pick<
  AnyBasePlugin,
  'name' | 'render' | 'inject' | 'decorate' | 'targetPlugins'
> & { component?: NodeComponent };

/** Presentation fields projected from authored static kit descriptors. */
export type StaticRenderers = Readonly<{ entries: readonly StaticRenderer[] }>;

/** Reuse a static kit's rendering configuration without installing its plugins. */
export function createStaticRenderers(
  plugins: readonly BasePluginInput[]
): StaticRenderers {
  const entries = plugins.map((input) => {
    const plugin = input as AnyBasePlugin;
    let presentation: StaticRenderer = {
      name: plugin.name,
      render: plugin.render,
      inject: plugin.inject,
      decorate: plugin.decorate,
      targetPlugins: plugin.targetPlugins,
    };
    for (const layer of getPluginDescriptorMetadata(plugin)
      .configurationLayers) {
      if (layer.kind !== 'object') {
        throw new Error(
          `Static render configuration for "${plugin.name}" must be an object.`
        );
      }
      const configuration = layer.value as Partial<StaticRenderer>;
      presentation = mergePlugins(presentation, {
        ...(configuration.component
          ? { component: configuration.component }
          : {}),
        ...(configuration.render ? { render: configuration.render } : {}),
        ...(configuration.inject ? { inject: configuration.inject } : {}),
        ...(configuration.decorate ? { decorate: configuration.decorate } : {}),
        ...(configuration.targetPlugins
          ? { targetPlugins: configuration.targetPlugins }
          : {}),
      });
    }
    return Object.freeze(presentation);
  });
  return Object.freeze({ entries: Object.freeze(entries) });
}

type StaticRenderRuntime = Pick<
  PlateRuntime,
  'components' | 'plugins' | 'pluginCache'
>;

const renderingCache = new WeakMap<
  PlateRuntime,
  WeakMap<StaticRenderers, StaticRenderRuntime>
>();

/** A presentation projection; the editor's installed model and stores remain authoritative. */
export function getStaticRenderRuntime(
  editor: Editor,
  renderers?: StaticRenderers
): StaticRenderRuntime {
  const runtime = getPlateRuntime(editor);
  if (!renderers) return runtime;
  let byConfiguration = renderingCache.get(runtime);
  if (!byConfiguration) {
    byConfiguration = new WeakMap();
    renderingCache.set(runtime, byConfiguration);
  }
  const known = byConfiguration.get(renderers);
  if (known) return known;
  const plugins: Record<string, AnyBasePlugin> = {};
  const components: NodeComponents = {};
  for (const entry of renderers.entries) {
    const installed = getCompiledPlatePlugin(editor, entry.name);
    if (!installed) continue;
    const render = {
      ...entry.render,
      ...(entry.component ? { node: entry.component } : {}),
    };
    const plugin = {
      ...installed,
      render,
      inject: entry.inject,
      decorate: entry.decorate,
      targetPlugins: entry.targetPlugins,
    };
    plugins[entry.name] = plugin;
    const binding = getCompiledPlateModelBinding(editor, installed);
    const type = binding?.elementType ?? binding?.propertyKey;
    if (type && render.node) components[type] = render.node;
  }
  const names = Object.keys(plugins);
  const slotNames = (slot: keyof PlateRuntime['pluginCache']['render']) =>
    names.filter((name) => Reflect.get(plugins[name].render, slot));
  const rendering: StaticRenderRuntime = {
    components,
    plugins,
    pluginCache: {
      ...runtime.pluginCache,
      decorate: names.filter((name) => plugins[name].decorate),
      inject: {
        nodeProps: names.filter((name) => plugins[name].inject.nodeProps),
      },
      node: {
        ...runtime.pluginCache.node,
        decoratedMarks: names.filter((name) => {
          const binding = getCompiledPlateModelBinding(editor, name);
          return (
            binding?.kind === 'mark' &&
            (binding.isDecoration || plugins[name].render.leaf)
          );
        }),
        textMarks: names.filter((name) => {
          const binding = getCompiledPlateModelBinding(editor, name);
          return binding?.kind === 'mark' && !binding.isDecoration;
        }),
        leafProps: names.filter((name) => plugins[name].render.leafProps),
        textProps: names.filter((name) => plugins[name].render.textProps),
      },
      render: {
        aboveEditable: slotNames('aboveEditable'),
        aboveNodes: slotNames('aboveNodes'),
        abovePlite: slotNames('abovePlite'),
        afterContainer: slotNames('afterContainer'),
        afterEditable: slotNames('afterEditable'),
        beforeContainer: slotNames('beforeContainer'),
        beforeEditable: slotNames('beforeEditable'),
        belowNodes: slotNames('belowNodes'),
        belowRootNodes: slotNames('belowRootNodes'),
      },
    },
  };
  byConfiguration.set(renderers, rendering);
  return rendering;
}
