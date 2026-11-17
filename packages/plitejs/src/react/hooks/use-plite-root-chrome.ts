import {
  type MouseEvent,
  type MouseEventHandler,
  useCallback,
  useMemo,
} from 'react';

import type { NamedRootKey, RootKey } from '../..';
import { markRootViewUsed } from '../../core/root-target';
import { resolveDOMTargetView } from '../../dom/internal';
import { mouseEventTargetToElement } from '../editable/content-root-owner-target';
import { useRootInteractionController } from '../editable/root-interaction-controller';
import { resolveRootInteractionTarget } from '../editable/root-interaction-resolver';
import { MAIN_ROOT_KEY } from '../root-key';
import {
  useRequiredPliteRuntimeContext,
  useRootEditor,
} from './use-plite-runtime';

const EDITABLE = '[data-editor="true"]';

type RootView = ReturnType<typeof resolveDOMTargetView>;

const findPressedCopyView = (
  control: object,
  chrome: Element,
  target: Element
): RootView => {
  for (
    let copy = target.closest(EDITABLE);
    copy && chrome.contains(copy);
    copy = copy.parentElement?.closest(EDITABLE) ?? null
  ) {
    const view = resolveDOMTargetView(control, copy);

    if (view) return view;
  }

  return null;
};

const findInnermostRootChrome = (
  root: RootKey,
  chrome: Element,
  target: Element
) => {
  let scope = target;

  while (
    scope !== chrome &&
    scope.getAttribute('data-editor-root-chrome') !== root
  ) {
    scope = scope.parentElement ?? chrome;
  }

  return scope;
};

const findFollowedOrFirstView = (
  control: object,
  followed: object | null,
  copies: Iterable<Element>
): RootView => {
  let first: RootView = null;

  for (const copy of copies) {
    const view = resolveDOMTargetView(control, copy);

    if (view && view === followed) return view;
    first ??= view;
  }

  return first;
};

const findFollowedOrFirstCopyView = (
  control: object,
  root: RootKey,
  followed: object | null,
  scope: Element
): RootView => {
  const copies = [...scope.querySelectorAll(EDITABLE)];

  return (
    findFollowedOrFirstView(
      control,
      followed,
      copies.filter(
        (copy) => findInnermostRootChrome(root, scope, copy) === scope
      )
    ) ?? findFollowedOrFirstView(control, followed, copies)
  );
};

const followSurroundedCopy = (
  control: object,
  root: RootKey,
  followed: object | null,
  event: MouseEvent<HTMLElement>
) => {
  const chrome = event.currentTarget;
  const target = mouseEventTargetToElement(event.target);
  const { kind } = resolveRootInteractionTarget({
    control,
    currentTarget: chrome,
    target: event.target,
  });

  if (!target || kind === 'external' || kind === 'interactive-descendant') {
    return;
  }

  const view =
    findPressedCopyView(control, chrome, target) ??
    findFollowedOrFirstCopyView(
      control,
      root,
      followed,
      findInnermostRootChrome(root, chrome, target)
    );

  if (view) markRootViewUsed(view);
};

/** Options for mouse interaction on root-level chrome outside editable text. */
export type UseRootChromeOptions = {
  disabled?: boolean;
  selection?: 'end' | 'restore';
};

/** Props and root metadata for root-level mouse interaction chrome. */
export type RootChromeController = {
  props: {
    'data-editor-root-chrome'?: NamedRootKey;
    onMouseDownCapture: MouseEventHandler<HTMLElement>;
    onMouseMoveCapture: MouseEventHandler<HTMLElement>;
    onMouseUpCapture: MouseEventHandler<HTMLElement>;
  };
  root: NamedRootKey | undefined;
};

/**
 * Create props for root-level mouse interaction outside editable content.
 *
 * Each mounted `Editable` of the root is a copy of it. A press acts on the copy
 * that the chrome surrounds, even while another copy of that root was used
 * last. A press on a control or widget inside the chrome, such as a button,
 * acts on no copy. When one chrome holds several copies, a press outside them
 * acts on the copy used last, or else the first. Chrome of the primary
 * document inside another chrome of it acts as part of the outer one. A press
 * that an `Editable` of another root around the chrome handles first never
 * reaches the chrome.
 */
export function useRootChrome<const TRoot extends RootKey = RootKey>(
  root?: NamedRootKey<TRoot>,
  { disabled = false, selection = 'restore' }: UseRootChromeOptions = {}
): RootChromeController {
  if (root === MAIN_ROOT_KEY) {
    throw new Error('Omit root to create chrome for the primary document.');
  }

  const internalRoot = root ?? MAIN_ROOT_KEY;
  const editor = useRootEditor(root);
  const { getMountedViewEditor } = useRequiredPliteRuntimeContext();
  const {
    onMouseDownCapture: onControllerMouseDownCapture,
    onMouseMoveCapture,
    onMouseUpCapture,
  } = useRootInteractionController({
    disabled,
    editor,
    getMountedViewEditor,
    root: internalRoot,
    selection,
  });
  const onMouseDownCapture = useCallback<MouseEventHandler<HTMLElement>>(
    (event) => {
      if (!disabled && !event.defaultPrevented) {
        followSurroundedCopy(
          editor,
          internalRoot,
          getMountedViewEditor(internalRoot),
          event
        );
      }

      onControllerMouseDownCapture(event);
    },
    [
      disabled,
      editor,
      getMountedViewEditor,
      internalRoot,
      onControllerMouseDownCapture,
    ]
  );

  return useMemo(
    () => ({
      props: {
        ...(root ? { 'data-editor-root-chrome': root } : {}),
        onMouseDownCapture,
        onMouseMoveCapture,
        onMouseUpCapture,
      },
      root,
    }),
    [onMouseDownCapture, onMouseMoveCapture, onMouseUpCapture, root]
  );
}
