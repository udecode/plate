import type { Text } from '../interfaces';
import type {
  AnyEditor as Editor,
  EditorStateView,
} from '../interfaces/editor';

export const marks = (editor: Editor): Omit<Text, 'text'> | null =>
  editor.read((state: EditorStateView<any, any>) => state.marks());
