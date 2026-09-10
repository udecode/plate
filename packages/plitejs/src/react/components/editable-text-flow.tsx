import React, { useCallback, useContext, useMemo, useRef } from 'react';

import type { NodeKey, Path, Text as PliteTextNode } from '../..';
import {
  markDOMSyncMutationTarget,
  releaseDOMTextFlowRecordIndex,
  setDOMTextFlowRecordIndex,
  setDOMTextFlowRecordIndexes,
} from '../../dom/internal';
import { readDOMTextFlowPaint } from '../../dom/plugin/dom-text-flow-index';
import { DecorationContext } from '../decoration-context';
import {
  getDecorationSliceIdentity,
  getDecorationPaintChange,
  getNativeMappedDecorationInsertion,
  type PliteDecorationAttributes,
  type PliteDecorationSlice,
} from '../decoration-source';
import { getPureTextInsertion } from '../editable/native-text-input-delta';
import { readNodeByKey } from '../editable/runtime-live-state';
import {
  EditableDOMRuntimeContext,
  useClaimEditableDOMCommit,
} from '../hooks/use-claim-editable-dom-commit';
import { useEditorContext } from '../hooks/use-editor-context';
import { useRequiredEditorSelectorContext } from '../hooks/use-editor-selector';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { createPliteNodeFlowRootBinding } from '../hooks/use-plite-node-ref';
import { recordPliteReactRender } from '../render-profiler';

export type EditableTextFlowEntry = Readonly<{
  isLast: boolean;
  node: PliteTextNode;
  nodeKey: NodeKey;
  path: Path;
}>;

export const ImperativeTextFlowContext = React.createContext(true);

type TextFlowSegment = Readonly<{
  decorations: readonly PliteDecorationSlice[];
  end: number;
  identity: string;
  start: number;
  text: string;
}>;

type TextFlowSegmentPlan = Readonly<{
  boundaryVisits: number;
  segments: readonly TextFlowSegment[];
}>;

type TextFlowPaint = ReturnType<typeof readDOMTextFlowPaint>;

type DecorationDOMRecord = {
  attributeNames: Set<string>;
  element: HTMLSpanElement;
  identity: string;
};

export const shouldDeferTextFlowReconcileForNativeInput = ({
  activeIntent,
  pendingNativeTextInputRepairPathKey,
  receivedUserInput,
}: {
  activeIntent: string | null;
  pendingNativeTextInputRepairPathKey: string | null | undefined;
  receivedUserInput: boolean;
}) =>
  receivedUserInput &&
  activeIntent === 'text-insert' &&
  pendingNativeTextInputRepairPathKey != null;

type SegmentDOMRecord = {
  bindingIndex: number;
  bindingHost: HTMLElement | null;
  bindingRecord: TextDOMRecord | null;
  decorationRecords: DecorationDOMRecord[];
  decorations: readonly PliteDecorationSlice[];
  domLength: number;
  end: number;
  identity: string;
  leaf: HTMLSpanElement | null;
  rootNode: globalThis.ChildNode;
  start: number;
  stringElement: HTMLSpanElement | null;
  text: string;
  textNode: globalThis.Text;
};

type TextDOMRecord = {
  bindingDirtyFrom?: number;
  bound: boolean;
  decorationIndexByIdentity: Map<string, number> | null;
  decorations: readonly PliteDecorationSlice[];
  isLast: boolean;
  node: PliteTextNode;
  nodeKey: NodeKey;
  path: Path;
  paintChange?: {
    before: ChildNode[];
    after: ChildNode[];
    anchor: ChildNode | null;
    from: number;
    to: number;
  };
  segments: SegmentDOMRecord[];
  shiftAfterSegment: number;
  shiftDelta: number;
  text: string;
};

type TextFlowDOMState = {
  binding: ReturnType<typeof createPliteNodeFlowRootBinding> | null;
  deferredTextChangeCount: number;
  incrementalTextChangeCount: number;
  reconcileCount: number;
  reconcileMs: number;
  rebuildCount: number;
  records: TextDOMRecord[];
  rootNodes: globalThis.Node[];
};
const UNITLESS_STYLE_PROPERTIES = new Set([
  'animationIterationCount',
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'boxFlex',
  'boxFlexGroup',
  'boxOrdinalGroup',
  'columnCount',
  'columns',
  'flex',
  'flexGrow',
  'flexNegative',
  'flexOrder',
  'flexPositive',
  'flexShrink',
  'fontWeight',
  'gridArea',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnSpan',
  'gridColumnStart',
  'gridRow',
  'gridRowEnd',
  'gridRowSpan',
  'gridRowStart',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'scale',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
]);

const samePath = (left: Path, right: Path) =>
  left.length === right.length &&
  left.every((part, index) => part === right[index]);

const clampOffset = (text: string, offset: number) =>
  Math.max(0, Math.min(text.length, offset));

const compileOrderedNonOverlappingSegments = (
  text: string,
  decorations: readonly PliteDecorationSlice[],
  windowStart: number,
  windowEnd: number
): TextFlowSegmentPlan | null => {
  const ranges: Array<{
    decoration: PliteDecorationSlice;
    end: number;
    start: number;
  }> = [];
  let previousEnd = 0;

  for (const decoration of decorations) {
    const start = clampOffset(text, decoration.start);
    const end = clampOffset(text, decoration.end);

    if (end <= start) continue;
    if (start < previousEnd) return null;
    ranges.push({ decoration, end, start });
    previousEnd = end;
  }

  const segments: TextFlowSegment[] = [];
  let cursor = 0;
  let previousBoundary = 'start';
  let boundaryVisits = 0;

  for (const { decoration, end, start } of ranges) {
    if (start > cursor && cursor < windowEnd && start > windowStart) {
      segments.push({
        decorations: [],
        end: Math.min(start, windowEnd),
        identity: `gap:${previousBoundary}:start:${getDecorationSliceIdentity(decoration)}:0`,
        start: Math.max(cursor, windowStart),
        text: text.slice(
          Math.max(cursor, windowStart),
          Math.min(start, windowEnd)
        ),
      });
    }
    if (start < windowEnd && end > windowStart) {
      boundaryVisits += 2;
      segments.push({
        decorations: [decoration],
        end: Math.min(end, windowEnd),
        identity: `active:${getDecorationSliceIdentity(decoration)}:0`,
        start: Math.max(start, windowStart),
        text: text.slice(
          Math.max(start, windowStart),
          Math.min(end, windowEnd)
        ),
      });
    }
    cursor = end;
    previousBoundary = `end:${getDecorationSliceIdentity(decoration)}`;
  }
  if (cursor < windowEnd) {
    segments.push({
      decorations: [],
      end: windowEnd,
      identity: `gap:${previousBoundary}:end:0`,
      start: Math.max(cursor, windowStart),
      text: text.slice(Math.max(cursor, windowStart), windowEnd),
    });
  }

  return { boundaryVisits, segments };
};

const compileTextFlowWindow = (
  text: string,
  decorations: readonly PliteDecorationSlice[],
  windowStart: number,
  windowEnd: number
): TextFlowSegmentPlan => {
  if (windowEnd <= windowStart) return { boundaryVisits: 0, segments: [] };
  if (decorations.length === 0) {
    return {
      boundaryVisits: 0,
      segments: [
        {
          decorations: [],
          end: windowEnd,
          identity: 'plain',
          start: windowStart,
          text: text.slice(windowStart, windowEnd),
        },
      ],
    };
  }
  const ordered = compileOrderedNonOverlappingSegments(
    text,
    decorations,
    windowStart,
    windowEnd
  );

  if (ordered) return ordered;

  const eventDecorationCount = decorations.length;
  const eventStride = eventDecorationCount * 2 + 1;
  const events: number[] = [];

  for (let index = 0; index < decorations.length; index++) {
    const decoration = decorations[index];
    const start = clampOffset(text, decoration.start);
    const end = clampOffset(text, decoration.end);

    if (end <= start) continue;
    events.push(start * eventStride + eventDecorationCount + index);
    events.push(end * eventStride + index);
  }
  events.sort((left, right) => left - right);
  const getEventOffset = (event: number) => Math.floor(event / eventStride);
  const readEvent = (event: number) => {
    const remainder = event % eventStride;
    const isStart = remainder >= eventDecorationCount;

    return {
      decorationIndex: isStart ? remainder - eventDecorationCount : remainder,
      isStart,
    };
  };

  const active = new Set<number>();
  const identityCounts = new Map<string, number>();
  const segments: TextFlowSegment[] = [];
  let cursor = 0;
  let eventIndex = 0;
  let previousBoundary = 'start';

  while (
    eventIndex < events.length &&
    getEventOffset(events[eventIndex]) === 0
  ) {
    const event = readEvent(events[eventIndex]);

    if (event.isStart) active.add(event.decorationIndex);
    else active.delete(event.decorationIndex);
    eventIndex += 1;
  }

  while (cursor < windowEnd) {
    const nextOffset = Math.min(
      text.length,
      events[eventIndex] === undefined
        ? text.length
        : getEventOffset(events[eventIndex])
    );
    const boundaryEventStart = eventIndex;
    let nextEventIndex = eventIndex;

    while (
      nextEventIndex < events.length &&
      getEventOffset(events[nextEventIndex]) === nextOffset
    ) {
      nextEventIndex += 1;
    }

    if (nextOffset > cursor) {
      const activeIndexes = [...active].sort((left, right) => left - right);
      const activeDecorations = activeIndexes.map(
        (index) => decorations[index]
      );
      let nextBoundary = '';

      for (
        let boundaryIndex = boundaryEventStart;
        boundaryIndex < nextEventIndex;
        boundaryIndex++
      ) {
        const event = readEvent(events[boundaryIndex]);

        nextBoundary += `${nextBoundary ? ',' : ''}${
          event.isStart ? 'start' : 'end'
        }:${getDecorationSliceIdentity(decorations[event.decorationIndex])}`;
      }
      if (!nextBoundary) nextBoundary = 'end';
      const identityBase =
        activeDecorations.length > 0
          ? `active:${activeDecorations
              .map(getDecorationSliceIdentity)
              .join(',')}`
          : `gap:${previousBoundary}:${nextBoundary}`;
      const identityCount = identityCounts.get(identityBase) ?? 0;

      identityCounts.set(identityBase, identityCount + 1);
      if (nextOffset > windowStart) {
        segments.push({
          decorations: activeDecorations,
          end: Math.min(nextOffset, windowEnd),
          identity: `${identityBase}:${identityCount}`,
          start: Math.max(cursor, windowStart),
          text: text.slice(
            Math.max(cursor, windowStart),
            Math.min(nextOffset, windowEnd)
          ),
        });
      }
      previousBoundary = nextBoundary;
    }

    for (
      let boundaryIndex = boundaryEventStart;
      boundaryIndex < nextEventIndex;
      boundaryIndex++
    ) {
      const event = readEvent(events[boundaryIndex]);

      if (event.isStart) active.add(event.decorationIndex);
      else active.delete(event.decorationIndex);
    }
    cursor = nextOffset;
    eventIndex = nextEventIndex;
  }

  return { boundaryVisits: events.length, segments };
};

export const compileTextFlowSegments = (
  text: string,
  decorations: readonly PliteDecorationSlice[]
) => compileTextFlowWindow(text, decorations, 0, text.length);

const toCSSPropertyName = (name: string) =>
  name.startsWith('--')
    ? name
    : name.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);

const setExpectedAttribute = (
  element: HTMLElement,
  name: string,
  value: string
) => {
  if (element.getAttribute(name) === value) return;
  markDOMSyncMutationTarget(element, 'attributes', name);
  element.setAttribute(name, value);
};

const removeExpectedAttribute = (element: HTMLElement, name: string) => {
  if (!element.hasAttribute(name)) return;
  markDOMSyncMutationTarget(element, 'attributes', name);
  element.removeAttribute(name);
};

const toDOMAttributeValue = (value: unknown) => {
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }

  return null;
};

const toDOMStyleValue = (property: string, value: unknown) => {
  if (typeof value === 'number') {
    return value !== 0 && !UNITLESS_STYLE_PROPERTIES.has(property)
      ? `${value}px`
      : String(value);
  }
  if (typeof value === 'string') return value;

  return null;
};

const applyDecorationAttributes = (
  element: HTMLElement,
  attributes: PliteDecorationAttributes,
  previousNames: Set<string>,
  trackMutation = true
) => {
  const nextNames = new Set(Object.keys(attributes));

  for (const name of previousNames) {
    if (nextNames.has(name)) continue;
    const attributeName = name === 'className' ? 'class' : name;

    if (trackMutation) removeExpectedAttribute(element, attributeName);
    else element.removeAttribute(attributeName);
  }

  for (const [name, value] of Object.entries(attributes)) {
    if (name === 'className') {
      const attributeValue = toDOMAttributeValue(value);

      if (attributeValue === null) {
        if (trackMutation) removeExpectedAttribute(element, 'class');
        else element.removeAttribute('class');
      } else if (trackMutation) {
        setExpectedAttribute(element, 'class', attributeValue);
      } else {
        element.setAttribute('class', attributeValue);
      }
      continue;
    }
    if (name === 'style') {
      if (trackMutation) {
        markDOMSyncMutationTarget(element, 'attributes', 'style');
      }
      element.removeAttribute('style');
      for (const [property, styleValue] of Object.entries(
        (value ?? {}) as Record<string, unknown>
      )) {
        const cssValue = toDOMStyleValue(property, styleValue);

        if (cssValue === null) continue;
        element.style.setProperty(toCSSPropertyName(property), cssValue);
      }
      continue;
    }
    const attributeValue = toDOMAttributeValue(value);

    if (attributeValue === null) {
      if (trackMutation) removeExpectedAttribute(element, name);
      else element.removeAttribute(name);
    } else if (trackMutation) {
      setExpectedAttribute(element, name, attributeValue);
    } else {
      element.setAttribute(name, attributeValue);
    }
  }

  return nextNames;
};

const getDisplayedText = (
  segment: TextFlowSegment,
  index: number,
  count: number,
  isLast: boolean
) =>
  isLast && index === count - 1 && segment.text.endsWith('\n')
    ? `${segment.text}\n`
    : segment.text;

const updateStringMetadata = (
  stringElement: HTMLSpanElement,
  segment: TextFlowSegment,
  index: number,
  count: number,
  isLast: boolean,
  trackMutation = true
) => {
  if (trackMutation) {
    setExpectedAttribute(stringElement, 'data-plite-string', 'true');
  } else {
    stringElement.setAttribute('data-plite-string', 'true');
  }
  if (isLast && index === count - 1 && segment.text.endsWith('\n')) {
    if (trackMutation) {
      setExpectedAttribute(
        stringElement,
        'data-plite-length',
        String(segment.text.length)
      );
    } else {
      stringElement.setAttribute(
        'data-plite-length',
        String(segment.text.length)
      );
    }
  } else if (trackMutation) {
    removeExpectedAttribute(stringElement, 'data-plite-length');
  }
};

const requiresSegmentWrapper = (
  segment: TextFlowSegment,
  index: number,
  count: number,
  isLast: boolean
) =>
  segment.decorations.length > 0 ||
  (isLast && index === count - 1 && segment.text.endsWith('\n'));

const createSegmentRecord = (
  document: Document,
  segment: TextFlowSegment,
  index: number,
  count: number,
  isLast: boolean
): SegmentDOMRecord => {
  const displayedText = getDisplayedText(segment, index, count, isLast);

  if (!requiresSegmentWrapper(segment, index, count, isLast)) {
    const textNode = document.createTextNode(displayedText);

    return {
      bindingIndex: -1,
      bindingHost: null,
      bindingRecord: null,
      decorationRecords: [],
      decorations: [],
      domLength: displayedText.length,
      end: segment.end,
      identity: segment.identity,
      leaf: null,
      rootNode: textNode,
      start: segment.start,
      stringElement: null,
      text: segment.text,
      textNode,
    };
  }

  const decorationRecords = segment.decorations.map((decoration) => {
    const element = document.createElement('span');

    return {
      attributeNames: applyDecorationAttributes(
        element,
        decoration.attributes,
        new Set(),
        false
      ),
      element,
      identity: getDecorationSliceIdentity(decoration),
    };
  });
  const leaf = decorationRecords[0]?.element ?? document.createElement('span');
  const stringElement = decorationRecords.at(-1)?.element ?? leaf;

  for (let layer = 1; layer < decorationRecords.length; layer++) {
    decorationRecords[layer - 1].element.append(
      decorationRecords[layer].element
    );
  }
  updateStringMetadata(stringElement, segment, index, count, isLast, false);
  const textNode = document.createTextNode(displayedText);

  stringElement.append(textNode);

  return {
    bindingIndex: -1,
    bindingHost: null,
    bindingRecord: null,
    decorationRecords,
    decorations: segment.decorations,
    domLength: displayedText.length,
    end: segment.end,
    identity: segment.identity,
    leaf,
    rootNode: leaf,
    start: segment.start,
    stringElement,
    text: segment.text,
    textNode,
  };
};

const createPlainSegmentRecord = (
  document: Document,
  text: string
): SegmentDOMRecord => {
  const textNode = document.createTextNode(text);

  return {
    bindingIndex: -1,
    bindingHost: null,
    bindingRecord: null,
    decorationRecords: [],
    decorations: [],
    domLength: text.length,
    end: text.length,
    identity: 'plain',
    leaf: null,
    rootNode: textNode,
    start: 0,
    stringElement: null,
    text,
    textNode,
  };
};

const canReuseSegmentRecord = (
  record: SegmentDOMRecord,
  segment: TextFlowSegment,
  index: number,
  count: number,
  isLast: boolean,
  paint: TextFlowPaint
) =>
  (paint.isClean(record) ||
    (record.rootNode.isConnected &&
      (!record.leaf ||
        !record.stringElement ||
        record.stringElement === record.leaf ||
        record.leaf.contains(record.stringElement)) &&
      record.decorationRecords.every(
        ({ element }, decorationIndex) =>
          decorationIndex === record.decorationRecords.length - 1 ||
          (element.childNodes.length === 1 &&
            element.firstChild ===
              record.decorationRecords[decorationIndex + 1].element)
      ))) &&
  (record.leaf !== null) ===
    requiresSegmentWrapper(segment, index, count, isLast) &&
  record.decorationRecords.length === segment.decorations.length &&
  record.decorationRecords.every(
    ({ identity }, decorationIndex) =>
      identity ===
      getDecorationSliceIdentity(segment.decorations[decorationIndex])
  ) &&
  record.decorations.length === segment.decorations.length &&
  record.decorations.every(
    (decoration, decorationIndex) =>
      getDecorationSliceIdentity(decoration) ===
      getDecorationSliceIdentity(segment.decorations[decorationIndex])
  );

const updateSegmentRecord = (
  record: SegmentDOMRecord,
  segment: TextFlowSegment,
  index: number,
  count: number,
  isLast: boolean,
  paint: TextFlowPaint
) => {
  const displayedText = getDisplayedText(segment, index, count, isLast);
  let changedTextDOM = false;

  if (
    paint.isClean(record) &&
    record.text === segment.text &&
    record.domLength === displayedText.length &&
    record.decorations.length === segment.decorations.length &&
    record.decorations.every((previous, decorationIndex) =>
      sameDecorationAttributes(
        previous.attributes,
        segment.decorations[decorationIndex].attributes
      )
    )
  ) {
    record.end = segment.end;
    record.start = segment.start;
    record.decorations = segment.decorations;
    return false;
  }
  if (!record.leaf || !record.stringElement) {
    if (record.textNode.nodeValue !== displayedText) {
      markDOMSyncMutationTarget(record.textNode, 'characterData');
      record.textNode.nodeValue = displayedText;
      changedTextDOM = true;
    }
    record.end = segment.end;
    record.domLength = displayedText.length;
    record.start = segment.start;
    record.text = segment.text;
    return changedTextDOM;
  }

  for (
    let decorationIndex = 0;
    decorationIndex < segment.decorations.length;
    decorationIndex++
  ) {
    const decoration = segment.decorations[decorationIndex];
    const decorationRecord = record.decorationRecords[decorationIndex];

    decorationRecord.attributeNames = applyDecorationAttributes(
      decorationRecord.element,
      decoration.attributes,
      decorationRecord.attributeNames
    );
  }
  updateStringMetadata(record.stringElement, segment, index, count, isLast);
  const stringChildren = Array.from(record.stringElement.childNodes);
  const browserTextNodes = stringChildren.filter(
    (node): node is globalThis.Text => node.nodeType === Node.TEXT_NODE
  );
  const canAdoptBrowserText =
    browserTextNodes.length > 0 &&
    browserTextNodes.length === stringChildren.length &&
    record.stringElement.textContent === displayedText;

  if (canAdoptBrowserText) {
    changedTextDOM = record.textNode !== browserTextNodes[0];
    record.textNode = browserTextNodes[0];
  } else if (
    record.stringElement.childNodes.length !== 1 ||
    record.stringElement.firstChild !== record.textNode
  ) {
    markDOMSyncMutationTarget(record.stringElement, 'childList');
    record.stringElement.replaceChildren(record.textNode);
    changedTextDOM = true;
  }

  if (!canAdoptBrowserText && record.textNode.nodeValue !== displayedText) {
    markDOMSyncMutationTarget(record.textNode, 'characterData');
    record.textNode.nodeValue = displayedText;
    changedTextDOM = true;
  }
  record.end = segment.end;
  record.decorations = segment.decorations;
  record.domLength = displayedText.length;
  record.start = segment.start;
  record.text = segment.text;
  return changedTextDOM;
};

const sameDecorationAttributes = (
  left: PliteDecorationAttributes,
  right: PliteDecorationAttributes
) => {
  if (left === right) return true;
  const leftNames = Object.keys(left);
  const rightNames = Object.keys(right);

  return (
    leftNames.length === rightNames.length &&
    leftNames.every((name) =>
      Object.is(
        (left as Record<string, unknown>)[name],
        (right as Record<string, unknown>)[name]
      )
    )
  );
};

const reconcileDecorationAttributeChange = (
  record: TextDOMRecord,
  nextDecorations: readonly PliteDecorationSlice[]
) => {
  if (record.decorations.length !== nextDecorations.length) return false;
  const changedIdentities = new Set<string>();

  for (let index = 0; index < record.decorations.length; index++) {
    const previous = record.decorations[index];
    const next = nextDecorations[index];

    if (
      getDecorationSliceIdentity(previous) !==
        getDecorationSliceIdentity(next) ||
      previous.start !== next.start ||
      previous.end !== next.end
    ) {
      return false;
    }
    if (!sameDecorationAttributes(previous.attributes, next.attributes)) {
      changedIdentities.add(getDecorationSliceIdentity(next));
    }
  }

  if (changedIdentities.size === 0) return true;
  const decorationsByIdentity = new Map(
    nextDecorations.map((decoration) => [
      getDecorationSliceIdentity(decoration),
      decoration,
    ])
  );

  for (const segment of record.segments) {
    if (
      !segment.decorations.some((decoration) =>
        changedIdentities.has(getDecorationSliceIdentity(decoration))
      )
    ) {
      continue;
    }
    const segmentDecorations = segment.decorations.flatMap((current) => {
      const decoration = decorationsByIdentity.get(
        getDecorationSliceIdentity(current)
      );

      return decoration ? [decoration] : [];
    });

    if (segment.decorationRecords.length !== segmentDecorations.length) {
      return false;
    }
    for (let index = 0; index < segmentDecorations.length; index++) {
      const decoration = segmentDecorations[index];
      const decorationRecord = segment.decorationRecords[index];

      if (
        decorationRecord.identity !== getDecorationSliceIdentity(decoration)
      ) {
        return false;
      }
      decorationRecord.attributeNames = applyDecorationAttributes(
        decorationRecord.element,
        decoration.attributes,
        decorationRecord.attributeNames
      );
    }
    segment.decorations = segmentDecorations;
  }

  return true;
};

const followsInsertion = (
  previous: PliteDecorationSlice,
  next: PliteDecorationSlice,
  insertion: { length: number; start: number }
) => {
  const expectedStart =
    previous.start >= insertion.start
      ? previous.start + insertion.length
      : previous.start;
  const expectedEnd =
    previous.end > insertion.start
      ? previous.end + insertion.length
      : previous.end;

  return next.start === expectedStart && next.end === expectedEnd;
};

const reconcilePureInsertion = ({
  requireDOMMatch,
  isLast,
  nextDecorations,
  nextText,
  paint,
  record,
}: {
  requireDOMMatch: boolean;
  isLast: boolean;
  nextDecorations: readonly PliteDecorationSlice[];
  nextText: string;
  paint: TextFlowPaint;
  record: TextDOMRecord;
}) => {
  const textInsertion = getPureTextInsertion(record.text, nextText);
  const insertion = textInsertion
    ? { length: textInsertion.text.length, start: textInsertion.offset }
    : null;

  if (
    !insertion ||
    record.isLast !== isLast ||
    record.decorations.length !== nextDecorations.length
  ) {
    return 'failed' as const;
  }
  const getSegmentShift = (index: number) =>
    index > record.shiftAfterSegment ? record.shiftDelta : 0;
  let low = 0;
  let high = record.segments.length - 1;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);

    if (
      record.segments[middle].end + getSegmentShift(middle) <=
      insertion.start
    ) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  const targetIndex = low;
  const targetShift = getSegmentShift(targetIndex);
  const targetStart = record.segments[targetIndex]?.start + targetShift;
  const targetEnd = record.segments[targetIndex]?.end + targetShift;

  if (
    targetStart === undefined ||
    targetEnd === undefined ||
    targetStart >= insertion.start ||
    insertion.start > targetEnd ||
    (insertion.start === targetEnd &&
      (targetIndex !== record.segments.length - 1 ||
        record.segments[targetIndex].decorations.length > 0)) ||
    (record.shiftDelta !== 0 && targetIndex !== record.shiftAfterSegment)
  ) {
    return 'failed' as const;
  }
  const target = record.segments[targetIndex];
  const dirtyRange = paint.getDirtyRange(record);
  const validateRetainedSegments =
    dirtyRange === null ||
    (dirtyRange !== undefined &&
      (dirtyRange.start < targetStart || dirtyRange.end > targetEnd));

  if (validateRetainedSegments) {
    for (let index = 0; index < record.segments.length; index++) {
      const segment = record.segments[index];

      if (
        index !== targetIndex &&
        !canReuseSegmentRecord(
          segment,
          segment,
          index,
          record.segments.length,
          isLast,
          paint
        )
      ) {
        return 'failed' as const;
      }
    }
  }
  const localOffset = insertion.start - targetStart;
  const insertedText = nextText.slice(
    insertion.start,
    insertion.start + insertion.length
  );
  const targetText =
    target.text.slice(0, localOffset) +
    insertedText +
    target.text.slice(localOffset);
  const displayedTargetText =
    isLast &&
    targetIndex === record.segments.length - 1 &&
    targetText.endsWith('\n')
      ? `${targetText}\n`
      : targetText;
  if (!target.leaf && displayedTargetText !== targetText) {
    return 'failed' as const;
  }
  const domMatchesInsertion =
    target.rootNode.textContent === displayedTargetText;

  if (requireDOMMatch && !domMatchesInsertion) return 'failed' as const;
  let decorationsAreUnchanged = record.decorations === nextDecorations;
  let decorationsFollowInsertion = decorationsAreUnchanged;
  let hasAffectedDecoration = false;
  const mappedInsertion = getNativeMappedDecorationInsertion(
    record.decorations,
    nextDecorations
  );
  const followsKnownNativeMapping =
    mappedInsertion?.offset === insertion.start &&
    mappedInsertion.length === insertion.length;

  if (followsKnownNativeMapping) {
    hasAffectedDecoration = true;
    decorationsFollowInsertion = true;
  } else {
    decorationsAreUnchanged = true;
    decorationsFollowInsertion = true;

    for (let index = 0; index < record.decorations.length; index++) {
      const previous = record.decorations[index];
      const next = nextDecorations[index];

      if (
        getDecorationSliceIdentity(previous) !==
          getDecorationSliceIdentity(next) ||
        (previous.attributes !== next.attributes &&
          !sameDecorationAttributes(previous.attributes, next.attributes))
      ) {
        return 'failed' as const;
      }
      if (previous.start !== next.start || previous.end !== next.end) {
        decorationsAreUnchanged = false;
      }
      if (previous.start >= insertion.start || previous.end > insertion.start) {
        hasAffectedDecoration = true;
      }
      if (!followsInsertion(previous, next, insertion)) {
        decorationsFollowInsertion = false;
      }
    }
  }

  if (!decorationsFollowInsertion) {
    return decorationsAreUnchanged &&
      hasAffectedDecoration &&
      domMatchesInsertion
      ? ('deferred' as const)
      : ('failed' as const);
  }

  const targetDecorations = (() => {
    if (target.decorations.length === 0) return [];

    const decorationIndexByIdentity =
      record.decorationIndexByIdentity ??
      new Map(
        record.decorations.map(
          (decoration, index) =>
            [getDecorationSliceIdentity(decoration), index] as const
        )
      );

    record.decorationIndexByIdentity = decorationIndexByIdentity;

    return target.decorations.flatMap((targetDecoration) => {
      const index = decorationIndexByIdentity.get(
        getDecorationSliceIdentity(targetDecoration)
      );
      const decoration =
        index === undefined ? undefined : nextDecorations[index];

      return decoration ? [decoration] : [];
    });
  })();

  if (targetDecorations.length !== target.decorations.length) {
    return 'failed' as const;
  }
  if (validateRetainedSegments) {
    for (let index = 0; index < record.segments.length; index++) {
      if (index === targetIndex) continue;
      const segment = record.segments[index];

      updateSegmentRecord(
        segment,
        segment,
        index,
        record.segments.length,
        isLast,
        paint
      );
    }
  }
  record.shiftAfterSegment = targetIndex;
  record.shiftDelta += insertion.length;
  target.end = targetEnd + insertion.length;
  target.start = targetStart;
  updateSegmentRecord(
    target,
    {
      decorations: targetDecorations,
      end: target.end,
      identity: target.identity,
      start: target.start,
      text: nextText.slice(targetStart, targetEnd + insertion.length),
    },
    targetIndex,
    record.segments.length,
    isLast,
    paint
  );
  if (validateRetainedSegments) paint.markClean(record);
  else paint.markClean(record, targetIndex, targetIndex + 1);

  return 'reconciled' as const;
};

const reconcilePaintChange = (
  document: Document,
  record: TextDOMRecord,
  text: string,
  decorations: readonly PliteDecorationSlice[],
  isLast: boolean,
  paint: TextFlowPaint
) => {
  if (record.segments.length === 0 || record.isLast !== isLast) return null;
  const dirty = paint.getDirtyRange(record);
  const change = getDecorationPaintChange(record.decorations, decorations);

  if (dirty === null || !change) return null;
  const insertion =
    record.text === text ? null : getPureTextInsertion(record.text, text);

  if (record.text !== text && !insertion) return null;
  const delta = text.length - record.text.length;
  const start = Math.min(
    change.start,
    dirty?.start ?? Infinity,
    insertion?.offset ?? Infinity
  );
  const end = Math.max(
    change.end,
    dirty ? dirty.end + delta : 0,
    insertion ? insertion.offset + insertion.text.length : 0
  );
  const bounds = (index: number) => {
    const segment = record.segments[index];
    const shift = index > record.shiftAfterSegment ? record.shiftDelta : 0;

    return { start: segment.start + shift, end: segment.end + shift };
  };
  let from = 0;

  while (from < record.segments.length && bounds(from).end < start) from += 1;
  from = Math.max(0, Math.min(from, record.segments.length - 1));
  let to = from;

  while (to < record.segments.length && bounds(to).start <= end) to += 1;
  to = Math.max(from + 1, to);
  const windowStart = bounds(from).start;
  const windowEnd = Math.min(text.length, bounds(to - 1).end + delta);
  const plan = compileTextFlowWindow(text, decorations, windowStart, windowEnd);
  const oldMiddle = record.segments.slice(from, to);
  const result = reconcileSegments(
    document,
    oldMiddle,
    plan,
    isLast && to === record.segments.length,
    paint
  );

  record.paintChange = {
    after: result.next.map(({ rootNode }) => rootNode),
    anchor: oldMiddle.at(-1)?.rootNode.nextSibling ?? null,
    before: oldMiddle.map(({ rootNode }) => rootNode),
    from,
    to: from + result.next.length,
  };
  const next = record.segments.slice(0, from);

  next.push(...result.next);
  for (let index = to; index < record.segments.length; index++) {
    const segment = record.segments[index];
    const position = bounds(index);

    segment.start = position.start + delta;
    segment.end = position.end + delta;
    next.push(segment);
  }
  for (let index = 0; index < from; index++) {
    const position = bounds(index);

    next[index].start = position.start;
    next[index].end = position.end;
  }
  record.bindingDirtyFrom = from;
  return {
    ...result,
    next,
    reused: result.reused + from + record.segments.length - to,
    boundaryVisits: plan.boundaryVisits,
  };
};

const reconcileSegments = (
  document: Document,
  previous: SegmentDOMRecord[],
  plan: TextFlowSegmentPlan,
  isLast: boolean,
  paint: TextFlowPaint
) => {
  const recordsByIdentity = new Map<string, SegmentDOMRecord[]>();

  for (const record of previous) {
    const records = recordsByIdentity.get(record.identity) ?? [];

    records.push(record);
    recordsByIdentity.set(record.identity, records);
  }

  const next: SegmentDOMRecord[] = [];
  let changedTextDOM = false;
  let created = 0;
  let reused = 0;

  for (let index = 0; index < plan.segments.length; index++) {
    const segment = plan.segments[index];
    const candidates = recordsByIdentity.get(segment.identity);
    const candidate = candidates?.shift();
    const record =
      candidate &&
      canReuseSegmentRecord(
        candidate,
        segment,
        index,
        plan.segments.length,
        isLast,
        paint
      )
        ? candidate
        : createSegmentRecord(
            document,
            segment,
            index,
            plan.segments.length,
            isLast
          );

    if (record === candidate) {
      reused += 1;
      const changed = updateSegmentRecord(
        record,
        segment,
        index,
        plan.segments.length,
        isLast,
        paint
      );
      changedTextDOM ||= changed;
    } else {
      created += 1;
    }
    next.push(record);
  }

  const nextRootNodes = new Set(next.map(({ rootNode }) => rootNode));
  const removed = previous.reduce(
    (count, record) => count + Number(!nextRootNodes.has(record.rootNode)),
    0
  );
  return { changedTextDOM, created, next, removed, reused };
};

const setTextHostCapability = (host: HTMLSpanElement) => {
  setExpectedAttribute(host, 'data-plite-node', 'text');
  setExpectedAttribute(host, 'data-plite-text-flow-host', 'true');
  setExpectedAttribute(host, 'data-plite-dom-sync', 'true');
  removeExpectedAttribute(host, 'data-plite-dom-sync-reason');
};

const disposeRecord = (
  binding: ReturnType<typeof createPliteNodeFlowRootBinding>,
  record: TextDOMRecord
) => {
  if (record.bound) {
    binding.release(record.nodeKey, record.node);
    record.bound = false;
  }
  releaseDOMTextFlowRecordIndex(binding.node, record.nodeKey);
};

const reconcileTextFlow = ({
  buckets,
  editor,
  entries,
  root,
  requireDOMMatch,
  state,
}: {
  buckets: ReadonlyArray<readonly PliteDecorationSlice[]>;
  editor: ReturnType<typeof useEditorContext>;
  entries: readonly EditableTextFlowEntry[];
  root: HTMLSpanElement;
  requireDOMMatch: boolean;
  state: TextFlowDOMState;
}) => {
  const reconcileStartedAt = globalThis.performance?.now() ?? 0;
  const paint = readDOMTextFlowPaint(root);
  const rootPaintDirty = state.records.some(
    (record) => paint.getDirtyRange(record) === null
  );
  setTextHostCapability(root);
  const binding =
    state.binding?.node === root
      ? state.binding
      : createPliteNodeFlowRootBinding({ editor, node: root });

  state.binding = binding;
  const initializing = state.records.length === 0;
  const previousByNodeKey = new Map(
    state.records.map((record) => [record.nodeKey, record])
  );
  const next: TextDOMRecord[] = [];
  const recordsToBind: TextDOMRecord[] = [];
  const recordsToIndex: TextDOMRecord[] = [];
  let boundaryVisits = 0;
  let createdSegments = 0;
  let deferredTextChanges = 0;
  let incrementalTextChanges = 0;
  let nextSegmentCount = 0;
  let removedSegments = 0;
  let reusedSegments = 0;
  let requiresSelectionExport = false;
  const previousRecords = state.records;
  const previousRootNodes = state.rootNodes;
  let segmentOrderMayChange = initializing;

  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    const decorations = buckets[index] ?? [];
    let record = previousByNodeKey.get(entry.nodeKey);

    previousByNodeKey.delete(entry.nodeKey);
    if (!record) {
      segmentOrderMayChange = true;
      record = {
        bound: false,
        decorationIndexByIdentity: null,
        decorations,
        isLast: entry.isLast,
        node: entry.node,
        nodeKey: entry.nodeKey,
        path: entry.path,
        segments: [],
        shiftAfterSegment: -1,
        shiftDelta: 0,
        text: entry.node.text,
      };
    }
    let rebuiltSegmentIndex = false;
    const dirtyRange = paint.getDirtyRange(record);
    const reconciledDecorationAttributes =
      dirtyRange === undefined &&
      record.segments.length > 0 &&
      record.text === entry.node.text &&
      record.isLast === entry.isLast &&
      record.decorations !== decorations &&
      reconcileDecorationAttributeChange(record, decorations);

    const insertionResult =
      !reconciledDecorationAttributes &&
      record.segments.length > 0 &&
      record.text !== entry.node.text &&
      reconcilePureInsertion({
        isLast: entry.isLast,
        nextDecorations: decorations,
        nextText: entry.node.text,
        paint,
        record,
        requireDOMMatch,
      });
    const reconciledInsertion = insertionResult === 'reconciled';
    const deferredInsertion = insertionResult === 'deferred';

    if (reconciledDecorationAttributes) {
      reusedSegments += record.segments.length;
    } else if (reconciledInsertion) {
      incrementalTextChanges += 1;
      reusedSegments += record.segments.length;
    } else if (deferredInsertion) {
      deferredTextChanges += 1;
    } else if (
      record.segments.length === 0 ||
      record.text !== entry.node.text ||
      record.decorations !== decorations ||
      record.isLast !== entry.isLast ||
      dirtyRange !== undefined
    ) {
      if (
        record.segments.length === 0 &&
        decorations.length === 0 &&
        !(entry.isLast && entry.node.text.endsWith('\n'))
      ) {
        record.segments = [
          createPlainSegmentRecord(root.ownerDocument, entry.node.text),
        ];
        createdSegments += 1;
        requiresSelectionExport = true;
      } else {
        const segmentResult =
          reconcilePaintChange(
            root.ownerDocument,
            record,
            entry.node.text,
            decorations,
            entry.isLast,
            paint
          ) ??
          (() => {
            const plan = compileTextFlowSegments(entry.node.text, decorations);

            return {
              ...reconcileSegments(
                root.ownerDocument,
                record.segments,
                plan,
                entry.isLast,
                paint
              ),
              boundaryVisits: plan.boundaryVisits,
            };
          })();

        boundaryVisits += segmentResult.boundaryVisits;
        createdSegments += segmentResult.created;
        removedSegments += segmentResult.removed;
        reusedSegments += segmentResult.reused;
        record.segments = segmentResult.next;
        requiresSelectionExport ||= segmentResult.changedTextDOM;
      }
      record.decorationIndexByIdentity = null;
      record.shiftAfterSegment = -1;
      record.shiftDelta = 0;
      rebuiltSegmentIndex = true;
      segmentOrderMayChange = true;
      state.rebuildCount += 1;
    }
    if (rebuiltSegmentIndex) {
      recordsToIndex.push(record);
    }

    if (!deferredInsertion) {
      const bindingChanged = !record.bound || record.node !== entry.node;
      const pathChanged = !samePath(record.path, entry.path);

      if (bindingChanged) {
        if (record.bound) binding.release(record.nodeKey, record.node);
        if (initializing) recordsToBind.push(record);
        else binding.bind(entry.nodeKey, entry.node);
        record.bound = true;
      }
      if (bindingChanged || pathChanged) requiresSelectionExport = true;
      record.decorations = decorations;
      record.isLast = entry.isLast;
      record.node = entry.node;
      record.path = entry.path;
      record.text = entry.node.text;
    }
    nextSegmentCount += record.segments.length;
    next.push(record);
  }

  if (recordsToBind.length > 0) binding.bindAll(recordsToBind);
  if (recordsToIndex.length === 1) {
    setDOMTextFlowRecordIndex(root, recordsToIndex[0]);
  } else if (recordsToIndex.length > 1) {
    setDOMTextFlowRecordIndexes(root, recordsToIndex);
  }

  for (const record of previousByNodeKey.values()) {
    disposeRecord(binding, record);
    segmentOrderMayChange = true;
    requiresSelectionExport = true;
  }

  const recordOrderChanged =
    previousRecords.length !== next.length ||
    previousRecords.some((record, index) => record !== next[index]);
  let nextRootNodes: Node[] | null = null;
  let rootOrderChanged = initializing || rootPaintDirty;

  if (
    !initializing &&
    (rootPaintDirty || segmentOrderMayChange || recordOrderChanged)
  ) {
    nextRootNodes = next.flatMap((record) =>
      record.segments.map(({ rootNode }) => rootNode)
    );
    rootOrderChanged ||=
      previousRootNodes.length !== nextRootNodes.length ||
      previousRootNodes.some((node, index) => node !== nextRootNodes?.[index]);
  }

  const paintChanges = recordsToIndex.flatMap((record) =>
    record.paintChange ? [record.paintChange] : []
  );
  const boundedOrder =
    rootOrderChanged &&
    !initializing &&
    !rootPaintDirty &&
    !recordOrderChanged &&
    paintChanges.length > 0 &&
    paintChanges.length === recordsToIndex.length &&
    paintChanges.every(
      (change) =>
        change.before.every((node) => node.parentNode === root) &&
        (!change.anchor || change.anchor.parentNode === root)
    );

  if (boundedOrder && nextRootNodes) {
    for (const change of paintChanges) {
      const kept = new Set(change.after);

      for (const node of change.before) {
        if (!kept.has(node)) {
          markDOMSyncMutationTarget(root, 'childList');
          node.remove();
          requiresSelectionExport = true;
        }
      }
      let { anchor } = change;

      for (let index = change.after.length - 1; index >= 0; index--) {
        const node = change.after[index];

        if (node.parentNode !== root || node.nextSibling !== anchor) {
          if (node.parentNode) {
            markDOMSyncMutationTarget(node.parentNode, 'childList');
          }
          markDOMSyncMutationTarget(root, 'childList');
          if (anchor) anchor.before(node);
          else root.append(node);
          requiresSelectionExport = true;
        }
        anchor = node;
      }
    }
    state.rootNodes = nextRootNodes;
  }
  if (rootOrderChanged && !boundedOrder) {
    const orderedRootNodes =
      nextRootNodes ??
      next.flatMap((record) => record.segments.map(({ rootNode }) => rootNode));

    if (initializing) {
      const fragment = root.ownerDocument.createDocumentFragment();

      for (const node of orderedRootNodes) fragment.append(node);
      markDOMSyncMutationTarget(root, 'childList');
      root.replaceChildren(fragment);
      requiresSelectionExport = true;
    } else {
      const wanted = new Set(orderedRootNodes);
      let child = root.firstChild;

      while (child) {
        const nextChild = child.nextSibling;

        if (!wanted.has(child)) {
          markDOMSyncMutationTarget(root, 'childList');
          child.remove();
          requiresSelectionExport = true;
        }
        child = nextChild;
      }
      let cursor = root.firstChild;

      for (const node of orderedRootNodes) {
        if (node === cursor) cursor = node.nextSibling;
        else {
          if (node.parentNode) {
            markDOMSyncMutationTarget(node.parentNode, 'childList');
          }
          markDOMSyncMutationTarget(root, 'childList');
          if (cursor) cursor.before(node);
          else root.append(node);
          requiresSelectionExport = true;
        }
      }
    }
    state.rootNodes = orderedRootNodes;
  }

  for (const record of recordsToIndex) {
    if (record.paintChange) {
      paint.markClean(record, record.paintChange.from, record.paintChange.to);
    } else paint.markClean(record);
    record.paintChange = undefined;
  }

  state.records = next;
  const singleRecord = next.length === 1 ? next[0] : null;
  const isPlainSingleSegment =
    singleRecord?.segments.length === 1 &&
    singleRecord.segments[0].decorationRecords.length === 0 &&
    singleRecord.segments[0].rootNode.nodeType === Node.TEXT_NODE;

  if (singleRecord) {
    setExpectedAttribute(root, 'data-plite-node-key', singleRecord.nodeKey);
    setExpectedAttribute(root, 'data-plite-path', singleRecord.path.join(','));
  } else {
    removeExpectedAttribute(root, 'data-plite-node-key');
    removeExpectedAttribute(root, 'data-plite-path');
  }
  if (isPlainSingleSegment) {
    setExpectedAttribute(root, 'data-plite-string', 'true');
  } else {
    removeExpectedAttribute(root, 'data-plite-string');
  }
  state.deferredTextChangeCount += deferredTextChanges;
  state.incrementalTextChangeCount += incrementalTextChanges;
  setExpectedAttribute(
    root,
    'data-plite-text-flow-boundary-visits',
    String(boundaryVisits)
  );
  setExpectedAttribute(
    root,
    'data-plite-text-flow-created-segments',
    String(createdSegments)
  );
  setExpectedAttribute(
    root,
    'data-plite-text-flow-deferred-text-changes',
    String(deferredTextChanges)
  );
  setExpectedAttribute(
    root,
    'data-plite-text-flow-incremental-text-changes',
    String(incrementalTextChanges)
  );
  setExpectedAttribute(
    root,
    'data-plite-text-flow-deferred-text-change-count',
    String(state.deferredTextChangeCount)
  );
  setExpectedAttribute(
    root,
    'data-plite-text-flow-incremental-text-change-count',
    String(state.incrementalTextChangeCount)
  );
  setExpectedAttribute(
    root,
    'data-plite-text-flow-records',
    String(next.length)
  );
  setExpectedAttribute(
    root,
    'data-plite-text-flow-removed-segments',
    String(removedSegments)
  );
  setExpectedAttribute(
    root,
    'data-plite-text-flow-reused-segments',
    String(reusedSegments)
  );
  setExpectedAttribute(
    root,
    'data-plite-text-flow-segments',
    String(nextSegmentCount)
  );
  state.reconcileCount += 1;
  state.reconcileMs +=
    (globalThis.performance?.now() ?? reconcileStartedAt) - reconcileStartedAt;
  setExpectedAttribute(
    root,
    'data-plite-text-flow-rebuild-count',
    String(state.rebuildCount)
  );
  setExpectedAttribute(
    root,
    'data-plite-text-flow-reconcile-count',
    String(state.reconcileCount)
  );
  setExpectedAttribute(
    root,
    'data-plite-text-flow-reconcile-ms',
    String(state.reconcileMs)
  );

  return requiresSelectionExport;
};

export const EditableTextFlow = ({
  entries,
}: {
  entries: readonly EditableTextFlowEntry[];
}) => {
  const editor = useEditorContext();
  const decorationManager = useContext(DecorationContext);
  const editableRuntime = useContext(EditableDOMRuntimeContext);
  const { addEventListener } = useRequiredEditorSelectorContext();
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const entriesRef = useRef(entries);
  const requireDOMMatchRef = useRef(false);
  const stateRef = useRef<TextFlowDOMState>({
    binding: null,
    deferredTextChangeCount: 0,
    incrementalTextChangeCount: 0,
    reconcileCount: 0,
    reconcileMs: 0,
    rebuildCount: 0,
    records: [],
    rootNodes: [],
  });
  const nodeKeys = useMemo(
    () => entries.map(({ nodeKey }) => nodeKey),
    [entries]
  );
  const reconcile = useCallback(
    (readLiveEntries = true) => {
      const root = rootRef.current;

      if (!root) return;
      const liveEntries = readLiveEntries
        ? entriesRef.current.flatMap((entry) => {
            const { node, path } = readNodeByKey(editor, entry.nodeKey);

            return node &&
              path &&
              typeof (node as PliteTextNode).text === 'string'
              ? [{ ...entry, node: node as PliteTextNode, path }]
              : [];
          })
        : entriesRef.current;
      const buckets = decorationManager?.hasSources()
        ? liveEntries.map(({ nodeKey }) =>
            decorationManager.getNodeSnapshot(nodeKey)
          )
        : [];
      const requireDOMMatch = requireDOMMatchRef.current;

      requireDOMMatchRef.current = false;
      const runReconcile = () =>
        reconcileTextFlow({
          buckets,
          editor,
          entries: liveEntries,
          requireDOMMatch,
          root,
          state: stateRef.current,
        });
      const requiresSelectionExport = editableRuntime
        ? editableRuntime.runOwnedDOMMutation('scheduler', runReconcile)
        : runReconcile();

      if (requiresSelectionExport) {
        editableRuntime?.requestSelectionExportAfterDOMCommit();
      }
    },
    [decorationManager, editableRuntime, editor]
  );

  recordPliteReactRender({ id: nodeKeys[0] ?? null, kind: 'text' });
  // A nested renderer can remount this flow without updating the root fence.
  useClaimEditableDOMCommit();
  useIsomorphicLayoutEffect(() => {
    entriesRef.current = entries;
  }, [entries]);
  useIsomorphicLayoutEffect(() => {
    nodeKeys.forEach((nodeKey) =>
      editableRuntime?.externalText.assertNativeProjection(nodeKey)
    );
    let active = true;
    let cancelScheduledReconcile = () => {};
    let scheduledRevision = 0;
    const scheduleReconcile = () => {
      scheduledRevision += 1;
      const revision = scheduledRevision;
      const run = () => {
        if (active && revision === scheduledRevision) reconcile();
      };

      cancelScheduledReconcile();
      cancelScheduledReconcile = () => {};
      if (
        editableRuntime &&
        shouldDeferTextFlowReconcileForNativeInput({
          activeIntent: editableRuntime.inputController.state.activeIntent,
          pendingNativeTextInputRepairPathKey:
            editableRuntime.inputController.state
              .pendingNativeTextInputRepairPathKey,
          receivedUserInput: editableRuntime.receivedUserInput.current,
        })
      ) {
        requireDOMMatchRef.current = true;
        recordPliteReactRender({
          id: 'text-flow-schedule-after-native-input',
          kind: 'runtime-time',
        });
        cancelScheduledReconcile = editableRuntime.domPhaseScheduler.schedule(
          'dom-write',
          'retained-text-flow-after-native-input',
          run,
          {
            key: `retained-text-flow:${nodeKeys[0]}`,
          }
        );
        return;
      }

      recordPliteReactRender({
        id: 'text-flow-schedule-microtask',
        kind: 'runtime-time',
      });
      queueMicrotask(run);
    };
    const reconcileDecorationChange = () => {
      if (
        editableRuntime &&
        shouldDeferTextFlowReconcileForNativeInput({
          activeIntent: editableRuntime.inputController.state.activeIntent,
          pendingNativeTextInputRepairPathKey:
            editableRuntime.inputController.state
              .pendingNativeTextInputRepairPathKey,
          receivedUserInput: editableRuntime.receivedUserInput.current,
        })
      ) {
        scheduleReconcile();
        return;
      }

      scheduledRevision += 1;
      cancelScheduledReconcile();
      cancelScheduledReconcile = () => {};
      reconcile();
    };
    const unsubscribeEditor = addEventListener(scheduleReconcile, {
      nodeKeys,
      profileId: 'text-flow-retained',
    });
    const unsubscribeDecorations = decorationManager
      ? [...new Set(nodeKeys)].map((nodeKey) =>
          decorationManager.subscribeNodeKey(nodeKey, reconcileDecorationChange)
        )
      : [];

    reconcile(false);

    return () => {
      active = false;
      scheduledRevision += 1;
      cancelScheduledReconcile();
      unsubscribeEditor();
      unsubscribeDecorations.forEach((unsubscribe) => unsubscribe());
    };
  }, [addEventListener, decorationManager, nodeKeys, reconcile]);
  useIsomorphicLayoutEffect(
    () => () => {
      const { binding } = stateRef.current;

      if (binding) {
        for (const record of stateRef.current.records) {
          disposeRecord(binding, record);
        }
      }
      stateRef.current = {
        binding: null,
        deferredTextChangeCount: 0,
        incrementalTextChangeCount: 0,
        reconcileCount: 0,
        reconcileMs: 0,
        rebuildCount: 0,
        records: [],
        rootNodes: [],
      };
    },
    []
  );

  return (
    <span
      data-plite-text-flow="true"
      ref={rootRef}
      suppressContentEditableWarning
    />
  );
};
