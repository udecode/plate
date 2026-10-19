import type { Editor, EditorCoreStateView } from '../../../core';

export type ComboboxEditor = Pick<Editor, 'plugin'> & {
  read: Pick<EditorCoreStateView, 'nodes'>;
};

/**
 * Autocomplete policy a feature keeps in its plugin state. Typing the trigger
 * in an Editable opens that feature's popup over the text that follows it.
 */
export type ComboboxState = {
  /** Text that opens the popup, or a pattern tested against the typed character. */
  trigger: readonly string[] | RegExp | string;
  /** Tested against the character before the trigger, or `''` at a text start. */
  triggerPreviousCharPattern: RegExp | null;
  /** Return false to keep a typed trigger as plain text, such as inside code. */
  triggerQuery: ((editor: ComboboxEditor) => boolean) | null;
  /** The popup closes once the query grows longer. */
  maxQueryLength: number;
  /** Tested against each query character; the first failure closes the popup. */
  queryPattern: RegExp | null;
};
