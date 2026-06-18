export type NativeTextInsertDelta = {
  offset: number;
  text: string;
};

const getPureInsertDelta = ({
  inputText,
  slateText,
  textHostText,
}: {
  inputText: string;
  slateText: string;
  textHostText: string;
}): NativeTextInsertDelta | null => {
  if (textHostText.length <= slateText.length) {
    return null;
  }

  let start = 0;

  while (
    start < slateText.length &&
    start < textHostText.length &&
    slateText[start] === textHostText[start]
  ) {
    start += 1;
  }

  let slateEnd = slateText.length;
  let textHostEnd = textHostText.length;

  while (
    slateEnd > start &&
    textHostEnd > start &&
    slateText[slateEnd - 1] === textHostText[textHostEnd - 1]
  ) {
    slateEnd -= 1;
    textHostEnd -= 1;
  }

  const insertedText = textHostText.slice(start, textHostEnd);

  if (
    slateEnd === start &&
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
  slateText,
  textHostText,
}: {
  inputText: string;
  selectionOffset: number;
  slateText: string;
  textHostText: string;
}): NativeTextInsertDelta => {
  const insertedLength = textHostText.length - slateText.length;

  if (insertedLength > 0 && selectionOffset >= insertedLength) {
    const offset = Math.max(
      0,
      Math.min(slateText.length, selectionOffset - insertedLength)
    );
    const insertedText = textHostText.slice(offset, offset + insertedLength);

    if (
      insertedText.length > 0 &&
      textHostText.slice(0, offset) === slateText.slice(0, offset) &&
      textHostText.slice(offset + insertedLength) === slateText.slice(offset)
    ) {
      return {
        offset,
        text: insertedText,
      };
    }
  }

  const pureInsert = getPureInsertDelta({
    inputText,
    slateText,
    textHostText,
  });

  if (pureInsert) {
    return pureInsert;
  }

  return {
    offset: Math.max(
      0,
      Math.min(slateText.length, selectionOffset - inputText.length)
    ),
    text: inputText,
  };
};
