type DOMTextFlowSegment = {
  bindingIndex?: number;
  bindingHost: HTMLElement | null;
  bindingRecord: DOMTextFlowRecord | null;
  boundNodes?: readonly globalThis.Node[];
  domLength: number;
  end: number;
  paintEpoch?: number;
  rootNode?: globalThis.Node;
  start: number;
  stringElement: HTMLElement | null;
  text?: string;
  textNode: globalThis.Text;
};

type DOMTextFlowRecord = {
  bindingDirtyFrom?: number;
  nodeKey: string;
  paintEpoch?: number;
  path: readonly number[];
  segments: readonly DOMTextFlowSegment[];
  shiftAfterSegment?: number;
  shiftDelta?: number;
  text?: string;
};

type DOMTextFlowIndex = {
  dirtySegments: Map<DOMTextFlowRecord, Set<DOMTextFlowSegment>>;
  epoch: number;
  observation: DOMTextFlowObservation | null;
  observationEpoch: number;
  records: Map<string, DOMTextFlowRecordBinding>;
};

type DOMTextFlowRecordBinding = {
  record: DOMTextFlowRecord;
  segments: readonly DOMTextFlowSegment[];
};

type DOMTextFlowObservation = {
  epoch: number;
  flush: () => void;
};

const DOM_TEXT_FLOW_SEGMENT = Symbol('plite.domTextFlowSegment');
type DOMTextFlowBoundNode = globalThis.Node & {
  [DOM_TEXT_FLOW_SEGMENT]?: DOMTextFlowSegment | null;
};

const TEXT_HOST_TO_FLOW_INDEX = new WeakMap<HTMLElement, DOMTextFlowIndex>();
const ROOT_TO_FLOW_OBSERVATION = new WeakMap<
  HTMLElement,
  DOMTextFlowObservation
>();

const DEFAULT_RECORD_KEY = '';

const getTextFlowIndex = (host: HTMLElement) => {
  let index = TEXT_HOST_TO_FLOW_INDEX.get(host);

  if (!index) {
    index = {
      dirtySegments: new Map(),
      epoch: 0,
      observation: null,
      observationEpoch: -1,
      records: new Map(),
    };
    TEXT_HOST_TO_FLOW_INDEX.set(host, index);
  }
  return index;
};

export const observeDOMTextFlowRoot = (
  root: HTMLElement,
  flush: (() => void) | null
) => {
  if (flush) ROOT_TO_FLOW_OBSERVATION.set(root, { epoch: 0, flush });
  else ROOT_TO_FLOW_OBSERVATION.delete(root);
};

export const markDOMTextFlowMutation = (
  root: HTMLElement,
  mutation: MutationRecord
) => {
  for (let node: Node | null = mutation.target; node; node = node.parentNode) {
    const segment = (node as DOMTextFlowBoundNode)[DOM_TEXT_FLOW_SEGMENT];
    const host = segment?.bindingHost;
    const record = segment?.bindingRecord;

    if (host && record) {
      const index = TEXT_HOST_TO_FLOW_INDEX.get(host);

      if (index) {
        segment.paintEpoch = undefined;
        const dirty = index.dirtySegments.get(record) ?? new Set();

        dirty.add(segment);
        index.dirtySegments.set(record, dirty);
        return;
      }
    }
    const index = TEXT_HOST_TO_FLOW_INDEX.get(node as HTMLElement);

    if (index) {
      index.epoch += 1;
      index.dirtySegments.clear();
      return;
    }
    if (node === root) break;
  }
  const observation = ROOT_TO_FLOW_OBSERVATION.get(root);

  if (observation) observation.epoch += 1;
};

export const readDOMTextFlowPaint = (host: HTMLElement) => {
  const index = getTextFlowIndex(host);
  const root = host.closest<HTMLElement>('[data-plite-editor]');
  const observation =
    root && host.isConnected
      ? (ROOT_TO_FLOW_OBSERVATION.get(root) ?? null)
      : null;

  observation?.flush();
  if (
    index.observation !== observation ||
    index.observationEpoch !== (observation?.epoch ?? -1)
  ) {
    index.epoch += 1;
    index.observation = observation;
    index.observationEpoch = observation?.epoch ?? -1;
    index.dirtySegments.clear();
  }
  const { epoch } = index;
  const observed = () =>
    !!root &&
    !!observation &&
    index.epoch === epoch &&
    ROOT_TO_FLOW_OBSERVATION.get(root) === observation &&
    observation.epoch === index.observationEpoch;

  return {
    getDirtyRange(record: DOMTextFlowRecord) {
      if (
        !observed() ||
        index.records.get(record.nodeKey)?.record !== record ||
        record.paintEpoch !== epoch
      ) {
        return null;
      }
      const dirty = index.dirtySegments.get(record);

      if (!dirty?.size) return undefined;
      let start = Infinity;
      let end = 0;

      for (const segment of dirty) {
        const bounds = getBindingSegmentBounds({ record, segment });

        start = Math.min(start, bounds.start);
        end = Math.max(end, bounds.end);
      }
      return { end, start };
    },
    isClean(segment: DOMTextFlowSegment) {
      return (
        observed() &&
        segment.bindingHost === host &&
        segment.paintEpoch === epoch
      );
    },
    markClean(
      record: DOMTextFlowRecord,
      from = 0,
      to = record.segments.length
    ) {
      if (
        index.epoch !== epoch ||
        index.records.get(record.nodeKey)?.record !== record
      ) {
        return;
      }
      const dirty = index.dirtySegments.get(record);

      for (let i = from; i < to; i++) {
        const segment = record.segments[i];

        segment.paintEpoch = epoch;
        dirty?.delete(segment);
      }
      if (from === 0 && to === record.segments.length) {
        record.paintEpoch = epoch;
        index.dirtySegments.delete(record);
      } else if (dirty?.size === 0) {
        index.dirtySegments.delete(record);
      }
    },
  };
};

const releaseRecordBindings = ({
  record,
  segments,
}: DOMTextFlowRecordBinding) => {
  for (const segment of segments) {
    for (const node of segment.boundNodes ?? []) {
      (node as DOMTextFlowBoundNode)[DOM_TEXT_FLOW_SEGMENT] = null;
    }
    segment.boundNodes = undefined;
    segment.bindingIndex = -1;
    segment.bindingHost = null;
    segment.bindingRecord = null;
    segment.paintEpoch = undefined;
  }
  record.paintEpoch = undefined;
};

export const setDOMTextFlowRecordIndexes = (
  host: HTMLElement,
  records: readonly DOMTextFlowRecord[]
) => {
  const index = getTextFlowIndex(host);

  for (const record of records) {
    const previous = index.records.get(record.nodeKey);
    const from =
      previous?.record === record ? (record.bindingDirtyFrom ?? 0) : 0;

    if (previous) {
      if (record.bindingDirtyFrom !== undefined && previous.record === record) {
        const kept = new Set(record.segments.slice(from));
        const removed = previous.segments
          .slice(from)
          .filter((segment) => !kept.has(segment));

        for (const segment of removed) {
          index.dirtySegments.get(record)?.delete(segment);
        }
        const epoch = record.paintEpoch;

        releaseRecordBindings({ record, segments: removed });
        record.paintEpoch = epoch;
      } else {
        releaseRecordBindings(previous);
        index.dirtySegments.delete(previous.record);
      }
    }
    index.records.set(record.nodeKey, { record, segments: record.segments });
    for (
      let segmentIndex = from;
      segmentIndex < record.segments.length;
      segmentIndex++
    ) {
      const segment = record.segments[segmentIndex];

      for (const node of segment.boundNodes ?? []) {
        if (
          node !== segment.rootNode &&
          node !== segment.stringElement &&
          node !== segment.textNode
        ) {
          (node as DOMTextFlowBoundNode)[DOM_TEXT_FLOW_SEGMENT] = null;
        }
      }

      segment.bindingIndex = segmentIndex;
      segment.bindingHost = host;
      segment.bindingRecord = record;

      if (segment.rootNode) {
        (segment.rootNode as DOMTextFlowBoundNode)[DOM_TEXT_FLOW_SEGMENT] =
          segment;
      }
      if (segment.stringElement) {
        (segment.stringElement as DOMTextFlowBoundNode)[DOM_TEXT_FLOW_SEGMENT] =
          segment;
      }
      (segment.textNode as DOMTextFlowBoundNode)[DOM_TEXT_FLOW_SEGMENT] =
        segment;
      segment.boundNodes = [
        segment.rootNode,
        segment.stringElement,
        segment.textNode,
      ].filter((node): node is globalThis.Node => !!node);
    }
    record.bindingDirtyFrom = undefined;
  }
  TEXT_HOST_TO_FLOW_INDEX.set(host, index);
};

export const setDOMTextFlowRecordIndex = (
  host: HTMLElement,
  record: DOMTextFlowRecord
) => setDOMTextFlowRecordIndexes(host, [record]);

export const releaseDOMTextFlowRecordIndex = (
  host: HTMLElement,
  nodeKey: string
) => {
  const index = TEXT_HOST_TO_FLOW_INDEX.get(host);
  const binding = index?.records.get(nodeKey);

  if (!index || !binding) return;
  releaseRecordBindings(binding);
  index.dirtySegments.delete(binding.record);
  index.records.delete(nodeKey);
  if (index.records.size === 0) TEXT_HOST_TO_FLOW_INDEX.delete(host);
};

export const setDOMTextFlowIndex = (
  host: HTMLElement,
  segments: readonly DOMTextFlowSegment[]
) => {
  setDOMTextFlowRecordIndex(host, {
    nodeKey: DEFAULT_RECORD_KEY,
    path: [],
    segments,
  });
};

export const releaseDOMTextFlowIndex = (host: HTMLElement) => {
  const index = TEXT_HOST_TO_FLOW_INDEX.get(host);

  index?.records.forEach(releaseRecordBindings);
  index?.records.clear();
  index?.dirtySegments.clear();
  TEXT_HOST_TO_FLOW_INDEX.delete(host);
};

export const resolveDOMTextFlowPoint = (
  host: HTMLElement,
  offset: number,
  nodeKey = DEFAULT_RECORD_KEY
): { node: globalThis.Text; offset: number } | null => {
  const index = TEXT_HOST_TO_FLOW_INDEX.get(host);
  const record =
    index?.records.get(nodeKey)?.record ??
    (index?.records.size === 1
      ? index.records.values().next().value?.record
      : null);
  const segments = record?.segments;

  if (!segments || segments.length === 0) return null;
  let low = 0;
  let high = segments.length - 1;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    const shift =
      middle > (record?.shiftAfterSegment ?? Number.MAX_SAFE_INTEGER)
        ? (record?.shiftDelta ?? 0)
        : 0;

    if (segments[middle].end + shift < offset) low = middle + 1;
    else high = middle;
  }

  const segment = segments[low];
  const shift =
    low > (record?.shiftAfterSegment ?? Number.MAX_SAFE_INTEGER)
      ? (record?.shiftDelta ?? 0)
      : 0;
  const segmentStart = segment.start + shift;
  const logicalLength = segment.end - segment.start;
  const localOffset = Math.max(
    0,
    Math.min(offset - segmentStart, logicalLength)
  );
  const textNodes = segment.stringElement
    ? Array.from(segment.stringElement.childNodes).filter(
        (node): node is globalThis.Text => node.nodeType === Node.TEXT_NODE
      )
    : [segment.textNode];
  let consumed = 0;

  for (const textNode of textNodes) {
    const nextConsumed = consumed + (textNode.nodeValue?.length ?? 0);

    if (localOffset <= nextConsumed) {
      return { node: textNode, offset: localOffset - consumed };
    }
    consumed = nextConsumed;
  }

  return null;
};

const getSegmentBinding = (node: globalThis.Node) => {
  let segment: DOMTextFlowSegment | undefined;

  if (node.nodeType === Node.TEXT_NODE) {
    segment =
      (node as DOMTextFlowBoundNode)[DOM_TEXT_FLOW_SEGMENT] ?? undefined;
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    const stringElement = element.closest<HTMLElement>(
      '[data-plite-string], [data-plite-zero-width]'
    );

    if (stringElement) {
      segment =
        (stringElement as DOMTextFlowBoundNode)[DOM_TEXT_FLOW_SEGMENT] ??
        undefined;
    }
  }

  return segment?.bindingHost && segment.bindingRecord
    ? {
        host: segment.bindingHost,
        record: segment.bindingRecord,
        segment,
      }
    : null;
};

const getBindingSegmentBounds = ({
  record,
  segment,
}: {
  record: DOMTextFlowRecord;
  segment: DOMTextFlowSegment;
}) => {
  const shift =
    (segment.bindingIndex ?? -1) >
    (record.shiftAfterSegment ?? Number.MAX_SAFE_INTEGER)
      ? (record.shiftDelta ?? 0)
      : 0;

  return {
    end: segment.end + shift,
    start: segment.start + shift,
  };
};

export const resolveDOMTextFlowEntry = (
  node: globalThis.Node,
  offset: number
): {
  host: HTMLElement;
  nodeKey: string;
  offset: number;
  path: readonly number[];
} | null => {
  const binding = getSegmentBinding(node);

  if (!binding) return null;
  const localOffset = resolveDOMTextFlowOffset(binding.host, node, offset);

  return localOffset == null
    ? null
    : {
        host: binding.host,
        nodeKey: binding.record.nodeKey,
        offset: localOffset,
        path: binding.record.path,
      };
};

export const resolveDOMTextFlowRecordText = (
  host: HTMLElement,
  nodeKey: string
) => {
  const record =
    TEXT_HOST_TO_FLOW_INDEX.get(host)?.records.get(nodeKey)?.record;

  if (!record) return null;
  if (record.text !== undefined) return record.text;
  return record.segments
    .map(
      ({ end, start, text, textNode }) =>
        text ?? (textNode.nodeValue ?? '').slice(0, end - start)
    )
    .join('');
};

export const isDOMTextFlowSegmentSynchronized = (node: globalThis.Node) => {
  const binding = getSegmentBinding(node);

  if (!binding) return false;
  const { segment } = binding;
  const value = segment.stringElement
    ? (segment.stringElement.textContent ?? '')
    : (segment.textNode.nodeValue ?? '');
  const displaySuffixLength = Math.max(
    0,
    segment.domLength - (segment.end - segment.start)
  );
  const logicalValue =
    displaySuffixLength > 0
      ? value.slice(0, Math.max(0, value.length - displaySuffixLength))
      : value;

  return logicalValue === segment.text;
};

export const resolveDOMTextFlowRecordDOMText = (
  host: HTMLElement,
  nodeKey: string
) => {
  const record =
    TEXT_HOST_TO_FLOW_INDEX.get(host)?.records.get(nodeKey)?.record;

  if (!record) return null;
  return record.segments
    .map(({ domLength, end, start, textNode }) => {
      const value =
        textNode.parentElement?.closest('[data-plite-leaf]')?.textContent ??
        textNode.nodeValue ??
        '';
      const displaySuffixLength = Math.max(0, domLength - (end - start));

      return displaySuffixLength > 0
        ? value.slice(0, Math.max(0, value.length - displaySuffixLength))
        : value;
    })
    .join('');
};

export const resolveDOMTextFlowOffset = (
  host: HTMLElement,
  node: globalThis.Node,
  offset: number
) => {
  if (node.nodeType !== Node.TEXT_NODE) return null;
  const directBinding = getSegmentBinding(node);

  if (directBinding?.host === host && !directBinding.segment.stringElement) {
    const bounds = getBindingSegmentBounds(directBinding);

    return Math.max(bounds.start, Math.min(bounds.start + offset, bounds.end));
  }
  const stringElement = node.parentElement?.closest<HTMLElement>(
    '[data-plite-string], [data-plite-zero-width]'
  );
  const binding = stringElement ? getSegmentBinding(stringElement) : null;

  if (
    !stringElement ||
    !binding ||
    binding.host !== host ||
    node.parentElement !== stringElement
  ) {
    return null;
  }

  let localOffset = offset;

  for (const child of stringElement.childNodes) {
    if (child === node) break;
    if (child.nodeType === Node.TEXT_NODE) {
      localOffset += child.nodeValue?.length ?? 0;
    }
  }

  const bounds = getBindingSegmentBounds(binding);

  return Math.max(
    bounds.start,
    Math.min(bounds.start + localOffset, bounds.end)
  );
};

export const resolveDOMTextFlowInsertTarget = (
  host: HTMLElement,
  node: globalThis.Node,
  offset: number,
  insertedText: string
) => {
  if (node.nodeType !== Node.TEXT_NODE || insertedText.length === 0) {
    return null;
  }

  const textNode = node as globalThis.Text;
  const directBinding = getSegmentBinding(textNode);
  const stringElement = directBinding?.segment.stringElement
    ? directBinding.segment.stringElement
    : textNode.parentElement?.closest<HTMLElement>(
        '[data-plite-string], [data-plite-zero-width]'
      );
  const stringBinding = stringElement ? getSegmentBinding(stringElement) : null;
  const binding =
    directBinding?.host === host
      ? directBinding
      : stringBinding?.host === host
        ? stringBinding
        : null;

  if (!binding) return null;

  let localOffset = offset;
  let currentText = textNode.nodeValue ?? '';

  if (stringElement) {
    currentText = stringElement.textContent ?? '';
    localOffset = offset;
    for (const child of stringElement.childNodes) {
      if (child === textNode) break;
      if (child.nodeType === Node.TEXT_NODE) {
        localOffset += child.nodeValue?.length ?? 0;
      }
    }
  }

  const insertOffset = localOffset - insertedText.length;
  const logicalLength = binding.segment.end - binding.segment.start;

  if (
    currentText.length < binding.segment.domLength + insertedText.length ||
    insertOffset < 0 ||
    insertOffset >
      logicalLength + currentText.length - binding.segment.domLength ||
    currentText.slice(insertOffset, localOffset) !== insertedText
  ) {
    return null;
  }

  const bounds = getBindingSegmentBounds(binding);

  return {
    insertOffset: bounds.start + insertOffset,
    selectionOffset: bounds.start + localOffset,
  };
};

export const resolveDOMTextFlowStringOffset = (
  host: HTMLElement,
  stringElement: HTMLElement,
  offset: number
) => {
  const binding = getSegmentBinding(stringElement);

  if (!binding || binding.host !== host) return null;
  const bounds = getBindingSegmentBounds(binding);

  return Math.max(bounds.start, Math.min(bounds.start + offset, bounds.end));
};
