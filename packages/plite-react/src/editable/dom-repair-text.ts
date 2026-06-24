import { isDOMText } from '@platejs/plite-dom';
import { getNativeTextInsertDelta } from './native-text-input-delta';

export const applyTextInsert = (
  text: string,
  insert: {
    offset: number;
    text: string;
  }
) => text.slice(0, insert.offset) + insert.text + text.slice(insert.offset);

export const getDOMTextRepairInsert = ({
  inputText,
  preferCapturedInsert,
  selectionOffset,
  pliteText,
  targetInsert,
  textHostText,
}: {
  inputText: string;
  preferCapturedInsert?: boolean;
  selectionOffset: number;
  pliteText: string;
  targetInsert?: {
    offset: number;
    text: string;
  };
  textHostText: string;
}) => {
  const clampedTargetInsert = targetInsert
    ? {
        offset: Math.max(0, Math.min(pliteText.length, targetInsert.offset)),
        text: targetInsert.text,
      }
    : null;

  if (clampedTargetInsert && preferCapturedInsert) {
    return clampedTargetInsert;
  }

  const insert = getNativeTextInsertDelta({
    inputText,
    selectionOffset,
    pliteText,
    textHostText,
  });

  if (applyTextInsert(pliteText, insert) === textHostText) {
    return insert;
  }

  if (clampedTargetInsert) {
    return clampedTargetInsert;
  }

  return insert;
};

export const getTextHostSelectionOffset = ({
  anchorNode,
  anchorOffset,
  textHost,
}: {
  anchorNode: Node | null;
  anchorOffset: number | null;
  textHost: Element;
}) => {
  if (anchorOffset == null || !anchorNode) {
    return null;
  }

  const strings = Array.from(
    textHost.querySelectorAll('[data-plite-string], [data-plite-zero-width]')
  );
  let offset = 0;

  for (const string of strings) {
    const textNode = Array.from(string.childNodes).find(isDOMText);
    const lengthAttribute = string.getAttribute('data-plite-length');
    const length =
      lengthAttribute == null
        ? (textNode?.textContent?.length ?? string.textContent?.length ?? 0)
        : Number.parseInt(lengthAttribute, 10);
    const safeLength = Number.isFinite(length) ? length : 0;

    if (anchorNode === textNode || string.contains(anchorNode)) {
      return offset + Math.max(0, Math.min(anchorOffset, safeLength));
    }

    offset += safeLength;
  }

  return null;
};

export const isInsideVirtualizedDOM = (element: Element) =>
  !!element.closest(
    [
      '[data-plite-dom-strategy-virtual-row="true"]',
      '[data-plite-dom-strategy-virtualizer="true"]',
      '[data-plite-paged-editable-page-virtualization="true"]',
    ].join(',')
  );
