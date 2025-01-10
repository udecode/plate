import type { Path } from '@udecode/plate';

export interface Heading {
  id: string;
  depth: number;
  path: Path;
  title: string;
  type: string;
}
