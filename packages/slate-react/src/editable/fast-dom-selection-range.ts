import { type Point, type Range, RangeApi } from '@platejs/slate';
import { type DOMRange, isDOMText } from '@platejs/slate-dom';
import { getSlateNodeElementByPath } from '../hooks/use-slate-node-ref';
import type { ReactRuntimeEditor } from '../plugin/react-editor';

const getDOMPointForSlateTextPoint = (
  editor: ReactRuntimeEditor,
  point: Point
): { node: globalThis.Node; offset: number } | null => {
  const textHost = getSlateNodeElementByPath(editor, point.path);

  if (!textHost) {
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
    const nextOffset = offset + (Number.isFinite(length) ? length : 0);

    if (point.offset <= nextOffset) {
      const zeroWidthOffset =
        textNode?.textContent?.startsWith('\uFEFF') ||
        string.textContent === '\uFEFF'
          ? 1
          : 0;

      return {
        node: textNode ?? string,
        offset: string.hasAttribute('data-slate-zero-width')
          ? zeroWidthOffset
          : Math.max(0, Math.min(point.offset - offset, length)),
      };
    }

    offset = nextOffset;
  }

  return null;
};

const createDOMSelectionRangeFromEndpoints = ({
  editorElement,
  end,
  start,
}: {
  editorElement: HTMLElement;
  end: { node: globalThis.Node; offset: number };
  start: { node: globalThis.Node; offset: number };
}) => {
  const range = editorElement.ownerDocument.createRange();

  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset);

  return range;
};

export const createFastDOMSelectionRange = ({
  editor,
  editorElement,
  selection,
}: {
  editor: ReactRuntimeEditor;
  editorElement: HTMLElement;
  includeFullDocument?: boolean;
  selection: Range;
}): DOMRange | null => {
  const [start, end] = RangeApi.edges(selection);
  const startDOMPoint = getDOMPointForSlateTextPoint(editor, start);
  const endDOMPoint = getDOMPointForSlateTextPoint(editor, end);

  if (!startDOMPoint || !endDOMPoint) {
    return null;
  }

  return createDOMSelectionRangeFromEndpoints({
    editorElement,
    end: endDOMPoint,
    start: startDOMPoint,
  });
};
