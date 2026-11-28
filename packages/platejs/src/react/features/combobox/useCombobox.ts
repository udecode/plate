import React from 'react';

import type { Editor } from '../../editor';
import { useEditor } from '../../stores';
import type { ComboboxPolicy } from './combobox.internal';
import {
  type ComboboxCompletion,
  type ComboboxMatch,
  type ComboboxOwner,
  type ComboboxPopup,
  getComboboxOwner,
} from './comboboxOwner.internal';

export type {
  ComboboxCompletion,
  ComboboxMatch,
} from './comboboxOwner.internal';

/** Visibility and active option reported by a combobox popup to the Editable ARIA writer. */
export type ComboboxPopupState = Readonly<{
  /** The listbox's active option id, mirrored as `aria-activedescendant`. */
  activeOptionId?: string | null;
  /**
   * Whether the popup is showing. Keys, `aria-controls` and
   * `aria-activedescendant` attach only while it shows, and `aria-expanded`
   * follows it. Defaults to true.
   */
  open?: boolean;
}>;

/** Options for `useCombobox`. */
export type UseComboboxOptions = {
  /** Stable ref to the Editable this popup serves, as passed to an `afterEditable` slot. */
  editableRef: React.RefObject<HTMLDivElement | null>;
  /** Text that opens the popup when typed, such as `'@'`, `'/'`, or `'[^'`. */
  trigger: string;
  /**
   * Fallback accessible name for the Editable while `role="combobox"` is
   * active and the app has not set `aria-label` or `aria-labelledby`.
   * Defaults to `'Autocomplete'`.
   */
  label?: string;
  /** The popup closes once the query is longer. Defaults to 75. */
  maxQueryLength?: number;
  /**
   * Handle Enter, Tab, ArrowUp, ArrowDown or Escape while this popup shows.
   * Return true when handled; unhandled Escape dismisses the popup.
   */
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => boolean;
  /**
   * Tested against each query character; the first failure closes the popup.
   * `null` allows any character except a line break. Defaults to `null`.
   */
  queryPattern?: RegExp | null;
  /**
   * Tested against the character before the trigger, or `''` at the start
   * of a text. `null` allows any character. Defaults to `/^\s?$/`.
   */
  triggerPreviousCharPattern?: RegExp | null;
  /**
   * Return `false` to keep a typed trigger as plain text, for example inside
   * a code block. Defaults to `null`.
   */
  triggerQuery?: ((editor: Editor) => boolean) | null;
};

/** Return value of `useCombobox`. */
export type UseComboboxReturn = {
  /**
   * The text after a typed trigger, or null when none is active. It does not
   * depend on `open`.
   */
  match: ComboboxMatch | null;
  /** Id for the popup's listbox, mirrored as the Editable's `aria-controls`. */
  listboxId: string;
  /**
   * Replace the offered match's trigger and query through one synchronous
   * transaction, as one undo step. Return false from the callback to refuse;
   * refusal, a stale match or an active composition changes nothing and
   * returns false. A thrown callback rolls back everything.
   */
  complete: (match: ComboboxMatch, callback: ComboboxCompletion) => boolean;
  /** Close the popup and keep the typed text. */
  dismiss: () => void;
  /**
   * Report the popup's current visibility and active option id to the Editable
   * ARIA writer. Call from a layout effect.
   */
  syncPopup: (state: ComboboxPopupState) => void;
};

const DEFAULT_TRIGGER_PREVIOUS_CHAR_PATTERN = /^\s?$/;
const subscribeNone = () => () => {};

/**
 * Autocomplete over ordinary editor text. The popup opens when the user types
 * `trigger` in this Editable and follows the text after it.
 */
export function useCombobox({
  editableRef,
  label = 'Autocomplete',
  maxQueryLength = 75,
  onKeyDown,
  queryPattern = null,
  trigger,
  triggerPreviousCharPattern = DEFAULT_TRIGGER_PREVIOUS_CHAR_PATTERN,
  triggerQuery = null,
}: UseComboboxOptions): UseComboboxReturn {
  const view = useEditor();
  const listboxId = React.useId();
  const latest = React.useRef<{
    onKeyDown: UseComboboxOptions['onKeyDown'];
    policy: ComboboxPolicy;
  }>({
    onKeyDown,
    policy: {
      label,
      maxQueryLength,
      queryPattern,
      trigger,
      triggerPreviousCharPattern,
      triggerQuery,
    },
  });
  const popupStateRef = React.useRef<{
    activeOptionId: string | null;
    open: boolean;
  }>({ activeOptionId: null, open: true });
  const ownerRef = React.useRef<ComboboxOwner | null>(null);
  const popup = React.useMemo<ComboboxPopup>(
    () => ({
      get activeOptionId() {
        return popupStateRef.current.activeOptionId;
      },
      listboxId,
      onKeyDown: (event) => latest.current.onKeyDown?.(event) ?? false,
      get open() {
        return popupStateRef.current.open;
      },
      get policy() {
        return latest.current.policy;
      },
    }),
    [listboxId]
  );
  const [owner, setOwner] = React.useState<ComboboxOwner | null>(null);

  React.useLayoutEffect(() => {
    const element = editableRef.current;

    if (!element) return undefined;

    const nextOwner = getComboboxOwner(view, element);
    const unmount = nextOwner.mount(popup);

    ownerRef.current = nextOwner;
    setOwner(nextOwner);

    return () => {
      unmount();
      ownerRef.current = null;
      setOwner(null);
    };
  }, [editableRef, popup, view]);

  React.useLayoutEffect(() => {
    const prev = latest.current.policy;
    const nextPolicy: ComboboxPolicy = {
      label,
      maxQueryLength,
      queryPattern,
      trigger,
      triggerPreviousCharPattern,
      triggerQuery,
    };

    latest.current = { onKeyDown, policy: nextPolicy };

    const policyChanged =
      prev.trigger !== trigger ||
      prev.queryPattern !== queryPattern ||
      prev.maxQueryLength !== maxQueryLength;

    if (policyChanged) {
      ownerRef.current?.refresh();
    }
    ownerRef.current?.syncAria();
  });

  const match = React.useSyncExternalStore(
    owner?.subscribe ?? subscribeNone,
    () => owner?.getMatch(popup) ?? null,
    () => null
  );
  const complete = React.useCallback(
    (expected: ComboboxMatch, callback: ComboboxCompletion) =>
      owner?.complete(popup, expected, callback) ?? false,
    [owner, popup]
  );
  const dismiss = React.useCallback(() => {
    owner?.dismiss(popup);
  }, [owner, popup]);
  const syncPopup = React.useCallback((next: ComboboxPopupState) => {
    const prev = popupStateRef.current;
    const activeOptionId =
      next.activeOptionId === undefined
        ? prev.activeOptionId
        : next.activeOptionId;
    const open = next.open === undefined ? prev.open : next.open;

    if (prev.activeOptionId === activeOptionId && prev.open === open) return;

    popupStateRef.current = { activeOptionId, open };
    ownerRef.current?.syncAria();
  }, []);

  return React.useMemo(
    () => ({ complete, dismiss, listboxId, match, syncPopup }),
    [complete, dismiss, listboxId, match, syncPopup]
  );
}
