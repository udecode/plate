import type { Path } from 'platejs';

export type Heading = {
  id: string;
  depth: number;
  path: Path;
  title: string;
  type: string;
};
