import type { BaseEditor } from '../../lib/editor';
import type { AnyBasePlugin } from '../../lib/plugin/BasePlugin';
import { getPlateRuntime } from './compilePlateModel';

export type InjectedParserPluginProjection = Readonly<
  Pick<AnyBasePlugin, 'inject' | 'key' | 'parser' | 'parsers'>
>;

/** Parser-only views of plugin injection overlays. These are not descriptors. */
export const getInjectedParserPluginProjections = (
  editor: BaseEditor,
  plugin: AnyBasePlugin,
  pluginList: readonly AnyBasePlugin[] = getPlateRuntime(editor).pluginList
): readonly InjectedParserPluginProjection[] => {
  const projections: InjectedParserPluginProjection[] = [];

  [...pluginList].reverse().forEach((source) => {
    const overlays = source.inject.plugins;

    if (!overlays || !Object.hasOwn(overlays, plugin.key)) return;
    const overlay = overlays[plugin.key];

    if (!overlay) return;

    projections.push(
      Object.freeze({
        inject: overlay.inject === undefined ? plugin.inject : overlay.inject,
        key: overlay.key ?? plugin.key,
        parser: overlay.parser === undefined ? plugin.parser : overlay.parser,
        parsers:
          overlay.parsers === undefined ? plugin.parsers : overlay.parsers,
      })
    );
  });

  return Object.freeze(projections);
};
