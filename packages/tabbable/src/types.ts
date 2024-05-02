import { PlateEditor, TNode, TPath, Value } from '@udecode/plate-common/server';

export type TabDestinationPath = {
  type: 'path';
  path: TPath;
};

export type TabDestinationDOMNode = {
  type: 'dom-node';
  domNode: HTMLElement;
};

export type TabDestination = TabDestinationPath | TabDestinationDOMNode;

export type TabbableEntry = {
  domNode: HTMLElement;
  slateNode: TNode;
  path: TPath;
};

export interface TabbablePlugin<V extends Value = Value> {
  /**
   * Dynamically enable or disable the plugin.
   * @default: () => true
   */
  query?: (editor: PlateEditor<V>, event: KeyboardEvent) => boolean;

  /**
   * When true, the plugin will add its event listener to the document instead
   * of the editor, allowing it to capture events from outside the editor.
   * @default: false
   */
  globalEventListener?: boolean;

  /**
   * Add additional tabbables to the list of tabbables. Useful for adding
   * tabbables that are not contained within the editor. Ignores `isTabbable`.
   * @default: () => []
   */
  insertTabbableEntries?: (
    editor: PlateEditor<V>,
    event: KeyboardEvent
  ) => TabbableEntry[];

  /**
   * Determine whether an element should be included in the tabbable list.
   * @default: (editor, tabbableEntry) => isVoid(editor, tabbableEntry.slateNode)
   */
  isTabbable?: (
    editor: PlateEditor<V>,
    tabbableEntry: TabbableEntry
  ) => boolean;
}
