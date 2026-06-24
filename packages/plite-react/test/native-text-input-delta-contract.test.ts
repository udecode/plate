import { getNativeTextInsertDelta } from '../src/editable/native-text-input-delta';

test('native text insert delta uses DOM diff when mobile reports a collapsed whitespace boundary', () => {
  const pliteText = 'This is DOM imported editable ';
  const textHostText = 'This is DOM imported !editable ';
  const boundaryOffset = 'This is DOM imported '.length;

  expect(
    getNativeTextInsertDelta({
      inputText: '!',
      selectionOffset: boundaryOffset,
      pliteText,
      textHostText,
    })
  ).toEqual({
    offset: boundaryOffset,
    text: '!',
  });
});
