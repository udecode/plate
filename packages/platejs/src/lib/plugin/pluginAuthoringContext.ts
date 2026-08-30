import type {
  DefinePluginCodecs,
  PluginCodecMapDeclaration,
} from './BasePlugin';
import type {
  AnyBasePluginDefinition,
  PluginReference,
} from './PluginDefinition';

export const pluginCodecMapDeclaration = Symbol('plate.pluginCodecMap');

export function createDefinePluginCodecs<
  C extends AnyBasePluginDefinition,
>(): DefinePluginCodecs<C> {
  function defineCodecs(
    ...args:
      | readonly [codecs: Readonly<Record<string, unknown>>]
      | readonly [
          target: PluginReference,
          codecs: Readonly<Record<string, unknown>>,
        ]
  ): PluginCodecMapDeclaration {
    const target = args.length === 2 ? args[0] : undefined;
    const codecs = args.length === 2 ? args[1] : args[0];
    const html = codecs['text/html'];
    const withTarget = (rule: unknown) =>
      typeof rule === 'object' && rule !== null ? { ...rule, target } : rule;
    const withNodeCodecTarget = (declaration: unknown) => {
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
        ? codecs
        : Object.fromEntries(
            Object.entries(codecs).map(([format, codec]) => [
              format,
              format === 'text/html'
                ? Array.isArray(html)
                  ? html.map(withTarget)
                  : withTarget(html)
                : withNodeCodecTarget(codec),
            ])
          );
    const branded: PluginCodecMapDeclaration = {
      ...declaration,
      [pluginCodecMapDeclaration]: true,
    };

    return branded;
  }

  return defineCodecs;
}
