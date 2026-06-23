import type { Path } from '@platejs/plite';

export type Heading = {
  id: string;
  depth: number;
  path: Path;
  title: string;
  type: string;
};
