import {
  canPlaceBlocksAtPath,
  definePluginPoint,
  ElementApi,
  getPluginContributions,
  PathApi,
  type Descendant,
  type Editor,
  type EditorUpdateTransaction,
  type Element,
  type NodeEntry,
  type NodeKey,
  type Path,
} from '../../facade';
import { failInvariant } from '../failInvariant';

/**
 * A container's release of one of its blocks as a plain block, `block`, with
 * the container's children taking its place.
 */
export type BlockRelease = Readonly<{
  /** The released block as it will read, before any write. */
  block: Element;
  /** The container that goes away, read before any write. */
  container: NodeEntry<Element>;
  /**
   * The children that take the container's place, one per container child in
   * its order, with the released block at its own child's index.
   */
  fit: readonly Descendant[];
  /** The released block's key. */
  key: NodeKey;
  /** Retypes the released block and unwraps the container, keeping every key. */
  apply: (tx: EditorUpdateTransaction) => boolean;
}>;

/**
 * Contribute how a container releases one of its blocks, such as a Details
 * releasing its title, so a command that converts that block, such as a list
 * or code block toggle, can convert it without knowing the container.
 */
export const blockRelease =
  definePluginPoint<
    (
      tx: EditorUpdateTransaction,
      entry: NodeEntry<Element>
    ) => BlockRelease | null
  >('block-release');

/** The releases of `entries` whose released block `accept` takes, outermost first. */
export const readBlockReleases = (
  editor: Editor,
  tx: EditorUpdateTransaction,
  entries: ReadonlyArray<NodeEntry<Element>>,
  accept: (block: Element, entry: NodeEntry<Element>) => boolean
) => {
  const contributions = getPluginContributions(editor, blockRelease);
  const releases = new Map<NodeKey, BlockRelease>();

  for (const entry of entries) {
    for (const release of contributions) {
      const found = release(tx, entry);

      if (found && accept(found.block, entry)) {
        releases.set(found.key, found);
        break;
      }
    }
  }

  return [...releases.values()].toSorted(
    (left, right) =>
      left.container[1].length - right.container[1].length ||
      PathApi.compare(left.container[1], right.container[1])
  );
};

export const canReplaceContainers = (
  tx: EditorUpdateTransaction,
  fits: ReadonlyMap<BlockRelease, readonly Descendant[]>
) => {
  const byParent = new Map<
    string,
    { fits: Map<number, readonly Descendant[]>; path: Path }
  >();

  for (const [{ container }, fit] of fits) {
    const [, path] = container;
    const parentPath = PathApi.parent(path);
    const id = parentPath.join(',');
    const group = byParent.get(id) ?? {
      fits: new Map<number, readonly Descendant[]>(),
      path: parentPath,
    };

    group.fits.set(path.at(-1) ?? 0, fit);
    byParent.set(id, group);
  }

  return [...byParent.values()].every(({ fits: planned, path }) => {
    const first = Math.min(...planned.keys());
    const last = Math.max(...planned.keys());
    const fit: Descendant[] = [];
    const removing: number[] = [];

    for (let index = first; index <= last; index++) {
      const sibling = tx.nodes.get([...path, index], {
        match: ElementApi.isElement,
      })?.[0];

      removing.push(index);
      fit.push(...(planned.get(index) ?? (sibling ? [sibling] : [])));
    }

    return canPlaceBlocksAtPath(tx.schema, [...path, first], fit, {
      removing,
      root: tx.view.root(),
    });
  });
};

/**
 * Applies `releases` innermost first. A caller checks the whole result before
 * it writes, so a refused release here is a bug, not a refusal.
 */
export const applyBlockReleases = (
  tx: EditorUpdateTransaction,
  releases: readonly BlockRelease[]
) => {
  for (const release of releases.toReversed()) {
    if (!release.apply(tx)) failInvariant('A checked block release refused.');
  }
};
