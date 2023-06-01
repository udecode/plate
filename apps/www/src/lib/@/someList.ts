import { getListItemEntry } from '@udecode/plate-list';

export const someList = (editor, type: string) => {
  return getListItemEntry(editor)?.list?.[0].type === type;
};
