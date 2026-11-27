import type { CustomTextKey } from './custom-types.d';

type MarkReadableEditor = {
  read: { marks: () => Partial<Record<CustomTextKey, unknown>> | null };
};

type MarkToggleableEditor = {
  update: { marks: { toggle: (format: CustomTextKey) => void } };
};

export const toggleMark = (
  editor: MarkToggleableEditor,
  format: CustomTextKey
) => {
  editor.update.marks.toggle(format);
};

export const isMarkActive = (
  editor: MarkReadableEditor,
  format: CustomTextKey
) => editor.read.marks()?.[format] === true;
