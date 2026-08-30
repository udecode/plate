import type { FocusableElement } from 'tabbable';

import type { Node, Path } from '../../core';

export type TabbableEntry = {
  domNode: FocusableElement;
  path: Path;
  slateNode: Node;
};

export type TabDestination =
  | { domNode: FocusableElement; type: 'dom-node' }
  | { path: Path; type: 'path' };

export type FindTabDestinationOptions = {
  activeTabbableEntry: TabbableEntry | null;
  direction: 'backward' | 'forward';
  tabbableEntries: TabbableEntry[];
};

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
  insertTabbableEntries: (event: KeyboardEvent) => TabbableEntry[];
  /**
   * Determine whether an element should be included in the tabbable list.
   *
   * @default (entry) => editor.read.schema.isVoid(entry.slateNode)
   */
  isTabbable: (entry: TabbableEntry) => boolean;
  /**
   * Dynamically enable or disable the plugin.
   *
   * @default () => true
   */
  query: (event: KeyboardEvent) => boolean;
};
