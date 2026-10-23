import {
  createEditor,
  defineEditorSchema,
  property,
  schema as schemaBuilder,
  target,
} from 'plitejs';

import { createAuthoredPlugin } from '../../src/authored/authored';
import { factsOf } from '../../src/authored/facts/facts';
import { type LandedRecord, landedOf } from '../../src/authored/facts/records';
import { authoredResolveSchemaOf } from '../../src/authored/resolve-schema';
import type { AuthoredMark } from '../../src/authored/tree/marks';
import {
  type AuthoredOutcome,
  type AuthoredResolution,
  resolveAuthoredChildren,
} from '../../src/authored/tree/resolve';
import type { JsonNode } from '../../src/core/change/tokens';
import { reviewRecords } from './authored';

// The laws hold for the editor's canonical form, which decisions produce.
export const schema = authoredResolveSchemaOf(
  createEditor({ plugins: [createAuthoredPlugin({ authorId: 'laws' })] })
);

export type Verdict = 'accept' | 'reject';

// A link to `<key>l` names a gone write that landed, one to `<key>g` a gone
// write that never did.
export const LANDED = ['align', 'bold'].map((key) =>
  landedOf({ at: 1, change: '~edit:laws', id: `${key}l` })
);
// Only a landed write some remaining tag links can be read; a step that
// lands a write on content a later step removes stores one nothing reads.
export const writesOf = (
  landed: readonly LandedRecord[],
  nodes: readonly unknown[]
) => {
  const linked = new Set<string>();
  const walk = (node: {
    authored?: readonly AuthoredMark[];
    children?: readonly unknown[];
  }) => {
    const formats = (node.authored ?? []).filter(
      (item) => item.kind === 'format'
    );

    // A link whose tag still sits on the key reads that tag, not its record.
    for (const item of formats) {
      for (const link of (item.over ?? []).flat()) {
        if (
          !formats.some(
            (other) => other.id === link.id && other.key === item.key
          )
        ) {
          linked.add(link.id);
        }
      }
    }
    for (const child of node.children ?? []) walk(child as never);
  };

  for (const node of nodes) walk(node as never);

  return [...new Set(landed.map(({ write }) => write))]
    .filter((write) => linked.has(write))
    .sort();
};

export const resolveWithVerdicts = (
  decided: ReadonlyMap<string, Verdict>,
  children: readonly JsonNode[],
  outcome: AuthoredOutcome,
  resolveSchema = schema,
  landed: readonly LandedRecord[] = LANDED
) =>
  resolveAuthoredChildren(children, outcome, resolveSchema, 'main', {
    facts: factsOf({
      children,
      records: reviewRecords({
        landed,
        verdicts: [...decided].map(([change, verdict], index) => ({
          decision: `d:${index}`,
          member: { at: 1, change },
          verdict,
        })),
      }),
    }),
  });

export const settleAsAdmission = (
  decided: ReadonlyMap<string, Verdict>,
  step: Readonly<{
    children: readonly JsonNode[];
    landed: readonly LandedRecord[];
  }>,
  landed: readonly LandedRecord[],
  resolveSchema = schema
) => {
  const stored = [...landed, ...step.landed];
  const settled = resolveWithVerdicts(
    decided,
    step.children,
    () => 'keep',
    resolveSchema,
    stored
  );

  return { children: settled.children, landed: [...stored, ...settled.landed] };
};

export type StepAdmission =
  | Readonly<{ kind: 'refused'; reason: string }>
  | Readonly<{ kind: 'settles' }>
  | Readonly<{ kind: 'waits' }>;

export const admissionOf = (
  result: AuthoredResolution,
  decided: ReadonlyMap<string, Verdict>,
  deciding: ReadonlyMap<string, Verdict>,
  pending: readonly string[]
): StepAdmission => {
  const blockers = result.blockers.filter((blocker) => !deciding.has(blocker));
  const held = blockers.filter(
    (blocker) => decided.has(blocker) || !pending.includes(blocker)
  );
  if (held.length > 0) {
    return {
      kind: 'refused',
      reason: `waiting on ${held.join(', ')}, which is not another pending change`,
    };
  }
  if (blockers.length > 0) return { kind: 'waits' };
  if (result.unplaceable) return { kind: 'refused', reason: 'unplaceable' };
  return { kind: 'settles' };
};

export const all =
  (decisions: ReadonlyMap<string, Verdict>): AuthoredOutcome =>
  (change) =>
    decisions.get(change) ?? 'keep';

// A link names a tag present when its tag was written, or a gone write.
export const linksToPresentTags = (tags: readonly AuthoredMark[]) =>
  tags.map((tag) => {
    if (tag.kind !== 'format' || !tag.over) return tag;
    const over = tag.over
      .map((step) =>
        step.filter(
          ({ id }) =>
            /[gl]$/.test(id) ||
            tags.some((other) => other.kind === 'format' && other.id === id)
        )
      )
      .filter((step) => step.length > 0);
    const { base, over: _over, ...rest } = tag;

    return over.length > 0 ? { ...rest, base, over } : rest;
  });

/**
 * A whole-block insertion or deletion marks every node inside the block too,
 * as recording writes it, in place of the node's own mark of that change. A
 * link to a dropped format tag goes with it, since a link that names a tag on
 * another leaf would be a part withdrawal, a named limit.
 */
export const spread = <T extends object>(node: T, item: AuthoredMark): T => {
  const record = node as T & {
    authored?: AuthoredMark[];
    children?: object[];
  };
  const marks = record.authored ?? [];

  return {
    ...node,
    authored: linksToPresentTags([
      ...marks.filter((other) => other.change !== item.change),
      item,
    ]),
    ...(record.children
      ? { children: record.children.map((child) => spread(child, item)) }
      : {}),
  };
};

const Quotes = defineEditorSchema('laws-quotes', {
  elements: {
    link: { content: schemaBuilder.content.text({ min: 1 }), inline: true },
    paragraph: schemaBuilder.element.textBlock(),
    quote: { content: schemaBuilder.content.type('paragraph', { min: 1 }) },
  },
  id: 'laws-quotes',
  properties: [
    schemaBuilder.elementProperty('align', property.string(), {
      target: target.type('quote'),
    }),
  ],
  root: schemaBuilder.content.any(
    [
      schemaBuilder.content.type('paragraph'),
      schemaBuilder.content.type('quote'),
    ],
    { default: { type: 'paragraph' }, min: 1 }
  ),
  unknown: 'reject',
  version: 1,
});
export const quotesEditor = (initialValue: readonly unknown[]) =>
  createEditor({
    plugins: [Quotes, createAuthoredPlugin({ authorId: 'laws' })],
    initialValue: initialValue as Array<Record<string, unknown>>,
  });
export const quotesSchema = authoredResolveSchemaOf(
  quotesEditor([{ type: 'paragraph', children: [{ text: '' }] }])
);
export const structuralMark = (kind: AuthoredMark['kind'], change: string) =>
  ({ at: 1, author: change, change, kind }) as AuthoredMark;
export const withMarksOf = <T extends object>(
  node: T,
  marks: ReadonlyArray<
    { change: string; kind: AuthoredMark['kind'] } | undefined
  >
) => {
  const present = marks.filter((item) => item !== undefined);
  const unique = present.filter(
    (item, index) =>
      present.findIndex((other) => other.change === item.change) === index
  );
  const marked =
    unique.length > 0
      ? {
          ...node,
          authored: unique.map((item) =>
            structuralMark(item.kind, item.change)
          ),
        }
      : node;
  const { children } = marked as { children?: object[] };
  const content = unique.filter(
    (item) => item.kind === 'delete' || item.kind === 'insert'
  );

  return children && content.length > 0
    ? {
        ...marked,
        children: children.map((child) =>
          content.reduce(
            (spreading, item) =>
              spread(spreading, structuralMark(item.kind, item.change)),
            child
          )
        ),
      }
    : marked;
};
export type Block2 = {
  authored?: AuthoredMark[];
  children: object[];
  type: string;
};

/**
 * Where a paragraph's split boundary follows another paragraph, a link around
 * each side's text carries that split's cut, as an Enter inside a link writes.
 */
export const withCuts = (
  blocks: readonly Block2[],
  flags: readonly boolean[]
) => {
  const cuts = blocks.map((): AuthoredMark[] => []);

  blocks.forEach((block, index) => {
    const previous = blocks[index - 1];
    const split = block.authored?.find((item) => item.kind === 'split');

    if (
      !flags[index] ||
      !split ||
      block.type !== 'paragraph' ||
      previous?.type !== 'paragraph'
    ) {
      return;
    }
    const cut = (side: 'end' | 'start') =>
      ({
        at: 1,
        author: split.change,
        change: split.change,
        cut: `k${index}`,
        kind: 'split',
        side,
      }) as AuthoredMark;

    cuts[index - 1].push(cut('end'));
    cuts[index].push(cut('start'));
  });

  return blocks.map((block, index) =>
    cuts[index].length === 0
      ? block
      : {
          ...block,
          children: [
            { text: '' },
            { authored: cuts[index], children: block.children, type: 'link' },
            { text: '' },
          ],
        }
  );
};
