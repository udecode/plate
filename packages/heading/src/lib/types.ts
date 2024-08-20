import type { Path } from 'slate';

export interface Heading {
  depth: number;
  id: string;
  path: Path;
  title: string;
  type: string;
}
