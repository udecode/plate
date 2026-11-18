import { type NodeKey, type Path, TextApi } from '../../../facade';
import type { InkLine } from '../../../features/ink/lib';
import {
  INK_VOID,
  type InkBox,
  type InkLiveBlock,
  inkText,
} from '../../../features/ink/lib/inkMatch.internal';
import type { Editor } from '../../core';

export type InkLayerOrigin = Readonly<{ left: number; top: number }>;

export type InkMeasuredBlock = InkLiveBlock &
  Readonly<{ lines: readonly InkLine[] }>;

export type InkTextBlock = Readonly<{
  element: HTMLElement;
  id: string;
  key: NodeKey;
  path: Path;
  text: string;
}>;

export const inkTextBlocks = (view: Editor): InkTextBlock[] => {
  const { schema } = view.read;

  return view.read.nodes
    .blocks({ at: [], mode: 'lowest' })
    .flatMap(([node, path]) => {
      if (
        typeof node.id !== 'string' ||
        schema.isVoid(node) ||
        !node.children.every(
          (child) => TextApi.isText(child) || schema.isInline(child)
        )
      ) {
        return [];
      }

      const key = view.key(node);
      const element = view.api.dom.resolveDOMNode(key);

      return element
        ? [{ element, id: node.id, key, path, text: inkText(schema, node) }]
        : [];
    });
};

const boxIn = (rect: DOMRectReadOnly, origin: InkLayerOrigin): InkBox => ({
  height: rect.height,
  left: rect.left - origin.left,
  top: rect.top - origin.top,
  width: rect.width,
});

export const inkBoxOf = (element: Element, origin: InkLayerOrigin) =>
  boxIn(element.getBoundingClientRect(), origin);

/** Below one layout unit in every engine (1/64px, and 1/60px in Firefox), above float drift. */
export const INK_MOVE_TOLERANCE = 0.01;

export const sameInkBox = (a: InkBox, b: InkBox) =>
  Math.abs(a.left - b.left) <= INK_MOVE_TOLERANCE &&
  Math.abs(a.top - b.top) <= INK_MOVE_TOLERANCE &&
  Math.abs(a.width - b.width) <= INK_MOVE_TOLERANCE &&
  Math.abs(a.height - b.height) <= INK_MOVE_TOLERANCE;

const isInlineVoid = (element: Element) =>
  element.getAttribute('data-editor-node') === 'element' &&
  element.getAttribute('data-editor-inline') === 'true' &&
  element.getAttribute('data-editor-void') === 'true';

type Piece = Element | Readonly<{ length: number; node: Text }>;

const piecesOf = (block: Element) => {
  const pieces: Piece[] = [];
  const rest = new Map<Element, number>();
  const visit = (node: Element, inText: boolean) => {
    for (const child of node.childNodes) {
      if (child instanceof Text) {
        if (!inText) continue;

        const owner = node.closest('[data-editor-length]');
        const left =
          owner === null
            ? child.length
            : (rest.get(owner) ??
              Number(owner.getAttribute('data-editor-length')));
        const length = Math.min(child.length, left);

        if (owner) rest.set(owner, left - length);
        pieces.push({ length, node: child });
      } else if (!(child instanceof Element)) {
        continue;
      } else if (isInlineVoid(child)) {
        pieces.push(child);
      } else if (
        !child.hasAttribute('data-editor-zero-width') &&
        child.getAttribute('contenteditable') !== 'false'
      ) {
        visit(
          child,
          inText || child.getAttribute('data-editor-node') === 'text'
        );
      }
    }
  };

  visit(block, false);

  return pieces;
};

const union = (boxes: readonly InkBox[]): InkBox => {
  const left = Math.min(...boxes.map((box) => box.left));
  const top = Math.min(...boxes.map((box) => box.top));

  return {
    height: Math.max(...boxes.map((box) => box.top + box.height)) - top,
    left,
    top,
    width: Math.max(...boxes.map((box) => box.left + box.width)) - left,
  };
};

/**
 * Its lines, and the boxes `line` and `measure` return, sit inside the
 * block's `box`. `line` at the text's end returns the last line, and `measure`
 * of an empty range returns the caret's box, so a point between two words has
 * a place. Returns nothing while the rendered text is not `text`, as when the
 * DOM has not caught up with a commit.
 */
export const measureInkBlock = (
  element: Element,
  text: string,
  origin: InkLayerOrigin
): InkMeasuredBlock | undefined => {
  const pieces = piecesOf(element);
  const rendered = pieces
    .map((piece) =>
      piece instanceof Element
        ? INK_VOID
        : piece.node.data.slice(0, piece.length)
    )
    .join('');

  if (rendered !== text) return undefined;

  const box = inkBoxOf(element, origin);
  const inBlock = (rect: DOMRectReadOnly): InkBox => {
    const inner = boxIn(rect, origin);

    return { ...inner, left: inner.left - box.left, top: inner.top - box.top };
  };
  const chars: InkBox[] = [];
  const range = element.ownerDocument.createRange();

  for (const piece of pieces) {
    if (piece instanceof Element) {
      chars.push(inBlock(piece.getBoundingClientRect()));
    } else {
      for (let at = 0; at < piece.length; at++) {
        range.setStart(piece.node, at);
        range.setEnd(piece.node, at + 1);
        chars.push(inBlock(range.getBoundingClientRect()));
      }
    }
  }

  const lines: InkLine[] = [];
  const lineOfChar: number[] = [];
  let first = 0;

  for (const [at, char] of chars.entries()) {
    const head = chars[first];

    if (at > first && char.top >= head.top + head.height / 2) {
      lines.push({ end: at, ...union(chars.slice(first, at)) });
      first = at;
    }
    lineOfChar.push(lines.length);
  }
  if (chars.length > 0) {
    lines.push({ end: chars.length, ...union(chars.slice(first)) });
  } else {
    const caret = element.querySelector('[data-editor-node="text"]');

    lines.push({
      end: 0,
      ...(caret
        ? inBlock(caret.getBoundingClientRect())
        : { ...box, left: 0, top: 0 }),
      width: 0,
    });
  }

  const indexAt = (offset: number) =>
    offset < chars.length ? lineOfChar[offset] : lines.length - 1;

  return {
    box,
    line: (offset) => lines[indexAt(offset)],
    lines,
    measure: (start, end) => {
      const index = indexAt(start);
      const { height, top } = lines[index];

      if (start === end) {
        const after = indexAt(start - 1) === index ? chars[start - 1] : null;
        const left = after
          ? after.left + after.width
          : (chars[start]?.left ?? lines[index].left);

        return { height, left, top, width: 0 };
      }
      if (indexAt(end - 1) !== index) return undefined;

      const { left, width } = union(chars.slice(start, end));

      return { height, left, top, width };
    },
    text,
  };
};
