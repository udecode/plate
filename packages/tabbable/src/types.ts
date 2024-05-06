import type {
  PlateEditor,
  TNode,
  TPath,
  Value,
} from '@udecode/plate-common/server';

export type TabDestinationPath = {
  path: TPath;
  type: 'path';
};

export type TabDestinationDOMNode = {
  domNode: HTMLElement;
  type: 'dom-node';
};

export type TabDestination = TabDestinationDOMNode | TabDestinationPath;

export type TabbableEntry = {
  domNode: HTMLElement;
  path: TPath;
  slateNode: TNode;
};

export interface TabbablePlugin<V extends Value = Value> {
  /**
   * When true, the plugin will add its event listener to the document instead
   * of the editor, allowing it to capture events from outside the editor.
   *
   * @default: false
   */
  globalEventListener?: boolean;

  /**
   * Add additional tabbables to the list of tabbables. Useful for adding
   * tabbables that are not contained within the editor. Ignores `isTabbable`.
   *
   * @default: () => []
   */
  insertTabbableEntries?: (
    editor: PlateEditor<V>,
    event: KeyboardEvent
  ) => TabbableEntry[];

  /**
   * Determine whether an element should be included in the tabbable list.
   *
   * @default: (editor, tabbableEntry) => isVoid(editor, tabbableEntry.slateNode)
   */
  isTabbable?: (
    editor: PlateEditor<V>,
    tabbableEntry: TabbableEntry
  ) => boolean;

  /**
   * Dynamically enable or disable the plugin.
   *
   * @default: () => true
   */
  query?: (editor: PlateEditor<V>, event: KeyboardEvent) => boolean;
}
