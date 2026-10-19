import { hasEditorRuntime } from '../core/editor-runtime';
import type {
  AnyEditor as Editor,
  EditorStaticApi,
} from '../interfaces/editor';

/** Return true when a value is a Plite editor created by this runtime. */
export const isEditor: EditorStaticApi['isEditor'] = (
  value: unknown,
  _options = {}
): value is Editor => {
  if (hasEditorRuntime(value)) return true;
  if (typeof value !== 'object' || value === null || !('id' in value)) {
    return false;
  }

  const { read } = value as { read?: unknown };

  if (typeof read !== 'function') return false;

  const { runtime } = read as Editor['read'];

  return (
    typeof runtime === 'object' &&
    runtime !== null &&
    typeof runtime.snapshot === 'function'
  );
};
