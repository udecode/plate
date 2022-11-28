import { PlateEditor, Value, withoutNormalizing } from '@udecode/plate-core';
import { MARK_COMMENT } from '../constants';
import { TCommentText } from '../types';
import { findCommentNode } from './findCommentNode';

export const getCommentKey = (id: string) => `${MARK_COMMENT}_${id}`;

export const getCommentKeyId = (key: string) =>
  key.replace(`${MARK_COMMENT}_`, '');
export const isCommentKey = (key: string) => key.startsWith(`${MARK_COMMENT}_`);

export const getCommentCount = (node: TCommentText) => {
  let commentCount = 0;
  Object.keys(node).forEach((key) => {
    if (isCommentKey(key)) commentCount++;
  });
  return commentCount;
};

export const getCommentKeys = (node: TCommentText) => {
  const keys: string[] = [];

  Object.keys(node).forEach((key) => {
    if (isCommentKey(key)) keys.push(key);
  });

  return keys;
};

export const removeCommentMark = <V extends Value>(editor: PlateEditor<V>) => {
  const nodeEntry = findCommentNode(editor);
  if (!nodeEntry) return;

  const keys = getCommentKeys(nodeEntry[0]);

  withoutNormalizing(editor, () => {
    keys.forEach((key) => {
      editor.removeMark(key);
    });

    editor.removeMark(MARK_COMMENT);
  });
};
