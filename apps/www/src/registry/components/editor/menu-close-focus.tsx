'use client';

import { useOptionalEditor } from 'platejs/react';
import * as React from 'react';

import {
  softKeyboardUp,
  useToolbarOverlayHold,
  useToolbarOverlayHoldPastUnmount,
  useToolbarScrollDismiss,
} from '@/registry/components/editor/toolbar-overlay';

export type FinalFocus = false | (() => void);
export type FinalFocusRef = React.RefObject<FinalFocus | undefined>;
export type MenuRoot = {
  decideKeepEditorFocus: () => void;
  finalFocusRef: FinalFocusRef;
  keepEditorFocus: boolean;
  modal: boolean;
  open: boolean;
  pressed: (touch: boolean) => void;
  toolbar: HTMLElement | null;
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
    event.type === 'touchmove' ||
    event.type === 'touchend' ||
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

/** Handing focus back in the same task keeps the on-screen keyboard from seeing it leave the editor. */
export function handBackFocus(event: React.FocusEvent<HTMLElement>) {
  const from = event.relatedTarget;

  if (!(from instanceof HTMLElement) || event.currentTarget.contains(from)) {
    return false;
  }

  from.focus({ preventScroll: true });

  return true;
}

export function useMenuRoot(modal: boolean, open: boolean, close: () => void) {
  const editor = useOptionalEditor();
  const finalFocusRef = React.useRef<FinalFocus | undefined>(undefined);
  const touchPressRef = React.useRef(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const [focusRule, setFocusRule] = React.useState({
    keepEditorFocus: false,
    open,
  });

  if (focusRule.open !== open) {
    // A modal flip while the menu closes would remount its content as modal.
    setFocusRule(
      open ? { keepEditorFocus: false, open } : { ...focusRule, open }
    );
  }

  useToolbarOverlayHold(open);
  const toolbar = useToolbarScrollDismiss(open, triggerRef, () => {
    close();
    finalFocusRef.current = false;
  });

  React.useEffect(() => {
    if (open) finalFocusRef.current = undefined;
  }, [open]);

  const { keepEditorFocus } = focusRule;

  return React.useMemo<MenuRoot>(
    () => ({
      decideKeepEditorFocus: () => {
        setFocusRule({
          keepEditorFocus:
            touchPressRef.current &&
            !!toolbar &&
            !!editor?.api.dom.isFocused() &&
            softKeyboardUp(),
          open: true,
        });
        touchPressRef.current = false;
      },
      finalFocusRef,
      keepEditorFocus,
      // A modal Radix menu hides the rest of the page, the editor that keeps focus included, from screen readers.
      modal: modal && !keepEditorFocus,
      open,
      pressed: (touch) => {
        touchPressRef.current = touch;
      },
      toolbar,
      triggerRef,
    }),
    [editor, keepEditorFocus, modal, open, toolbar]
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
