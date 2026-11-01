import type { MouseEvent } from 'react';

import {
  defineUpdateAnnotation,
  type NodeKey,
  type Point,
  PointApi,
  type Range,
  RangeApi,
} from '../..';
import { usesAppleDOMHotkeys } from '../../dom';
import { getTextRunBetweenAtomics } from '../../editor/positions';
import { getWordSegments } from '../../utils/string';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { isPointInsideDOMSelection } from './root-interaction-dom-selection-replay';
import type { RootInteractionTarget } from './root-interaction-resolver';
import { getTripleClickBlock } from './selection-triple-click';

export type PlacedPressKind = 'block' | 'plain' | 'shift' | 'word';

export type PlacedPress = Readonly<{
  kind: PlacedPressKind;
  target: Element;
  takes: 'press' | 'selection-drag';
}>;

export type PlacedPointer = Pick<
  globalThis.MouseEvent,
  'buttons' | 'clientX' | 'clientY' | 'target'
>;

export type PlacedUnit = Readonly<{ block: NodeKey | null; range: Range }>;

// Chromium shows its touch handles only beside a caret the tap placed itself,
// and marks the mouse events it synthesizes from that tap.
export const isTapOnTextBlock = (
  event: MouseEvent<HTMLElement>,
  target: Element
) =>
  (
    event.nativeEvent as globalThis.MouseEvent & {
      sourceCapabilities?: { firesTouchEvents: boolean } | null;
    }
  ).sourceCapabilities?.firesTouchEvents === true &&
  target instanceof HTMLElement &&
  target.isContentEditable &&
  !target.matches('[data-editor-void="true"]') &&
  target
    .querySelector('[data-editor-node="text"]')
    ?.closest('[data-editor-node="element"]') === target;

export const classifyPlacedPress = (
  event: MouseEvent<HTMLElement>,
  target: RootInteractionTarget
): PlacedPress | null => {
  if (
    event.button !== 0 ||
    // Ctrl-press is the context-menu press on macOS.
    (event.ctrlKey && usesAppleDOMHotkeys(event.nativeEvent)) ||
    (target.kind !== 'editable-root' && target.kind !== 'native-editable') ||
    target.target.closest('[data-editor-void="true"]') ||
    isTapOnTextBlock(event, target.target)
  ) {
    return null;
  }
  if (event.detail >= 2) {
    return {
      kind: event.detail === 2 ? 'word' : 'block',
      takes: 'press',
      target: target.target,
    };
  }
  if (event.shiftKey) {
    return { kind: 'shift', takes: 'press', target: target.target };
  }

  // The browser keeps a single press inside the selection, which may start a
  // drag of the selected text.
  return {
    kind: 'plain',
    takes: isPointInsideDOMSelection({
      clientX: event.clientX,
      clientY: event.clientY,
      target: event.currentTarget,
    })
      ? 'selection-drag'
      : 'press',
    target: target.target,
  };
};

export const watchSelectionDrag = (
  rootElement: HTMLElement,
  {
    onEnd,
    onSelectionDrag,
  }: Readonly<{
    onEnd: () => void;
    onSelectionDrag: (pointer: PlacedPointer) => boolean;
  }>
) => {
  const document = rootElement.ownerDocument;
  const window = document.defaultView;
  let adopted = false;
  let last: PlacedPointer | null = null;
  const endBeforeAdoption = () => {
    if (!adopted) onEnd();
  };
  const move = (event: globalThis.MouseEvent) => {
    last = event;
    if (event.buttons === 0) endBeforeAdoption();
  };
  const selectStart = (event: Event) => {
    if (!adopted) {
      if (!event.isTrusted || last?.buttons !== 1) return;
      adopted = onSelectionDrag(last);
    }
    if (adopted) event.preventDefault();
  };
  const hide = () => {
    if (document.hidden) onEnd();
  };

  document.addEventListener('mousemove', move, true);
  document.addEventListener('selectstart', selectStart, true);
  document.addEventListener('dragstart', endBeforeAdoption, true);
  document.addEventListener('mouseup', endBeforeAdoption, true);
  document.addEventListener('visibilitychange', hide);
  window?.addEventListener('blur', onEnd);

  return () => {
    document.removeEventListener('mousemove', move, true);
    document.removeEventListener('selectstart', selectStart, true);
    document.removeEventListener('dragstart', endBeforeAdoption, true);
    document.removeEventListener('mouseup', endBeforeAdoption, true);
    document.removeEventListener('visibilitychange', hide);
    window?.removeEventListener('blur', onEnd);
  };
};

export const placedSelectionWord = defineUpdateAnnotation<Range>({
  key: 'selection.placed-word',
});

// WebKit on macOS and iOS, and Blink on macOS, keep the end of the selection
// farther from the click. Elsewhere, and in Gecko, the anchor stays, with a
// double-clicked word kept whole.
export const getShiftSpanFrom = ({
  editor,
  keepsFarEnd,
  point,
  selection,
  word,
}: Readonly<{
  editor: ReactRuntimeEditor;
  keepsFarEnd: boolean;
  point: Point;
  selection: Range;
  word: Range | null;
}>): Range => {
  if (!keepsFarEnd) {
    return word ?? { anchor: selection.anchor, focus: selection.anchor };
  }
  const [start, end] = RangeApi.edges(selection);
  const pivot =
    PointApi.compare(point, start) < 0 ||
    (PointApi.compare(point, end) <= 0 &&
      editor.read.text.string({ anchor: start, focus: point }).length <=
        editor.read.text.string({ anchor: point, focus: end }).length)
      ? end
      : start;

  return { anchor: pivot, focus: pivot };
};

export const spanPlacedUnits = (pressed: Range, reached: Range): Range => {
  const [start, end] = RangeApi.edges(pressed);
  const [reachedStart, reachedEnd] = RangeApi.edges(reached);

  if (PointApi.compare(reachedEnd, end) > 0) {
    return { anchor: start, focus: reachedEnd };
  }
  if (PointApi.compare(reachedStart, start) < 0) {
    return { anchor: end, focus: reachedStart };
  }
  return { anchor: start, focus: end };
};

const wordSegmenter =
  typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter(undefined, { granularity: 'word' })
    : null;

const SPACE = /\s/u;

const getWordAround = (text: string, index: number) => {
  let start = 0;
  let end = text.length;

  if (wordSegmenter) {
    const segment = wordSegmenter.segment(text).containing(index);

    if (segment) {
      start = segment.index;
      end = segment.index + segment.segment.length;
    }
  } else {
    for (const { length } of getWordSegments(text, false)) {
      if (index < start + length) {
        end = start + length;
        break;
      }
      start += length;
    }
  }
  if (/^\s+$/u.test(text.slice(start, end))) {
    while (start > 0 && SPACE.test(text[start - 1])) start -= 1;
    while (end < text.length && SPACE.test(text[end])) end += 1;
  }
  return [start, end] as const;
};

const getPlacedWord = (
  editor: ReactRuntimeEditor,
  point: Point,
  overLetterBefore: boolean
): Range => {
  const run = getTextRunBetweenAtomics(editor, point.path);
  const offset = run?.offsetOf(point);

  if (!run || offset == null || run.text.length === 0) {
    return { anchor: point, focus: point };
  }
  const [start, end] = getWordAround(
    run.text,
    (overLetterBefore && offset > 0) || offset === run.text.length
      ? offset - 1
      : offset
  );

  return {
    anchor: run.pointAt(start, 'forward'),
    focus: run.pointAt(end, 'backward'),
  };
};

export const getPlacedUnit = ({
  editor,
  kind,
  overLetterBefore,
  point,
}: Readonly<{
  editor: ReactRuntimeEditor;
  kind: PlacedPressKind;
  overLetterBefore: boolean;
  point: Point;
}>): PlacedUnit => {
  if (kind === 'word') {
    return {
      block: null,
      range: getPlacedWord(editor, point, overLetterBefore),
    };
  }
  const node =
    kind === 'block'
      ? editor.read((state) => state.nodes.get(point.path)?.[0])
      : null;

  return node
    ? getTripleClickBlock(editor, [node, point.path])
    : { block: null, range: { anchor: point, focus: point } };
};
