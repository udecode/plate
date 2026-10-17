import type { NodeList } from '../../core/change/document-index';
import type { JsonNode } from '../../core/change/tokens';
import { survivalUnder } from '../../core/survival';
import { type Path, PathApi } from '../../interfaces/path';
import { getDefined } from '../../internal/get-defined';
import { type AuthoredMark, readAuthoredMarks } from './marks';
import {
  isTextBlock,
  joinKeysOf,
  joinPassage,
  proposedKeepsContentAtJoin,
} from './resolve';

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

type JoinTarget = { blocks: Node[]; entry: number | null; keeps: boolean };

type ReachableBlock = Readonly<{
  path: Path;
  target: JoinTarget;
  container?: Readonly<{ node: Node; path: Path }>;
}>;

/**
 * The element whose children a review element's children become once every
 * pending change is accepted, as a path from the root's children (empty for
 * the root), or null when Editing has already removed the element.
 */
export const proposedHost = (
  children: NodeList,
  path: readonly number[]
): readonly number[] | null => {
  const { survives } = proposedSurvival;
  const chain: Node[] = [];
  let level = children;

  for (const index of path) {
    const node = level.at(index);

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

const childrenAt = (children: NodeList, path: readonly number[]) =>
  path.reduce<NodeList>(
    (level, index) => level.at(index)?.children ?? [],
    children
  );

/**
 * The children of the host at `hostPath`, a path into `children`, once every
 * pending change is accepted, left to right, read from the review children of
 * the host and of each block that folds into it: pending unwraps lift their
 * children, struck nodes with no live content go, and a block with a pending
 * join folds into the text block it reaches, the nearest one before it past
 * blocks written after the join that go with it, or replaces that block when
 * it keeps no content at the join. A pending join on the first surviving text
 * block after the host also drops the text block among these children that it
 * reaches when that block keeps no content at that join, unless a surviving
 * element after the host that does not unwrap encloses the joining block.
 * Reading stops once the first `limit` children are known, that is once no
 * later join can replace one of them.
 */
export const proposedChildren = (
  children: NodeList,
  hostPath: readonly number[],
  limit = Number.POSITIVE_INFINITY
): ProposedChild[] => {
  const { liveContent, survives } = proposedSurvival;
  const out: ProposedChild[] = [];
  const reachableBlocks: ReachableBlock[] = [];
  const passage = joinPassage(children, readAuthoredMarks, survives);
  const joinKeys = (node: Node) => joinKeysOf(readAuthoredMarks(node));
  // A join after a container merges into the container's last text block,
  // which stays inside it.
  const lastTextBlockIn = (
    container: Readonly<{ node: Node; path: Path }>,
    before?: Path
  ): ReachableBlock | null => {
    const targetOf = (node: Node, path: Path): JoinTarget => {
      const keeps = (node.children ?? []).some(liveContent);
      const keys = joinKeys(node);
      let joined = keys.size > 0 ? lastTextBlockIn(container, path) : null;

      while (joined && passage.passesOver(joined.path, keys)) {
        joined = lastTextBlockIn(container, joined.path);
      }
      if (joined && !passage.stopsBefore(joined.path, path)) {
        const { target } = joined;

        if (target.keeps || proposedKeepsContentAtJoin(target.blocks, node)) {
          return {
            blocks: [...target.blocks, node],
            entry: null,
            keeps: target.keeps || keeps,
          };
        }
      }

      return { blocks: [node], entry: null, keeps };
    };
    const search = (node: Node, path: Path): ReachableBlock | null => {
      const level = node.children ?? [];

      for (let index = level.length - 1; index >= 0; index -= 1) {
        const child = getDefined(level[index]);
        const childPath = [...path, index];

        if (before && PathApi.compare(childPath, before) === 1) continue;
        if (isText(child) || !survives(child)) continue;
        if (isTextBlock(child)) {
          if (before && !PathApi.isBefore(childPath, before)) continue;

          return {
            path: childPath,
            target: targetOf(child, childPath),
            container,
          };
        }

        const inner = search(child, childPath);

        if (inner) return inner;
      }

      return null;
    };

    return search(container.node, container.path);
  };
  const reachedBy = (keys: ReadonlySet<string>) => {
    for (let at = reachableBlocks.length - 1; at >= 0; at -= 1) {
      let block: ReachableBlock | null = getDefined(reachableBlocks[at]);

      while (block && passage.passesOver(block.path, keys)) {
        block = block.container
          ? lastTextBlockIn(block.container, block.path)
          : null;
      }
      if (block) return block.target;
    }

    return null;
  };
  // As Editing's merge does, an empty target gives its place to the joining
  // block, which keeps its own type.
  const empty = (target: JoinTarget, joining: ProposedChild) => {
    const { entry } = target;

    for (let at = reachableBlocks.length - 1; at >= 0; at -= 1) {
      if (getDefined(reachableBlocks[at]).target === target) {
        reachableBlocks.splice(at, 1);
      }
    }
    if (entry === null) return;
    out[entry] = joining;
  };
  // A later join reaches past a block only when that block goes with a join.
  const known = () => {
    if (out.length <= limit) return false;
    for (let at = reachableBlocks.length - 1; at >= 0; at -= 1) {
      const { path, target } = getDefined(reachableBlocks[at]);

      if (!target.keeps && target.entry !== null && target.entry < limit) {
        return false;
      }
      if (!passage.goesWithJoin(path)) return true;
    }

    return true;
  };
  const read = (level: NodeList, base: readonly number[]) => {
    for (let index = 0; index < level.length; index += 1) {
      const child = getDefined(level.at(index));

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
      const keys = joinKeys(child);
      const target = keys.size > 0 ? reachedBy(keys) : null;

      if (target) {
        if (target.keeps || proposedKeepsContentAtJoin(target.blocks, child)) {
          target.blocks.push(child);
          target.keeps ||= keeps;
          reachableBlocks.push({ path: childPath, target });
          continue;
        }
        empty(target, { node: child, path: childPath });
        reachableBlocks.push({
          path: childPath,
          target: { blocks: [child], entry: target.entry, keeps },
        });
        continue;
      }

      out.push({ node: child, path: childPath });

      // A join past a container with no text block left reaches the block
      // before it.
      const block = isTextBlock(child)
        ? {
            path: childPath,
            target: { blocks: [child], entry: out.length - 1, keeps },
          }
        : lastTextBlockIn({ node: child, path: childPath });

      if (block) reachableBlocks.push(block);
    }
  };
  const firstBlockIn = (
    node: Node
  ): Readonly<{ below: number[]; node: Node }> | null => {
    if (isText(node) || !survives(node)) return null;
    if (isTextBlock(node)) return { below: [], node };

    for (const [index, child] of (node.children ?? []).entries()) {
      const found = firstBlockIn(child);

      if (found) return { ...found, below: [index, ...found.below] };
    }

    return null;
  };
  const blockAfter = (after: Path) => {
    for (let depth = after.length; depth > 0; depth -= 1) {
      const parent = after.slice(0, depth - 1);
      const siblings = childrenAt(children, parent);

      for (
        let index = getDefined(after[depth - 1]) + 1;
        index < siblings.length;
        index += 1
      ) {
        const found = firstBlockIn(getDefined(siblings.at(index)));

        if (found) {
          return { node: found.node, path: [...parent, index, ...found.below] };
        }
      }
    }

    return null;
  };
  const dropJoinedBack = () => {
    if (known()) return;

    const joining = blockAfter(hostPath);

    if (!joining || passage.stopsBefore(hostPath, joining.path)) return;

    const keys = joinKeys(joining.node);
    const target = keys.size > 0 ? reachedBy(keys) : null;

    if (
      target &&
      !target.keeps &&
      !proposedKeepsContentAtJoin(target.blocks, joining.node)
    ) {
      empty(target, joining);
    }
  };
  const readJoinedIntoHost = (host: Node) => {
    const blocks = [host];
    const reachable = [{ joinedIntoHost: true, path: hostPath }];

    for (let next = blockAfter(hostPath); next; next = blockAfter(next.path)) {
      const keys = joinKeys(next.node);
      const reached =
        keys.size > 0
          ? reachable.findLast(({ path }) => !passage.passesOver(path, keys))
          : undefined;

      if (
        reached?.joinedIntoHost &&
        !passage.stopsBefore(reached.path, next.path)
      ) {
        if (!proposedKeepsContentAtJoin(blocks, next.node)) return;
        read(next.node.children ?? [], next.path);
        blocks.push(next.node);
        reachable.push({ joinedIntoHost: true, path: next.path });
        continue;
      }
      if (!passage.goesWithJoin(next.path)) return;
      reachable.push({ joinedIntoHost: false, path: next.path });
    }
  };
  const last = hostPath.at(-1);
  const host =
    last === undefined
      ? undefined
      : childrenAt(children, hostPath.slice(0, -1)).at(last);

  read(childrenAt(children, hostPath), hostPath);
  dropJoinedBack();
  if (host && isTextBlock(host)) readJoinedIntoHost(host);

  return out.slice(0, Math.min(out.length, limit));
};
