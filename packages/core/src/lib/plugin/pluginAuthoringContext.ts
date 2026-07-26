import type {
  DefineEditorExtension,
  DefinePluginCodecs,
  PluginCodecMapDeclaration,
} from './BasePlugin';
import type { AnyPluginConfig, PluginReference } from './PluginConfig';

export const pluginCodecMapDeclaration = Symbol('plate.pluginCodecMap');

export function createDefineEditorExtension<
  C extends AnyPluginConfig,
>(): DefineEditorExtension<C> {
  const defineEditorExtension = <
    const TExtension extends object | readonly object[],
  >(
    extension: TExtension
  ) => extension;

  return defineEditorExtension;
}

export function createDefinePluginCodecs<
  C extends AnyPluginConfig,
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
    const declaration =
      target === undefined
        ? codecs
        : {
            ...codecs,
            'text/html': Array.isArray(html)
              ? html.map(withTarget)
              : withTarget(html),
          };
    const branded: PluginCodecMapDeclaration = {
      ...declaration,
      [pluginCodecMapDeclaration]: true,
    };

    return branded;
  }

  return defineCodecs;
}
