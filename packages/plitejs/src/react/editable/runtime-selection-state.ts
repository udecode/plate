import {
  type Editor as CoreEditor,
  type Range,
  RangeApi,
  type Selection,
  type Value,
} from '../..';
import {
  type Editor,
  getSelection as editorGetSelection,
} from './runtime-editor-api';

export function readRuntimeSelection<
  V extends Value,
  TPlugins extends readonly unknown[],
>(editor: CoreEditor<V, TPlugins>): Selection;
export function readRuntimeSelection(editor: Editor): Selection {
  return editorGetSelection(editor);
}

export function readRuntimeSelectionRange<
  V extends Value,
  TPlugins extends readonly unknown[],
>(editor: CoreEditor<V, TPlugins>): Range | null;
export function readRuntimeSelectionRange(editor: Editor): Range | null {
  const selection = readRuntimeSelection(editor);

  return RangeApi.isRange(selection) ? selection : null;
}
