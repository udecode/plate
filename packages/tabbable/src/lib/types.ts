import type { Node, Path } from '@platejs/plite';
import type { FocusableElement } from 'tabbable';

export type TabbableEntry = {
  domNode: FocusableElement;
  path: Path;
  slateNode: Node;
};

export type TabDestination = TabDestinationDOMNode | TabDestinationPath;

export type TabDestinationDOMNode = {
  domNode: FocusableElement;
  type: 'dom-node';
};

export type TabDestinationPath = {
  path: Path;
  type: 'path';
};
