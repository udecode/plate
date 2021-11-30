import { Path } from 'slate';

export type FormattingSources = {
  text?: unknown;
  dirty?: boolean;
};

export type PreviousStates = {
  [key: string]: FormattingSources;
};

export type ListItemMarkerSelection = {
  path: Path;
  depth: boolean;
};
