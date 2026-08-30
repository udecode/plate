import type {
  AnyEditor as Editor,
  EditorStateField,
  StateFieldValueInput,
} from '../interfaces/editor';
import { getExtensionRegistry } from './extension-registry';

const HYDRATED_STATE_FIELDS = new WeakMap<Editor, Set<string>>();

export const getStateFieldMap = (editor: Editor) =>
  new Map(
    [...getExtensionRegistry(editor).stateFields].map(([key, registration]) => [
      key,
      registration.field,
    ])
  );

/**
 * All descriptors whose identity has belonged to this editor revision.
 *
 * Inactive descriptors remain serialization authorities for their stored
 * values, without becoming readable or participating in effects.
 */
export const getStateFieldIdentityMap = (editor: Editor) =>
  new Map(getExtensionRegistry(editor).stateFieldIdentities);

export const getInstalledStateField = <TValue>(
  editor: Editor,
  field: EditorStateField<TValue>
): EditorStateField<TValue> => {
  const installed = getExtensionRegistry(editor).stateFields.get(field.key);

  if (!installed) {
    throw new Error(`State field "${field.key}" is not installed.`);
  }
  if (installed.field !== field) {
    throw new Error(
      `State field "${field.key}" does not match the installed stable descriptor.`
    );
  }

  return field;
};

export const initializeStateFieldMap = (editor: Editor) => {
  HYDRATED_STATE_FIELDS.set(editor, new Set());
};

export const isStateFieldHydrated = (editor: Editor, key: string) =>
  HYDRATED_STATE_FIELDS.get(editor)?.has(key) ?? false;

export const markStateFieldHydrated = (editor: Editor, key: string) => {
  const hydrated = HYDRATED_STATE_FIELDS.get(editor) ?? new Set<string>();

  hydrated.add(key);
  HYDRATED_STATE_FIELDS.set(editor, hydrated);
};

export const restoreStateFieldHydration = (
  editor: Editor,
  key: string,
  hydrated: boolean
) => {
  const fields = HYDRATED_STATE_FIELDS.get(editor) ?? new Set<string>();

  if (hydrated) fields.add(key);
  else fields.delete(key);
  HYDRATED_STATE_FIELDS.set(editor, fields);
};

export const resolveStateFieldInitial = <TValue>(
  field: EditorStateField<TValue>
): TValue | undefined =>
  field.initial === undefined
    ? undefined
    : typeof field.initial === 'function'
      ? (field.initial as () => TValue)()
      : field.initial;

export const resolveStateFieldValue = <TValue>(
  previous: TValue,
  value: StateFieldValueInput<TValue>
): TValue =>
  typeof value === 'function'
    ? (value as (previous: TValue) => TValue)(previous)
    : value;
