import type { JsonNode } from '../../core/change/tokens';
import { survivalUnder } from '../../core/survival';
import { getDefined } from '../../internal/get-defined';
import { type AuthoredMark, readAuthoredMarks } from './marks';
import { isTextBlock } from './resolve';

type Node = JsonNode;

/** One child Editing holds once every pending change is accepted. */
export type ProposedChild = Readonly<{
  node: Node;
  /** Where the review tree holds it. */
  path: readonly number[];
}>;

const isText = (node: Node) => typeof node.text === 'string';

const hasMark = (node: unknown, kind: AuthoredMark['kind']) =>
  readAuthoredMarks(node).some((mark) => mark.kind === kind);

/** @internal */
export const proposedSurvival = survivalUnder<Node>((node) =>
  hasMark(node, 'delete')
);

/**
 * The element whose children a review element's children become once every
 * pending change is accepted, as a path from the root's children (empty for
 * the root), or null when Editing has already removed the element.
 */
export const proposedHost = (
  children: readonly Node[],
  path: readonly number[]
): readonly number[] | null => {
  const { survives } = proposedSurvival;
  const chain: Node[] = [];
  let level = children;

  for (const index of path) {
    const node = level[index];

    if (!node || !survives(node)) return null;
    chain.push(node);
    level = node.children ?? [];
  }

  let depth = chain.length;

  while (depth > 0 && hasMark(getDefined(chain[depth - 1]), 'unwrap')) {
    depth -= 1;
  }

  return path.slice(0, depth);
};

const childrenAt = (children: readonly Node[], path: readonly number[]) =>
  path.reduce<readonly Node[]>(
    (level, index) => level[index]?.children ?? [],
    children
  );

/**
 * The children of the host at `hostPath`, a path into `children`, once every
 * pending change is accepted, left to right, read from the host's own review
 * children: pending unwraps lift their children, struck nodes with no live
 * content go, and a block with a pending join folds into the text block
 * before it, or replaces it when that block keeps no content. A pending join
 * on the first surviving text block after the host also drops the last of
 * these children that is a text block when it keeps no content and no later
 * child holds a text block, unless a surviving element after the host that
 * does not unwrap encloses the joining block. Reading stops once the first
 * `limit` children are known, that is once no later join can replace one of
 * them.
 */
export const proposedChildren = (
  children: readonly Node[],
  hostPath: readonly number[],
  limit = Number.POSITIVE_INFINITY
): ProposedChild[] => {
  const { liveContent, survives } = proposedSurvival;
  const out: ProposedChild[] = [];
  // The text block a join in this host merges into, and whether it or a block
  // already joined to it keeps content.
  let target: Readonly<{ entry: number | null; keeps: boolean }> | null = null;

  // A join after a container merges into the container's last text block,
  // which stays inside it.
  const lastTextBlockIn = (
    node: Node
  ): Readonly<{ entry: null; keeps: boolean }> | null => {
    for (const child of [...(node.children ?? [])].reverse()) {
      if (isText(child) || !survives(child)) continue;
      if (isTextBlock(child)) {
        return { entry: null, keeps: (child.children ?? []).some(liveContent) };
      }

      const inner = lastTextBlockIn(child);

      if (inner) return inner;
    }

    return null;
  };
  const known = () =>
    out.length > limit &&
    (!target || target.keeps || target.entry === null || target.entry >= limit);
  const read = (level: readonly Node[], base: readonly number[]) => {
    for (const [index, child] of level.entries()) {
      if (known()) return;
      if (!survives(child)) continue;

      const childPath = [...base, index];

      if (isText(child)) {
        out.push({ node: child, path: childPath });
        continue;
      }
      if (hasMark(child, 'unwrap')) {
        read(child.children ?? [], childPath);
        continue;
      }

      const keeps = (child.children ?? []).some(liveContent);

      if (hasMark(child, 'join') && target) {
        if (target.keeps) continue;
        // As Editing's merge does, an empty target goes and the joining
        // block keeps its own type.
        if (target.entry !== null) out.splice(target.entry, 1);
      }

      out.push({ node: child, path: childPath });
      // A join past a container with no text block left reaches the block
      // before it.
      target = isTextBlock(child)
        ? { entry: out.length - 1, keeps }
        : (lastTextBlockIn(child) ?? target);
    }
  };
  // The first surviving text block in `node`, and whether a surviving element
  // that does not unwrap, `node` included, encloses it. Such an element is the
  // block's join boundary in the resolver, so its join cannot reach out of
  // `node` to the host.
  const firstBlockIn = (
    node: Node,
    enclosed: boolean
  ): Readonly<{ enclosed: boolean; node: Node }> | null => {
    if (isText(node) || !survives(node)) return null;
    if (isTextBlock(node)) return { enclosed, node };

    for (const child of node.children ?? []) {
      const found = firstBlockIn(child, enclosed || !hasMark(node, 'unwrap'));

      if (found) return found;
    }

    return null;
  };
  const joinsBack = () => {
    for (let depth = hostPath.length; depth > 0; depth -= 1) {
      const siblings = childrenAt(children, hostPath.slice(0, depth - 1));

      for (
        let index = getDefined(hostPath[depth - 1]) + 1;
        index < siblings.length;
        index += 1
      ) {
        const found = firstBlockIn(getDefined(siblings[index]), false);

        if (found) return !found.enclosed && hasMark(found.node, 'join');
      }
    }

    return false;
  };
  const dropJoinedBack = () => {
    if (known() || !target || target.entry === null || target.keeps) return;
    if (joinsBack()) out.splice(target.entry, 1);
  };

  read(childrenAt(children, hostPath), hostPath);
  dropJoinedBack();

  return out.slice(0, Math.min(out.length, limit));
};
