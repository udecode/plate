import type { TNode, TPath } from '@udecode/plate-common';

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
