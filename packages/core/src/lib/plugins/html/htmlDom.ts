const INLINE_TAG_NAMES = new Set([
  'A',
  'ABBR',
  'ACRONYM',
  'B',
  'BDI',
  'BDO',
  'BIG',
  'BR',
  'BUTTON',
  'CANVAS',
  'CITE',
  'CODE',
  'CONTENT',
  'DATA',
  'DEL',
  'DFN',
  'EM',
  'EMBED',
  'FONT',
  'I',
  'IFRAME',
  'IMG',
  'INPUT',
  'INS',
  'KBD',
  'LABEL',
  'MAP',
  'MARK',
  'MARQUEE',
  'math',
  'MENUITEM',
  'METER',
  'NOBR',
  'OBJECT',
  'OUTPUT',
  'PICTURE',
  'PORTAL',
  'PROGRESS',
  'Q',
  'S',
  'SAMP',
  'SELECT',
  'SHADOW',
  'SMALL',
  'SOURCE',
  'SPAN',
  'STRIKE',
  'STRONG',
  'SUB',
  'SUP',
  'svg',
  'TEXTAREA',
  'TIME',
  'TRACK',
  'TT',
  'U',
  'VAR',
  'VIDEO',
  'WBR',
]);

export const isHtmlComment = (node: Node): node is Comment =>
  node.nodeType === Node.COMMENT_NODE;

export const isHtmlElement = (node: Node): node is Element =>
  node.nodeType === Node.ELEMENT_NODE;

export const isHtmlText = (node: Node): node is Text =>
  node.nodeType === Node.TEXT_NODE;

/**
 * Return whether a DOM node participates in an inline formatting context.
 *
 * The fallback tag list mirrors browser defaults. An explicit `display` style
 * wins, including inherited and special CSS values.
 */
export const isHtmlInlineElement = (node: Node): boolean => {
  if (!isHtmlElement(node)) return false;

  const element = node as HTMLElement;
  const tagNameIsInline = INLINE_TAG_NAMES.has(element.tagName);
  const display = element.style.display.split(' ')[0];

  if (display === '') return tagNameIsInline;
  if (display.startsWith('inline')) return true;
  if (display === 'inherit' && element.parentElement) {
    return isHtmlInlineElement(element.parentElement);
  }
  if (
    ['contents', 'initial', 'none', 'revert', 'revert-layer', 'unset'].includes(
      display
    )
  ) {
    return tagNameIsInline;
  }

  return false;
};

export const isHtmlBlockElement = (node: Node): boolean =>
  isHtmlElement(node) && !isHtmlInlineElement(node);

/**
 * Traverse a DOM tree depth-first while remaining stable when callbacks unwrap
 * nodes or replace sibling lists.
 */
export const traverseHtmlNode = (
  node: Node,
  callback: (node: Node) => boolean
): void => {
  if (!callback(node)) return;

  let child = node.firstChild;

  while (child) {
    const currentChild = child;
    const previousChild = child.previousSibling;
    child = child.nextSibling;

    traverseHtmlNode(currentChild, callback);

    if (
      !currentChild.previousSibling &&
      !currentChild.nextSibling &&
      !currentChild.parentNode &&
      child &&
      previousChild !== child.previousSibling &&
      child.parentNode
    ) {
      child = previousChild ? previousChild.nextSibling : node.firstChild;
    } else if (
      !currentChild.previousSibling &&
      !currentChild.nextSibling &&
      !currentChild.parentNode &&
      child &&
      !child.previousSibling &&
      !child.nextSibling &&
      !child.parentNode
    ) {
      if (previousChild) {
        child = previousChild.nextSibling
          ? previousChild.nextSibling.nextSibling
          : null;
      } else if (node.firstChild) {
        child = node.firstChild.nextSibling;
      }
    }
  }
};

export const traverseHtmlElements = (
  rootNode: Node,
  callback: (node: Element) => boolean
): void => {
  traverseHtmlNode(rootNode, (node) =>
    isHtmlElement(node) ? callback(node) : true
  );
};

export const someHtmlElement = (
  rootNode: Node,
  predicate: (node: HTMLElement) => boolean
): boolean => {
  let found = false;

  traverseHtmlElements(rootNode, (node) => {
    if (found) return false;

    found = predicate(node as HTMLElement);

    return !found;
  });

  return found;
};

export const getHtmlComments = (node: Node): string[] => {
  const comments: string[] = [];
  const iterator = document.createNodeIterator(node, NodeFilter.SHOW_COMMENT, {
    acceptNode: () => NodeFilter.FILTER_ACCEPT,
  });
  let currentNode = iterator.nextNode();

  while (currentNode) {
    if (currentNode.nodeValue) comments.push(currentNode.nodeValue);

    currentNode = iterator.nextNode();
  }

  return comments;
};

/** Remove each range delimited by matching HTML comments. */
export const removeHtmlNodesBetweenComments = (
  rootNode: Node,
  start: string,
  end: string
): void => {
  const isClosingComment = (node: Node) =>
    isHtmlComment(node) && node.data === end;

  traverseHtmlNode(rootNode, (node) => {
    if (!isHtmlComment(node)) return true;

    if (node.data === start) {
      let sibling = node.nextSibling;

      node.remove();

      while (sibling && !isClosingComment(sibling)) {
        const { nextSibling } = sibling;

        sibling.remove();
        sibling = nextSibling;
      }

      if (sibling && isClosingComment(sibling)) sibling.remove();
    }

    return true;
  });
};

/** Replace a DOM element while preserving its attributes and contents. */
export const replaceTagName = (element: Element, tagName: string): Element => {
  const replacement = document.createElement(tagName);

  replacement.innerHTML = element.innerHTML;

  for (const { name, value } of element.attributes) {
    replacement.setAttribute(name, value);
  }

  element.parentNode?.replaceChild(replacement, element);

  return replacement;
};

/** Trim HTML, remove zero-width spaces, and wrap it with a body element. */
export const postCleanHtml = (html: string): string =>
  `<body>${html.trim().replaceAll('\u200B', '')}</body>`;
