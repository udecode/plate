import { isDOMElement, isDOMText } from '../utils/dom';
import { getPliteTextHostStrings } from './dom-geometry';
import { getDOMTextFlowRestoreSegments } from './dom-text-flow-index';

export const formatDOMStringText = (text: string, isTrailing: boolean) =>
  `${text}${isTrailing ? '\n' : ''}`;

export const formatDisplayedDOMStringData = (
  modelText: string,
  hasTrailingDisplayNewline: boolean
) => {
  if (modelText === '') return '\uFEFF';

  return hasTrailingDisplayNewline ? `${modelText}\n` : modelText;
};

const readDeclaredStringLength = (stringElement: Element) => {
  const lengthAttribute = stringElement.getAttribute('data-editor-length');

  if (lengthAttribute == null) return null;

  const parsed = Number.parseInt(lengthAttribute, 10);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const readLeafSliceBounds = (stringElement: Element) => {
  const leaf = stringElement.closest('[data-editor-leaf-start]');
  const startAttr = leaf?.getAttribute('data-editor-leaf-start');
  const endAttr = leaf?.getAttribute('data-editor-leaf-end');
  const start = startAttr == null ? null : Number.parseInt(startAttr, 10);
  const end = endAttr == null ? null : Number.parseInt(endAttr, 10);

  if (
    start === null ||
    end === null ||
    !Number.isFinite(start) ||
    !Number.isFinite(end)
  ) {
    return null;
  }

  return { end, start };
};

export const readDOMStringModelText = (
  stringElement: Element,
  rawText?: string
) => {
  const text = (rawText ?? stringElement.textContent ?? '').replaceAll(
    '\uFEFF',
    ''
  );

  if (stringElement.hasAttribute('data-editor-zero-width')) {
    return text;
  }

  const expectedLength = readDeclaredStringLength(stringElement);

  if (
    expectedLength !== null &&
    text.length === expectedLength + 1 &&
    text.endsWith('\n\n')
  ) {
    return text.slice(0, expectedLength);
  }

  return text;
};

export const isCanonicalDOMTextHostDisplay = (
  textHost: Element,
  target: Node,
  modelText: string
): boolean => {
  const targetElement = isDOMText(target)
    ? target.parentElement
    : isDOMElement(target)
      ? target
      : null;
  const targetString = targetElement?.closest<HTMLElement>(
    '[data-editor-string], [data-editor-zero-width]'
  );

  if (!targetString || !textHost.contains(targetString)) {
    return false;
  }

  const strings = getPliteTextHostStrings(textHost);

  if (strings.length === 0) {
    return false;
  }

  if (strings.length === 1) {
    if (strings[0] !== targetString) {
      return false;
    }

    const hasTrailingDisplayNewline =
      modelText.endsWith('\n') &&
      targetString.hasAttribute('data-editor-length');
    const expectedDisplay = formatDisplayedDOMStringData(
      modelText,
      hasTrailingDisplayNewline
    );

    return targetString.textContent === expectedDisplay;
  }

  const index = strings.indexOf(targetString);

  if (index === -1) {
    return false;
  }

  const bounds = readLeafSliceBounds(targetString);

  if (!bounds) {
    return false;
  }

  const slice = modelText.slice(bounds.start, bounds.end);
  const hasTrailingDisplayNewline =
    index === strings.length - 1 &&
    slice.endsWith('\n') &&
    targetString.hasAttribute('data-editor-length');
  const expectedDisplay = formatDisplayedDOMStringData(
    slice,
    hasTrailingDisplayNewline
  );

  return targetString.textContent === expectedDisplay;
};

export const ensureDOMStringDisplaySentinel = (
  stringElement: Element,
  textNode: Text
) => {
  if (stringElement.hasAttribute('data-editor-zero-width')) {
    if (
      stringElement.getAttribute('data-editor-zero-width') === 'n' &&
      stringElement.querySelector('br')
    ) {
      if (textNode.data === '') {
        textNode.remove();
      }
      return;
    }
    if (textNode.data === '') {
      textNode.data = '\uFEFF';
    }
    return;
  }

  const expectedLength = readDeclaredStringLength(stringElement);

  if (
    expectedLength !== null &&
    textNode.data.length === expectedLength &&
    textNode.data.endsWith('\n')
  ) {
    textNode.appendData('\n');
  }
};

const writeDOMStringDisplayData = (
  stringElement: Element,
  preferredTextNode: Text | null,
  expectedData: string
) => {
  if (
    expectedData === '\uFEFF' &&
    stringElement.getAttribute('data-editor-zero-width') === 'n' &&
    stringElement.querySelector('br')
  ) {
    for (const child of Array.from(stringElement.childNodes)) {
      if (isDOMText(child)) {
        child.remove();
      }
    }
    return;
  }

  if (
    preferredTextNode &&
    stringElement.childNodes.length === 1 &&
    stringElement.firstChild === preferredTextNode
  ) {
    if (preferredTextNode.data !== expectedData) {
      preferredTextNode.data = expectedData;
    }
    return;
  }

  if (
    stringElement.childNodes.length === 1 &&
    isDOMText(stringElement.firstChild)
  ) {
    if (stringElement.firstChild.data !== expectedData) {
      stringElement.firstChild.data = expectedData;
    }
    return;
  }

  if (
    stringElement.textContent !== expectedData ||
    stringElement.childNodes.length !== 1 ||
    !isDOMText(stringElement.firstChild)
  ) {
    stringElement.textContent = expectedData;
  }
};

export const restoreDOMTextHostDisplayText = ({
  modelText,
  path,
  preferredTextNode,
  textHost,
}: {
  modelText: string;
  path?: readonly number[] | null;
  preferredTextNode: Text | null;
  textHost: Element;
}) => {
  const flowSegments = getDOMTextFlowRestoreSegments(textHost, path);

  if (flowSegments) {
    const knownNodes = new Set<Node>();

    for (const segment of flowSegments) {
      knownNodes.add(segment.textNode);
      if (segment.stringElement) {
        knownNodes.add(segment.stringElement);
      }
    }

    for (const segment of flowSegments) {
      const slice = modelText.slice(segment.start, segment.end);
      const hasTrailingDisplayNewline =
        slice.endsWith('\n') && segment.domLength > segment.end - segment.start;
      const expectedData = formatDisplayedDOMStringData(
        slice,
        hasTrailingDisplayNewline
      );

      if (segment.stringElement) {
        writeDOMStringDisplayData(
          segment.stringElement,
          segment.textNode,
          expectedData
        );
        if (
          segment.stringElement.childNodes.length === 1 &&
          isDOMText(segment.stringElement.firstChild)
        ) {
          segment.replaceTextNode(segment.stringElement.firstChild);
        }
      } else {
        if (segment.textNode.data !== expectedData) {
          segment.textNode.data = expectedData;
        }
        let sibling = segment.textNode.nextSibling;

        while (sibling && isDOMText(sibling) && !knownNodes.has(sibling)) {
          const next = sibling.nextSibling;

          sibling.remove();
          sibling = next;
        }
      }
    }

    return;
  }

  const strings = getPliteTextHostStrings(textHost);

  if (strings.length > 1) {
    for (let index = 0; index < strings.length; index += 1) {
      const stringElement = strings[index];
      const bounds = readLeafSliceBounds(stringElement);

      if (!bounds) {
        continue;
      }

      const slice = modelText.slice(bounds.start, bounds.end);
      const hasTrailingDisplayNewline =
        index === strings.length - 1 &&
        slice.endsWith('\n') &&
        stringElement.hasAttribute('data-editor-length');
      const expectedData = formatDisplayedDOMStringData(
        slice,
        hasTrailingDisplayNewline
      );

      writeDOMStringDisplayData(stringElement, preferredTextNode, expectedData);
    }

    return;
  }

  const targetString =
    strings[0] ??
    (preferredTextNode && textHost.contains(preferredTextNode)
      ? preferredTextNode.parentElement?.closest(
          '[data-editor-string], [data-editor-zero-width]'
        )
      : null);
  const hasTrailingDisplayNewline =
    modelText.endsWith('\n') &&
    Boolean(targetString?.hasAttribute('data-editor-length'));
  const expectedData = formatDisplayedDOMStringData(
    modelText,
    hasTrailingDisplayNewline
  );

  if (targetString) {
    writeDOMStringDisplayData(targetString, preferredTextNode, expectedData);
    return;
  }

  if (
    preferredTextNode &&
    textHost.contains(preferredTextNode) &&
    preferredTextNode.data !== expectedData
  ) {
    preferredTextNode.data = expectedData;
  }
};
