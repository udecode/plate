import type { Path, TElement } from 'platejs';

export interface TabbableEntry {
  domNode: HTMLElement;
  path: Path;
  slateNode: TElement;
}

export type TabDestination = TabDestinationDOMNode | TabDestinationPath;

export interface TabDestinationDOMNode {
  domNode: HTMLElement;
  type: 'dom-node';
}

export interface TabDestinationPath {
  path: Path;
  type: 'path';
}
