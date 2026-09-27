import type {
  DefinePluginFormats,
  PluginFormatMapDeclaration,
} from './BasePlugin';
import type {
  AnyBasePluginDefinition,
  PluginReference,
} from './PluginDefinition';

export const pluginFormatMapDeclaration = Symbol('plate.pluginFormatMap');

export function createDefinePluginFormats<
  C extends AnyBasePluginDefinition,
>(): DefinePluginFormats<C> {
  function defineFormats(
    ...args:
      | readonly [formats: Readonly<Record<string, unknown>>]
      | readonly [
          target: PluginReference,
          formats: Readonly<Record<string, unknown>>,
        ]
  ): PluginFormatMapDeclaration {
    const target = args.length === 2 ? args[0] : undefined;
    const formats = args.length === 2 ? args[1] : args[0];
    const withTarget = (rule: unknown) =>
      typeof rule === 'object' && rule !== null ? { ...rule, target } : rule;
    const declaration =
      target === undefined
        ? formats
        : Object.fromEntries(
            Object.entries(formats).map(([format, mapping]) => [
              format,
              Array.isArray(mapping)
                ? mapping.map(withTarget)
                : withTarget(mapping),
            ])
          );
    const branded: PluginFormatMapDeclaration = {
      ...declaration,
      [pluginFormatMapDeclaration]: true,
    };

    return branded;
  }

  return defineFormats;
}
