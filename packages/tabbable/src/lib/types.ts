type Path = number[];

export type TabbableEntry = {
  domNode: HTMLElement;
  path: Path;
  slateNode: any;
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
