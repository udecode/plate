/* eslint-disable react/display-name */
import { memo, useEffect, useRef } from 'react';
import { Range, Selection } from 'slate';
import { useSlate } from 'slate-react';

import { PlateId, useIncrementVersion } from '../stores';

export const EditorStateEffect = memo(({ id }: { id?: PlateId }) => {
  const editorState = useSlate();
  const updateVersionEditor = useIncrementVersion('versionEditor', id);

  useEffect(() => {
    updateVersionEditor();
  });

  const updateVersionSelection = useIncrementVersion('versionSelection', id);
  const prevSelectionRef = useRef(editorState.selection);

  const sameSelection = isSelectionEqual(
    prevSelectionRef.current,
    editorState.selection
  );

  useEffect(() => {
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
