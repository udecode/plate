import type { JsonRecord } from '../../core/change/json';
import type { JsonNode } from '../../core/change/tokens';
import {
  type AuthoredMark,
  type AuthoredMember,
  isContextInsertion,
  readAuthoredMarks,
  readMembers,
  withMembers,
} from '../tree/marks';
import { type Carried, outerToInner } from './compact';
import {
  type ContextLookup,
  claimsOf,
  contextClaimsOf,
  contextFor,
} from './facts';
import { type ContextRecord, incarnationOf, memberOf } from './records';

export type Dependencies = ContextLookup &
  Readonly<{
    /**
     * A node's claims: its context's members first as insertions, then its
     * own marks with its own insertions outer to inner.
     */
    marks: (node: unknown) => readonly AuthoredMark[];
    /** The context records `props` and `throughout` added. */
    minted: () => readonly ContextRecord[];
    /** `fresh` drops the held deletions `props` carries, for new content. */
    props: (
      props: Readonly<JsonRecord>,
      marks: readonly AuthoredMark[],
      fresh?: boolean
    ) => Readonly<JsonRecord>;
    /** New content `node` with `marks` added to it and to each descendant. */
    throughout: (node: JsonNode, marks: readonly AuthoredMark[]) => JsonNode;
  }>;

export const createDependencies = (
  facts: ContextLookup,
  carried: Carried = () => 0
): Dependencies => {
  const added = new Map<string, ContextRecord>();
  const minted: ContextRecord[] = [];
  const recording: ContextLookup = {
    contexts: {
      get: (ctx) => added.get(ctx) ?? facts.contexts.get(ctx),
      has: (ctx) => added.has(ctx) || facts.contexts.has(ctx),
    },
  };
  const marks = (node: unknown) => {
    const own = readAuthoredMarks(node);
    const inserts = own.filter(isContextInsertion);

    return inserts.length < 2
      ? claimsOf(node, recording)
      : [
          ...contextClaimsOf(node, recording),
          ...own.filter((mark) => !isContextInsertion(mark)),
          ...outerToInner(inserts, carried),
        ];
  };
  const props: Dependencies['props'] = (target, written, fresh = false) => {
    const seen = new Set<string>();
    const unique = written.filter((mark) => {
      if (mark.kind !== 'insert') return true;

      const key = incarnationOf(mark);

      if (seen.has(key)) return false;
      seen.add(key);

      return true;
    });
    const inserts = unique.filter(isContextInsertion);
    const claim = inserts.at(-1);
    const { ctx, records } = contextFor(
      recording,
      inserts.slice(0, -1).map(memberOf)
    );

    for (const record of records) {
      added.set(record.ctx, record);
      minted.push(record);
    }

    const held: AuthoredMember[] = fresh
      ? []
      : readMembers(target).filter((member) => member.kind === 'held');

    return withMembers(target, [
      ...unique.filter((mark) => !isContextInsertion(mark)),
      ...(claim ? [claim] : []),
      ...held,
      ...(ctx === null ? [] : [{ ctx, kind: 'in' as const }]),
    ]);
  };
  const throughout = (
    node: JsonNode,
    extra: readonly AuthoredMark[]
  ): JsonNode => {
    if (extra.length === 0) return node;

    const { children, ...rest } = node;

    return {
      ...props(rest, [...marks(node), ...extra], true),
      ...(children
        ? { children: children.map((child) => throughout(child, extra)) }
        : {}),
    } as JsonNode;
  };

  return {
    contexts: recording.contexts,
    marks,
    minted: () => minted,
    props,
    throughout,
  };
};
