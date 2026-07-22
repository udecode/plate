import type {
  EditorExtension,
  EditorExtensionInput,
  EditorExtensionTypeProvider,
  EditorInstalledApiGroups,
  EditorInstalledStateGroups,
  EditorInstalledTxGroups,
  Value,
} from '../interfaces/editor';
import type {
  EditorSchemaExtensionProvider,
  SchemaExtensionsOf,
} from '../interfaces/schema';

export const EDITOR_EXTENSION_SLOT_INPUT = Symbol('plite.extension-slot');

type ExtensionTuple<TInput> = TInput extends readonly unknown[]
  ? TInput
  : readonly [TInput];

type ExtensionGroups<TGroups> =
  TGroups extends Record<string, unknown> ? TGroups : Record<never, never>;

export type EditorExtensionSlotValue<
  TKey extends string,
  TInput extends EditorExtensionInput,
> = EditorExtension &
  EditorSchemaExtensionProvider<SchemaExtensionsOf<TInput>> &
  EditorExtensionTypeProvider<
    <V extends Value>() => {
      api: ExtensionGroups<EditorInstalledApiGroups<ExtensionTuple<TInput>>>;
      state: ExtensionGroups<
        EditorInstalledStateGroups<V, ExtensionTuple<TInput>>
      >;
      tx: ExtensionGroups<EditorInstalledTxGroups<V, ExtensionTuple<TInput>>>;
    }
  > & {
    name: `slot:${TKey}`;
  };

export type EditorExtensionSlot<TKey extends string> = Readonly<{
  key: TKey;
  of: <const TInput extends EditorExtensionInput>(
    input: TInput
  ) => EditorExtensionSlotValue<TKey, TInput>;
}>;

export type InternalEditorExtensionSlotValue = EditorExtension & {
  readonly [EDITOR_EXTENSION_SLOT_INPUT]?: EditorExtensionInput;
};

/**
 * Define a named extension boundary that can be replaced as one atomic unit.
 */
export const defineExtensionSlot = <const TKey extends string>(
  key: TKey
): EditorExtensionSlot<TKey> => {
  if (!key) throw new Error('Editor extension slot key cannot be empty.');

  const of = <const TInput extends EditorExtensionInput>(input: TInput) =>
    Object.freeze({
      [EDITOR_EXTENSION_SLOT_INPUT]: input,
      name: `slot:${key}`,
    }) as unknown as EditorExtensionSlotValue<TKey, TInput>;

  return Object.freeze({
    key,
    of,
  });
};
