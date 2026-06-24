import { type Path, PathApi, type RootKey } from '@platejs/plite';
import { isDOMElement, isDOMText } from '@platejs/plite-dom';

import { getPliteNodePathFromDOMElement } from '../hooks/use-plite-node-ref';
import { MAIN_ROOT_KEY } from '../root-key';
import type { ContentRootOwner } from './content-root-navigation';

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
  const editableRoot = element?.closest('[data-plite-editor="true"]');

  return (editableRoot?.getAttribute('data-plite-root') ??
    MAIN_ROOT_KEY) as RootKey;
};

const parseContentRootOwnerPath = (value: string | null): Path | null => {
  if (!value) {
    return null;
  }

  const path = value.split(',').map((part) => Number.parseInt(part, 10));

  return path.every(Number.isFinite) ? (path as Path) : null;
};

export const getContentRootOwnerFromTarget = ({
  childRoot,
  target,
}: {
  childRoot: RootKey;
  target: EventTarget | null;
}): ContentRootOwner | null => {
  if (childRoot === MAIN_ROOT_KEY) {
    return null;
  }

  const element = mouseEventTargetToElement(target);
  const slotElement = element?.closest('[data-plite-content-root-slot]');
  const slotOwnerPath =
    slotElement instanceof HTMLElement
      ? parseContentRootOwnerPath(
          slotElement.getAttribute('data-plite-content-root-owner-path')
        )
      : null;
  const slotOwnerRoot =
    slotElement instanceof HTMLElement
      ? slotElement.getAttribute('data-plite-content-root-owner-root')
      : null;
  const ownerElement = slotElement?.parentElement?.closest(
    '[data-plite-node="element"][data-plite-path]'
  );
  const ownerEditorElement = ownerElement?.closest(
    '[data-plite-editor="true"]'
  );
  const ownerPath =
    slotOwnerPath ??
    (ownerElement instanceof HTMLElement
      ? getPliteNodePathFromDOMElement(ownerElement)
      : null);
  const ownerRoot = (slotOwnerRoot ??
    ownerEditorElement?.getAttribute('data-plite-root') ??
    MAIN_ROOT_KEY) as RootKey;

  return ownerPath
    ? {
        childRoot,
        ownerPath,
        ownerRoot,
      }
    : null;
};

export const isSameOwner = (
  left: ContentRootOwner | null | undefined,
  right: ContentRootOwner | null | undefined
) =>
  (!left && !right) ||
  (!!left &&
    !!right &&
    left.childRoot === right.childRoot &&
    left.ownerRoot === right.ownerRoot &&
    PathApi.equals(left.ownerPath, right.ownerPath));
