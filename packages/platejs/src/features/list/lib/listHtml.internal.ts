import type { HtmlMappingDiagnosticInput } from '../../../lib/plugin/PluginFormatContext';
import { isHtmlBlockElement } from '../../../lib/plugins/html/htmlDom';
import { toIndentLevel } from '../../indent/lib/indentLevel.internal';

export const isHtmlList = (node: globalThis.Node) =>
  node.nodeName === 'UL' || node.nodeName === 'OL';

const HTML_MEDIA =
  'img, picture, video, audio, iframe, embed, object, svg, canvas';

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
  report: (diagnostic: HtmlMappingDiagnosticInput) => void
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
