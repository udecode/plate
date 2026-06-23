import type { BooleanMarksOf } from '@platejs/plite';
import type { CustomEditor, CustomText, CustomTextKey } from './custom-types.d';

type ActiveMarks = BooleanMarksOf<CustomText>;

const getActiveMarks = (editor: CustomEditor): ActiveMarks | null =>
  editor.read((state) => state.marks.get()) as ActiveMarks | null;

export const toggleMark = (editor: CustomEditor, format: CustomTextKey) => {
  editor.update((tx) => {
    tx.marks.toggle(format);
  });
};

export const isMarkActive = (editor: CustomEditor, format: CustomTextKey) => {
  const marks = getActiveMarks(editor);

  return marks ? marks[format] === true : false;
};
