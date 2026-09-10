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
  pliteText,
  textHostText,
}: {
  inputText: string;
  pliteText: string;
  textHostText: string;
}): NativeTextInsertDelta | null => {
  const insertion = getPureTextInsertion(pliteText, textHostText);

  if (insertion && insertion.text === inputText) {
    return insertion;
  }

  return null;
};

export const getNativeTextInsertDelta = ({
  inputText,
  selectionOffset,
  pliteText,
  textHostText,
}: {
  inputText: string;
  selectionOffset: number;
  pliteText: string;
  textHostText: string;
}): NativeTextInsertDelta => {
  const insertedLength = textHostText.length - pliteText.length;

  if (insertedLength > 0 && selectionOffset >= insertedLength) {
    const offset = Math.max(
      0,
      Math.min(pliteText.length, selectionOffset - insertedLength)
    );
    const insertedText = textHostText.slice(offset, offset + insertedLength);

    if (
      insertedText.length > 0 &&
      textHostText.slice(0, offset) === pliteText.slice(0, offset) &&
      textHostText.slice(offset + insertedLength) === pliteText.slice(offset)
    ) {
      return {
        offset,
        text: insertedText,
      };
    }
  }

  const pureInsert = getPureInsertDelta({
    inputText,
    pliteText,
    textHostText,
  });

  if (pureInsert) {
    return pureInsert;
  }

  return {
    offset: Math.max(
      0,
      Math.min(pliteText.length, selectionOffset - inputText.length)
    ),
    text: inputText,
  };
};
