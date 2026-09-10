import {
  getNativeTextInsertDelta,
  getPureTextInsertion,
} from '../../src/react/editable/native-text-input-delta';

test('pure text insertion rejects replacements and reports the inserted span', () => {
  expect(getPureTextInsertion('abcdef', 'abcXYdef')).toEqual({
    offset: 3,
    text: 'XY',
  });
  expect(getPureTextInsertion('abcdef', 'abcXef')).toBeNull();
});

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
