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
    const { html } = formats;
    const withTarget = (rule: unknown) =>
      typeof rule === 'object' && rule !== null ? { ...rule, target } : rule;
    const withNodeMappingTarget = (declaration: unknown) => {
      if (target === undefined) return declaration;
      if (Array.isArray(declaration)) {
        return declaration.every(
          (item) =>
            typeof item === 'object' &&
            item !== null &&
            'kind' in item &&
            item.kind === 'node'
        )
          ? declaration.map(withTarget)
          : declaration;
      }
      if (
        typeof declaration !== 'object' ||
        declaration === null ||
        !('kind' in declaration) ||
        declaration.kind !== 'node'
      ) {
        return declaration;
      }

      return withTarget(declaration);
    };
    const declaration =
      target === undefined
        ? formats
        : Object.fromEntries(
            Object.entries(formats).map(([format, mapping]) => [
              format,
              format === 'html'
                ? Array.isArray(html)
                  ? html.map(withTarget)
                  : withTarget(html)
                : withNodeMappingTarget(mapping),
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
