import { TEditor } from '@udecode/plate-core';
import { ListItemMarkerSelection } from '../../types';
import { getListItemContentMark } from './getListItemContentMark';

export const isListItemContentMarkActive = (
  editor: TEditor,
  licSelection: ListItemMarkerSelection,
  key: string
): boolean => {
  return !!getListItemContentMark(editor, licSelection, key);
};
