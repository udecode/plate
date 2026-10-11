import { hasEditorContent } from '../core/content';
import { isEditorNodeSelectable } from '../core/editor-read-execution';
import { getEditorSchema } from '../core/editor-runtime';
import type { AnyEditor, EditorStaticApi } from '../interfaces/editor';
import {
  above as editorAbove,
  point as editorPoint,
  positions as editorPositions,
  string as editorString,
} from '../interfaces/editor';
import type { Location } from '../interfaces/location';
import { NodeApi } from '../interfaces/node';
import { PathApi } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type { TextUnitAdjustment } from '../types/types';
import { getWordDistance } from '../utils/string';
import {
  canUseAdjacentCharacterFastPath,
  getAdjacentCharacterPoint,
} from './adjacent-character-point';

export const after: EditorStaticApi['after'] = (editor, at, options = {}) => {
  if (options.content && hasEditorContent(editor)) {
    return stepContent(
      editor,
      at,
      options.distance ?? 1,
      'forward',
      options.unit ?? 'offset',
      (point, unit) =>
        after(editor, point, { ...options, content: false, distance: 1, unit })
    );
  }

  const anchor = editorPoint(editor, at, { edge: 'end' });
  const { distance = 1, unit = 'offset', voids = false } = options;

  if (unit === 'character' && canUseAdjacentCharacterFastPath(editor, anchor)) {
    return getAdjacentCharacterPoint(editor, anchor, {
      direction: 'forward',
      distance,
      voids,
    });
  }

  const focus = editorPoint(editor, [], { edge: 'end' });
  const range = { anchor, focus };
  let d = 0;
  let target: Point | undefined;

  for (const p of editorPositions(editor, {
    ...options,
    at: range,
  })) {
    const insideNonSelectable = editorAbove(editor, {
      at: p,
      match: (node) =>
        NodeApi.isElement(node) && !isEditorNodeSelectable(editor, node),
      mode: 'highest',
      voids: true,
    });

    if (insideNonSelectable) {
      continue;
    }

    if (d > distance) {
      break;
    }

    if (d !== 0) {
      target = p;
    }

    d += 1;
  }

  return target;
};

type ContentStep = (
  point: Point,
  unit: TextUnitAdjustment
) => Point | undefined;

/**
 * Step by content: a step counts when it crosses a content character or a
 * block boundary, so the returned point lies past any struck text and leaf
 * boundary in the way.
 *
 * @internal
 */
export const stepContent = (
  editor: AnyEditor,
  at: Location,
  distance: number,
  direction: 'backward' | 'forward',
  unit: TextUnitAdjustment,
  step: ContentStep
) => {
  let point: Point | undefined = editorPoint(editor, at, {
    edge: direction === 'forward' ? 'end' : 'start',
  });

  for (let counted = 0; point && counted < distance; counted += 1) {
    point =
      unit === 'word'
        ? stepContentWord(editor, point, direction, step)
        : stepContentOnce(editor, point, (from) => step(from, unit));
  }

  return point;
};

const stepContentOnce = (
  editor: AnyEditor,
  point: Point,
  step: (point: Point) => Point | undefined
) => {
  let from = point;

  for (;;) {
    const next = step(from);

    if (!next || countsAsContentStep(editor, from, next)) return next;
    from = next;
  }
};

// A word is measured on the block's content text and walked in content
// offsets, so struck text inside it is skipped instead of segmented.
const stepContentWord = (
  editor: AnyEditor,
  point: Point,
  direction: 'backward' | 'forward',
  step: ContentStep
) => {
  const forward = direction === 'forward';
  const block = blockPath(editor, point);
  const edge = block
    ? editorPoint(editor, block, { edge: forward ? 'end' : 'start' })
    : point;
  const text = editorString(
    editor,
    forward ? { anchor: point, focus: edge } : { anchor: edge, focus: point },
    { content: true }
  );
  let current: Point | undefined = point;

  for (
    let remaining = text === '' ? 1 : getWordDistance(text, !forward);
    current && remaining > 0;
    remaining -= 1
  ) {
    current = stepContentOnce(editor, current, (from) => step(from, 'offset'));
  }

  return current;
};

const blockPath = (editor: AnyEditor, point: Point) =>
  editorAbove(editor, {
    at: point,
    match: (node) =>
      NodeApi.isElement(node) && getEditorSchema(editor).isBlock(node),
  })?.[1];

const countsAsContentStep = (editor: AnyEditor, from: Point, to: Point) => {
  const range = { anchor: from, focus: to };

  if (editorString(editor, range, { content: true }) !== '') return true;
  if (editorString(editor, range) !== '') return false;

  const fromBlock = blockPath(editor, from);
  const toBlock = blockPath(editor, to);

  return !fromBlock || !toBlock || !PathApi.equals(fromBlock, toBlock);
};
