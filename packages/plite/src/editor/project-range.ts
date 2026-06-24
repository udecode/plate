import { getSnapshot as editorGetSnapshot } from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { projectRangeInSnapshot } from '../range-projection';

export const projectRange: EditorStaticApi['projectRange'] = (editor, range) =>
  projectRangeInSnapshot(editorGetSnapshot(editor), range);
