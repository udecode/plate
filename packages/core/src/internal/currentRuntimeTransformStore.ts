const currentRuntimeTransforms = new WeakMap<object, unknown>();

const isObject = (value: unknown): value is object =>
  (typeof value === 'object' && value !== null) || typeof value === 'function';

export const getStoredCurrentRuntimeTransforms = <T>(
  editor: unknown
): T | undefined => {
  if (!isObject(editor)) return;

  return currentRuntimeTransforms.get(editor) as T | undefined;
};

export const setStoredCurrentRuntimeTransforms = (
  editor: unknown,
  transforms: unknown
) => {
  if (!isObject(editor)) return;

  currentRuntimeTransforms.set(editor, transforms);
};
