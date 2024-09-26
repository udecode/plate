/* eslint-disable react/display-name */
import React from 'react';

import { type Selection, Range } from 'slate';
import { useSlate } from 'slate-react';

import { useIncrementVersion } from '../stores';

export const EditorStateEffect = React.memo(({ id }: { id?: string }) => {
  const editorState = useSlate();
  const updateVersionEditor = useIncrementVersion('versionEditor', id);

  React.useEffect(() => {
    updateVersionEditor();
  });

  const updateVersionSelection = useIncrementVersion('versionSelection', id);
  const prevSelectionRef = React.useRef(editorState.selection);

  const sameSelection = isSelectionEqual(
    prevSelectionRef.current,
    editorState.selection
  );

  React.useEffect(() => {
    if (!sameSelection) {
      updateVersionSelection();
    }

    prevSelectionRef.current = editorState.selection;
  }, [editorState.selection, sameSelection, updateVersionSelection]);

  return null;
});

const isSelectionEqual = (a: Selection, b: Selection) => {
  if (!a && !b) return true;
  if (!a || !b) return false;

  return Range.equals(a, b);
};
