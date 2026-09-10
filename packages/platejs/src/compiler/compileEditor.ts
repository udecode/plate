import type { BasePluginInput } from '../lib/editor/Editor';
import type { EditorApplicationSchema } from '../lib/editor/editorApplicationSchema';
import {
  compilePlateEditor,
  type EditorCompilation,
} from '../lib/editor/withPlite';

export type { EditorCompilation } from '../lib/editor/withPlite';

/**
 * Compile nominal plugins and optional application schema into immutable JSON data.
 * Evaluates configuration, API factories and validators without activating extensions
 * or constructing an initial document.
 */
export const compileEditor = (
  options: Readonly<{
    plugins: readonly BasePluginInput[];
    schema?: EditorApplicationSchema;
  }>
): EditorCompilation => compilePlateEditor(options);
