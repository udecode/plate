import { type Descendant, defineEditorExtension } from '@platejs/plite';
import { jsx } from '@platejs/plite-hyperscript';

import type {
  CustomEditor,
  CustomElement,
  CustomElementType,
  CustomText,
} from './custom-types.d';

interface ElementAttributes {
  type: CustomElementType;
  align?: string;
  language?: string;
  url?: string;
}

// Google Docs often emits `<b>` for styling that should not become a bold mark.
interface TextAttributes {
  backgroundColor?: string;
  code?: boolean;
  color?: string;
  fontSize?: string;
  strikethrough?: boolean;
  subscript?: boolean;
  superscript?: boolean;
  italic?: boolean;
  bold?: boolean;
  underline?: boolean;
}

type DeserializedChild = string | Descendant;
type DeserializedResult = DeserializedChild | DeserializedChild[] | null;

const ELEMENT_TAGS: Record<string, (el: HTMLElement) => ElementAttributes> = {
  A: (el) => ({ type: 'link', url: el.getAttribute('href')! }),
  BLOCKQUOTE: () => ({ type: 'block-quote' }),
  H1: () => ({ type: 'heading-one' }),
  H2: () => ({ type: 'heading-two' }),
  H3: () => ({ type: 'heading-three' }),
  H4: () => ({ type: 'heading-four' }),
  H5: () => ({ type: 'heading-five' }),
  H6: () => ({ type: 'heading-six' }),
  IMG: (el) => ({ type: 'image', url: el.getAttribute('src')! }),
  LI: () => ({ type: 'list-item' }),
  OL: () => ({ type: 'numbered-list' }),
  P: (el) => elementAttributes({ type: 'paragraph' }, el),
  PRE: () => ({ type: 'code-block' }),
  TABLE: () => ({ type: 'table' }),
  TD: () => ({ type: 'table-cell' }),
  TH: () => ({ type: 'table-cell' }),
  TR: () => ({ type: 'table-row' }),
  UL: () => ({ type: 'bulleted-list' }),
};

const TEXT_TAGS: Record<string, () => TextAttributes> = {
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  SUB: () => ({ subscript: true }),
  SUP: () => ({ superscript: true }),
  U: () => ({ underline: true }),
};

const INLINE_ELEMENT_TYPES = new Set<CustomElementType>(['link']);
const LIST_STRUCTURE_TAGS = new Set(['LI', 'OL', 'UL']);
const IGNORED_TAGS = new Set(['COL', 'COLGROUP', 'META', 'SCRIPT', 'STYLE']);
const LIST_TEXT_BOUNDARY_TAGS = new Set(['DIV']);
const ELEMENT_ALIGN_VALUES = new Set(['center', 'justify', 'left', 'right']);
const CODE_LINE_BOUNDARY_TAGS = new Set(['DIV', 'P']);
const CODE_WHITE_SPACE_VALUES = new Set(['pre', 'pre-wrap', 'break-spaces']);

const hasTextAttributes = (attrs: TextAttributes) =>
  Object.keys(attrs).length > 0;

const normalizeFontSize = (fontSize: string) => {
  const value = fontSize.trim();

  return /^\d+(\.\d+)?(px|pt|em|rem|%)$/i.test(value) ? value : undefined;
};

const normalizeCssColor = (color: string) => {
  const value = color.trim();

  return value ? value : undefined;
};

const getElementAlign = (el: HTMLElement) => {
  const value = (el.style.textAlign || el.getAttribute('align') || '')
    .trim()
    .toLowerCase();

  return ELEMENT_ALIGN_VALUES.has(value) ? value : undefined;
};

export const isPlainTextClipboardHtml = (html: string, text: string) => {
  if (!text || html === text) {
    return !!text;
  }

  const parsed = new DOMParser().parseFromString(html, 'text/html');

  return parsed.body.textContent === text && parsed.body.children.length === 0;
};

const elementAttributes = (
  attrs: ElementAttributes,
  el: HTMLElement
): ElementAttributes => {
  const align = getElementAlign(el);

  return align ? { ...attrs, align } : attrs;
};

const isExplicitNonBoldFontWeight = (fontWeight: string) => {
  const value = fontWeight.trim().toLowerCase();

  if (!value) {
    return false;
  }

  if (value === 'normal' || value === 'lighter') {
    return true;
  }

  const parsedFontWeight = Number.parseInt(value, 10);

  return Number.isFinite(parsedFontWeight) && parsedFontWeight < 600;
};

const getTextTagAttributes = (
  nodeName: string,
  el: HTMLElement
): TextAttributes => {
  if (nodeName === 'B') {
    return isExplicitNonBoldFontWeight(el.style.fontWeight)
      ? {}
      : { bold: true };
  }

  return TEXT_TAGS[nodeName]?.() ?? {};
};

const getStyledTextAttributes = (el: HTMLElement): TextAttributes => {
  const attrs: TextAttributes = {};
  const {
    backgroundColor,
    color,
    fontSize,
    fontStyle,
    fontWeight,
    textDecorationLine,
    verticalAlign,
  } = el.style;
  const parsedFontWeight = Number.parseInt(fontWeight, 10);
  const normalizedBackgroundColor = normalizeCssColor(backgroundColor);
  const normalizedColor = normalizeCssColor(color);
  const normalizedFontSize = normalizeFontSize(fontSize);

  if (isExplicitNonBoldFontWeight(fontWeight)) {
    attrs.bold = false;
  } else if (
    fontWeight === 'bold' ||
    fontWeight === 'bolder' ||
    parsedFontWeight >= 600
  ) {
    attrs.bold = true;
  }

  if (fontStyle === 'normal') {
    attrs.italic = false;
  } else if (fontStyle === 'italic' || fontStyle === 'oblique') {
    attrs.italic = true;
  }

  if (textDecorationLine.includes('underline')) {
    attrs.underline = true;
  }

  if (textDecorationLine.includes('line-through')) {
    attrs.strikethrough = true;
  }

  if (verticalAlign === 'super') {
    attrs.superscript = true;
  } else if (verticalAlign === 'sub') {
    attrs.subscript = true;
  }

  if (normalizedBackgroundColor) {
    attrs.backgroundColor = normalizedBackgroundColor;
  }

  if (normalizedColor) {
    attrs.color = normalizedColor;
  }

  if (normalizedFontSize) {
    attrs.fontSize = normalizedFontSize;
  }

  return attrs;
};

const isTextDescendant = (child: DeserializedChild): child is CustomText =>
  typeof child === 'object' &&
  child != null &&
  'text' in child &&
  !('children' in child);

const isElementDescendant = (
  child: DeserializedChild
): child is CustomElement =>
  typeof child === 'object' && child != null && 'children' in child;

const isDescendant = (child: DeserializedChild): child is Descendant =>
  typeof child === 'object' &&
  child != null &&
  ('text' in child || 'children' in child);

const applyTextAttributes = (
  children: DeserializedChild[],
  attrs: TextAttributes
): DeserializedChild[] => {
  if (!hasTextAttributes(attrs)) {
    return children;
  }

  return children.map((child) => {
    if (typeof child === 'string') {
      return jsx('text', attrs, child);
    }

    if (isTextDescendant(child)) {
      return { ...attrs, ...child };
    }

    if (isElementDescendant(child)) {
      return {
        ...child,
        children: applyTextAttributes(child.children, attrs).filter(
          isDescendant
        ),
      };
    }

    return child;
  });
};

const normalizeInlineChildren = (children: DeserializedChild[]) =>
  children.map((child) =>
    typeof child === 'string' ? jsx('text', {}, child) : child
  );

const getGitHubCodeLineElements = (el: HTMLElement) =>
  Array.from(el.querySelectorAll<HTMLElement>('.blob-code-inner.js-file-line'));

const normalizeCodeText = (text: string) =>
  text.replaceAll('\u00a0', ' ').replace(/\r\n?/g, '\n').replace(/\n+$/g, '');

const isPreservedWhiteSpaceElement = (el: HTMLElement) => {
  if (el.nodeName === 'PRE' || el.nodeName === 'CODE') {
    return true;
  }

  return CODE_WHITE_SPACE_VALUES.has(el.style.whiteSpace.trim().toLowerCase());
};

const shouldPreserveTextNewlines = (node: ChildNode) => {
  let parent = node.parentElement;

  while (parent) {
    if (isPreservedWhiteSpaceElement(parent)) {
      return true;
    }

    if (parent.nodeName === 'BODY') {
      return false;
    }

    parent = parent.parentElement;
  }

  return false;
};

const normalizeTextNode = (node: ChildNode) => {
  const text = node.textContent ?? '';

  if (shouldPreserveTextNewlines(node)) {
    return text;
  }

  const normalized = text.replace(/\r\n?/g, '\n').replaceAll('\n', '');

  if (node.parentElement?.nodeName === 'LI' && text.includes('\n')) {
    return normalized.trim();
  }

  return normalized;
};

const collectInlineCodeText = (node: ChildNode): string => {
  if (node.nodeType === 3) {
    return node.textContent ?? '';
  }

  if (node.nodeType !== 1) {
    return '';
  }

  const el = node as HTMLElement;

  if (el.nodeName === 'BR') {
    return '\n';
  }

  return Array.from(el.childNodes).map(collectInlineCodeText).join('');
};

const getDirectCodeLineChildren = (el: HTMLElement) =>
  Array.from(el.children).filter((child) =>
    CODE_LINE_BOUNDARY_TAGS.has(child.nodeName)
  );

const collectCodeSourceText = (el: HTMLElement) => {
  const githubCodeLines = getGitHubCodeLineElements(el);

  if (githubCodeLines.length > 0) {
    return normalizeCodeText(
      githubCodeLines.map((line) => collectInlineCodeText(line)).join('\n')
    );
  }

  const directCodeLineChildren = getDirectCodeLineChildren(el);

  if (directCodeLineChildren.length > 1) {
    return normalizeCodeText(
      directCodeLineChildren
        .map((line) => collectInlineCodeText(line))
        .join('\n')
    );
  }

  return normalizeCodeText(collectInlineCodeText(el));
};

const hasCodeWhiteSpace = (el: HTMLElement) => {
  const whiteSpace = el.style.whiteSpace.trim().toLowerCase();

  return CODE_WHITE_SPACE_VALUES.has(whiteSpace);
};

const isCodeSourceElement = (el: HTMLElement) => {
  if (getGitHubCodeLineElements(el).length > 0) {
    return true;
  }

  if (el.nodeName === 'PRE') {
    return true;
  }

  if (el.nodeName === 'CODE') {
    return collectCodeSourceText(el).includes('\n');
  }

  return hasCodeWhiteSpace(el) && getDirectCodeLineChildren(el).length > 1;
};

const createCodeBlockElement = (text: string) =>
  jsx(
    'element',
    { language: 'text', type: 'code-block' },
    jsx('text', {}, text)
  );

const isTopLevelBlock = (node: unknown): node is CustomElement =>
  typeof node === 'object' &&
  node != null &&
  'children' in node &&
  'type' in node &&
  !INLINE_ELEMENT_TYPES.has((node as CustomElement).type);

const getMeaningfulChildren = (children: DeserializedChild[]) =>
  children.filter(
    (child) => !(typeof child === 'string' && child.trim() === '')
  );

const isOnlyLineBreakChildren = (children: DeserializedChild[]) =>
  children.length > 0 &&
  children.every(
    (child) =>
      typeof child === 'string' && child.replace(/\n/g, '').trim() === ''
  );

const isLineBreakOnlyString = (child: unknown): child is string =>
  typeof child === 'string' &&
  child.includes('\n') &&
  child.replace(/\n/g, '').trim() === '';

const createEmptyParagraph = () => ({
  type: 'paragraph',
  children: [{ text: '' }],
});

const deserializeChild = (
  child: ChildNode,
  index: number,
  siblings: ChildNode[],
  parentNodeName: string
): DeserializedChild[] => {
  const value = deserialize(child);
  const values = Array.isArray(value) ? value : value == null ? [] : [value];
  const meaningfulValues = getMeaningfulChildren(values);

  if (
    child.nodeType === 1 &&
    parentNodeName === 'LI' &&
    LIST_TEXT_BOUNDARY_TAGS.has(child.nodeName) &&
    (index > 0 || index < siblings.length - 1)
  ) {
    if (
      meaningfulValues.length > 0 &&
      meaningfulValues.every(isTopLevelBlock)
    ) {
      return meaningfulValues;
    }

    return [
      jsx('element', { type: 'paragraph' }, normalizeInlineChildren(values)),
    ];
  }

  return values;
};

const isListItemElement = (node: unknown): node is CustomElement =>
  isTopLevelBlock(node) && node.type === 'list-item';

const getCommentBoundedFragmentRoot = (body: HTMLElement): HTMLElement => {
  const walker = body.ownerDocument.createTreeWalker(body, 128);
  let start: Comment | null = null;
  let end: Comment | null = null;

  while (walker.nextNode()) {
    const comment = walker.currentNode as Comment;
    const marker = comment.nodeValue?.trim().toLowerCase();

    if (marker === 'startfragment') {
      start = comment;
      continue;
    }

    if (marker === 'endfragment' && start) {
      end = comment;
      break;
    }
  }

  if (!start || !end) {
    return body;
  }

  const range = body.ownerDocument.createRange();
  range.setStartAfter(start);
  range.setEndBefore(end);

  const root = body.ownerDocument.createElement('div');
  root.appendChild(range.cloneContents());

  return root;
};

const normalizeBodyFragment = (children: DeserializedChild[]): Descendant[] => {
  const fragment: Descendant[] = [];
  let inlineChildren: DeserializedChild[] = [];
  let orphanListItems: CustomElement[] = [];

  const flushInlineChildren = () => {
    if (inlineChildren.length === 0) {
      return;
    }

    fragment.push({
      type: 'paragraph',
      children: normalizeInlineChildren(inlineChildren),
    });
    inlineChildren = [];
  };

  const flushOrphanListItems = () => {
    if (orphanListItems.length === 0) {
      return;
    }

    fragment.push({
      type: 'bulleted-list',
      children: orphanListItems,
    });
    orphanListItems = [];
  };

  for (const child of children) {
    if (typeof child === 'string' && child.trim() === '') {
      if (isLineBreakOnlyString(child)) {
        flushInlineChildren();
        flushOrphanListItems();

        for (const character of child) {
          if (character === '\n') {
            fragment.push(createEmptyParagraph());
          }
        }
      }

      continue;
    }

    if (isTopLevelBlock(child)) {
      flushInlineChildren();

      if (isListItemElement(child)) {
        orphanListItems.push(child);
        continue;
      }

      flushOrphanListItems();
      fragment.push(child);
      continue;
    }

    flushOrphanListItems();
    inlineChildren.push(child);
  }

  flushInlineChildren();
  flushOrphanListItems();

  return fragment;
};

export const deserialize = (
  el: HTMLElement | ChildNode
): DeserializedResult => {
  if (el.nodeType === 3) {
    return normalizeTextNode(el);
  }
  if (el.nodeType !== 1) {
    return null;
  }
  if (el.nodeName === 'BR') {
    return '\n';
  }

  const { nodeName } = el;
  if (IGNORED_TAGS.has(nodeName)) {
    return null;
  }

  if (isCodeSourceElement(el as HTMLElement)) {
    return createCodeBlockElement(collectCodeSourceText(el as HTMLElement));
  }

  let parent = el;

  if (
    nodeName === 'PRE' &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === 'CODE'
  ) {
    parent = el.childNodes[0];
  }
  const childNodes = Array.from(parent.childNodes);
  let children = childNodes
    .flatMap((child, index) =>
      deserializeChild(child, index, childNodes, parent.nodeName)
    )
    .filter((child) => child != null);

  if (children.length === 0) {
    children = [{ text: '' }];
  }

  children = applyTextAttributes(children, {
    ...getTextTagAttributes(nodeName, el as HTMLElement),
    ...getStyledTextAttributes(el as HTMLElement),
  });

  if (nodeName === 'P') {
    if (children.length === 1 && children[0] === '\n') {
      children = [{ text: '' }];
    }

    const meaningfulChildren = getMeaningfulChildren(children);

    if (
      meaningfulChildren.length > 0 &&
      meaningfulChildren.every(isTopLevelBlock)
    ) {
      return meaningfulChildren;
    }
  }

  if (nodeName === 'DIV') {
    if (isOnlyLineBreakChildren(children)) {
      return jsx('element', { type: 'paragraph' }, jsx('text', {}, ''));
    }

    return jsx('fragment', {}, normalizeBodyFragment(children));
  }

  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, normalizeBodyFragment(children));
  }

  if (LIST_STRUCTURE_TAGS.has(nodeName)) {
    children = getMeaningfulChildren(children);

    if (children.length === 0) {
      children = [{ text: '' }];
    }
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el as HTMLElement);
    return jsx('element', attrs, children);
  }

  return children;
};

const insertHtmlData = (editor: CustomEditor, data: DataTransfer) => {
  const html = data.getData('text/html');

  if (!html) {
    return false;
  }

  const hasPlainText = Array.from(data.types).includes('text/plain');
  const text = hasPlainText ? data.getData('text/plain') : '';

  // Prediction/autocorrect paste can carry plain text as identical or wrapper-only HTML.
  if (isPlainTextClipboardHtml(html, text)) {
    return false;
  }

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const deserialized = deserialize(getCommentBoundedFragmentRoot(parsed.body));
  const fragment = (
    Array.isArray(deserialized)
      ? deserialized
      : deserialized == null
        ? []
        : [deserialized]
  ).filter(isDescendant);
  editor.update((tx) => {
    tx.fragment.insert(fragment);
  });
  return true;
};

export const html = () =>
  defineEditorExtension<CustomEditor>()({
    name: 'paste-html',
    clipboard: {
      insertData(data, { editor, next }) {
        return insertHtmlData(editor, data) || next();
      },
    },
    elements: [
      { inline: true, type: 'link' },
      { type: 'image', void: 'block' },
    ],
  });
