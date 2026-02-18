import type { Path } from 'platejs';

export interface Heading {
  id: string;
  depth: number;
  path: Path;
  title: string;
  type: string;
}
