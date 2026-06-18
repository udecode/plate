import type { Text } from '../interfaces';
import type { Editor } from '../interfaces/editor';

export const marks = (editor: Editor): Omit<Text, 'text'> | null =>
  editor.read((state) => state.marks.get());
