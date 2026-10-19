import {
  defineEffect,
  defineStateField,
  encodeEditorEffect,
  type EditorValuePersistence,
  type SerializedEditorEffect,
  type SerializedEditorValue,
} from 'plitejs';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;

type Label = Readonly<{ label: string }>;
type LabelJson = { label: string };

const persistence = {
  decode(value) {
    if (
      typeof value !== 'object' ||
      value === null ||
      !('label' in value) ||
      typeof value.label !== 'string'
    ) {
      throw new Error('Invalid label.');
    }

    return { label: value.label };
  },
  encode: (value) => ({ label: value.label }),
  version: 2,
} satisfies EditorValuePersistence<Label, LabelJson>;

const field = defineStateField({ key: 'typed-label', persist: persistence });
const effect = defineEffect({ key: 'typed-label', persist: persistence });
const serializedField = field.serialize({ label: 'field' });
const serializedEffect = encodeEditorEffect({
  type: effect,
  value: { label: 'effect' },
});

type _FieldEncodedType = Assert<
  Equal<typeof serializedField, SerializedEditorValue<LabelJson>>
>;
type _EffectEncodedType = Assert<
  Equal<typeof serializedEffect, SerializedEditorEffect<LabelJson>>
>;

void serializedField;
void serializedEffect;
