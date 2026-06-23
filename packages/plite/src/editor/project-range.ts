import { Editor, type EditorStaticApi } from '../interfaces/editor';
import { projectRangeInSnapshot } from '../range-projection';

export const projectRange: EditorStaticApi['projectRange'] = (editor, range) =>
  projectRangeInSnapshot(Editor.getSnapshot(editor), range);
