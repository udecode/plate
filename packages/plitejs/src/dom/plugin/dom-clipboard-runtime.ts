import {
  ContentSlice,
  type ContentSlice as ContentSliceValue,
  type Descendant,
  defineCommand,
  type Editor,
  type EditorStateView,
  editorCommands,
  type NodeSelection,
  NodeApi as PliteNode,
  PathApi,
  type Point,
  PointApi,
  type Range,
  RangeApi,
  SelectionApi,
  type Value,
} from '../..';
import {
  dispatchCommand,
  evaluateCommandWithState,
  getActiveCommandEditor,
} from '../../core/command-registry';
import { getEditorRuntimeOwner } from '../../core/editor-runtime';
import { importContentSlice } from '../../core/import-content-slice';
import { getInstalledPlugin } from '../../core/plugin';
import {
  getSelection as getEditorSelection,
  void as editorVoid,
} from '../../interfaces/editor';
import { failInvariant } from '../../internal/fail-invariant';
import {
  type DOMNode,
  type DOMRange,
  getPlainText,
  readClipboardFragmentPayload,
  isDOMElement,
  isDOMText,
} from '../utils/dom';
import { resolveLastEditorWindow } from '../utils/weak-maps';
import {
  createDataTransferTransactionSpec,
  insertDataTransfer,
  recordDataTransferOutcome,
  writeDataTransferFragment,
} from './data-transfer-format';
import type { DOMCoverageBoundary, DOMCoverageSession } from './dom-coverage';
import { DOMEditor } from './dom-editor';
import { PLITE_STRING_SELECTOR } from './dom-geometry';
import { findEditorDOMRootRuntime } from './dom-root-runtime';
import { isEditorRoot, isFlowHost, TEXT_HOST } from './dom-text-freshness';

const PLITE_FRAGMENT_ATTRIBUTE_RE = /\bdata-editor-fragment\s*=/i;
const OPENING_HTML_TAG_RE = /<[A-Za-z][^<>]*?>/;
const DEFAULT_CLIPBOARD_FORMAT_KEY = 'x-editor-fragment';
const PLITE_FRAGMENT_FORMAT_ATTRIBUTE = 'data-editor-fragment-format';

const EDITOR_TO_CLIPBOARD_FORMAT_KEY = new WeakMap<object, string>();

/** Semantic commands that own DOM clipboard ingress. */
export const domCommands = Object.freeze({
  insertData: defineCommand<DataTransfer>('dom.insertData', {
    locate: false,
    build: ({ input, state }) => {
      const editor = getActiveCommandEditor();

      return getInstalledPlugin(editor, 'dom')
        ? createDOMDataTransactionSpec(editor, input, state)
        : false;
    },
  }),
});

export type ClipboardSliceRead<V extends Value = Value> =
  | Readonly<{ kind: 'absent' }>
  | Readonly<{ kind: 'invalid'; source: 'html' | 'mime' }>
  | Readonly<{ kind: 'slice'; slice: ContentSliceValue<V> }>;

export type ClipboardSliceWrite<V extends Value = Value> = Readonly<{
  formats?: Readonly<Record<string, string>>;
  slice: ContentSliceValue<V>;
}>;

const stripRenderOnlyLeafWrappers = (root: ParentNode, ui: Set<DOMNode>) => {
  const candidates = Array.from(
    root.querySelectorAll(
      '[data-editor-leaf] span:not([data-editor-string]):not([data-editor-zero-width])'
    )
  );

  candidates.forEach((candidate) => {
    if (candidate.closest('[data-editor-leaf]')) {
      const children = Array.from(candidate.childNodes);

      if (ui.has(candidate)) children.forEach((child) => ui.add(child));
      candidate.replaceWith(...children);
    }
  });
};

// Mounted views share the clipboard key of the runtime owner that activated
// the DOM plugin.
export const setDOMClipboardFormatKey = (
  editor: Editor<any, any>,
  clipboardFormatKey: string
) => {
  EDITOR_TO_CLIPBOARD_FORMAT_KEY.set(
    getEditorRuntimeOwner(editor),
    clipboardFormatKey
  );
};

export const clearDOMClipboardFormatKey = (editor: Editor<any, any>) => {
  EDITOR_TO_CLIPBOARD_FORMAT_KEY.delete(getEditorRuntimeOwner(editor));
};

/** Read the configured MIME suffix used for exact Plite clipboard payloads. */
export const getDOMClipboardFormatKey = (editor: Editor<any, any>) =>
  EDITOR_TO_CLIPBOARD_FORMAT_KEY.get(getEditorRuntimeOwner(editor)) ??
  DEFAULT_CLIPBOARD_FORMAT_KEY;

const escapeHtmlText = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const escapeHtmlAttribute = (text: string) =>
  escapeHtmlText(text).replaceAll('"', '&quot;');

const attachFragmentMetadataToHtml = (
  html: string,
  encoded: string,
  clipboardFormatKey: string
) => {
  const escapedEncoded = escapeHtmlAttribute(encoded);
  const escapedFormatKey = escapeHtmlAttribute(clipboardFormatKey);
  const attributes = ` data-editor-fragment="${escapedEncoded}" ${PLITE_FRAGMENT_FORMAT_ATTRIBUTE}="${escapedFormatKey}"`;

  if (
    html.includes(`data-editor-fragment="${escapedEncoded}"`) &&
    html.includes(`${PLITE_FRAGMENT_FORMAT_ATTRIBUTE}="${escapedFormatKey}"`)
  ) {
    return html;
  }

  if (PLITE_FRAGMENT_ATTRIBUTE_RE.test(html)) {
    return `<span${attributes}>${html}</span>`;
  }

  const openingTag = OPENING_HTML_TAG_RE.exec(html);

  if (!openingTag) return `<span${attributes}>${html}</span>`;

  const tag = openingTag[0];
  const insertionOffset = tag.endsWith('/>') ? tag.length - 2 : tag.length - 1;
  const markedTag = `${tag.slice(0, insertionOffset)}${attributes}${tag.slice(
    insertionOffset
  )}`;

  return `${html.slice(0, openingTag.index)}${markedTag}${html.slice(
    openingTag.index + tag.length
  )}`;
};

const preserveFragmentMetadataInTransferHtml = (
  data: Pick<DataTransfer, 'getData' | 'setData'>,
  encoded: string,
  clipboardFormatKey: string,
  writtenFormats: readonly string[]
) => {
  if (!writtenFormats.includes('text/html')) return;

  data.setData(
    'text/html',
    attachFragmentMetadataToHtml(
      data.getData('text/html'),
      encoded,
      clipboardFormatKey
    )
  );
};

const getFragmentLines = (nodes: readonly Descendant[]): string[] =>
  nodes.some((node) => PliteNode.isText(node))
    ? [nodes.map((node) => PliteNode.string(node)).join('')]
    : nodes.flatMap((node) =>
        PliteNode.isElement(node) ? getFragmentLines(node.children) : []
      );

const getFragmentText = <V extends Value>(slice: ContentSliceValue<V>) =>
  getFragmentLines(slice.content).join('\n');

const joinSliceContent = (
  left: readonly Descendant[],
  right: readonly Descendant[],
  depth: number
): readonly Descendant[] => {
  if (depth === 0) return [...left, ...right];

  const before = left.at(-1);
  const after = right[0];

  if (
    !before ||
    !after ||
    !PliteNode.isElement(before) ||
    !PliteNode.isElement(after)
  ) {
    throw new Error('Clipboard slices lost their shared element context.');
  }

  return [
    ...left.slice(0, -1),
    {
      ...before,
      children: joinSliceContent(before.children, after.children, depth - 1),
    },
    ...right.slice(1),
  ];
};

const joinSlices = <V extends Value>(
  parts: ReadonlyArray<{
    range: Range;
    slice: ContentSliceValue<V>;
  }>
): ContentSliceValue<V> => {
  const [first, ...rest] = parts;

  if (!first) return ContentSlice.empty;

  let previousRange = first.range;

  return rest.reduce<ContentSliceValue<V>>((result, part) => {
    const { slice } = part;
    const roots = { ...result.roots, ...slice.roots };
    const [, previousEnd] = RangeApi.edges(previousRange);
    const [nextStart] = RangeApi.edges(part.range);
    const sharedDepth = Math.min(
      result.openEnd,
      slice.openStart,
      PathApi.common(previousEnd.path, nextStart.path).length
    );

    previousRange = part.range;

    return ContentSlice.fromJSON<V>({
      content: joinSliceContent(result.content, slice.content, sharedDepth),
      openEnd: slice.openEnd,
      openStart: result.openStart,
      ...(Object.keys(roots).length > 0 ? { roots } : {}),
    });
  }, first.slice);
};

const laterPoint = (left: Point, right: Point) =>
  PointApi.isAfter(left, right) ? left : right;

const earlierPoint = (left: Point, right: Point) =>
  PointApi.isBefore(left, right) ? left : right;

const getModelSliceWithoutExcludedBoundaries = <V extends Value>(
  editor: DOMEditor<V>,
  range: Range,
  boundaries: readonly DOMCoverageBoundary[]
) => {
  const [selectionStart, selectionEnd] = RangeApi.edges(range);
  const exclusions = boundaries
    .filter((boundary) => boundary.copyPolicy === 'exclude')
    .flatMap((boundary) => boundary.coveredPathRanges)
    .flatMap(({ anchor, focus }) => {
      const startPath = PathApi.isBefore(anchor, focus) ? anchor : focus;
      const endPath = PathApi.isBefore(anchor, focus) ? focus : anchor;
      const start =
        editor.read.points.before(startPath) ??
        editor.read.points.start(startPath);
      const after = editor.read.points.after(endPath);
      const end = after ?? editor.read.points.end(endPath);

      return start && end ? [{ end, start }] : [];
    })
    .map(({ end, start }) => ({
      end: earlierPoint(end, selectionEnd),
      start: laterPoint(start, selectionStart),
    }))
    .filter(({ end, start }) => PointApi.isBefore(start, end))
    .sort((left, right) => PointApi.compare(left.start, right.start));
  const allowed: Range[] = [];
  let cursor = selectionStart;

  exclusions.forEach((exclusion) => {
    if (PointApi.isAfter(exclusion.start, cursor)) {
      allowed.push({ anchor: cursor, focus: exclusion.start });
    }
    if (PointApi.isAfter(exclusion.end, cursor)) {
      cursor = exclusion.end;
    }
  });
  if (PointApi.isBefore(cursor, selectionEnd)) {
    allowed.push({ anchor: cursor, focus: selectionEnd });
  }

  return joinSlices(
    allowed.map((allowedRange) => ({
      range: allowedRange,
      slice: editor.read.slice.export({ at: allowedRange }),
    }))
  );
};

/** HTML payload for a serialized Plite fragment. */
export type DOMFragmentDataHtml =
  | ((context: {
      clipboardFormatKey: string;
      encoded: string;
      text: string;
    }) => string)
  | string;

/** Payload written to browser clipboard data for a Plite fragment. */
export type DOMFragmentDataPayload<V extends Value = Value> = {
  clipboardFormatKey?: string;
  html: DOMFragmentDataHtml;
  slice: ContentSliceValue<V>;
  text?: string;
  window?: Pick<Window, 'btoa'>;
};

const DOM_FRAGMENT_DATA_VERSION = 1;

const stringifyDOMFragmentData = <V extends Value>(
  slice: ContentSliceValue<V>
) => {
  const nodes = new WeakSet<object>();
  const pending: Descendant[] = [...slice.content];

  for (const children of Object.values(slice.roots ?? {})) {
    pending.push(...children);
  }

  while (pending.length > 0) {
    const node = pending.pop() ?? failInvariant('Expected value to be defined');

    nodes.add(node);

    if (PliteNode.isElement(node)) {
      pending.push(...node.children);
    }
  }

  return JSON.stringify(
    { slice, version: DOM_FRAGMENT_DATA_VERSION },
    (_key, value: unknown) => {
      if (typeof value !== 'object' || value === null || !nodes.has(value)) {
        return value;
      }

      if (PliteNode.isText(value)) {
        const { text, ...props } = value;

        return { ...props, text };
      }

      if (!PliteNode.isElement(value)) return value;

      const { children, ...props } = value;

      return { ...props, children };
    }
  );
};

const encodeDOMFragmentData = <V extends Value>(
  slice: ContentSliceValue<V>,
  window?: Pick<Window, 'btoa'>
) => {
  const string = stringifyDOMFragmentData(slice);
  const btoa = window?.btoa ?? globalThis.btoa;

  return btoa(encodeURIComponent(string));
};

/** Write Plite fragment MIME, HTML, and plain-text clipboard payloads. */
export const writeDOMFragmentData = <V extends Value>(
  data: Pick<DataTransfer, 'setData'>,
  {
    clipboardFormatKey = DEFAULT_CLIPBOARD_FORMAT_KEY,
    html,
    slice,
    text,
    window,
  }: DOMFragmentDataPayload<V>
) => {
  const sourceSlice = ContentSlice.fromJSON<V>(slice);
  const sourceText = text ?? getFragmentText(sourceSlice);
  const encoded = encodeDOMFragmentData(sourceSlice, window);
  const htmlPayload =
    typeof html === 'function'
      ? html({ clipboardFormatKey, encoded, text: sourceText })
      : html;

  data.setData(`application/${clipboardFormatKey}`, encoded);
  data.setData('text/plain', sourceText);
  data.setData(
    'text/html',
    htmlPayload.length > 0
      ? attachFragmentMetadataToHtml(htmlPayload, encoded, clipboardFormatKey)
      : htmlPayload
  );

  return encoded;
};

/** Write one exact Plite slice plus every configured host representation. */
export const writeDOMDataTransferFragment = <V extends Value>(
  editor: DOMEditor<V>,
  data: Pick<DataTransfer, 'getData' | 'setData'>,
  payload: DOMFragmentDataPayload<V>,
  options: Readonly<{ explicitFormats?: readonly string[] }> = {}
) => {
  const clipboardFormatKey =
    payload.clipboardFormatKey ?? getDOMClipboardFormatKey(editor);
  const encoded = writeDOMFragmentData(data, {
    ...payload,
    clipboardFormatKey,
    window: payload.window ?? resolveLastEditorWindow(editor) ?? undefined,
  });

  const { explicitFormats } = options;
  const writtenFormats = writeDataTransferFragment(
    editor,
    {
      setData: (format, value) => {
        data.setData(format, value);
      },
    },
    payload.slice,
    { excludeMimeTypes: explicitFormats }
  );
  preserveFragmentMetadataInTransferHtml(
    data,
    encoded,
    clipboardFormatKey,
    writtenFormats
  );

  return encoded;
};

const decodeClipboardSlice = <V extends Value>(
  fragment: string,
  window?: Pick<Window, 'atob'>
): ContentSliceValue<V> | null => {
  try {
    const decoded = decodeURIComponent(
      (window?.atob ?? globalThis.atob)(fragment)
    );
    const parsed: unknown = JSON.parse(decoded);

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return null;
    }

    const envelope = parsed as Record<string, unknown>;
    const keys = Object.keys(envelope).sort();

    if (
      keys.length !== 2 ||
      keys[0] !== 'slice' ||
      keys[1] !== 'version' ||
      envelope.version !== DOM_FRAGMENT_DATA_VERSION
    ) {
      return null;
    }

    return ContentSlice.fromJSON<V>(envelope.slice);
  } catch {
    return null;
  }
};

const writeModelBackedRangeData = <V extends Value>(
  editor: DOMEditor<V>,
  data: Pick<DataTransfer, 'getData' | 'setData'>,
  clipboardFormatKey: string,
  range: NodeSelection | Range,
  slice = editor.read.slice.export({ at: range })
) => {
  writeDOMDataTransferFragment(editor, data, {
    clipboardFormatKey,
    html: ({ clipboardFormatKey: innerClipboardFormatKey, encoded, text }) => {
      const attributes = `data-editor-fragment="${encoded}" ${PLITE_FRAGMENT_FORMAT_ATTRIBUTE}="${escapeHtmlAttribute(
        innerClipboardFormatKey
      )}"`;
      const lines = text.split('\n');

      return lines.length === 1
        ? `<span ${attributes}>${escapeHtmlText(text)}</span>`
        : `<div ${attributes}>${lines
            .map((line) => `<div>${line ? escapeHtmlText(line) : '<br>'}</div>`)
            .join('')}</div>`;
    },
    slice,
  });
};

const LINE_BREAK_ZERO_WIDTH = 'n';

type CopyScope = 'structure' | 'text';

type CopyStep =
  | Readonly<{ kind: 'drop' | 'keep' }>
  | Readonly<{ host: boolean; kind: 'enter'; scope: CopyScope }>;

const DROP: CopyStep = { kind: 'drop' };
const KEEP: CopyStep = { kind: 'keep' };
const ENTER_ELEMENT_HOST: CopyStep = {
  host: true,
  kind: 'enter',
  scope: 'structure',
};
const ENTER_STRUCTURE: CopyStep = {
  host: false,
  kind: 'enter',
  scope: 'structure',
};
const ENTER_TEXT_HOST: CopyStep = { host: true, kind: 'enter', scope: 'text' };
const ENTER_TEXT: CopyStep = { host: false, kind: 'enter', scope: 'text' };

const stepInto = (element: Element, scope: CopyScope): CopyStep => {
  if (isEditorRoot(element)) return DROP;
  if (scope === 'text') {
    return element.matches(PLITE_STRING_SELECTOR) ? KEEP : ENTER_TEXT;
  }
  if (element.getAttribute('data-editor-node') === 'element') {
    return element.hasAttribute('data-editor-void') ? KEEP : ENTER_ELEMENT_HOST;
  }
  if (element.matches(TEXT_HOST)) {
    return isFlowHost(element) ? KEEP : ENTER_TEXT_HOST;
  }

  return element.hasAttribute('data-editor-external-text')
    ? KEEP
    : ENTER_STRUCTURE;
};

const readCopyScope = (node: DOMNode): CopyScope | null => {
  const chain: Element[] = [];

  for (
    let element = isDOMElement(node) ? node : node.parentElement;
    element;
    element = element.parentElement
  ) {
    if (isEditorRoot(element)) {
      let scope: CopyScope = 'structure';

      for (let index = chain.length - 1; index >= 0; index--) {
        const step = stepInto(chain[index], scope);

        if (step.kind !== 'enter') return null;
        ({ scope } = step);
      }

      return scope;
    }
    chain.push(element);
  }

  return null;
};

const holdsContent = (
  element: Element,
  scope: CopyScope,
  ui: Set<DOMNode>
): boolean => {
  const step = stepInto(element, scope);

  if (step.kind !== 'enter') return step.kind === 'keep';

  return markChildUI(element, step.scope, step.host, ui);
};

const markChildUI = (
  parent: ParentNode,
  scope: CopyScope,
  isHost: boolean,
  ui: Set<DOMNode>
) => {
  const drops: ChildNode[] = [];
  let holds = false;

  Array.from(parent.childNodes).forEach((child) => {
    if (isDOMElement(child) && holdsContent(child, scope, ui)) {
      holds = true;
    } else {
      drops.push(child);
    }
  });

  if (!holds && !isHost) return false;

  drops.forEach((child) => ui.add(child));
  return true;
};

const cloneWithWholeVoidEdges = (
  domRange: DOMRange,
  startVoid: DOMNode | null,
  endVoid: DOMNode | null
) => {
  const range = domRange.cloneRange();

  if (startVoid) range.setStartBefore(startVoid);
  if (endVoid) range.setEndAfter(endVoid);

  return {
    contents: range.cloneContents(),
    scope: readCopyScope(range.commonAncestorContainer),
  };
};

const markUI = (root: Element, scope: CopyScope | null) => {
  const ui = new Set<DOMNode>();

  if (scope) markChildUI(root, scope, true, ui);

  return ui;
};

const replaceZeroWidthSentinels = (root: ParentNode) => {
  root.querySelectorAll('[data-editor-zero-width]').forEach((zw) => {
    zw.textContent = '';

    if (zw.getAttribute('data-editor-zero-width') === LINE_BREAK_ZERO_WIDTH) {
      zw.append(zw.ownerDocument.createElement('br'));
    }
  });
};

const TRAILING_STRING = '[data-editor-string][data-editor-length]';

const stripRenderOnlyTrailingNewlines = (
  root: ParentNode,
  domRange: DOMRange
) => {
  const strings = Array.from(root.querySelectorAll(TRAILING_STRING));
  const { endContainer } = domRange;

  if (
    isDOMText(endContainer) &&
    endContainer.parentElement?.closest(TRAILING_STRING)
  ) {
    strings.pop();
  }
  strings.forEach((string) => {
    const text = string.lastChild;

    if (isDOMText(text) && text.nodeValue?.endsWith('\n')) {
      text.nodeValue = text.nodeValue.slice(0, -1);
    }
  });
};

const stripEditorAttributes = (root: ParentNode) => {
  root.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach(({ name }) => {
      if (name.startsWith('data-editor-')) element.removeAttribute(name);
    });
  });
};

const getDefaultFragmentAttach = (contents: DocumentFragment) => {
  let attach: ChildNode | null = contents.childNodes[0] ?? null;

  contents.childNodes.forEach((node) => {
    if (node.textContent && node.textContent.trim() !== '') {
      attach = node;
    }
  });

  return attach;
};

export const writeDOMSelectionData = <V extends Value>(
  editor: DOMEditor<V>,
  data: Pick<DataTransfer, 'getData' | 'setData'>
) => {
  const selection = getEditorSelection(editor);

  if (!selection) return undefined;

  return writeDOMRangeData(editor, data, selection, {
    slice: editor.read.slice.export(),
  });
};

/** Write clipboard payloads for one model range without changing selection. */
export const writeDOMRangeData = <V extends Value>(
  editor: DOMEditor<V>,
  data: Pick<DataTransfer, 'getData' | 'setData'>,
  range: NodeSelection | Range,
  options: Readonly<{
    coverage?: DOMCoverageSession;
    slice?: ContentSliceValue<V>;
  }> = {}
) => {
  const clipboardFormatKey = getDOMClipboardFormatKey(editor);

  if (SelectionApi.isNode(range)) {
    writeModelBackedRangeData(
      editor,
      data,
      clipboardFormatKey,
      range,
      options.slice
    );
    return undefined;
  }

  const [start, end] = RangeApi.edges(range);
  const startVoid = editorVoid(editor, { at: start.path });
  const endVoid = editorVoid(editor, { at: end.path });

  if (RangeApi.isCollapsed(range) && !startVoid) {
    return undefined;
  }

  const coverage =
    options.coverage ?? findEditorDOMRootRuntime(editor)?.domCoverage;
  const coveredBoundaries = coverage?.getBoundariesForRange(range) ?? [];
  const hasPolicyBoundaries = coveredBoundaries.length > 0;

  if (hasPolicyBoundaries) {
    const slice = getModelSliceWithoutExcludedBoundaries(
      editor,
      range,
      coveredBoundaries
    );

    writeModelBackedRangeData(editor, data, clipboardFormatKey, range, slice);
    return undefined;
  }

  // Clone the range so the encoded fragment can be recovered from HTML paste.
  const domRange = DOMEditor.resolveDOMRange(editor, range);

  if (!domRange) {
    writeModelBackedRangeData(
      editor,
      data,
      clipboardFormatKey,
      range,
      options.slice
    );
    return undefined;
  }
  const { contents, scope } = cloneWithWholeVoidEdges(
    domRange,
    startVoid ? DOMEditor.resolveDOMNode(editor, startVoid[0]) : null,
    endVoid ? DOMEditor.resolveDOMNode(editor, endVoid[0]) : null
  );

  stripRenderOnlyTrailingNewlines(contents, domRange);

  let attach = getDefaultFragmentAttach(contents);

  if (startVoid) {
    attach =
      contents.querySelector('[data-editor-spacer]') ??
      contents.querySelector(
        '[data-editor-node="element"], [data-editor-node="text"], [data-editor-string], [data-editor-zero-width]'
      ) ??
      attach;
  }

  replaceZeroWidthSentinels(contents);

  const div = contents.ownerDocument.createElement('div');

  div.appendChild(contents);
  div.setAttribute('hidden', 'true');
  div.ownerDocument.body.appendChild(div);

  const ui = markUI(div, scope);

  stripRenderOnlyLeafWrappers(div, ui);

  const text = getPlainText(div, ui);

  // Set a `data-editor-fragment` attribute on a non-empty node, so it shows up
  // in the HTML, and can be used for intra-Plite pasting. If it's a text
  // node, wrap it in a `<span>` so we have something to set an attribute on.
  if (isDOMText(attach)) {
    const span = attach.ownerDocument.createElement('span');
    // COMPAT: In Chrome and Safari, if we don't add the `white-space` style
    // then leading and trailing spaces will be ignored. (2017/09/21)
    span.style.whiteSpace = 'pre';
    span.appendChild(attach);
    div.appendChild(span);
    attach = span;
  }

  let attachElement: Element;

  if (isDOMElement(attach)) {
    attachElement = attach;
  } else {
    const span = div.ownerDocument.createElement('span');

    if (attach) {
      span.appendChild(attach);
    }

    div.appendChild(span);
    attachElement = span;
  }

  stripEditorAttributes(div);
  writeDOMDataTransferFragment(editor, data, {
    clipboardFormatKey,
    html: ({ encoded }) => {
      attachElement.setAttribute('data-editor-fragment', encoded);
      attachElement.setAttribute(
        PLITE_FRAGMENT_FORMAT_ATTRIBUTE,
        clipboardFormatKey
      );

      return div.innerHTML;
    },
    text,
    slice: options.slice ?? editor.read.slice.export({ at: range }),
  });
  div.remove();
  return data;
};

export const insertDOMData = <V extends Value>(
  editor: DOMEditor<V>,
  data: DataTransfer
): boolean | undefined => dispatchCommand(editor, domCommands.insertData, data);

/** Interpret DOM data into one unpublished transaction spec. */
export const createDOMDataTransactionSpec = <V extends Value>(
  editor: Editor<V, any>,
  data: DataTransfer,
  state: EditorStateView<V, any>
) => {
  const slice = readDOMFragmentData(editor as DOMEditor<V>, data);

  if (slice) {
    const { result } = evaluateCommandWithState(
      editor,
      editorCommands.replaceSlice,
      state,
      { slice }
    );

    // The exact editor fragment needs no decoder, so it reports nothing.
    if (result !== false) return recordDataTransferOutcome(editor, result);
  }

  return createDataTransferTransactionSpec(editor, data, { state });
};

export const readDOMFragmentData = <V extends Value>(
  editor: DOMEditor<V>,
  data: Pick<DataTransfer, 'getData'> & Partial<Pick<DataTransfer, 'types'>>,
  clipboardFormatKey = getDOMClipboardFormatKey(editor)
): ContentSliceValue<V> | null => {
  const fragment = readClipboardFragmentPayload(data, clipboardFormatKey);

  if (fragment?.value) {
    const slice = decodeClipboardSlice<V>(
      fragment.value,
      resolveLastEditorWindow(editor) ?? undefined
    );

    return slice ? importContentSlice(editor, slice) : null;
  }

  return null;
};

/** Read an exact Plite clipboard envelope without weakening malformed claims. */
export const readDOMClipboardSlice = <V extends Value>(
  editor: DOMEditor<V>,
  data: Pick<DataTransfer, 'getData' | 'types'>
): ClipboardSliceRead<V> => {
  const clipboardFormatKey = getDOMClipboardFormatKey(editor);
  const payload = readClipboardFragmentPayload(data, clipboardFormatKey);

  if (!payload) return Object.freeze({ kind: 'absent' });
  const decoded = payload.value
    ? decodeClipboardSlice<V>(
        payload.value,
        resolveLastEditorWindow(editor) ?? undefined
      )
    : null;
  const slice = decoded ? importContentSlice(editor, decoded) : null;

  return slice
    ? Object.freeze({ kind: 'slice', slice })
    : Object.freeze({ kind: 'invalid', source: payload.source });
};

/** Write one exact Plite slice plus optional DataTransfer formats. */
export const writeDOMClipboardSlice = <V extends Value>(
  editor: DOMEditor<V>,
  data: Pick<DataTransfer, 'getData' | 'setData'>,
  { formats = {}, slice }: ClipboardSliceWrite<V>
) => {
  const {
    'text/html': html = '',
    'text/plain': text,
    ...extraFormats
  } = formats;

  writeDOMDataTransferFragment(
    editor,
    data,
    { html, slice, text },
    { explicitFormats: Object.keys(formats) }
  );
  Object.entries(extraFormats).forEach(([format, value]) => {
    data.setData(format, value);
  });
};

export const insertDOMFragmentData = <V extends Value>(
  editor: DOMEditor<V>,
  data: DataTransfer
): boolean | undefined => {
  const slice = readDOMFragmentData(editor, data);

  if (slice) {
    return dispatchCommand(editor, editorCommands.replaceSlice, {
      slice,
    });
  }

  return false;
};

export const insertDOMTextData = <V extends Value>(
  editor: DOMEditor<V>,
  data: DataTransfer
): boolean | undefined =>
  insertDataTransfer(editor, data, { mimeType: 'text/plain' });
