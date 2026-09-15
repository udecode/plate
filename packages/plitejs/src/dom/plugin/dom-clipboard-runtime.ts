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
import { getInstalledPlugin } from '../../core/plugin';
import {
  getSelection as getEditorSelection,
  void as editorVoid,
} from '../../interfaces/editor';
import { failInvariant } from '../../internal/fail-invariant';
import {
  getPlainText,
  readClipboardFragmentPayload,
  isDOMElement,
  isDOMText,
} from '../utils/dom';
import type { DOMCoverageBoundary, DOMCoverageSession } from './dom-coverage';
import { DOMEditor } from './dom-editor';
import { findEditorDOMRootRuntime } from './dom-root-runtime';
import {
  createHostDataTransactionSpec,
  insertHostData,
  writeHostFragmentData,
} from './host-codec';

const PLITE_FRAGMENT_ATTRIBUTE_RE = /\bdata-editor-fragment\s*=/i;
const OPENING_HTML_TAG_RE = /<[A-Za-z][^<>]*?>/;
const DEFAULT_CLIPBOARD_FORMAT_KEY = 'x-editor-fragment';
const PLITE_FRAGMENT_FORMAT_ATTRIBUTE = 'data-editor-fragment-format';

const EDITOR_TO_CLIPBOARD_FORMAT_KEY = new WeakMap<object, string>();

/** Semantic commands that own DOM clipboard ingress. */
export const domCommands = Object.freeze({
  insertData: defineCommand<DataTransfer>('dom.insertData', {
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

const stripRenderOnlyLeafWrappers = (root: ParentNode) => {
  const candidates = Array.from(
    root.querySelectorAll(
      '[data-editor-leaf] span:not([data-editor-string]):not([data-editor-zero-width])'
    )
  );

  candidates.forEach((candidate) => {
    if (candidate.closest('[data-editor-leaf]')) {
      candidate.replaceWith(...Array.from(candidate.childNodes));
    }
  });
};

export const setDOMClipboardFormatKey = (
  editor: object,
  clipboardFormatKey: string
) => {
  EDITOR_TO_CLIPBOARD_FORMAT_KEY.set(editor, clipboardFormatKey);
};

export const clearDOMClipboardFormatKey = (editor: object) => {
  EDITOR_TO_CLIPBOARD_FORMAT_KEY.delete(editor);
};

/** Read the configured MIME suffix used for exact Plite clipboard payloads. */
export const getDOMClipboardFormatKey = (editor: object) =>
  EDITOR_TO_CLIPBOARD_FORMAT_KEY.get(editor) ?? DEFAULT_CLIPBOARD_FORMAT_KEY;

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

const preserveFragmentMetadataInHostHtml = (
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

const getFragmentText = <V extends Value>(slice: ContentSliceValue<V>) =>
  slice.content.map((node) => PliteNode.string(node)).join('\n');

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
export const writeDOMHostFragmentData = <V extends Value>(
  editor: DOMEditor<V>,
  data: Pick<DataTransfer, 'getData' | 'setData'>,
  payload: DOMFragmentDataPayload<V>,
  options: Readonly<{ explicitFormats?: readonly string[] }> = {}
) => {
  const clipboardFormatKey =
    payload.clipboardFormatKey ?? getDOMClipboardFormatKey(editor);
  let { window } = payload;

  if (!window) {
    try {
      window = DOMEditor.getWindow(editor);
    } catch {
      // Headless host adapters use the ambient encoder.
    }
  }
  const encoded = writeDOMFragmentData(data, {
    ...payload,
    clipboardFormatKey,
    window,
  });

  const { explicitFormats } = options;
  const writtenFormats = writeHostFragmentData(
    editor,
    {
      setData: (format, value) => {
        data.setData(format, value);
      },
    },
    payload.slice,
    { excludeFormats: explicitFormats }
  );
  preserveFragmentMetadataInHostHtml(
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
  writeDOMHostFragmentData(editor, data, {
    clipboardFormatKey,
    html: ({ clipboardFormatKey: innerClipboardFormatKey, encoded, text }) =>
      `<span data-editor-fragment="${encoded}" ${PLITE_FRAGMENT_FORMAT_ATTRIBUTE}="${escapeHtmlAttribute(
        innerClipboardFormatKey
      )}">${escapeHtmlText(text)}</span>`,
    slice,
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
    if (hasPolicyBoundaries) {
      return undefined;
    }

    writeModelBackedRangeData(
      editor,
      data,
      clipboardFormatKey,
      range,
      options.slice
    );
    return undefined;
  }
  let contents = domRange.cloneContents();
  let attach = getDefaultFragmentAttach(contents);

  // COMPAT: Void selections can be anchored in their hidden spacer DOM. Clone
  // the full void element so external HTML payloads include visible content.
  if (startVoid || endVoid) {
    const r = domRange.cloneRange();

    if (startVoid) {
      const [voidNode] = startVoid;
      const domNode = DOMEditor.assertDOMNode(editor, voidNode);
      r.setStartBefore(domNode);
    }

    if (endVoid) {
      const [voidNode] = endVoid;
      const domNode = DOMEditor.assertDOMNode(editor, voidNode);
      r.setEndAfter(domNode);
    }

    contents = r.cloneContents();
    attach = getDefaultFragmentAttach(contents);
  }

  // COMPAT: If the start node is a void node, we need to attach the encoded
  // fragment to the void node's content node instead of the spacer, because
  // attaching it to empty `<div>/<span>` nodes will end up having it erased by
  // most browsers. (2018/04/27)
  if (startVoid) {
    attach =
      contents.querySelector('[data-editor-spacer]') ??
      contents.querySelector(
        '[data-editor-node="element"], [data-editor-node="text"], [data-editor-string], [data-editor-zero-width]'
      ) ??
      attach;
  }

  // Remove any zero-width space spans from the cloned DOM so that they don't
  // show up elsewhere when pasted.
  Array.from(contents.querySelectorAll('[data-editor-zero-width]')).forEach(
    (zw) => {
      const isNewline = zw.getAttribute('data-editor-zero-width') === 'n';
      zw.textContent = isNewline ? '\n' : '';
    }
  );

  stripRenderOnlyLeafWrappers(contents);

  // Set a `data-editor-fragment` attribute on a non-empty node, so it shows up
  // in the HTML, and can be used for intra-Plite pasting. If it's a text
  // node, wrap it in a `<span>` so we have something to set an attribute on.
  if (isDOMText(attach)) {
    const span = attach.ownerDocument.createElement('span');
    // COMPAT: In Chrome and Safari, if we don't add the `white-space` style
    // then leading and trailing spaces will be ignored. (2017/09/21)
    span.style.whiteSpace = 'pre';
    span.appendChild(attach);
    contents.appendChild(span);
    attach = span;
  }

  let attachElement: Element;

  if (isDOMElement(attach)) {
    attachElement = attach;
  } else {
    const span = contents.ownerDocument.createElement('span');

    if (attach) {
      span.appendChild(attach);
    }

    contents.appendChild(span);
    attachElement = span;
  }

  // Add the content to a <div> so that we can get its inner HTML.
  const div = contents.ownerDocument.createElement('div');
  div.appendChild(contents);
  div.setAttribute('hidden', 'true');
  contents.ownerDocument.body.appendChild(div);

  if (!hasPolicyBoundaries) {
    const slice = options.slice ?? editor.read.slice.export({ at: range });

    writeDOMHostFragmentData(editor, data, {
      clipboardFormatKey,
      html: ({ encoded }) => {
        attachElement.setAttribute('data-editor-fragment', encoded);
        attachElement.setAttribute(
          PLITE_FRAGMENT_FORMAT_ATTRIBUTE,
          clipboardFormatKey
        );

        return div.innerHTML;
      },
      text: getPlainText(div),
      slice,
    });
  }
  div.remove();
  return data;
};

export const insertDOMData = <V extends Value>(
  editor: DOMEditor<V>,
  data: DataTransfer
): boolean => dispatchCommand(editor, domCommands.insertData, data);

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

    if (result !== false) return result;
  }

  return createHostDataTransactionSpec(editor, data, { state });
};

export const readDOMFragmentData = <V extends Value>(
  editor: DOMEditor<V>,
  data: Pick<DataTransfer, 'getData'> & Partial<Pick<DataTransfer, 'types'>>,
  clipboardFormatKey = getDOMClipboardFormatKey(editor)
): ContentSliceValue<V> | null => {
  const fragment = readClipboardFragmentPayload(data, clipboardFormatKey);

  if (fragment?.value) {
    let window: Pick<Window, 'atob'> | undefined;

    try {
      window = DOMEditor.getWindow(editor);
    } catch {
      // Headless host adapters use the ambient decoder.
    }

    return decodeClipboardSlice(fragment.value, window);
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
  let window: Pick<Window, 'atob'> | undefined;

  try {
    window = DOMEditor.getWindow(editor);
  } catch {
    // Headless host adapters use the ambient decoder.
  }

  const slice = payload.value
    ? decodeClipboardSlice<V>(payload.value, window)
    : null;

  return slice
    ? Object.freeze({ kind: 'slice', slice })
    : Object.freeze({ kind: 'invalid', source: payload.source });
};

/** Write one exact Plite slice plus optional host formats. */
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

  writeDOMHostFragmentData(
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
): boolean => {
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
): boolean => insertHostData(editor, data, { format: 'text/plain' });
