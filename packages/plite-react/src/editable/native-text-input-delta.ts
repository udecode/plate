export type NativeTextInsertDelta = {
  offset: number;
  text: string;
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
  if (textHostText.length <= pliteText.length) {
    return null;
  }

  let start = 0;

  while (
    start < pliteText.length &&
    start < textHostText.length &&
    pliteText[start] === textHostText[start]
  ) {
    start += 1;
  }

  let pliteEnd = pliteText.length;
  let textHostEnd = textHostText.length;

  while (
    pliteEnd > start &&
    textHostEnd > start &&
    pliteText[pliteEnd - 1] === textHostText[textHostEnd - 1]
  ) {
    pliteEnd -= 1;
    textHostEnd -= 1;
  }

  const insertedText = textHostText.slice(start, textHostEnd);

  if (
    pliteEnd === start &&
    insertedText.length > 0 &&
    insertedText === inputText
  ) {
    return {
      offset: start,
      text: insertedText,
    };
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
