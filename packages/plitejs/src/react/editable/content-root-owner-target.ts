import type { Path, RootKey } from '../..';
import { isDOMElement, isDOMText } from '../../dom';
import { isDOMHTMLElement } from '../../dom/utils/dom';
import { getPliteNodePathFromDOMElement } from '../hooks/use-plite-node-ref';
import { MAIN_ROOT_KEY } from '../root-key';
import type { PliteViewBoundaryOwner } from './content-root-navigation';
import { isSameContentRootOwner } from './content-root-owners';

export const mouseEventTargetToElement = (
  target: EventTarget | null
): Element | null => {
  if (isDOMElement(target)) {
    return target;
  }

  if (isDOMText(target)) {
    return target.parentElement;
  }

  return null;
};

export const getEditableRootFromTarget = (
  target: EventTarget | null
): RootKey => {
  const element = mouseEventTargetToElement(target);
  const editableRoot = element?.closest('[data-editor="true"]');

  return editableRoot?.getAttribute('data-editor-root') ?? MAIN_ROOT_KEY;
};

const parseContentRootOwnerPath = (value: string | null): Path | null => {
  if (!value) {
    return null;
  }

  const path = value.split(',').map((part) => Number.parseInt(part, 10));

  return path.every(Number.isFinite) ? path : null;
};

const readSlotOwnerHop = (
  slotElement: Element,
  childRoot: RootKey
): {
  hop: PliteViewBoundaryOwner;
  nextSearchStart: Element | null;
} | null => {
  const htmlSlotElement = isDOMHTMLElement(slotElement) ? slotElement : null;
  const slotOwnerPath = htmlSlotElement
    ? parseContentRootOwnerPath(
        htmlSlotElement.getAttribute('data-editor-content-root-owner-path')
      )
    : null;
  const slotOwnerRoot = htmlSlotElement
    ? htmlSlotElement.getAttribute('data-editor-content-root-owner-root')
    : null;
  const ownerElement = slotElement.parentElement?.closest(
    '[data-editor-node="element"][data-editor-path]'
  );
  const ownerEditorElement = ownerElement?.closest('[data-editor="true"]');
  const ownerPath =
    slotOwnerPath ??
    (isDOMHTMLElement(ownerElement)
      ? getPliteNodePathFromDOMElement(ownerElement)
      : null);
  const ownerRoot =
    slotOwnerRoot ??
    ownerEditorElement?.getAttribute('data-editor-root') ??
    MAIN_ROOT_KEY;

  if (!ownerPath) {
    return null;
  }

  return {
    hop: {
      childRoot,
      ownerPath,
      ownerRoot,
    },
    nextSearchStart: slotElement.parentElement,
  };
};

export const getContentRootOwnerFromTarget = ({
  childRoot,
  target,
}: {
  childRoot: RootKey;
  target: EventTarget | null;
}): PliteViewBoundaryOwner | null => {
  if (childRoot === MAIN_ROOT_KEY) {
    return null;
  }

  const hops: PliteViewBoundaryOwner[] = [];
  const seenSlots = new Set<Element>();
  let currentElement = mouseEventTargetToElement(target);
  let expectedChildRoot: RootKey = childRoot;

  while (currentElement) {
    const slotElement = currentElement.closest(
      '[data-editor-content-root-slot]'
    );

    if (!slotElement || seenSlots.has(slotElement)) {
      break;
    }
    seenSlots.add(slotElement);

    if (hops.length > 0) {
      const slotChildRoot =
        slotElement
          .querySelector('[data-editor="true"]')
          ?.getAttribute('data-editor-root') ?? MAIN_ROOT_KEY;

      if (slotChildRoot !== expectedChildRoot) {
        break;
      }
    }

    const parsed = readSlotOwnerHop(slotElement, expectedChildRoot);

    if (!parsed) {
      break;
    }

    hops.push(parsed.hop);
    if (parsed.hop.ownerRoot === MAIN_ROOT_KEY) {
      break;
    }
    expectedChildRoot = parsed.hop.ownerRoot;
    currentElement = parsed.nextSearchStart;
  }

  let chained: PliteViewBoundaryOwner | null = null;

  for (let index = hops.length - 1; index >= 0; index -= 1) {
    const hop = hops[index];

    chained = chained ? { ...hop, parent: chained } : hop;
  }

  return chained;
};

export const isSameOwner = (
  left: PliteViewBoundaryOwner | null | undefined,
  right: PliteViewBoundaryOwner | null | undefined
) => isSameContentRootOwner(left, right);
