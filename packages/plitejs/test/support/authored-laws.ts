import {
  createEditor,
  defineEditorSchema,
  property,
  schema as schemaBuilder,
  target,
} from 'plitejs';

import type { AuthoredResult } from '../../src/authored';
import { createAuthoredPlugin } from '../../src/authored/authored';
import { expandContexts } from '../../src/authored/facts/compact';
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
import type { AnyEditor } from '../../src/interfaces/editor';
import { authoredTestApi, reviewRecords } from './authored';

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

const recordsOf = (
  decided: ReadonlyMap<string, Verdict>,
  landed: readonly LandedRecord[]
) =>
  reviewRecords({
    landed,
    verdicts: [...decided].map(([change, verdict], index) => ({
      decision: `d:${index}`,
      member: { at: 1, change },
      verdict,
    })),
  });

/**
 * Resolves `children` under `outcome` with `decided` stored as verdicts, as a
 * decision's view does. A decision that stores spares or shown values runs
 * through {@link decideIn} instead, since admission settles what it stores.
 */
export const resolveWithVerdicts = (
  decided: ReadonlyMap<string, Verdict>,
  children: readonly JsonNode[],
  outcome: AuthoredOutcome,
  resolveSchema = schema,
  landed: readonly LandedRecord[] = LANDED
) =>
  resolveAuthoredChildren(children, outcome, resolveSchema, 'main', {
    facts: factsOf({ children, records: recordsOf(decided, landed) }),
  });

export const settleAsAdmission = (
  decided: ReadonlyMap<string, Verdict>,
  step: Pick<AuthoredResolution, 'children' | 'landed'>,
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

  return {
    children: settled.children,
    landed: [...stored, ...settled.landed],
  };
};

export const loadWithVerdicts = (
  editor: (initialValue: readonly unknown[]) => ReturnType<typeof createEditor>,
  decided: ReadonlyMap<string, Verdict>,
  children: readonly JsonNode[],
  landed: readonly LandedRecord[]
) =>
  expandContexts(
    editor({
      children,
      records: recordsOf(decided, landed),
    } as never).read.value()
  ).children as readonly JsonNode[];

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

export const idGeneratorCalls = { count: 0 };
let generatedId = 0;

/**
 * Where a generated id holds: on every element with unique values, as
 * Plate's block ids do, on blocks, on blocks beside an unused element whose
 * content admits text, paragraphs and links, or on paragraphs. Under
 * `placed`, paragraphs generate theirs and a heading holds an id it states,
 * one that is not a line's own `p` id while it sits in a quote.
 */
export type IdPlaces =
  | 'blocks'
  | 'elements'
  | 'mixed'
  | 'paragraphs'
  | 'placed';
export const ID_PLACES: readonly IdPlaces[] = [
  'elements',
  'blocks',
  'mixed',
  'paragraphs',
  'placed',
];

const generateId = () => {
  idGeneratorCalls.count += 1;
  generatedId += 1;
  return `g${generatedId}`;
};

const underQuote = target.parent(target.type('quote'));

const idProperties = (places: IdPlaces) => {
  if (places === 'elements') {
    return [
      schemaBuilder.elementProperty(
        'id',
        property.string({ generate: generateId }),
        {
          role: 'metadata',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
          unique: true,
        }
      ),
    ];
  }
  const generated = schemaBuilder.elementProperty(
    'id',
    property.string({ generate: generateId }),
    {
      copy: 'drop',
      role: 'metadata',
      target:
        places === 'blocks' || places === 'mixed'
          ? target.group('block')
          : target.type('paragraph'),
      typeChange: 'preserve-if-allowed',
    }
  );
  if (places !== 'placed') return [generated];
  return [
    generated,
    schemaBuilder.elementProperty(
      'id',
      property.string({
        validate: (value): value is string =>
          typeof value === 'string' && !value.startsWith('p'),
        validationVersion: 1,
      }),
      {
        role: 'metadata',
        split: 'drop',
        target: target.and(target.type('heading'), underQuote),
        typeChange: 'preserve-if-allowed',
      }
    ),
    schemaBuilder.elementProperty('id', property.string(), {
      role: 'metadata',
      split: 'drop',
      target: target.and(target.type('heading'), target.not(underQuote)),
      typeChange: 'preserve-if-allowed',
    }),
  ];
};

/**
 * The quotes schema, and with `places` its generated-id variant, whose
 * blocks include headings, sections and cards whose body is a root of its
 * own; a `twin` has the variant's elements and no id.
 */
const quotesOf = (places?: IdPlaces, twin = false) => {
  const name = `laws-quotes${places ? `-${places}` : ''}${twin ? '-twin' : ''}`;
  const c = schemaBuilder.content;
  const blocks = places
    ? c.any([c.type('paragraph'), c.type('heading')], {
        default: { type: 'paragraph' },
        min: 1,
      })
    : c.type('paragraph', { min: 1 });

  return defineEditorSchema(name, {
    elements: {
      ...(places
        ? {
            card: {
              content: c.text({ default: 'text', min: 1 }),
              contentRoots: {
                body: {
                  content: c.type('paragraph', {
                    default: { type: 'paragraph' },
                    min: 1,
                  }),
                  ownership: 'exclusive' as const,
                },
              },
            },
            heading: schemaBuilder.element.textBlock(),
            section: { content: blocks },
          }
        : {}),
      link: { content: c.text({ min: 1 }), inline: true },
      ...(places === 'mixed'
        ? {
            mixed: {
              content: c.any([c.text(), c.type('paragraph'), c.type('link')]),
            },
          }
        : {}),
      paragraph: schemaBuilder.element.textBlock(),
      quote: { content: blocks },
    },
    id: name,
    properties: [
      schemaBuilder.elementProperty(
        'align',
        places && !twin
          ? property.string({
              validate: (value): value is string => typeof value === 'string',
              validationVersion: 1,
            })
          : property.string(),
        { target: target.type('quote') }
      ),
      ...(places && !twin ? idProperties(places) : []),
    ],
    root: c.any(
      [
        c.type('paragraph'),
        ...(places
          ? [c.type('heading'), c.type('section'), c.type('card')]
          : []),
        c.type('quote'),
      ],
      { default: { type: 'paragraph' }, min: 1 }
    ),
    unknown: 'reject',
    version: 1,
  });
};
const editorOf =
  (definition: ReturnType<typeof quotesOf>) => (initialValue: unknown) =>
    createEditor({
      plugins: [definition, createAuthoredPlugin({ authorId: 'laws' })],
      initialValue: initialValue as Array<Record<string, unknown>>,
    });
export const quotesEditor = editorOf(quotesOf());
export const quotesSchema = authoredResolveSchemaOf(
  quotesEditor([{ type: 'paragraph', children: [{ text: '' }] }])
);

/**
 * The editor of each id variant, and of its twin, which stores the same marks
 * with no id.
 */
export const generatedQuotes = Object.fromEntries(
  ID_PLACES.map((places) => [
    places,
    {
      editor: editorOf(quotesOf(places)),
      twin: editorOf(quotesOf(places, true)),
    },
  ])
) as Record<IdPlaces, Readonly<Record<'editor' | 'twin', typeof quotesEditor>>>;
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

const inline = () =>
  schemaBuilder.content.any(
    [schemaBuilder.content.text(), schemaBuilder.content.type('link')],
    { default: 'text', min: 1 }
  );
const Links = defineEditorSchema('laws-links', {
  elements: {
    link: {
      content: schemaBuilder.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
    paragraph: { content: inline() },
  },
  id: 'laws-links',
  properties: [
    // Stands for an element id, which a split drops from its new half.
    schemaBuilder.elementProperty('ref', property.string(), {
      split: 'drop',
      target: target.type('link'),
    }),
  ],
  root: schemaBuilder.content.type('paragraph', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

/** The author of every Editing operation in a give-back script. */
export const EDITING = 'edit';

const linksEditor = (
  initialValue: unknown,
  author = 'laws',
  intent: 'edit' | 'propose' = 'edit',
  tags = 't'
) => {
  let count = 0;

  return createEditor({
    initialValue: initialValue as never,
    plugins: [
      Links,
      createAuthoredPlugin({
        authorId: author,
        createChangeId: () => author,
        createTagId: () => `${tags}.${(count += 1)}`,
        intent,
        now: () => 1,
      }),
    ],
  });
};

export type LinkHalf = 'left' | 'right' | 'whole';

/**
 * One update of a give-back script, by a proposing change or by
 * {@link EDITING}. Change `s0` proposes the one split.
 */
export type GivebackOp = Readonly<
  | { by: string; kind: 'remove' }
  | { by: string; kind: 'split' }
  | { at: LinkHalf; by: string; kind: 'set'; value: string }
  | { at: LinkHalf; by: string; kind: 'unset' }
>;

type LinkNode = Readonly<{
  authored?: unknown;
  children?: readonly LinkNode[];
  text?: string;
  type?: string;
}>;
type LinkValue = Readonly<{ children: readonly LinkNode[] }>;

export const givebackStart = (): LinkValue => ({
  children: [
    {
      children: [
        { text: '' },
        { children: [{ text: 'ab' }], ref: 'r1', type: 'link' } as LinkNode,
        { text: '' },
      ],
      type: 'paragraph',
    },
  ],
});

const linkPathsOf = (value: LinkValue) =>
  value.children.flatMap((block, at) =>
    (block.children ?? []).flatMap((child, index) =>
      child.type === 'link' ? [[at, index]] : []
    )
  );

/**
 * Records `op`, the script's operation at `index`, on `value` as its author
 * writes it, in one update. Tag ids name the operation, since random ones
 * would make a decision's result differ from run to run.
 */
export const recordGiveback = (
  value: unknown,
  op: GivebackOp,
  index: number
) => {
  const editing = op.by === EDITING;
  const editor = linksEditor(
    value,
    editing ? 'editor' : op.by,
    editing ? 'edit' : 'propose',
    `op${index}`
  );
  const links = linkPathsOf(value as LinkValue);

  editor.update((tx) => {
    if (op.kind === 'split') {
      tx.nodes.split({
        always: true,
        at: { offset: 1, path: [...links[0], 0] },
        match: (node) => (node as LinkNode).type === 'link',
      });
    } else if (op.kind === 'remove') {
      tx.nodes.remove({ at: links[0] });
    } else {
      const at = op.at === 'right' ? links.at(-1) : links[0];
      if (op.kind === 'set') tx.nodes.set({ ref: op.value }, { at });
      else tx.nodes.unset('ref', { at });
    }
  });

  return editor.read.value() as LinkValue;
};

const unmarked = (node: LinkNode): LinkNode => {
  const { authored: _authored, children, ...rest } = node;

  return children ? { ...rest, children: children.map(unmarked) } : rest;
};

/** What a reader sees: the children without any review mark. */
export const givebackRead = (value: unknown) =>
  (value as LinkValue).children.map(unmarked);

/** Decides `decisions` in one call of `editor`'s public `decide`. */
export const decideIn = (
  editor: AnyEditor,
  decisions: ReadonlyMap<string, Verdict>
) => {
  const result = authoredTestApi(editor).decide(
    (['accept', 'reject'] as const).flatMap((action) => {
      const changes = [...decisions]
        .filter(([, verdict]) => verdict === action)
        .map(([change]) => change);

      return changes.length > 0 ? [{ action, changes }] : [];
    })
  );

  return { result, value: editor.read.value() };
};

export const decideGiveback = (
  value: unknown,
  decisions: ReadonlyMap<string, Verdict>
) => decideIn(linksEditor(value, 'zed'), decisions);

/**
 * Judges a public `decide` result as {@link admissionOf} judges a resolve: a
 * wait on another pending change waits, and any other refusal is a failure.
 */
export const decisionAdmission = (
  result: AuthoredResult,
  decided: ReadonlyMap<string, Verdict>,
  pending: readonly string[]
): StepAdmission => {
  if (result.status === 'applied' || result.status === 'unchanged') {
    return { kind: 'settles' };
  }
  if (result.status !== 'blocked') {
    return { kind: 'refused', reason: result.status };
  }
  const held = result.with.filter(
    (blocker) => decided.has(blocker) || !pending.includes(blocker)
  );

  return held.length > 0
    ? {
        kind: 'refused',
        reason: `waiting on ${held.join(', ')}, which is not another pending change`,
      }
    : { kind: 'waits' };
};
