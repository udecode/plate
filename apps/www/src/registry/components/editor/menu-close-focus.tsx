'use client';

import * as React from 'react';

import {
  useToolbarOverlayHold,
  useToolbarOverlayHoldPastUnmount,
} from '@/registry/components/editor/toolbar-overlay';

export type FinalFocus = false | (() => void);
export type FinalFocusRef = React.RefObject<FinalFocus | undefined>;
export type MenuRoot = {
  finalFocusRef: FinalFocusRef;
  modal: boolean;
  open: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

export const FinalFocusContext = React.createContext<FinalFocusRef | null>(
  null
);
export const MenuRootContext = React.createContext<MenuRoot | null>(null);

export function secondaryPress(event: Event) {
  return (
    event instanceof MouseEvent &&
    (event.button === 2 || (event.button === 0 && event.ctrlKey))
  );
}

export function outsideFinalFocus(
  event: Event,
  { modal, triggerRef }: MenuRoot
): false | undefined {
  if (
    event instanceof FocusEvent ||
    event instanceof KeyboardEvent ||
    secondaryPress(event)
  ) {
    return false;
  }

  const trigger = triggerRef.current;
  const owner = trigger?.closest('[role="toolbar"]') ?? trigger;
  const path = event.composedPath();
  // Radix reports a touch press from the click that follows it, after the press's own dispatch has emptied its path.
  const ownPress =
    !!owner &&
    (path.length > 0
      ? path.includes(owner)
      : event.target instanceof Node && owner.contains(event.target));

  if (ownPress) return undefined;

  return modal ? undefined : false;
}

export function focusClaimed(trigger: HTMLElement | null) {
  let active = document.activeElement;

  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }

  return !!active && active !== document.body && !trigger?.contains(active);
}

export function takeFinalFocus(finalFocusRef: FinalFocusRef) {
  const finalFocus = finalFocusRef.current;

  finalFocusRef.current = undefined;

  return finalFocus;
}

export function useMenuRoot(modal: boolean, open: boolean) {
  const finalFocusRef = React.useRef<FinalFocus | undefined>(undefined);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  useToolbarOverlayHold(open);

  React.useEffect(() => {
    if (open) finalFocusRef.current = undefined;
  }, [open]);

  return React.useMemo<MenuRoot>(
    () => ({ finalFocusRef, modal, open, triggerRef }),
    [modal, open]
  );
}

export function MenuPopupHold({ root }: { root: MenuRoot }) {
  const { finalFocusRef, open } = root;

  // Holding the toolbar until the close focus runs keeps a floating toolbar mounted under a press that closes the menu, so that press still reaches its button.
  useToolbarOverlayHoldPastUnmount();

  // Base UI's useDismiss stops reporting presses once the menu closes, while its popup stays mounted for a frame or more.
  React.useLayoutEffect(() => {
    if (open) return undefined;

    const onPointerDown = (event: PointerEvent) => {
      if (
        finalFocusRef.current === undefined &&
        outsideFinalFocus(event, root) === false
      ) {
        finalFocusRef.current = false;
      }
    };

    document.addEventListener('pointerdown', onPointerDown, true);

    return () =>
      document.removeEventListener('pointerdown', onPointerDown, true);
  }, [finalFocusRef, open, root]);

  return null;
}
