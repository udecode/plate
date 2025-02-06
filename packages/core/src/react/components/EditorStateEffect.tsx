import React from 'react';

export const EditorStateEffect = React.memo(() => {
  // const editorState = useSlate();
  // const updateVersionEditor = useIncrementVersion('versionEditor', id);
  // React.useEffect(() => {
  //   updateVersionEditor();
  // });
  // const updateVersionSelection = useIncrementVersion('versionSelection', id);
  // const prevSelectionRef = React.useRef(editorState.selection);
  // const sameSelection = isSelectionEqual(
  //   prevSelectionRef.current,
  //   editorState.selection
  // );
  // React.useEffect(() => {
  //   if (!sameSelection) {
  //     updateVersionSelection();
  //   }
  //   prevSelectionRef.current = editorState.selection;
  // }, [editorState.selection, sameSelection, updateVersionSelection]);
  return null;
});

// const isSelectionEqual = (a: EditorSelection, b: EditorSelection) => {
//   if (!a && !b) return true;
//   if (!a || !b) return false;

//   return RangeApi.equals(a, b);
// };
