import type { FocusableElement } from 'tabbable';

import type { Editor, Node, Path } from '../../core';

export type TabbableEntry = {
  domNode: FocusableElement;
  path: Path;
  slateNode: Node;
};

/** The Tab keydown and the editor of the view Tabbable runs in. */
export type TabbableEventContext = Readonly<{
  editor: Editor;
  event: KeyboardEvent;
}>;

export type TabbablePluginState = {
  /**
   * When true, the plugin will add its event listener to the document instead
   * of the editor, allowing it to capture events from outside the editor.
   *
   * @default false
   */
  globalEventListener: boolean;
  /**
   * Add additional tabbables to the list of tabbables. Useful for adding
   * tabbables that are not contained within the editor. Ignores `isTabbable`.
   *
   * @default () => []
   */
  insertTabbableEntries: (context: TabbableEventContext) => TabbableEntry[];
  /**
   * Determine whether an element should be included in the tabbable list.
   *
   * @default ({ editor, entry }) => editor.read.schema.isVoid(entry.slateNode)
   */
  isTabbable: (
    context: TabbableEventContext & { entry: TabbableEntry }
  ) => boolean;
  /**
   * Decide whether Tabbable handles a Tab. A Tab pressed on a stop Tabbable
   * admits, which is an inserted entry or an in-editor tabbable that
   * `isTabbable` accepts, skips `query` and always follows the tab order.
   *
   * @default () => true
   */
  query: (context: TabbableEventContext) => boolean;
};
