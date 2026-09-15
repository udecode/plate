import { exportContentSlice } from 'plitejs/internal';

import {
  ContentSlice,
  type ContentSlice as ContentSliceValue,
  type Descendant,
  type Path,
  type Point,
  createEditorView,
  MAIN_ROOT_KEY,
  PathApi,
  SelectionApi,
  TextApi,
} from '../../facade';
import type { Editor } from '../../lib/editor';
import { getPlainText } from './getPlainText';

type StaticSelectionItem =
  | Readonly<{
      element: Element;
      end: Point;
      kind: 'text';
      root: string;
      start: Point;
    }>
  | Readonly<{
      element: Element;
      kind: 'node';
      path: Path;
      root: string;
    }>;

const parsePath = (value: string | null): Path | null => {
  if (!value) return null;
  const path = value.split(',').map(Number);

  return path.length > 0 &&
    path.every((part) => Number.isSafeInteger(part) && part >= 0)
    ? path
    : null;
};

const parseOffset = (value: string | null) => {
  if (value === null || value === '') return null;
  const offset = Number(value);

  return Number.isSafeInteger(offset) && offset >= 0 ? offset : null;
};

const containsBoundary = (element: Element, container: Node) =>
  element === container || element.contains(container);

const getBoundaryTextOffset = (
  element: Element,
  container: Node,
  offset: number
) => {
  const range = element.ownerDocument.createRange();

  range.selectNodeContents(element);
  range.setEnd(container, offset);

  return range.toString().length;
};

const containsNodeContents = (range: Range, node: Node) => {
  const nodeRange = node.ownerDocument?.createRange();

  if (!nodeRange) return false;
  nodeRange.selectNodeContents(node);
  const RangeType = node.ownerDocument?.defaultView?.Range;

  return (
    range.compareBoundaryPoints(RangeType?.START_TO_START ?? 0, nodeRange) <=
      0 &&
    range.compareBoundaryPoints(RangeType?.END_TO_END ?? 2, nodeRange) >= 0
  );
};

const compareDomOrder = (left: Element, right: Element) => {
  if (left === right) return 0;
  const relation = left.compareDocumentPosition(right);
  const following =
    left.ownerDocument.defaultView?.Node.DOCUMENT_POSITION_FOLLOWING ?? 4;

  return relation & following ? -1 : 1;
};

const comparePoints = (left: Point, right: Point) => {
  const path = PathApi.compare(left.path, right.path);

  return path === 0 ? left.offset - right.offset : path;
};

const getStaticSelectionPayload = (
  editor: Editor,
  host: HTMLElement
): Readonly<{
  html: string;
  slice: ContentSliceValue;
  text: string;
}> | null => {
  const document = host.ownerDocument;
  const selection = document.getSelection();

  if (!selection || selection.rangeCount !== 1 || selection.isCollapsed) {
    return null;
  }
  const range = selection.getRangeAt(0);

  if (
    !containsBoundary(host, range.startContainer) ||
    !containsBoundary(host, range.endContainer)
  ) {
    return null;
  }

  const views = new Map<string, Editor>();
  const getView = (root: string) => {
    const existing = views.get(root);

    if (existing) return existing;
    const view =
      root === MAIN_ROOT_KEY
        ? editor
        : (createEditorView(editor, { root }) as unknown as Editor);

    views.set(root, view);

    return view;
  };
  const items: StaticSelectionItem[] = [];
  const selectedNodes = new Set<string>();
  const selectedEmptySentinels: globalThis.Text[] = [];
  const selectedVoids = Array.from(
    host.querySelectorAll<HTMLElement>(
      '[data-editor-void="true"][data-editor-path][data-editor-root]'
    )
  ).filter(
    (element) =>
      range.intersectsNode(element) && containsNodeContents(range, element)
  );

  const addNode = (element: Element) => {
    const path = parsePath(element.getAttribute('data-editor-path'));
    const root = element.getAttribute('data-editor-root');

    if (!path || !root) return false;
    const key = `${root}:${path.join(',')}`;

    if (selectedNodes.has(key)) return true;
    const entry = getView(root).read.nodes.get(path);

    if (!entry || TextApi.isText(entry[0])) return false;
    selectedNodes.add(key);
    items.push({ element, kind: 'node', path, root });

    return true;
  };

  for (const element of selectedVoids) {
    if (
      selectedVoids.some(
        (candidate) => candidate !== element && candidate.contains(element)
      )
    ) {
      continue;
    }
    if (!addNode(element)) return null;
  }

  const markers = Array.from(
    host.querySelectorAll<HTMLElement>(
      '[data-editor-string][data-editor-start][data-editor-end]'
    )
  );

  for (const marker of markers) {
    if (!range.intersectsNode(marker)) continue;
    if (selectedVoids.some((element) => element.contains(marker))) continue;
    const textHost = marker.closest<HTMLElement>(
      '[data-editor-node="text"][data-editor-path][data-editor-root]'
    );

    if (!textHost || !host.contains(textHost)) return null;
    const path = parsePath(textHost.getAttribute('data-editor-path'));
    const root = textHost.getAttribute('data-editor-root');
    const segmentStart = parseOffset(marker.getAttribute('data-editor-start'));
    const segmentEnd = parseOffset(marker.getAttribute('data-editor-end'));

    if (
      !path ||
      !root ||
      segmentStart === null ||
      segmentEnd === null ||
      segmentStart > segmentEnd
    ) {
      return null;
    }
    const entry = getView(root).read.nodes.get(path);

    if (
      !entry ||
      !TextApi.isText(entry[0]) ||
      segmentEnd > entry[0].text.length
    ) {
      return null;
    }
    const expected = entry[0].text.slice(segmentStart, segmentEnd);
    const rendered = marker.textContent ?? '';

    if (rendered !== (expected === '' ? '\uFEFF' : expected)) return null;
    if (segmentStart === segmentEnd) {
      const selectedStart = containsBoundary(marker, range.startContainer)
        ? getBoundaryTextOffset(marker, range.startContainer, range.startOffset)
        : 0;
      const selectedEnd = containsBoundary(marker, range.endContainer)
        ? getBoundaryTextOffset(marker, range.endContainer, range.endOffset)
        : rendered.length;

      if (selectedStart >= selectedEnd) continue;
      const sentinel = marker.firstChild;

      if (sentinel?.nodeType !== (document.defaultView?.Node.TEXT_NODE ?? 3)) {
        return null;
      }
      selectedEmptySentinels.push(sentinel as globalThis.Text);
      const parent = textHost.closest<HTMLElement>(
        '[data-editor-node="element"][data-editor-path][data-editor-root]'
      );

      if (!parent || !host.contains(parent) || !addNode(parent)) return null;
      continue;
    }

    const start = containsBoundary(marker, range.startContainer)
      ? Math.min(
          segmentEnd,
          segmentStart +
            getBoundaryTextOffset(
              marker,
              range.startContainer,
              range.startOffset
            )
        )
      : segmentStart;
    const end = containsBoundary(marker, range.endContainer)
      ? Math.min(
          segmentEnd,
          segmentStart +
            getBoundaryTextOffset(marker, range.endContainer, range.endOffset)
        )
      : segmentEnd;

    if (start > end) return null;
    if (start === end) continue;
    items.push({
      element: marker,
      end: { offset: end, path },
      kind: 'text',
      root,
      start: { offset: start, path },
    });
  }

  if (items.length === 0) return null;
  items.sort((left, right) => compareDomOrder(left.element, right.element));
  const slices: ContentSliceValue[] = [];
  const accumulator: {
    run: Extract<StaticSelectionItem, { kind: 'text' }> | null;
  } = { run: null };
  const flushRun = () => {
    if (!accumulator.run) return;
    const current = accumulator.run;
    const slice = getView(current.root).read((state) =>
      state.slice.get({ at: { anchor: current.start, focus: current.end } })
    );

    if (slice.content.length > 0) slices.push(slice);
    accumulator.run = null;
  };

  for (const item of items) {
    if (item.kind === 'node') {
      flushRun();
      const slice = getView(item.root).read((state) =>
        state.slice.get({ at: SelectionApi.nodes([item.path]) })
      );

      if (slice.content.length === 0) return null;
      slices.push(slice);
      continue;
    }
    const currentRun = accumulator.run;

    if (
      currentRun &&
      currentRun.root === item.root &&
      comparePoints(currentRun.end, item.start) <= 0
    ) {
      accumulator.run = {
        element: currentRun.element,
        end: item.end,
        kind: 'text',
        root: currentRun.root,
        start: currentRun.start,
      };
    } else {
      flushRun();
      accumulator.run = item;
    }
  }
  flushRun();
  if (slices.length === 0) return null;
  const firstSlice = slices[0];
  const lastSlice = slices.at(-1);

  if (!firstSlice || !lastSlice) return null;

  const roots: Record<string, readonly Descendant[]> = {};

  for (const slice of slices) {
    for (const [root, children] of Object.entries(slice.roots ?? {})) {
      roots[root] ??= children;
    }
  }
  const assembled = ContentSlice.fromJSON({
    content: slices.flatMap((slice) => slice.content),
    openEnd: lastSlice.openEnd,
    openStart: firstSlice.openStart,
    ...(Object.keys(roots).length > 0 ? { roots } : {}),
  });
  const htmlContainer = document.createElement('div');
  let sentinelToken = '';

  for (let code = 0xe0_00; code <= 0xf8_ff; code++) {
    const candidate = String.fromCharCode(code);

    if (!host.innerHTML.includes(candidate)) {
      sentinelToken = candidate;
      break;
    }
  }
  if (selectedEmptySentinels.length > 0 && sentinelToken === '') return null;
  const sentinelValues = selectedEmptySentinels.map((node) => node.data);
  let selectedContents: DocumentFragment;

  try {
    selectedEmptySentinels.forEach((node) => {
      node.data = sentinelToken;
    });
    selectedContents = range.cloneContents();
  } finally {
    selectedEmptySentinels.forEach((node, index) => {
      const value = sentinelValues[index];

      if (value !== undefined) node.data = value;
    });
  }

  htmlContainer.append(selectedContents);
  const textWalker = document.createTreeWalker(
    htmlContainer,
    document.defaultView?.NodeFilter.SHOW_TEXT ?? 4
  );
  let textNode = textWalker.nextNode();

  while (textNode) {
    textNode.nodeValue =
      textNode.nodeValue?.replaceAll(sentinelToken, '') ?? '';
    textNode = textWalker.nextNode();
  }

  return {
    html: htmlContainer.innerHTML,
    slice: exportContentSlice(editor, assembled),
    text: getPlainText(htmlContainer),
  };
};

export const writeStaticSelectionClipboardData = (
  editor: Editor,
  data: Pick<DataTransfer, 'getData' | 'setData'>,
  host: HTMLElement
) => {
  const payload = getStaticSelectionPayload(editor, host);

  if (!payload) return false;
  editor.api.dom.clipboard.writeSlice(data, {
    formats: {
      'text/html': payload.html,
      'text/plain': payload.text,
    },
    slice: payload.slice,
  });

  return true;
};
