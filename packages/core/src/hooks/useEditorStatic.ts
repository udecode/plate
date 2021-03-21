import { Editor } from 'slate';
import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { SlatePluginsEditor } from '../plugins/useSlatePluginsPlugin';

/**
 * {@link useSlateStatic} with generic type.
 */
export const useEditorStatic = <
  TEditor extends Editor = ReactEditor & HistoryEditor & SlatePluginsEditor
>() => (useSlateStatic() as unknown) as TEditor;
