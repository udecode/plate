import { ContentSlice } from '@platejs/plite';
import { hostCodecs, type HostCodec } from '@platejs/plite-dom';

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

const getParserOwnershipTargets = (
  editor: Parameters<typeof getCompiledPlateModel>[0],
  plugin: ReturnType<typeof prepareParserRegistry>['plugins'][number]
) => {
  const declaredTargets = plugin.parser?.owns;

  if (declaredTargets?.length) return declaredTargets;

  const model = getCompiledPlateModel(editor);
  const binding = model.byKey[plugin.key];
  const targets: NonNullable<HostCodec['owns']>[number][] = [];

  if (binding?.kind === 'element') {
    targets.push({ kind: 'element', type: binding.type });
  }
  targets.push(...(binding?.properties ?? []));
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

    return formats.map(
      (format) =>
        ({
          format,
          key: `plate:${plugin.key}:${format}:parse`,
          owns: getParserOwnershipTargets(editor, plugin),
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
        }) satisfies HostCodec
    );
  });

  return hostCodecs('plate-parser-host-codecs', codecs);
});
