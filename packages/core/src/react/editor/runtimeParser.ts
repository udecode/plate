import type { Descendant, Value } from '@platejs/plite';

import { mergePlugins } from '../../internal/utils/mergePlugins';
import type {
  PlateRuntimeEditor,
  PlateRuntimeParser,
  PlateRuntimeParserOptions,
  PlateRuntimePlugin,
  PlateRuntimeTransforms,
  RuntimePluginContext,
} from './createPlateRuntimeEditor';

type RuntimePluginContextFactory = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => RuntimePluginContext;

type RuntimeTransformsGetter = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
) => PlateRuntimeTransforms<V, TExtensions>;

type RuntimeParserDependencies = {
  createPluginContext: RuntimePluginContextFactory;
  readRuntimeTransforms: RuntimeTransformsGetter;
};

const getRuntimeParserMimeTypes = (parser: PlateRuntimeParser): string[] => {
  if (parser.mimeTypes) return parser.mimeTypes;

  const formats = Array.isArray(parser.format)
    ? parser.format
    : parser.format
      ? [parser.format]
      : [];

  return formats.map((format) =>
    format.includes('/') ? format : `text/${format}`
  );
};

const getRuntimeInjectedParserPlugins = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
): PlateRuntimePlugin[] => {
  const injectedPlugins: PlateRuntimePlugin[] = [];

  [...editor.meta.pluginList].reverse().forEach((candidate) => {
    const injectedPlugin = candidate.inject?.plugins?.[plugin.key];

    if (injectedPlugin) {
      injectedPlugins.push({
        ...plugin,
        ...injectedPlugin,
        key: injectedPlugin.key ?? plugin.key,
      } as PlateRuntimePlugin);
    }
  });

  return [plugin, ...injectedPlugins];
};

const createRuntimeParserContext = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin,
  options: PlateRuntimeParserOptions,
  createPluginContext: RuntimePluginContextFactory
) => ({
  ...createPluginContext(editor, plugin),
  ...options,
});

const shouldRuntimeInsertParserData = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugins: PlateRuntimePlugin[],
  options: PlateRuntimeParserOptions,
  createPluginContext: RuntimePluginContextFactory
) =>
  plugins.every((plugin) => {
    const query = plugin.parser?.query;

    return (
      !query ||
      query(
        createRuntimeParserContext(editor, plugin, options, createPluginContext)
      )
    );
  });

const transformRuntimeParserData = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugins: PlateRuntimePlugin[],
  options: PlateRuntimeParserOptions,
  createPluginContext: RuntimePluginContextFactory
) => {
  let data = options.data;

  plugins.forEach((plugin) => {
    const transformData = plugin.parser?.transformData;

    if (!transformData) return;

    data = transformData(
      createRuntimeParserContext(
        editor,
        plugin,
        { ...options, data },
        createPluginContext
      )
    );
  });

  return data;
};

const transformRuntimeParserFragment = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugins: PlateRuntimePlugin[],
  options: PlateRuntimeParserOptions & { fragment: Descendant[] },
  createPluginContext: RuntimePluginContextFactory
) => {
  let fragment = options.fragment;

  plugins.forEach((plugin) => {
    const transformFragment = plugin.parser?.transformFragment;

    if (!transformFragment) return;

    fragment = transformFragment({
      ...createRuntimeParserContext(
        editor,
        plugin,
        options,
        createPluginContext
      ),
      fragment,
    });
  });

  return fragment;
};

const insertRuntimeParserFragment = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugins: PlateRuntimePlugin[],
  options: PlateRuntimeParserOptions & { fragment: Descendant[] },
  createPluginContext: RuntimePluginContextFactory
) => {
  editor.update((tx) => {
    const fragment = options.fragment as Parameters<
      typeof tx.fragment.insert
    >[0];

    plugins.some(
      (plugin) =>
        plugin.parser?.preInsert?.({
          ...createRuntimeParserContext(
            editor,
            plugin,
            options,
            createPluginContext
          ),
          fragment: options.fragment,
        }) === true
    );

    tx.fragment.insert(fragment);
  });
};

const insertRuntimeParserData = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  dataTransfer: DataTransfer,
  createPluginContext: RuntimePluginContextFactory
) =>
  [...editor.meta.pluginList].reverse().some((plugin) => {
    const parser = plugin.parser;

    if (!parser) return false;

    const mimeTypes = getRuntimeParserMimeTypes(parser);

    if (mimeTypes.length === 0) return false;

    const injectedPlugins = getRuntimeInjectedParserPlugins(editor, plugin);

    for (const mimeType of mimeTypes) {
      let data = dataTransfer.getData(mimeType);

      if (
        (mimeType !== 'Files' && !data) ||
        (mimeType === 'Files' && dataTransfer.files.length === 0)
      ) {
        continue;
      }

      const parserOptions = { data, dataTransfer, mimeType };

      if (
        !shouldRuntimeInsertParserData(
          editor,
          injectedPlugins,
          parserOptions,
          createPluginContext
        )
      ) {
        continue;
      }

      data = transformRuntimeParserData(
        editor,
        injectedPlugins,
        parserOptions,
        createPluginContext
      );

      let fragment = parser.deserialize?.(
        createRuntimeParserContext(
          editor,
          plugin,
          {
            ...parserOptions,
            data,
          },
          createPluginContext
        )
      );

      if (!fragment?.length) continue;

      fragment = transformRuntimeParserFragment(
        editor,
        injectedPlugins,
        {
          ...parserOptions,
          data,
          fragment,
        },
        createPluginContext
      );

      if (fragment.length === 0) continue;

      insertRuntimeParserFragment(
        editor,
        injectedPlugins,
        {
          ...parserOptions,
          data,
          fragment,
        },
        createPluginContext
      );

      return true;
    }

    return false;
  });

export const installRuntimeParser = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin,
  { createPluginContext, readRuntimeTransforms }: RuntimeParserDependencies
) => {
  if (!plugin.runtimeParser) return;

  const previousInsertData = readRuntimeTransforms(editor).insertData;

  plugin.runtimeTransforms = mergePlugins(plugin.runtimeTransforms ?? {}, {
    insertData: (dataTransfer: DataTransfer) => {
      if (insertRuntimeParserData(editor, dataTransfer, createPluginContext)) {
        return true;
      }

      return previousInsertData(dataTransfer);
    },
  }) as PlateRuntimeTransforms;
};
