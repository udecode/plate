import { inlineTagNames } from './inlineTagNames';

/** Check if an element is a block-level element. */
const isBlockElement = (node: Node | null): boolean => {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) return false;

  const element = node as Element;
  return !inlineTagNames.has(element.tagName);
};

/**
 * Preprocess HTML to remove BR tags between block elements. This handles the
 * case where Google Docs adds BR tags between paragraphs.
 */
export const preprocessGoogleDocsBr = (element: HTMLElement): HTMLElement => {
  const clonedElement = element.cloneNode(true) as HTMLElement;

  const processNode = (node: Node) => {
    // Process all child nodes recursively
    const childNodes = Array.from(node.childNodes);

    childNodes.forEach((child, index) => {
      if (child.nodeName === 'BR') {
        const brElement = child as HTMLBRElement;

        // Always remove Apple-interchange-newline BR tags
        if (brElement.className === 'Apple-interchange-newline') {
          child.remove();
          return;
        }

        // Check if this BR is between block elements
        let prevBlock = null;
        let nextBlock = null;

        // Look for previous block element
        for (let i = index - 1; i >= 0; i--) {
          const node = childNodes[i];
          if (
            node.nodeType === Node.TEXT_NODE &&
            node.textContent?.trim() === ''
          ) {
            continue; // Skip whitespace text nodes
          }
          if (isBlockElement(node)) {
            prevBlock = node;
          }
          break;
        }

        // Look for next block element
        for (let i = index + 1; i < childNodes.length; i++) {
          const node = childNodes[i];
          if (
            node.nodeType === Node.TEXT_NODE &&
            node.textContent?.trim() === ''
          ) {
            continue; // Skip whitespace text nodes
          }
          if (isBlockElement(node)) {
            nextBlock = node;
          }
          break;
        }

        // Remove BR if it's between two block elements or at the end after a block
        if (
          (prevBlock && nextBlock) ||
          (prevBlock && index === childNodes.length - 1)
        ) {
          child.remove();
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        processNode(child);
      }
    });
  };

  processNode(clonedElement);

  return clonedElement;
};
