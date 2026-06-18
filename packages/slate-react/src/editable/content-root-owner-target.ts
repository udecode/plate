import { type Path, PathApi, type RootKey } from '@platejs/slate';
import { isDOMElement, isDOMText } from '@platejs/slate-dom';

import { getSlateNodePathFromDOMElement } from '../hooks/use-slate-node-ref';
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
  const editableRoot = element?.closest('[data-slate-editor="true"]');

  return (editableRoot?.getAttribute('data-slate-root') ??
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
  const slotElement = element?.closest('[data-slate-content-root-slot]');
  const slotOwnerPath =
    slotElement instanceof HTMLElement
      ? parseContentRootOwnerPath(
          slotElement.getAttribute('data-slate-content-root-owner-path')
        )
      : null;
  const slotOwnerRoot =
    slotElement instanceof HTMLElement
      ? slotElement.getAttribute('data-slate-content-root-owner-root')
      : null;
  const ownerElement = slotElement?.parentElement?.closest(
    '[data-slate-node="element"][data-slate-path]'
  );
  const ownerEditorElement = ownerElement?.closest(
    '[data-slate-editor="true"]'
  );
  const ownerPath =
    slotOwnerPath ??
    (ownerElement instanceof HTMLElement
      ? getSlateNodePathFromDOMElement(ownerElement)
      : null);
  const ownerRoot = (slotOwnerRoot ??
    ownerEditorElement?.getAttribute('data-slate-root') ??
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
