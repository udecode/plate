import React from 'react';

import type { ComboboxState } from '../../../features/combobox/lib/combobox';
import type {
  DefinitionOf,
  InferPluginStoreState,
  PluginReference,
} from '../../../lib';
import { useEditor } from '../../stores';
import {
  type ComboboxCompletion,
  type ComboboxMatch,
  type ComboboxOwner,
  type ComboboxPopup,
  getComboboxOwner,
} from './comboboxOwner.internal';

export type { ComboboxMatch } from './comboboxOwner.internal';

type RequireComboboxState<P> =
  InferPluginStoreState<DefinitionOf<P>> extends ComboboxState
    ? unknown
    : never;

export type UseComboboxOptions<P extends PluginReference = PluginReference> = {
  /** The Editable this popup serves, as passed to an `afterEditable` slot. */
  editableRef: React.RefObject<HTMLDivElement | null>;
  /** The feature whose state holds a `ComboboxState` trigger policy. */
  plugin: P & RequireComboboxState<P>;
  /** The listbox's active option id, mirrored as `aria-activedescendant`. */
  activeOptionId?: string | null;
  /**
   * Whether the popup is showing. Keys, `aria-controls` and
   * `aria-activedescendant` attach only while it shows, and `aria-expanded`
   * follows it.
   * Defaults to true.
   */
  open?: boolean;
  /**
   * Handle Enter, Tab, ArrowUp, ArrowDown or Escape while this popup shows.
   * Return true when handled; unhandled Escape dismisses the popup.
   */
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => boolean;
};

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
};

const subscribeNone = () => () => {};

/**
 * Autocomplete over ordinary editor text. The popup opens when the user types
 * the plugin's trigger in this Editable and follows the text after it.
 */
export function useCombobox<P extends PluginReference>({
  activeOptionId = null,
  editableRef,
  onKeyDown,
  open = true,
  plugin,
}: UseComboboxOptions<P>): UseComboboxReturn {
  const view = useEditor();
  const listboxId = React.useId();
  const latest = React.useRef({ activeOptionId, onKeyDown, open });
  const popup = React.useMemo<ComboboxPopup>(
    () => ({
      get activeOptionId() {
        return latest.current.activeOptionId;
      },
      listboxId,
      onKeyDown: (event) => latest.current.onKeyDown?.(event) ?? false,
      get open() {
        return latest.current.open;
      },
      plugin,
    }),
    [listboxId, plugin]
  );
  const [owner, setOwner] = React.useState<ComboboxOwner | null>(null);

  React.useLayoutEffect(() => {
    const element = editableRef.current;

    if (!element) return undefined;

    const nextOwner = getComboboxOwner(view, element);
    const unmount = nextOwner.mount(popup);

    setOwner(nextOwner);

    return () => {
      unmount();
      setOwner(null);
    };
  }, [editableRef, popup, view]);

  React.useLayoutEffect(() => {
    latest.current = { activeOptionId, onKeyDown, open };
    owner?.syncAria();
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

  return React.useMemo(
    () => ({ complete, dismiss, listboxId, match }),
    [complete, dismiss, listboxId, match]
  );
}
