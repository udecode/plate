import type { Path } from 'slate';

export interface Heading {
  id: string;
  depth: number;
  path: Path;
  title: string;
  type: string;
}
