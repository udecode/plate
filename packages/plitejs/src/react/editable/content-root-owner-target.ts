import { type Path, PathApi, type RootKey } from '../..';
import { isDOMElement, isDOMText } from '../../dom';
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
  const slotElement = element?.closest('[data-editor-content-root-slot]');
  const slotOwnerPath =
    slotElement instanceof HTMLElement
      ? parseContentRootOwnerPath(
          slotElement.getAttribute('data-editor-content-root-owner-path')
        )
      : null;
  const slotOwnerRoot =
    slotElement instanceof HTMLElement
      ? slotElement.getAttribute('data-editor-content-root-owner-root')
      : null;
  const ownerElement = slotElement?.parentElement?.closest(
    '[data-editor-node="element"][data-editor-path]'
  );
  const ownerEditorElement = ownerElement?.closest('[data-editor="true"]');
  const ownerPath =
    slotOwnerPath ??
    (ownerElement instanceof HTMLElement
      ? getPliteNodePathFromDOMElement(ownerElement)
      : null);
  const ownerRoot =
    slotOwnerRoot ??
    ownerEditorElement?.getAttribute('data-editor-root') ??
    MAIN_ROOT_KEY;

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
