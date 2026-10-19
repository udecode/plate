import type { Editor } from '../../../core';
import {
  ElementApi,
  PathApi,
  type Descendant,
  type EditorUpdateTransaction,
  type NodeKey,
  type Path,
} from '../../../facade';
import {
  canReplaceContainers,
  type BlockRelease,
} from '../../../internal/plugin/blockRelease';
import { BaseIndentPlugin } from '../../indent';
import { listDepth } from './listFamily.internal';

export const planListConversion = (
  editor: Editor,
  tx: EditorUpdateTransaction,
  releases: readonly BlockRelease[],
  { listType }: Readonly<{ listType: string }>
) => {
  const keyAt = (path: Path) => tx.key(path);
  const byContainer = new Map(
    releases.map((release) => [keyAt(release.container[1]), release])
  );
  const blocks = new Map<NodeKey, Readonly<{ depth: number; type: string }>>();
  const { indentMax } = editor.plugin(BaseIndentPlugin).store.get();

  const planNestedFit = (
    release: BlockRelease,
    depth: number
  ): Descendant[] => {
    const [, containerPath] = release.container;

    blocks.set(release.key, { depth, type: release.block.type });

    return release.fit.flatMap((child, index) => {
      if (child === release.block) {
        return [{ ...release.block, indent: depth, listType }];
      }
      if (!ElementApi.isElement(child) || !tx.nodes.isContent(child)) {
        return [child];
      }

      const key = keyAt([...containerPath, index]);
      const childDepth = depth + Math.max(1, listDepth(child));
      const inner = key && byContainer.get(key);

      if (inner) return planNestedFit(inner, childDepth);
      if (key) blocks.set(key, { depth: childDepth, type: child.type });

      return [{ ...child, indent: childDepth }];
    });
  };

  const fits = new Map<BlockRelease, Descendant[]>();

  for (const release of releases) {
    const [container, path] = release.container;
    const parentPath = PathApi.parent(path);
    const parentKey = parentPath.length > 0 ? keyAt(parentPath) : null;

    if (parentKey && byContainer.has(parentKey)) continue;

    fits.set(
      release,
      planNestedFit(release, Math.max(1, listDepth(container)))
    );
  }

  for (const { depth, type } of blocks.values()) {
    if (
      (typeof indentMax === 'number' && depth > indentMax) ||
      !tx.schema.property({ key: 'indent', placement: 'element', type })
    ) {
      return null;
    }
  }

  if (!canReplaceContainers(tx, fits)) return null;

  return new Map([...blocks].map(([key, { depth }]) => [key, depth] as const));
};
