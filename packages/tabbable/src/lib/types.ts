import type { Path, TElement } from '@udecode/plate';

export type TabDestinationPath = {
  path: Path;
  type: 'path';
};

export type TabDestinationDOMNode = {
  domNode: HTMLElement;
  type: 'dom-node';
};

export type TabDestination = TabDestinationDOMNode | TabDestinationPath;

export type TabbableEntry = {
  domNode: HTMLElement;
  path: Path;
  slateNode: TElement;
};
