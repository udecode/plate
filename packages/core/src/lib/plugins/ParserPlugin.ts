import { ContentSlice } from '@platejs/plite';
import {
  defineHostCodec,
  hostCodecs,
  type HostCodec,
} from '@platejs/plite-dom';

import { pipeTransformData } from '../../internal/plugin/pipeTransformData';
import { pipeTransformFragment } from '../../internal/plugin/pipeTransformFragment';
import {
  createParserPluginContext,
  pipePreparedInsertDataQuery,
  prepareParserRegistry,
} from '../../internal/plugin/prepareParserRegistry';
import { getCompiledPlateModel } from '../../internal/plugin/compilePlateModel';
import { createBasePlugin } from '../plugin';

const getParserFormats = (parser: {
  format?: null | readonly string[] | string;
}) =>
  Array.isArray(parser.format)
    ? parser.format
    : parser.format
      ? [parser.format]
      : [];

const getParserSchemaTargets = (
  editor: Parameters<typeof getCompiledPlateModel>[0],
  plugin: ReturnType<typeof prepareParserRegistry>['plugins'][number]
) => {
  const declaredTargets = plugin.parser?.schema as
    | HostCodec['schema']
    | undefined;

  if (declaredTargets?.length) {
    if (declaredTargets.some((target) => target.kind !== 'schema')) {
      throw new Error(
        `Plate parser "${plugin.key}" cannot repeat element or property schema targets. Ordinary claims derive from the plugin schema binding.`
      );
    }

    return declaredTargets;
  }

  const model = getCompiledPlateModel(editor);
  const binding = model.byKey[plugin.key];
  const targets: NonNullable<HostCodec['schema']>[number][] = [];

  if (binding?.kind === 'element') {
    targets.push({ kind: 'element', type: binding.type });
  }
  for (const id of [
    ...(binding?.propertyIds ?? []),
    ...(binding?.textPropertyId ? [binding.textPropertyId] : []),
  ]) {
    targets.push({ id, kind: 'property' });
  }
  if (targets.length === 0) {
    throw new Error(
      `Plate parser "${plugin.key}" must own an element or property schema binding, or explicitly claim the whole schema.`
    );
  }

  return Object.freeze(targets);
};

export const ParserPlugin = createBasePlugin({
  key: 'parser',
}).extendExtension(({ editor }) => {
  const registry = prepareParserRegistry(editor);
  const codecs = registry.plugins.flatMap((plugin) => {
    const parser = plugin.parser;

    if (!parser?.deserialize) return [];

    const formats = getParserFormats(parser);

    return formats.map((format) =>
      defineHostCodec({
        format,
        key: `plate:${plugin.key}:${format}:parse`,
        parse({ data, format, source, state }) {
          const parserOptions = {
            data,
            format,
            source,
          };
          const transformedData = pipeTransformData(
            state,
            plugin.pipeline,
            parserOptions
          );
          const fragment = parser.deserialize?.({
            ...parserOptions,
            data: transformedData,
            ...createParserPluginContext(plugin, state),
          });

          if (!fragment?.length) return null;

          const transformedFragment = pipeTransformFragment(
            state,
            plugin.pipeline,
            {
              ...parserOptions,
              data: transformedData,
              fragment,
            }
          );

          return transformedFragment.length > 0
            ? ContentSlice.closed(transformedFragment)
            : null;
        },
        query({ data, format, source, state }) {
          return pipePreparedInsertDataQuery(state, plugin.pipeline, {
            data,
            format,
            source,
          });
        },
        schema: getParserSchemaTargets(editor, plugin),
      } satisfies HostCodec)
    );
  });

  return hostCodecs('plate-parser-host-codecs', codecs);
});
