'use client';

import * as React from 'react';

export type FinalFocus = false | (() => void);
export type FinalFocusRef = React.RefObject<FinalFocus | undefined>;
export type MenuRoot = {
  finalFocusRef: FinalFocusRef;
  modal: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

export const FinalFocusContext = React.createContext<FinalFocusRef | null>(
  null
);
export const MenuRootContext = React.createContext<MenuRoot | null>(null);

const closeGestures = ['keydown', 'pointerdown'] as const;

function isSecondaryPress(event: Event) {
  return (
    event instanceof MouseEvent &&
    (event.button === 2 || (event.button === 0 && event.ctrlKey))
  );
}

function ownsGesture(event: Event, trigger: HTMLElement | null) {
  const owner = trigger?.closest('[role="toolbar"]') ?? trigger;

  return event
    .composedPath()
    .some(
      (node) =>
        node instanceof Element &&
        (node === owner || node.matches('[role="menu"]'))
    );
}

function gestureFinalFocus(
  event: Event,
  { modal, triggerRef }: MenuRoot
): false | undefined {
  if (event instanceof KeyboardEvent) {
    return event.key === 'Tab' ? false : undefined;
  }
  if (isSecondaryPress(event)) return false;
  if (ownsGesture(event, triggerRef.current)) return undefined;

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

export function useMenuRoot(modal: boolean) {
  const finalFocusRef = React.useRef<FinalFocus | undefined>(undefined);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  return React.useMemo<MenuRoot>(
    () => ({ finalFocusRef, modal, triggerRef }),
    [modal]
  );
}

export function CloseFocusWatcher({
  popupRef,
  root,
}: {
  popupRef: React.RefObject<HTMLElement | null>;
  root: MenuRoot;
}) {
  React.useEffect(() => {
    const record = (event: Event) => {
      // Base UI keeps a closed popup mounted for a frame or more before it calls finalFocus, so a gesture in between must not replace the close's intent.
      if (!popupRef.current?.matches('[data-open], [data-state="open"]')) {
        return;
      }

      root.finalFocusRef.current = gestureFinalFocus(event, root);
    };

    for (const type of closeGestures) {
      window.addEventListener(type, record, true);
    }

    return () => {
      for (const type of closeGestures) {
        window.removeEventListener(type, record, true);
      }
    };
  }, [popupRef, root]);

  return null;
}
