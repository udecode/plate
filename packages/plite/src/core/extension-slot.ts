import type {
  EditorResolvedInstalledExtensions,
  InternalEditorExtensionDependencyReference,
  EditorExtensionReference,
  EditorExtensionInput,
} from '../interfaces/editor';
import type {
  EditorSchemaExtensionProvider,
  SchemaExtensionsOf,
} from '../interfaces/schema';
import { defineExtension } from './editor-extension';

const EDITOR_EXTENSION_SLOT_INPUTS = new WeakMap<
  object,
  EditorExtensionInput
>();

type ExtensionTuple<TInput> = TInput extends readonly unknown[]
  ? TInput
  : readonly [TInput];

export type EditorExtensionSlotValue<
  TKey extends string,
  TInput extends EditorExtensionInput,
> = InternalEditorExtensionDependencyReference<
  Readonly<{
    direct: Readonly<{ name: `slot:${TKey}` }>;
    installed: EditorResolvedInstalledExtensions<
      ExtensionTuple<TInput>
    >[number];
  }>
> &
  EditorExtensionReference &
  EditorSchemaExtensionProvider<SchemaExtensionsOf<TInput>> & {
    name: `slot:${TKey}`;
  };

export type EditorExtensionSlot<TKey extends string> = Readonly<{
  key: TKey;
  of: <const TInput extends EditorExtensionInput>(
    input: TInput
  ) => EditorExtensionSlotValue<TKey, TInput>;
}>;

/** @internal Read the configured input owned by a nominal slot descriptor. */
export const getEditorExtensionSlotInput = (
  extension: EditorExtensionReference
): EditorExtensionInput | undefined =>
  EDITOR_EXTENSION_SLOT_INPUTS.get(extension);

/**
 * Define a named extension boundary that can be replaced as one atomic unit.
 */
export const defineExtensionSlot = <const TKey extends string>(
  key: TKey
): EditorExtensionSlot<TKey> => {
  if (!key) throw new Error('Editor extension slot key cannot be empty.');
  const values = new WeakMap<object, EditorExtensionReference>();

  const of = <const TInput extends EditorExtensionInput>(input: TInput) => {
    const known = values.get(input);

    if (known) {
      return known as unknown as EditorExtensionSlotValue<TKey, TInput>;
    }
    const extension = defineExtension(`slot:${key}`, {});

    EDITOR_EXTENSION_SLOT_INPUTS.set(extension, input);
    values.set(input, extension);

    return extension as unknown as EditorExtensionSlotValue<TKey, TInput>;
  };

  return Object.freeze({
    key,
    of,
  });
};
