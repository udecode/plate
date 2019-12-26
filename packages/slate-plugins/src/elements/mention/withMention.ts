import { Editor } from 'slate';
import { MENTION } from './types';

export const withMention = <T extends Editor>(editor: T) => {
  const { isInline, isVoid } = editor;

  editor.isInline = element =>
    element.type === MENTION ? true : isInline(element);

  editor.isVoid = element =>
    element.type === MENTION ? true : isVoid(element);

  return editor;
};
