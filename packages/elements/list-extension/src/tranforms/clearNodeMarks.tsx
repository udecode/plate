import { setNodes } from '@udecode/plate-common';
import { TEditor, TNode } from '@udecode/plate-core';
import { Path } from 'slate';
import { PreviousStates } from '../types/licStates';

export const clearNodeMarks = (
  editor: TEditor,
  type: string[],
  node: TNode,
  path: Path
) => {
  const changeSet: Partial<Record<keyof PreviousStates, unknown>> = {};
  const prev: PreviousStates = node.prev ?? {};

  type.forEach((key) => {
    changeSet[key as keyof PreviousStates] = null;
    prev[key as keyof PreviousStates] = {
      ...(prev[key as keyof PreviousStates] || {}),
      dirty: false,
    };
  });

  setNodes(
    editor,
    {
      ...changeSet,
      prev,
    },
    { at: path }
  );
};
