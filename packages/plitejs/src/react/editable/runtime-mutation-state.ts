import type { EditorMarks, EditorTargetRuntime } from '../..';
import type { AnyEditor } from '../../interfaces/editor';
import { setEditorMarks, setEditorTargetRuntime } from './runtime-editor-api';

export const writeRuntimeMarks = (
  editor: AnyEditor,
  marks: EditorMarks | null
) => {
  setEditorMarks(editor, marks);
};

export const writeTargetRuntime = (
  editor: AnyEditor,
  targetRuntime: EditorTargetRuntime | null
) => {
  setEditorTargetRuntime(editor, targetRuntime);
};
