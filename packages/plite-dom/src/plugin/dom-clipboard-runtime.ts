import { dispatchCommand, void as editorVoid } from '@platejs/plite/internal';
import {
  ContentSlice,
  type ContentSlice as ContentSliceValue,
  type Descendant,
  editorCommands,
  NodeApi as PliteNode,
  type Range,
  RangeApi,
  type Value,
} from '@platejs/plite';
import {
  getPlainText,
  getPliteFragmentAttribute,
  isDOMElement,
  isDOMText,
} from '../utils/dom';
import { DOMCoverage } from './dom-coverage';
import { DOMEditor } from './dom-editor';
import { insertHostData, writeHostFragmentData } from './host-codec';

const PLITE_FRAGMENT_ATTRIBUTE_RE = /\bdata-plite-fragment\s*=/i;
const OPENING_HTML_TAG_RE = /<[A-Za-z][^<>]*?>/;
const DEFAULT_CLIPBOARD_FORMAT_KEY = 'x-plite-fragment';
const PLITE_FRAGMENT_FORMAT_ATTRIBUTE = 'data-plite-fragment-format';

const EDITOR_TO_CLIPBOARD_FORMAT_KEY = new WeakMap<object, string>();

const stripRenderOnlyLeafWrappers = (root: ParentNode) => {
  const candidates = Array.from(
    root.querySelectorAll(
      '[data-plite-leaf] span:not([data-plite-string]):not([data-plite-zero-width])'
    )
  );

  candidates.forEach((candidate) => {
    if (candidate.closest('[data-plite-leaf]')) {
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
  const attributes = ` data-plite-fragment="${escapedEncoded}" ${PLITE_FRAGMENT_FORMAT_ATTRIBUTE}="${escapedFormatKey}"`;

  if (
    html.includes(`data-plite-fragment="${escapedEncoded}"`) &&
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
  const markedTag = `${tag.slice(0, insertionOffset)}${attributes}${tag.slice(insertionOffset)}`;

  return `${html.slice(0, openingTag.index)}${markedTag}${html.slice(openingTag.index + tag.length)}`;
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

  while (pending.length > 0) {
    const node = pending.pop()!;

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
    attachFragmentMetadataToHtml(htmlPayload, encoded, clipboardFormatKey)
  );

  return encoded;
};

/** Write one exact Plite slice plus every configured host representation. */
export const writeDOMHostFragmentData = <V extends Value>(
  editor: DOMEditor<V>,
  data: Pick<DataTransfer, 'getData' | 'setData'>,
  payload: DOMFragmentDataPayload<V>
) => {
  const clipboardFormatKey =
    payload.clipboardFormatKey ?? getDOMClipboardFormatKey(editor);
  let window = payload.window;

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

  preserveFragmentMetadataInHostHtml(
    data,
    encoded,
    clipboardFormatKey,
    writeHostFragmentData(editor, data, payload.slice)
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
  range: Range
) => {
  const slice = editor.read.slice.get({ at: range });

  writeDOMHostFragmentData(editor, data, {
    clipboardFormatKey,
    html: ({ clipboardFormatKey, encoded, text }) =>
      `<span data-plite-fragment="${encoded}" ${PLITE_FRAGMENT_FORMAT_ATTRIBUTE}="${escapeHtmlAttribute(clipboardFormatKey)}">${escapeHtmlText(text)}</span>`,
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
  const selection = editor.read((state) => state.selection());

  if (!selection) return;

  return writeDOMRangeData(editor, data, selection);
};

/** Write clipboard payloads for one model range without changing selection. */
export const writeDOMRangeData = <V extends Value>(
  editor: DOMEditor<V>,
  data: Pick<DataTransfer, 'getData' | 'setData'>,
  range: Range
) => {
  const clipboardFormatKey = getDOMClipboardFormatKey(editor);

  const [start, end] = RangeApi.edges(range);
  const startVoid = editorVoid(editor, { at: start.path });
  const endVoid = editorVoid(editor, { at: end.path });

  if (RangeApi.isCollapsed(range) && !startVoid) {
    return;
  }

  let coveredBoundaries = DOMCoverage.getBoundariesForRange(editor, range);
  const materializedBoundaryIds = new Set<string>();

  for (const boundary of coveredBoundaries) {
    if (boundary.copyPolicy === 'materialize') {
      const result = DOMCoverage.materializeBoundary(
        editor,
        boundary.boundaryId,
        'copy',
        {
          range,
        }
      );

      if (result.status === 'handled') {
        materializedBoundaryIds.add(boundary.boundaryId);
      }
    }
  }

  if (materializedBoundaryIds.size > 0) {
    coveredBoundaries = DOMCoverage.getBoundariesForRange(editor, range);
  }

  const hasPolicyBoundaries = coveredBoundaries.length > 0;
  const shouldWriteModelBackedSelection = coveredBoundaries.some(
    (boundary) =>
      boundary.copyPolicy === 'model' ||
      (boundary.copyPolicy === 'materialize' &&
        materializedBoundaryIds.has(boundary.boundaryId))
  );

  if (shouldWriteModelBackedSelection) {
    writeModelBackedRangeData(editor, data, clipboardFormatKey, range);
    return;
  }

  // Clone the range so the encoded fragment can be recovered from HTML paste.
  const domRange = DOMEditor.resolveDOMRange(editor, range);

  if (!domRange) {
    if (hasPolicyBoundaries) {
      return;
    }

    writeModelBackedRangeData(editor, data, clipboardFormatKey, range);
    return;
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
      contents.querySelector('[data-plite-spacer]') ??
      contents.querySelector(
        '[data-plite-node="element"], [data-plite-node="text"], [data-plite-string], [data-plite-zero-width]'
      ) ??
      attach;
  }

  // Remove any zero-width space spans from the cloned DOM so that they don't
  // show up elsewhere when pasted.
  Array.from(contents.querySelectorAll('[data-plite-zero-width]')).forEach(
    (zw) => {
      const isNewline = zw.getAttribute('data-plite-zero-width') === 'n';
      zw.textContent = isNewline ? '\n' : '';
    }
  );

  stripRenderOnlyLeafWrappers(contents);

  // Set a `data-plite-fragment` attribute on a non-empty node, so it shows up
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
    const slice = editor.read.slice.get({ at: range });

    writeDOMHostFragmentData(editor, data, {
      clipboardFormatKey,
      html: ({ encoded }) => {
        attachElement.setAttribute('data-plite-fragment', encoded);
        attachElement.setAttribute(
          PLITE_FRAGMENT_FORMAT_ATTRIBUTE,
          clipboardFormatKey
        );

        return div.innerHTML;
      },
      text: getPlainText(div),
      slice,
    });
  } else {
    data.setData('text/html', div.innerHTML);
    data.setData('text/plain', getPlainText(div));
  }
  contents.ownerDocument.body.removeChild(div);
  return data;
};

export const insertDOMData = <V extends Value>(
  editor: DOMEditor<V>,
  data: DataTransfer
): boolean => {
  if (insertDOMFragmentData(editor, data)) return true;

  return insertHostData(editor, data);
};

export const readDOMFragmentData = <V extends Value>(
  editor: DOMEditor<V>,
  data: Pick<DataTransfer, 'getData'>,
  clipboardFormatKey = getDOMClipboardFormatKey(editor)
): ContentSliceValue<V> | null => {
  const fragment =
    data.getData(`application/${clipboardFormatKey}`) ||
    getPliteFragmentAttribute(data, clipboardFormatKey);

  if (fragment) {
    let window: Pick<Window, 'atob'> | undefined;

    try {
      window = DOMEditor.getWindow(editor);
    } catch {
      // Headless host adapters use the ambient decoder.
    }

    return decodeClipboardSlice(fragment, window);
  }

  return null;
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
