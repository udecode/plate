import type { Path, TElement } from 'platejs';

export type TabbableEntry = {
  domNode: HTMLElement;
  path: Path;
  slateNode: TElement;
};

export type TabDestination = TabDestinationDOMNode | TabDestinationPath;

export type TabDestinationDOMNode = {
  domNode: HTMLElement;
  type: 'dom-node';
};

export type TabDestinationPath = {
  path: Path;
  type: 'path';
};
