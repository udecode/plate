export type NativeTextInsertDelta = {
  offset: number;
  text: string;
};

export const getPureTextInsertion = (
  previousText: string,
  nextText: string
): NativeTextInsertDelta | null => {
  if (nextText.length <= previousText.length) return null;

  let offset = 0;

  // Native string equality handles large equal prefixes far faster than a
  // JavaScript loop over every code unit.
  while (
    offset + 4096 <= previousText.length &&
    previousText.slice(offset, offset + 4096) ===
      nextText.slice(offset, offset + 4096)
  ) {
    offset += 4096;
  }
  while (
    offset < previousText.length &&
    previousText[offset] === nextText[offset]
  ) {
    offset += 1;
  }

  const length = nextText.length - previousText.length;

  return previousText.slice(offset) === nextText.slice(offset + length)
    ? { offset, text: nextText.slice(offset, offset + length) }
    : null;
};

const getPureInsertDelta = ({
  inputText,
  editorText,
  textHostText,
}: {
  inputText: string;
  editorText: string;
  textHostText: string;
}): NativeTextInsertDelta | null => {
  const insertion = getPureTextInsertion(editorText, textHostText);

  if (insertion && insertion.text === inputText) {
    return insertion;
  }

  return null;
};

export const getNativeTextInsertDelta = ({
  inputText,
  selectionOffset,
  editorText,
  textHostText,
}: {
  inputText: string;
  selectionOffset: number;
  editorText: string;
  textHostText: string;
}): NativeTextInsertDelta => {
  const insertedLength = textHostText.length - editorText.length;

  if (insertedLength > 0 && selectionOffset >= insertedLength) {
    const offset = Math.max(
      0,
      Math.min(editorText.length, selectionOffset - insertedLength)
    );
    const insertedText = textHostText.slice(offset, offset + insertedLength);

    if (
      insertedText.length > 0 &&
      textHostText.slice(0, offset) === editorText.slice(0, offset) &&
      textHostText.slice(offset + insertedLength) === editorText.slice(offset)
    ) {
      return {
        offset,
        text: insertedText,
      };
    }
  }

  const pureInsert = getPureInsertDelta({
    inputText,
    editorText,
    textHostText,
  });

  if (pureInsert) {
    return pureInsert;
  }

  return {
    offset: Math.max(
      0,
      Math.min(editorText.length, selectionOffset - inputText.length)
    ),
    text: inputText,
  };
};
