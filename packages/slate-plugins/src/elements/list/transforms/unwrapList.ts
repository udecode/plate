import { defaultListTypes } from 'elements/list/types';
import { Editor, Transforms } from 'slate';
import { isList, isListItem } from '../queries';

export const unwrapList = (editor: Editor, options = defaultListTypes) => {
  Transforms.unwrapNodes(editor, {
    match: isListItem(options),
  });

  Transforms.unwrapNodes(editor, {
    match: isList(options),
    split: true,
  });
};
