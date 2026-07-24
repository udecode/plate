import type { EditorCoreStateView } from '@platejs/plite';
import { toEditorCoreStateView } from '@platejs/plite/internal';

import type { BaseEditor } from '../../lib/editor';
import type { AnyBasePlugin, HtmlParser } from '../../lib/plugin/BasePlugin';
import type {
  HtmlParserOptions,
  HtmlPluginContext,
  HtmlPluginRegistry,
} from '../../lib/plugin/PluginConfig';
import {
  getCompiledPlateModel,
  getCompiledPlatePlugin,
  getCompiledPlatePluginList,
  hasCompiledPlatePluginCandidate,
} from './compilePlateModel';
import { getPluginOptionsStore } from './pluginOptionsStore';

export type PreparedHtmlPluginEntry = Readonly<{
  context: Omit<HtmlPluginContext, 'options' | 'state'>;
  getOptions: () => HtmlPluginContext['options'];
  key: string;
  query?: HtmlParser['query'];
  transformData?: HtmlParser['transformData'];
  transformFragment?: HtmlParser['transformFragment'];
}>;

export type PreparedHtmlRegistry = Readonly<{
  plugins: readonly PreparedHtmlPluginEntry[];
  public: HtmlPluginRegistry;
}>;

const EDITOR_PARSER_REGISTRIES = new WeakMap<
  BaseEditor,
  Readonly<{
    modelRevision: object | undefined;
    pluginList: readonly AnyBasePlugin[];
    registry: PreparedHtmlRegistry;
  }>
>();

const preparePlugin = (
  editor: BaseEditor,
  plugin: AnyBasePlugin,
  registry: HtmlPluginRegistry
): PreparedHtmlPluginEntry => {
  const installed = getCompiledPlatePlugin(editor, plugin.key);

  if (!installed) {
    throw new Error(`Parser plugin "${plugin.key}" is not installed.`);
  }

  return Object.freeze({
    context: Object.freeze({
      registry,
      type: registry.getType(plugin.key),
    }),
    getOptions: () =>
      getPluginOptionsStore(editor, installed.key)?.get('state') ??
      installed.options,
    key: plugin.key,
    ...(plugin.parsers.html?.query ? { query: plugin.parsers.html.query } : {}),
    ...(plugin.parsers.html?.transformData
      ? { transformData: plugin.parsers.html.transformData }
      : {}),
    ...(plugin.parsers.html?.transformFragment
      ? { transformFragment: plugin.parsers.html.transformFragment }
      : {}),
  });
};

/** Snapshot the flat whole-input HTML hooks for one compiled Plate model. */
export const prepareHtmlRegistry = (
  editor: BaseEditor
): PreparedHtmlRegistry => {
  const pluginList = getCompiledPlatePluginList(editor);
  const model = getCompiledPlateModel(editor);
  const isCandidate = hasCompiledPlatePluginCandidate(editor);
  const cached = isCandidate ? undefined : EDITOR_PARSER_REGISTRIES.get(editor);

  if (
    cached?.pluginList === pluginList &&
    cached.modelRevision === model.revision
  ) {
    return cached.registry;
  }

  const typesByKey = new Map(
    pluginList.map((plugin) => [plugin.key, plugin.type] as const)
  );
  const keysByType = new Map(
    pluginList.map((plugin) => [plugin.type, plugin.key] as const)
  );
  const publicRegistry = Object.freeze({
    getKey: (type: string) => keysByType.get(type),
    getType: (key: string) => typesByKey.get(key) ?? key,
    has: (key: string) => typesByKey.has(key),
  });
  const prepared = Object.freeze({
    plugins: Object.freeze(
      pluginList.map((plugin) => preparePlugin(editor, plugin, publicRegistry))
    ),
    public: publicRegistry,
  });

  if (!isCandidate) {
    EDITOR_PARSER_REGISTRIES.set(
      editor,
      Object.freeze({
        modelRevision: model.revision,
        pluginList,
        registry: prepared,
      })
    );
  }

  return prepared;
};

/** Prepare one installed plugin's flat whole-input HTML hooks. */
export const prepareHtmlPlugin = (
  editor: BaseEditor,
  plugin: AnyBasePlugin,
  registry = prepareHtmlRegistry(editor)
): PreparedHtmlPluginEntry => {
  const resolved = getCompiledPlatePlugin(editor, plugin.key);

  if (!resolved || !registry.public.has(resolved.key)) {
    throw new Error(`Parser plugin "${plugin.key}" is not installed.`);
  }

  return preparePlugin(editor, resolved, registry.public);
};

export const createHtmlPluginContext = (
  plugin: PreparedHtmlPluginEntry,
  state: EditorCoreStateView
): HtmlPluginContext =>
  Object.freeze({
    ...plugin.context,
    options: Object.freeze({ ...plugin.getOptions() }),
    state: toEditorCoreStateView(state),
  });

export const pipePreparedInsertDataQuery = (
  state: EditorCoreStateView,
  plugins: readonly PreparedHtmlPluginEntry[],
  options: HtmlParserOptions
) =>
  plugins.every((plugin) => {
    const { query } = plugin;

    return (
      !query ||
      query({
        ...options,
        ...createHtmlPluginContext(plugin, state),
      })
    );
  });
