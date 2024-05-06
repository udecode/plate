import { Node, type Path } from 'slate';

import type { NodeOf, TNode } from './TNode';
import type { TNodeEntry } from './TNodeEntry';

/** Get an entry for the common ancesetor node of two paths. */
export const getCommonNode = <N extends NodeOf<R>, R extends TNode = TNode>(
  root: R,
  path: Path,
  another: Path
) => Node.common(root, path, another) as TNodeEntry<N>;
