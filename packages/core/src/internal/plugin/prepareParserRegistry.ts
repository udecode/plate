import type { EditorCoreStateView } from '@platejs/plite';
import { toEditorCoreStateView } from '@platejs/plite/internal';

import type { BaseEditor } from '../../lib/editor';
import type {
  AnyBasePlugin,
  HtmlDeserializer,
  Parser,
} from '../../lib/plugin/BasePlugin';
import type {
  ParserOptions,
  ParserPluginContext,
  ParserPluginRegistry,
} from '../../lib/plugin/PluginConfig';
import { getPluginNodeClass } from '../../lib/utils/pluginNodeClass';
import {
  getCompiledPlateModel,
  getCompiledPlatePlugin,
  getCompiledPlatePluginList,
  hasCompiledPlatePluginCandidate,
} from './compilePlateModel';
import {
  getInjectedParserPluginProjections,
  type InjectedParserPluginProjection,
} from './getInjectedParserPluginProjections';
import { getPluginOptionsStore } from './pluginOptionsStore';

export type PreparedParserPluginEntry = Readonly<{
  context: Omit<ParserPluginContext, 'options' | 'state'>;
  defaultNodeValue?: unknown;
  getOptions: () => ParserPluginContext['options'];
  html?: Readonly<HtmlDeserializer>;
  isElement: boolean;
  isLeaf: boolean;
  key: string;
  parser?: Readonly<Parser>;
}>;

export type PreparedParserPlugin = PreparedParserPluginEntry &
  Readonly<{
    htmlInjections: readonly PreparedParserPluginEntry[];
    pipeline: readonly PreparedParserPluginEntry[];
  }>;

export type PreparedParserRegistry = Readonly<{
  plugins: readonly PreparedParserPlugin[];
  public: ParserPluginRegistry;
}>;

export type PreparedParserRuntime = Readonly<{
  registry: PreparedParserRegistry;
  state: EditorCoreStateView;
}>;

const PREPARED_PARSER_REGISTRIES = new WeakMap<
  ParserPluginRegistry,
  PreparedParserRegistry
>();
const EDITOR_PARSER_REGISTRIES = new WeakMap<
  BaseEditor,
  Readonly<{
    modelRevision: object | undefined;
    pluginList: readonly AnyBasePlugin[];
    registry: PreparedParserRegistry;
  }>
>();

const freezeHtmlDeserializer = (
  deserializer: HtmlDeserializer | null | undefined,
  key: string
) => {
  const rules = deserializer?.rules ?? [];
  const className = getPluginNodeClass(key);
  const hasStaticRule = rules.some((rule) =>
    rule.validClassName?.includes(className)
  );
  const staticRules = hasStaticRule
    ? rules
    : [{ validClassName: className, validNodeName: '*' }, ...rules];
  const freezeRuleValue = (value: readonly string[] | string) =>
    typeof value === 'string' ? value : Object.freeze([...value]);
  const freezeOptionalRuleValue = (
    value: readonly string[] | string | undefined
  ) =>
    value === undefined || typeof value === 'string'
      ? value
      : Object.freeze([...value]);

  return Object.freeze({
    ...deserializer,
    ...(deserializer?.attributeNames
      ? { attributeNames: Object.freeze([...deserializer.attributeNames]) }
      : {}),
    rules: Object.freeze(
      staticRules.map((rule) =>
        Object.freeze({
          ...rule,
          ...(rule.validAttribute && typeof rule.validAttribute === 'object'
            ? {
                validAttribute: Object.freeze(
                  Object.fromEntries(
                    Object.entries(rule.validAttribute).map(([name, value]) => [
                      name,
                      freezeRuleValue(value),
                    ])
                  )
                ),
              }
            : {}),
          ...(rule.validClassName
            ? { validClassName: rule.validClassName }
            : {}),
          ...(rule.validNodeName
            ? { validNodeName: freezeRuleValue(rule.validNodeName) }
            : {}),
          ...(rule.validStyle
            ? {
                validStyle: Object.freeze(
                  Object.fromEntries(
                    Object.entries(rule.validStyle).map(([name, value]) => [
                      name,
                      freezeOptionalRuleValue(value),
                    ])
                  )
                ),
              }
            : {}),
        })
      )
    ),
  });
};

const freezeParser = (parser: AnyBasePlugin['parser']) => {
  if (!parser) return;

  return Object.freeze({
    ...(parser.deserialize ? { deserialize: parser.deserialize } : {}),
    ...(Array.isArray(parser.format)
      ? { format: Object.freeze([...parser.format]) }
      : parser.format
        ? { format: parser.format }
        : {}),
    ...(parser.owns ? { owns: Object.freeze([...parser.owns]) } : {}),
    ...(parser.query ? { query: parser.query } : {}),
    ...(parser.transformData ? { transformData: parser.transformData } : {}),
    ...(parser.transformFragment
      ? { transformFragment: parser.transformFragment }
      : {}),
  }) satisfies Readonly<Parser>;
};

const preparePluginBase = (
  editor: BaseEditor,
  plugin: AnyBasePlugin | InjectedParserPluginProjection,
  registry: ParserPluginRegistry
): PreparedParserPluginEntry => {
  const installed = getCompiledPlatePlugin(editor, plugin.key);

  if (!installed) {
    throw new Error(`Parser plugin "${plugin.key}" is not installed.`);
  }
  const binding = getCompiledPlateModel(editor).byKey[plugin.key];

  return Object.freeze({
    context: Object.freeze({
      registry,
      type: registry.getType(plugin.key),
    }),
    getOptions: () =>
      getPluginOptionsStore(editor, installed.key)?.get('state') ??
      installed.options,
    ...(plugin.inject.nodeProps?.defaultNodeValue === undefined
      ? {}
      : { defaultNodeValue: plugin.inject.nodeProps.defaultNodeValue }),
    ...(plugin.parsers.html?.deserializer
      ? {
          html: freezeHtmlDeserializer(
            plugin.parsers.html.deserializer,
            plugin.key
          ),
        }
      : { html: freezeHtmlDeserializer(undefined, plugin.key) }),
    isElement: binding?.kind === 'element',
    isLeaf: binding?.kind === 'mark',
    key: plugin.key,
    ...(plugin.parser ? { parser: freezeParser(plugin.parser) } : {}),
  });
};

/** Snapshot the parser-facing Plate configuration without retaining an editor. */
export const prepareParserRegistry = (
  editor: BaseEditor
): PreparedParserRegistry => {
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

  const plugins = [...pluginList];
  const typesByKey = new Map(
    plugins.map((plugin) => [plugin.key, plugin.type] as const)
  );
  const keysByType = new Map(
    plugins.map((plugin) => [plugin.type, plugin.key] as const)
  );
  const publicRegistry = Object.freeze({
    getKey: (type: string) => keysByType.get(type),
    getType: (key: string) => typesByKey.get(key) ?? key,
    has: (key: string) => typesByKey.has(key),
  });
  const preparedPlugins = plugins.map((plugin) => {
    const injectedPlugins = getInjectedParserPluginProjections(
      editor,
      plugin,
      pluginList
    );
    const base = preparePluginBase(editor, plugin, publicRegistry);
    const htmlInjections = injectedPlugins.map((candidate) =>
      preparePluginBase(editor, candidate, publicRegistry)
    );
    const pipeline = [base, ...htmlInjections];

    return Object.freeze({
      ...base,
      htmlInjections: Object.freeze(htmlInjections),
      pipeline: Object.freeze(pipeline),
    });
  });
  const prepared = Object.freeze({
    plugins: Object.freeze(preparedPlugins),
    public: publicRegistry,
  });

  PREPARED_PARSER_REGISTRIES.set(publicRegistry, prepared);
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

/** Prepare one installed plugin against an immutable registry. */
export const prepareParserPlugin = (
  editor: BaseEditor,
  plugin: AnyBasePlugin,
  registry = prepareParserRegistry(editor)
): PreparedParserPlugin => {
  const resolved = getCompiledPlatePlugin(editor, plugin.key);

  if (!resolved || !registry.public.has(resolved.key)) {
    throw new Error(`Parser plugin "${plugin.key}" is not installed.`);
  }
  const publicRegistry = registry.public;
  const injectedPlugins = getInjectedParserPluginProjections(
    editor,
    resolved,
    getCompiledPlatePluginList(editor)
  );
  const base = preparePluginBase(editor, resolved, publicRegistry);
  const htmlInjections = injectedPlugins.map((candidate) =>
    preparePluginBase(editor, candidate, publicRegistry)
  );

  return Object.freeze({
    ...base,
    htmlInjections: Object.freeze(htmlInjections),
    pipeline: Object.freeze([base, ...htmlInjections]),
  });
};

export const getPreparedParserRegistry = (
  registry: ParserPluginRegistry
): PreparedParserRegistry => {
  const prepared = PREPARED_PARSER_REGISTRIES.get(registry);

  if (!prepared) {
    throw new Error('Parser registry is not attached to a prepared runtime.');
  }

  return prepared;
};

export const createParserPluginContext = (
  plugin: PreparedParserPluginEntry,
  state: EditorCoreStateView
): ParserPluginContext =>
  Object.freeze({
    ...plugin.context,
    options: Object.freeze({ ...plugin.getOptions() }),
    state: toEditorCoreStateView(state),
  });

export const pipePreparedInsertDataQuery = (
  state: EditorCoreStateView,
  plugins: readonly PreparedParserPluginEntry[],
  options: ParserOptions
) =>
  plugins.every((plugin) => {
    const query = plugin.parser?.query;

    return (
      !query ||
      query({
        ...options,
        ...createParserPluginContext(plugin, state),
      })
    );
  });

export const createPreparedParserRuntime = (
  context: ParserPluginContext
): PreparedParserRuntime =>
  Object.freeze({
    registry: getPreparedParserRegistry(context.registry),
    state: toEditorCoreStateView(context.state),
  });

/** Run a public parser helper against one immutable editor snapshot. */
export const withPreparedParserRuntime = <T>(
  editor: BaseEditor,
  run: (runtime: PreparedParserRuntime) => T
): T => {
  const registry = prepareParserRegistry(editor);

  return editor.read((state) =>
    run(
      Object.freeze({
        registry,
        state: toEditorCoreStateView(state),
      })
    )
  );
};
