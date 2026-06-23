import type { Path } from '@platejs/slate';

export type Heading = {
  id: string;
  depth: number;
  path: Path;
  title: string;
  type: string;
};
