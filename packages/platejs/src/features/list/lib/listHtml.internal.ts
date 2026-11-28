import {
  type EditorDocumentValue,
  type Element,
  PLUGINS,
  type RootKey,
} from '../../../core';
import type { HtmlPrepareDiagnosticInput } from '../../../lib/plugin/BasePlugin';
import {
  isHtmlBlockElement,
  traverseHtmlElements,
} from '../../../lib/plugins/html/htmlDom';
import { toIndentLevel } from '../../indent/lib/indentLevel.internal';
import { createListId } from './listIdentity.internal';
import {
  getDocumentListOrdinal,
  isListLevels,
  isListOrdinal,
  isListType,
  type LIST_FIELDS,
  normalizeListStyle,
} from './listIndex.internal';

export const isHtmlList = (node: globalThis.Node) =>
  node.nodeName === 'UL' || node.nodeName === 'OL';

const HTML_MEDIA =
  'img, picture, video, audio, iframe, embed, object, svg, canvas, math';

const isVisibleHtml = (node: globalThis.Node) =>
  !!node.textContent?.trim() ||
  (node.nodeType === 1 &&
    ((node as globalThis.Element).matches(HTML_MEDIA) ||
      !!(node as globalThis.Element).querySelector(HTML_MEDIA)));

/**
 * Give an HTML list item its level and keep only its leading text or first
 * block in it; everything after moves out, the shape Plate writes and
 * Markdown decodes. A nested list keeps the depth its position gives it; any
 * other block lands one level deeper with no list properties.
 */
export const flattenHtmlListItem = (
  listItem: HTMLElement,
  imagesAreBlocks: boolean,
  report: (diagnostic: HtmlPrepareDiagnosticInput) => void
) => {
  const isItemBlock = (node: globalThis.Node) =>
    isHtmlBlockElement(node) || (imagesAreBlocks && node.nodeName === 'IMG');
  // Decoding applies an ancestor's style to the text inside it, so content
  // that leaves the element loses that style. List and Indent read an item's
  // list style and left margin themselves, and no HTML mapping reads padding
  // or the other margins.
  const reportDroppedStyle = (element: HTMLElement) => {
    const declarations: string[] = [];

    for (let index = 0; index < element.style.length; index++) {
      const name = element.style.item(index);

      if (!/^(list-style|margin|padding)/.test(name)) {
        declarations.push(`${name}: ${element.style.getPropertyValue(name)}`);
      }
    }
    if (declarations.length > 0) {
      report({
        action: 'dropped',
        element,
        kind: 'style',
        message: `List HTML dropped the style "${declarations.join('; ')}" of <${element.tagName.toLowerCase()}> when it moved what the element held.`,
      });
    }
  };
  // A div, a section or a custom element that holds a block only groups an
  // item's blocks, and decoding keeps its children, not it. One of text is a
  // line of its own, and one with a data attribute may carry what a mapping
  // reads or the HTML runtime reports.
  const unwrapHtmlWrappers = (parent: globalThis.Element) => {
    Array.from(parent.children).forEach((child) => {
      if (
        !(
          child.nodeName === 'DIV' ||
          child.nodeName === 'SECTION' ||
          /[-:]/.test(child.nodeName)
        ) ||
        Array.from(child.attributes).some(({ name }) =>
          name.startsWith('data-')
        ) ||
        !Array.from(child.childNodes).some(isItemBlock)
      ) {
        return;
      }
      unwrapHtmlWrappers(child);
      reportDroppedStyle(child as HTMLElement);
      child.replaceWith(...Array.from(child.childNodes));
    });
  };
  let depth = 0;

  // A list inside a quote or a table cell starts its own depth.
  for (
    let parent = listItem.parentElement;
    parent && (isHtmlList(parent) || parent.nodeName === 'LI');
    parent = parent.parentElement
  ) {
    if (isHtmlList(parent)) depth += 1;
  }

  const level =
    toIndentLevel(Number(listItem.dataset.indent)) ??
    toIndentLevel(Number(listItem.getAttribute('aria-level'))) ??
    toIndentLevel(depth);

  if (level) listItem.dataset.indent = String(level);
  unwrapHtmlWrappers(listItem);

  // Whitespace at an item's edge or beside a block is source formatting, not
  // text.
  Array.from(listItem.childNodes).forEach((node) => {
    if (
      node.nodeType === 3 &&
      !node.textContent?.trim() &&
      (!node.previousSibling ||
        isItemBlock(node.previousSibling) ||
        !node.nextSibling ||
        isItemBlock(node.nextSibling))
    ) {
      node.remove();
    }
  });

  const children = Array.from(listItem.childNodes);
  const first = children.findIndex(isItemBlock);

  if (first === -1) return;

  const kept =
    children.slice(0, first).some(isVisibleHtml) || isHtmlList(children[first])
      ? null
      : children[first];
  const moved: ChildNode[] = [];
  let run: ChildNode[] = [];
  const flushRun = () => {
    if (run.some(isVisibleHtml)) {
      const paragraph = listItem.ownerDocument.createElement('p');

      paragraph.append(...run);
      moved.push(paragraph);
    } else {
      run.forEach((node) => node.remove());
    }
    run = [];
  };

  children.slice(kept ? first + 1 : first).forEach((child) => {
    if (!isItemBlock(child)) {
      run.push(child);
      return;
    }
    flushRun();
    if (child.nodeName === 'P' && !isVisibleHtml(child)) {
      child.remove();
      return;
    }
    moved.push(child);
  });
  flushRun();

  const blocks = moved.filter((child) => !isHtmlList(child));

  blocks.forEach((child) => {
    (child as HTMLElement).dataset.indent = String((level ?? 1) + 1);
  });
  if (blocks.length > 0) reportDroppedStyle(listItem);
  listItem.after(...moved);

  // Decoding an item's paragraph that holds an image or another block splits
  // it, and the item's list properties then reach none of the pieces.
  if (kept?.nodeName === 'P') kept.replaceWith(...Array.from(kept.childNodes));
};

const BULLETED_LIST_STYLES = [
  'disc',
  'circle',
  'square',
  'disclosure-open',
  'disclosure-closed',
] as const;

const readListLevels = (value: string | undefined) => {
  try {
    const parsed: unknown = JSON.parse(value ?? '');

    return isListLevels(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

export const decodeListHtmlProperties = ({
  element,
  preserve,
}: {
  element: HTMLElement;
  preserve: (...attributes: readonly string[]) => void;
}) => {
  const listParent = element.closest('ul, ol') as HTMLElement | null;
  const readNumber = (value: null | string | undefined) => {
    if (!value) return undefined;
    const parsed = Number(value);

    return isListOrdinal(parsed) ? parsed : undefined;
  };
  const checkedValue = element.dataset.checked;
  const checked =
    checkedValue === '' || checkedValue === 'true'
      ? true
      : checkedValue === 'false'
        ? false
        : undefined;
  const encodedListType = isListType(element.dataset.listType)
    ? element.dataset.listType
    : undefined;
  const listStart = readNumber(element.dataset.listStart);
  const listRestart = readNumber(element.dataset.listRestart);
  const listStyle =
    element.dataset.listStyle ||
    element.style.listStyleType ||
    listParent?.style.listStyleType ||
    undefined;
  const standaloneListType = listParent
    ? undefined
    : listStyle === undefined ||
        BULLETED_LIST_STYLES.some((style) => style === listStyle)
      ? 'bulleted'
      : 'numbered';
  const listType = encodedListType
    ? encodedListType
    : checked !== undefined
      ? 'task'
      : listParent?.tagName === 'OL'
        ? 'numbered'
        : listParent?.tagName === 'UL'
          ? 'bulleted'
          : standaloneListType;
  const normalizedListStyle = listType
    ? normalizeListStyle(listType, listStyle)
    : listStyle;
  const listLevels = readListLevels(element.dataset.listLevels);

  if (checked !== undefined) preserve('data-checked');
  if (listRestart !== undefined) preserve('data-list-restart');
  if (listStart !== undefined) preserve('data-list-start');
  if (element.dataset.listId !== undefined) preserve('data-list-id');
  if (listLevels !== undefined) preserve('data-list-levels');
  if (element.dataset.listStyle) preserve('data-list-style');
  if (encodedListType) preserve('data-list-type');

  return {
    ...(checked === undefined ? {} : { checked }),
    // prepareDocument gave every list a fresh id for this conversion.
    ...(element.dataset.listId ? { listId: element.dataset.listId } : {}),
    ...(listLevels === undefined ? {} : { listLevels }),
    // An encoded start stays on any kind, latent until the item numbers.
    ...(listRestart === undefined ? {} : { listRestart }),
    ...(listStart === undefined ? {} : { listStart }),
    ...(normalizedListStyle ? { listStyle: normalizedListStyle } : {}),
    ...(listType ? { listType } : {}),
  };
};

// One fresh id per source list in each conversion, so a paste never joins
// an unrelated list that shares an id.
const assignHtmlListIds = (body: HTMLElement) => {
  const fresh = new Map<string, string>();
  const remapped = (source: string) => {
    let id = fresh.get(source);

    if (!id) {
      id = createListId();
      fresh.set(source, id);
    }

    return id;
  };

  for (const element of Array.from(
    body.querySelectorAll<HTMLElement>('[data-list-id]')
  )) {
    element.dataset.listId = remapped(element.dataset.listId ?? '');
  }

  const nestedOwners = new Set<globalThis.Element>();
  const previousByIndent = new Map<
    string,
    { id: string; next: number; owner: globalThis.Element | null }
  >();

  for (const list of Array.from(body.querySelectorAll<HTMLElement>('ol, ul'))) {
    const listItems = Array.from(list.children).filter(
      (child): child is HTMLElement => child.tagName === 'LI'
    );

    if (list.dataset.listId !== undefined && listItems.length > 0) {
      for (const { dataset } of listItems) {
        dataset.listId ??= list.dataset.listId;
        if (list.dataset.listLevels && dataset.listId === list.dataset.listId) {
          dataset.listLevels ??= list.dataset.listLevels;
        }
      }
      delete list.dataset.listId;
      delete list.dataset.listLevels;
      continue;
    }

    const items = listItems.filter(({ dataset }) => !dataset.listId);

    if (items.length === 0) continue;

    let owner = list.parentElement?.closest('ol, ul')
      ? list.previousElementSibling
      : null;

    // The item's later blocks sit between it and its nested list.
    while (owner && owner.tagName !== 'LI' && !isHtmlList(owner)) {
      owner = owner.previousElementSibling;
    }

    const start = Number(list.getAttribute('start') ?? 1);
    const indent = items[0].dataset.indent ?? '1';
    const previous = previousByIndent.get(indent);
    const continues =
      list.tagName === 'OL' &&
      previous?.owner === owner &&
      start === previous.next;
    let id: string | undefined;

    if (owner?.tagName === 'LI' && !nestedOwners.has(owner)) {
      nestedOwners.add(owner);
      id = (owner as HTMLElement).dataset.listId;
    } else if (continues) {
      ({ id } = previous);
    }
    id ??= createListId();
    if (
      list.tagName === 'OL' &&
      !continues &&
      start !== 1 &&
      isListOrdinal(start)
    ) {
      items[0].dataset.listStart ??= String(start);
    }
    for (const listItem of items) listItem.dataset.listId = id;
    if (list.tagName === 'OL') {
      previousByIndent.set(indent, {
        id,
        next: start + items.length,
        owner,
      });
    }
  }
};

export const prepareListHtmlDocument = ({
  document,
  registry,
  report,
}: {
  document: Document;
  registry: { has: (key: string) => boolean };
  report: (diagnostic: HtmlPrepareDiagnosticInput) => void;
}) => {
  const { body } = document;

  if (!body.querySelector('ul, ol, li, [data-list-id]')) return;

  // The registry static kit draws an item's list inside its block,
  // as h2 > ol > li or pre > code > ol > li.
  const moveOut = (list: globalThis.Element) => {
    const host = list.parentElement;
    const item = list.firstElementChild;

    if (
      !host ||
      !item ||
      !(host.tagName === 'CODE'
        ? host.parentElement?.tagName === 'PRE'
        : /^(BLOCKQUOTE|H[1-6]|PRE)$/u.test(host.tagName)) ||
      Array.from(host.childNodes).some(
        (node) =>
          node !== list &&
          (node.nodeName !== '#text' || node.textContent?.trim())
      )
    ) {
      return undefined;
    }
    host.replaceWith(list);
    host.replaceChildren(...Array.from(item.childNodes));
    item.append(host);

    return host;
  };

  for (const list of Array.from(
    body.querySelectorAll('ul[data-list-id], ol[data-list-id]')
  )) {
    if (
      list.children.length !== 1 ||
      list.firstElementChild?.tagName !== 'LI'
    ) {
      continue;
    }
    if (
      moveOut(list)?.tagName === 'CODE' &&
      list.parentElement?.tagName === 'PRE'
    ) {
      moveOut(list);
    }
  }

  const imagesAreBlocks = registry.has(PLUGINS.image);
  const listItems: HTMLElement[] = [];
  traverseHtmlElements(body, (element) => {
    if (element.tagName === 'LI') {
      listItems.push(element as HTMLElement);
    }
    return true;
  });
  listItems.forEach((listItem) =>
    flattenHtmlListItem(listItem, imagesAreBlocks, report)
  );

  traverseHtmlElements(body, (element) => {
    if (element.tagName === 'LI') {
      const htmlElement = element as HTMLElement;

      if (htmlElement.dataset.listStyle) return false;

      const listStyle = htmlElement.style.listStyleType;
      if (listStyle) {
        htmlElement.dataset.listStyle = listStyle;
      } else {
        const listParent = element.closest('ul, ol');
        if (listParent) {
          const parentListStyle = (listParent as HTMLElement).style
            .listStyleType;
          if (parentListStyle) {
            htmlElement.dataset.listStyle = parentListStyle;
          }
        }
      }
      return false;
    }
    return true;
  });

  assignHtmlListIds(body);
};

export const encodeListHtml = <TContent>({
  content,
  document,
  node,
  preserve,
  root,
}: {
  content: TContent;
  document: EditorDocumentValue;
  node: Element;
  preserve: (...keys: ReadonlyArray<(typeof LIST_FIELDS)[number]>) => void;
  root: RootKey;
}) => {
  preserve(
    'checked',
    'listId',
    'listLevels',
    'listRestart',
    'listStart',
    'listStyle',
    'listType'
  );
  const checked = typeof node.checked === 'boolean' ? node.checked : undefined;
  const listRestart = isListOrdinal(node.listRestart)
    ? node.listRestart
    : undefined;
  const listStart = isListOrdinal(node.listStart) ? node.listStart : undefined;
  const listStyle =
    typeof node.listStyle === 'string' ? node.listStyle : undefined;
  const listType = isListType(node.listType) ? node.listType : undefined;
  const ordinal = getDocumentListOrdinal(document, root, node);

  return {
    attributes: {
      start:
        listType === 'numbered'
          ? (ordinal ?? listRestart ?? listStart)
          : undefined,
    },
    children: [
      {
        attributes: {
          'data-checked': checked === undefined ? undefined : String(checked),
          'data-indent':
            typeof node.indent === 'number' ? node.indent : undefined,
          // An empty id marks the root's default list, so a paste keeps
          // those items in one list instead of regrouping them by element.
          'data-list-id': typeof node.listId === 'string' ? node.listId : '',
          'data-list-levels': isListLevels(node.listLevels)
            ? JSON.stringify(node.listLevels)
            : undefined,
          'data-list-restart': listRestart,
          'data-list-start': listStart,
          'data-list-style': listStyle,
          'data-list-type': listType,
        },
        children: content,
        patchTarget: true as const,
        tag: 'li' as const,
      },
    ],
    style: {
      listStyleType: listStyle,
    },
    tag: listType === 'numbered' ? ('ol' as const) : ('ul' as const),
  };
};
