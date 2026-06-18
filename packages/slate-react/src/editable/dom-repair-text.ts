import { isDOMText } from '@platejs/slate-dom';
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
  slateText,
  targetInsert,
  textHostText,
}: {
  inputText: string;
  preferCapturedInsert?: boolean;
  selectionOffset: number;
  slateText: string;
  targetInsert?: {
    offset: number;
    text: string;
  };
  textHostText: string;
}) => {
  const clampedTargetInsert = targetInsert
    ? {
        offset: Math.max(0, Math.min(slateText.length, targetInsert.offset)),
        text: targetInsert.text,
      }
    : null;

  if (clampedTargetInsert && preferCapturedInsert) {
    return clampedTargetInsert;
  }

  const insert = getNativeTextInsertDelta({
    inputText,
    selectionOffset,
    slateText,
    textHostText,
  });

  if (applyTextInsert(slateText, insert) === textHostText) {
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
    textHost.querySelectorAll('[data-slate-string], [data-slate-zero-width]')
  );
  let offset = 0;

  for (const string of strings) {
    const textNode = Array.from(string.childNodes).find(isDOMText);
    const lengthAttribute = string.getAttribute('data-slate-length');
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
      '[data-slate-dom-strategy-virtual-row="true"]',
      '[data-slate-dom-strategy-virtualizer="true"]',
      '[data-slate-paged-editable-page-virtualization="true"]',
    ].join(',')
  );
