import type {
  Editor,
  EditorStateField,
  EditorStatePatch,
  StateFieldValueInput,
} from '../interfaces/editor';
import { cloneValue } from './clone';

const STATE_FIELDS = new WeakMap<Editor, Map<string, EditorStateField<any>>>();

export const getStateFieldMap = (editor: Editor) => {
  let fields = STATE_FIELDS.get(editor);

  if (!fields) {
    fields = new Map();
    STATE_FIELDS.set(editor, fields);
  }

  return fields;
};

export const initializeStateFieldMap = (editor: Editor) => {
  STATE_FIELDS.set(editor, new Map());
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

export const hasStateFieldPatchHooks = <TValue>(
  field: EditorStateField<TValue>
) =>
  typeof field.diff === 'function' &&
  typeof field.applyPatch === 'function' &&
  typeof field.invertPatch === 'function';

export const isCompactStatePatch = (
  patch: EditorStatePatch
): patch is EditorStatePatch & { inversePatch: unknown; patch: unknown } =>
  Object.hasOwn(patch, 'patch') && Object.hasOwn(patch, 'inversePatch');

export const createStateFieldPatch = (
  field: EditorStateField<any> | undefined,
  key: string,
  previousValue: unknown,
  nextValue: unknown
): EditorStatePatch => {
  if (field && hasStateFieldPatchHooks(field)) {
    const patch = field.diff!(previousValue, nextValue);

    return {
      inversePatch: field.invertPatch!(patch, previousValue, nextValue),
      key,
      patch,
    };
  }

  return {
    key,
    previousValue: cloneValue(previousValue),
    value: cloneValue(nextValue),
  };
};

export const assertStateFieldPatchPolicy = <TValue>(
  field: EditorStateField<TValue>,
  previousValue: TValue,
  nextValue: TValue
) => {
  const needsReplayablePatch =
    field.history !== 'skip' || field.collab === 'shared';

  if (!needsReplayablePatch || hasStateFieldPatchHooks(field)) {
    return;
  }

  const serializedSize =
    JSON.stringify({
      key: field.key,
      previousValue,
      value: nextValue,
    })?.length ?? 0;

  if (serializedSize <= 32_768) {
    return;
  }

  throw new Error(
    `State field "${field.key}" stores a large shared/history value without patch hooks. Add diff/applyPatch/invertPatch or mark the field non-shared/history-skip.`
  );
};
