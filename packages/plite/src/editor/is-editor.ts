import { hasEditorRuntime } from '../core/editor-runtime';
import type { Editor, EditorStaticApi } from '../interfaces/editor';

/** Return true when a value is a Plite editor created by this runtime. */
export const isEditor: EditorStaticApi['isEditor'] = (
  value: unknown,
  _options = {}
): value is Editor => hasEditorRuntime(value);
