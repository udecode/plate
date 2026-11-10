import type { EditorDocumentRecords } from '../../interfaces/editor';
import {
  canonicalRecordJson,
  getValueRecords,
  type RecordOps,
  recordStoreToJson,
} from '../record-store';
import {
  type DocumentChange,
  getInternalDocumentChangeEntries,
  getInternalDocumentChangeRecords,
} from './document-change';
import {
  alive,
  baseIdentity,
  editTaken,
  type Identity,
  type Intent,
  intentOf,
  type Move,
  type MoveStep,
  movesOf,
  renamedIdentity,
  renamedIntent,
  stepIdentity,
  withLineage,
} from './effect-ledger-identity';
import type { JsonRecord } from './json';
import { applyPropertyModifications, SectionIterator } from './root-change';
import {
  encodeNodes,
  type JsonNode,
  type JsonToken,
  type NodeKind,
} from './tokens';
import type { PropertyModification } from './transform';

export type ChangeSection =
  | Readonly<{ kind: 'props'; modifications: readonly PropertyModification[] }>
  | Readonly<{ kind: 'replace'; insert: readonly JsonToken[]; length: number }>
  | Readonly<{ kind: 'retain'; length: number }>;

export type ChangeView = Readonly<{
  createRoots: readonly string[];
  deleteRoots: readonly string[];
  records: RecordOps;
  roots: ReadonlyMap<string, readonly ChangeSection[]>;
}>;

export type LedgerValue = Readonly<{
  children: readonly JsonNode[];
  records?: EditorDocumentRecords;
  roots?: Readonly<Record<string, readonly JsonNode[]>>;
}>;

export type SetValued = (
  placement: 'element' | 'text',
  key: string,
  context: Readonly<{
    /** Immediate parent first. */
    ancestors: readonly string[];
    /** `null` addresses the implicit primary root. */
    root: string | null;
    type: string;
  }>
) => boolean;

export type Verdict = Readonly<{
  contests: readonly string[];
  harms: readonly string[];
  losses: readonly string[];
}> &
  (
    | Readonly<{ kind: 'contested' | 'lost' }>
    | Readonly<{ kind: 'held'; proof: HeldProof }>
  );

/** Whether own changed a fact against the base its changes were written on, which a later frame's base may already show. */
type Claims = Readonly<{
  boundary: (left: string, right: string) => boolean;
  /** The base container own moved a node into. */
  container: (id: string) => string | undefined;
  facet: (id: string, key: string) => boolean;
  order: (left: string, right: string) => boolean;
}>;
const NO_CLAIMS: Claims = {
  boundary: () => false,
  container: () => undefined,
  facet: () => false,
  order: () => false,
};
const proofState: unique symbol = Symbol('held proof');
export type HeldProof = Readonly<{
  [proofState]: Readonly<{
    accepted: SideFold;
    claims: Claims;
    merged: MergedFold;
    origin: Claimant;
    own: SideFold;
  }>;
}>;

export const viewOfChange = (change: DocumentChange): ChangeView => {
  const roots = new Map<string, ChangeSection[]>();
  for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
    const sections: ChangeSection[] = [];
    const at = new SectionIterator(rootChange.sections, rootChange.data);
    while (!at.done) {
      const { length, modifications } = at;
      if (modifications) sections.push({ kind: 'props', modifications });
      else if (at.keep) sections.push({ kind: 'retain', length });
      else {
        // A replaced word arrives as a delete and an insert side by side.
        const { tokens } = at.slice;
        const prior = sections.at(-1);
        if (prior?.kind === 'replace') {
          sections[sections.length - 1] = {
            insert: [...prior.insert, ...tokens],
            kind: 'replace',
            length: prior.length + length,
          };
        } else {
          sections.push({ insert: tokens, kind: 'replace', length });
        }
      }
      at.next();
    }
    roots.set(root, sections);
  }
  return {
    createRoots: [...change.createRoots],
    deleteRoots: [...change.deleteRoots],
    records: getInternalDocumentChangeRecords(change),
    roots,
  };
};

type Shape = Readonly<{
  ch?: string;
  kind: 'close' | 'letter' | 'open';
  nodeKind: NodeKind;
  props?: Readonly<JsonRecord>;
}>;
type Token = Shape & Readonly<{ id: string }>;
export type Streams = ReadonlyMap<string, readonly Token[]>;

const shapesOf = (tokens: readonly JsonToken[]) => {
  const shapes: Shape[] = [];
  for (const token of tokens) {
    if (token.kind === 'text') {
      // A change's lengths count code units, not code points.
      for (const ch of token.text.split('')) {
        shapes.push({ ch, kind: 'letter', nodeKind: 'text' });
      }
    } else if (token.kind === 'open') {
      shapes.push({
        kind: 'open',
        nodeKind: token.nodeKind,
        props: token.props,
      });
    } else {
      shapes.push({ kind: 'close', nodeKind: token.nodeKind });
    }
  }
  return shapes;
};

const isCarrier = (token: Shape) =>
  token.kind === 'letter' ||
  (token.kind === 'open' && token.nodeKind === 'element');
const alignKey = (token: Shape) =>
  `${token.kind}:${token.nodeKind}:${token.ch ?? ''}`;
const shapeKey = (token: Shape) =>
  `${alignKey(token)}:${token.props ? canonicalRecordJson(token.props) : ''}`;

const commonPairs = <L, R>(
  a: readonly L[],
  b: readonly R[],
  same: (left: L, right: R) => boolean
) => {
  const width = b.length + 1;
  const table = new Uint16Array((a.length + 1) * width);
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i * width + j] = same(a[i], b[j])
        ? table[(i + 1) * width + j + 1] + 1
        : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
    }
  }
  const pairs: Array<readonly [number, number]> = [];
  for (let i = 0, j = 0; i < a.length && j < b.length;) {
    if (same(a[i], b[j])) {
      pairs.push([i, j]);
      i += 1;
      j += 1;
    } else if (table[(i + 1) * width + j] >= table[i * width + j + 1]) {
      i += 1;
    } else {
      j += 1;
    }
  }
  return pairs;
};

const elementRanges = (tokens: readonly Shape[]) => {
  const ranges: Array<Readonly<{ from: number; to: number }>> = [];
  const opens: number[] = [];
  for (const [at, token] of tokens.entries()) {
    if (token.kind === 'open') opens.push(at);
    else if (token.kind === 'close') {
      const from = opens.pop();
      if (from !== undefined && tokens[from].nodeKind === 'element') {
        ranges.push({ from, to: at + 1 });
      }
    }
  }
  return ranges;
};

type Replacement = {
  deleted: readonly Token[];
  ids: Array<string | undefined>;
  inserted: readonly Shape[];
};

const wholeElementsOf = (shapes: readonly Shape[], empty = false) => {
  const whole: Array<string | undefined> = shapes.map(() => undefined);
  // An inner element closes first, so it claims its shapes before its parent.
  for (const { from, to } of elementRanges(shapes)) {
    const tree = shapes.slice(from, to);
    if (empty && tree.some((shape) => shape.kind === 'letter')) continue;
    const key = tree.map(shapeKey).join('\u0001');
    for (let at = from; at < to; at += 1) whole[at] ??= key;
  }
  return whole;
};

type Step = Readonly<{
  ambiguous: boolean;
  births: ReadonlyMap<string, readonly Token[]>;
  rewrites: ReadonlyArray<
    Readonly<{ deleted: readonly string[]; letters: number }>
  >;
  trees: ReadonlyArray<readonly string[]>;
}>;

const claimMovedTrees = (
  replacements: readonly Replacement[],
  claimed: Set<string>
) => {
  let ambiguous = false;
  const treesOf = (side: 'deleted' | 'inserted') =>
    replacements
      .flatMap((replacement, owner) =>
        elementRanges(replacement[side]).map((range) => ({
          ...range,
          key: replacement[side]
            .slice(range.from, range.to)
            .map(shapeKey)
            .join('\u0001'),
          owner,
        }))
      )
      .sort((left, right) => right.to - right.from - (left.to - left.from));
  const deletedTrees = treesOf('deleted');
  const insertedTrees = treesOf('inserted');
  const trees: string[][] = [];
  const taken = (owner: number, at: number) =>
    replacements[owner].ids[at] !== undefined;
  for (const tree of deletedTrees) {
    const { deleted } = replacements[tree.owner];
    if (claimed.has(deleted[tree.from].id)) continue;
    const copies = insertedTrees.filter(
      (copy) => copy.key === tree.key && !taken(copy.owner, copy.from)
    );
    const twins = deletedTrees.filter(
      (other) =>
        other !== tree &&
        other.key === tree.key &&
        !claimed.has(replacements[other.owner].deleted[other.from].id)
    );
    if (copies.length > 1 || (copies.length === 1 && twins.length > 0)) {
      ambiguous = true;
      continue;
    }
    const copy = copies[0];
    if (copy === undefined) continue;
    const ids: string[] = [];
    for (let k = 0; k < tree.to - tree.from; k += 1) {
      const { id } = deleted[tree.from + k];
      claimed.add(id);
      ids.push(id);
      replacements[copy.owner].ids[copy.from + k] = id;
    }
    trees.push(ids);
  }
  return { ambiguous, trees };
};

// Inside one replacement, a deleted token the change writes back is the same
// token, its properties possibly rewritten. An empty element the change
// inserts whole where it deletes a different one whole is a birth, such as the
// block a schema fills in for one the change removed. One that holds letters
// is the deleted element with new text, as typing over a whole line writes.
const claimWrittenBack = (
  replacements: readonly Replacement[],
  claimed: Set<string>
) => {
  for (const replacement of replacements) {
    const deletedWhole = wholeElementsOf(replacement.deleted);
    const insertedWhole = wholeElementsOf(replacement.inserted, true);
    const deleted = replacement.deleted
      .map((token, at) => ({ at, token }))
      .filter(({ token }) => !claimed.has(token.id));
    const inserted = replacement.inserted
      .map((token, at) => ({ at, token }))
      .filter(({ at }) => replacement.ids[at] === undefined);
    for (const [d, i] of commonPairs(
      deleted,
      inserted,
      (left, right) =>
        alignKey(left.token) === alignKey(right.token) &&
        (deletedWhole[left.at] === undefined ||
          insertedWhole[right.at] === undefined ||
          deletedWhole[left.at] === insertedWhole[right.at])
    )) {
      const { id } = deleted[d].token;
      claimed.add(id);
      replacement.ids[inserted[i].at] = id;
    }
  }
};

// A join across a wrapper deletes a node and writes its letters at the end of
// the block before it, in another replacement.
const claimJoinedLetters = (
  replacements: readonly Replacement[],
  claimed: Set<string>
) => {
  const looseDeleted = replacements.flatMap(({ deleted }) =>
    deleted.filter((token) => token.kind === 'letter' && !claimed.has(token.id))
  );
  const looseInserted = replacements.flatMap((replacement) =>
    replacement.inserted.flatMap((token, at) =>
      token.kind === 'letter' && replacement.ids[at] === undefined
        ? [{ at, replacement, token }]
        : []
    )
  );
  for (const [d, i] of commonPairs(
    looseDeleted,
    looseInserted,
    (left, right) => left.ch === right.token.ch
  )) {
    const { id } = looseDeleted[d];
    claimed.add(id);
    looseInserted[i].replacement.ids[looseInserted[i].at] = id;
  }
};

const foldChange = (
  streams: Streams,
  view: ChangeView,
  tag: string
): { step: Step; streams: Streams } => {
  const next = new Map(streams);
  const replacements: Replacement[] = [];
  const parts = new Map<string, Array<Replacement | readonly Token[]>>();
  for (const [root, sections] of view.roots) {
    const old = streams.get(root) ?? [];
    const rootParts: Array<Replacement | readonly Token[]> = [];
    let at = 0;
    for (const section of sections) {
      if (section.kind === 'retain') {
        rootParts.push(old.slice(at, at + section.length));
        at += section.length;
      } else if (section.kind === 'props') {
        const token = old[at];
        if (token?.kind !== 'open') {
          throw new Error(`A property write at ${at} of ${root} has no node.`);
        }
        rootParts.push([
          {
            ...token,
            props: applyPropertyModifications(
              token.props ?? {},
              section.modifications
            ),
          },
        ]);
        at += 1;
      } else {
        const replacement: Replacement = {
          deleted: old.slice(at, at + section.length),
          ids: [],
          inserted: shapesOf(section.insert),
        };
        replacements.push(replacement);
        rootParts.push(replacement);
        at += section.length;
      }
    }
    rootParts.push(old.slice(at));
    parts.set(root, rootParts);
  }

  const claimed = new Set<string>();
  const { ambiguous, trees } = claimMovedTrees(replacements, claimed);
  claimWrittenBack(replacements, claimed);
  claimJoinedLetters(replacements, claimed);

  let born = 0;
  for (const replacement of replacements) {
    for (let at = 0; at < replacement.inserted.length; at += 1) {
      replacement.ids[at] ??= `${tag}:${(born += 1) - 1}`;
    }
  }

  const births = new Map<string, Token[]>();
  const rewrites: Array<{ deleted: string[]; letters: number }> = [];
  for (const replacement of replacements) {
    const gone = replacement.deleted.filter((token) => !claimed.has(token.id));
    rewrites.push({
      deleted: gone
        .filter((token) => token.kind === 'letter')
        .map((token) => token.id),
      letters: replacement.inserted.filter(
        (token, at) =>
          token.kind === 'letter' &&
          replacement.ids[at]?.startsWith(`${tag}:`) === true
      ).length,
    });
  }
  for (const [root, rootParts] of parts) {
    const stream: Token[] = [];
    const rootBirths: Token[] = [];
    for (const part of rootParts) {
      if (Array.isArray(part)) {
        stream.push(...part);
        continue;
      }
      const replacement = part as Replacement;
      for (const [at, shape] of replacement.inserted.entries()) {
        const id = replacement.ids[at] as string;
        const token = { ...shape, id };
        stream.push(token);
        if (id.startsWith(`${tag}:`) && isCarrier(token)) {
          rootBirths.push(token);
        }
      }
    }
    next.set(root, stream);
    births.set(root, rootBirths);
  }
  for (const root of view.createRoots) if (!next.has(root)) next.set(root, []);
  for (const root of view.deleteRoots) {
    next.delete(root);
  }
  return {
    step: { ambiguous, births, rewrites, trees },
    streams: next,
  };
};

type Records = ReadonlyMap<string, string>;
// Set and id may hold any character, so only a tuple keeps them apart.
const recordKey = (set: string, id: string) => JSON.stringify([set, id]);
const recordsOf = (value: LedgerValue) => {
  const records = new Map<string, string>();
  for (const [set, tree] of Object.entries(
    recordStoreToJson(getValueRecords(value))
  )) {
    for (const [id, record] of Object.entries(tree)) {
      records.set(recordKey(set, id), canonicalRecordJson(record));
    }
  }
  return records;
};
const foldRecords = (records: Records, view: ChangeView) => {
  const next = new Map(records);
  for (const [set, ops] of view.records) {
    for (const [id, record] of ops) {
      if (record === null) next.delete(recordKey(set, id));
      else next.set(recordKey(set, id), record);
    }
  }
  return next;
};

const ROOT = 'root:';
type Place = Readonly<{ ancestors: readonly string[]; type: string }>;
type LetterFact = Readonly<{
  anc: string;
  block: string;
  blockProps: Readonly<JsonRecord>;
  /** The inline elements around the letter, outermost first, with their properties. */
  inline: string;
  root: string;
  text: Readonly<JsonRecord>;
  textPlace: Place;
}>;
type ElementFact = Readonly<{
  block: boolean;
  next?: string;
  parent: string;
  place: Place;
  prev?: string;
  props: Readonly<JsonRecord>;
  root: string;
}>;
export type Facts = Readonly<{
  blocks: ReadonlyMap<string, readonly string[]>;
  elements: ReadonlyMap<string, ElementFact>;
  index: ReadonlyMap<string, number>;
  letters: ReadonlyMap<string, LetterFact>;
  owners: ReadonlyMap<string, string>;
  roots: ReadonlySet<string>;
}>;

type TreeNode = {
  children: TreeNode[];
  close?: Token;
  letters: Token[];
  token: Token;
};

const factsOf = (streams: Streams): Facts => {
  const blocks = new Map<string, string[]>();
  const elements = new Map<string, ElementFact>();
  const index = new Map<string, number>();
  const letters = new Map<string, LetterFact>();
  const owners = new Map<string, string>();
  for (const [root, stream] of streams) {
    const top: TreeNode[] = [];
    const stack: TreeNode[] = [];
    for (const [at, token] of stream.entries()) {
      if (isCarrier(token)) index.set(token.id, at);
      if (token.kind === 'open') {
        const node: TreeNode = { children: [], letters: [], token };
        (stack.at(-1)?.children ?? top).push(node);
        stack.push(node);
      } else if (token.kind === 'close') {
        const node = stack.pop();
        if (node) node.close = token;
      } else {
        stack.at(-1)?.letters.push(token);
      }
    }
    const visit = (
      nodes: readonly TreeNode[],
      parent: string,
      context: Readonly<{
        block?: TreeNode;
        inline: readonly string[];
        parents: readonly string[];
        types: readonly string[];
      }>
    ) => {
      const holdsText = nodes.some((node) => node.token.nodeKind === 'text');
      const siblings = nodes.filter(
        (node) => node.token.nodeKind === 'element'
      );
      for (const node of nodes) {
        if (node.token.nodeKind === 'text') {
          const { block } = context;
          const blockId = block?.token.id ?? `${ROOT}${root}`;
          const held = blocks.get(blockId) ?? [];
          blocks.set(blockId, held);
          for (const token of [node.token, ...node.letters, node.close]) {
            if (token) owners.set(token.id, blockId);
          }
          const inline = context.inline.join('/');
          for (const letter of node.letters) {
            held.push(letter.id);
            letters.set(letter.id, {
              anc: `${root}:${context.types.join('/')}|${inline}`,
              block: blockId,
              blockProps: block?.token.props ?? {},
              inline,
              root,
              text: node.token.props ?? {},
              textPlace: {
                ancestors: context.parents.slice(1),
                type: context.parents[0] ?? 'text',
              },
            });
          }
          continue;
        }
        const props = node.token.props ?? {};
        const type = typeof props.type === 'string' ? props.type : 'element';
        const isBlock = !holdsText;
        const at = siblings.indexOf(node);
        elements.set(node.token.id, {
          block: isBlock,
          next: siblings[at + 1]?.token.id,
          parent,
          place: { ancestors: context.parents, type },
          prev: siblings[at - 1]?.token.id,
          props,
          root,
        });
        const parents = [type, ...context.parents];
        visit(
          node.children,
          node.token.id,
          isBlock
            ? {
                block: node,
                inline: [],
                parents,
                types: [...context.types, type],
              }
            : {
                ...context,
                inline: [...context.inline, canonicalRecordJson(props)],
                parents,
              }
        );
      }
    };
    visit(top, `${ROOT}${root}`, { inline: [], parents: [], types: [] });
  }
  return {
    blocks,
    elements,
    index,
    letters,
    owners,
    roots: new Set(streams.keys()),
  };
};

const facetsOf = (
  prefix: string,
  props: Readonly<JsonRecord> | undefined,
  isSet: (key: string) => boolean
) => {
  const facets = new Map<string, string>();
  for (const [key, value] of Object.entries(props ?? {})) {
    if (Array.isArray(value) && isSet(key)) {
      facets.set(`${prefix}${key}`, SET);
      for (const member of value) {
        facets.set(`${prefix}${key}∋${canonicalRecordJson(member)}`, 'in');
      }
    } else {
      facets.set(`${prefix}${key}`, canonicalRecordJson(value));
    }
  }
  return facets;
};
const SET = 'set';
// A node moved between places can hold one property as a set in one fold and
// as a whole value in another, so where any fold holds a set, an array reads
// as its members in every fold and equal values read equal.
const asSets = (
  folds: ReadonlyArray<ReadonlyMap<string, string>>
): ReadonlyArray<ReadonlyMap<string, string>> => {
  const sets = new Set<string>();
  for (const facets of folds) {
    for (const [key, value] of facets) if (value === SET) sets.add(key);
  }
  if (sets.size === 0) return folds;
  return folds.map((facets) => {
    const next = new Map(facets);
    for (const key of sets) {
      const value = facets.get(key);
      if (value === undefined || !value.startsWith('[')) continue;
      next.set(key, SET);
      for (const member of JSON.parse(value) as unknown[]) {
        next.set(`${key}∋${canonicalRecordJson(member)}`, 'in');
      }
    }
    return next;
  });
};

type FoldCore = Readonly<{
  facts: Facts;
  records: Records;
  steps: readonly Step[];
  streams: Streams;
}>;
type Claimant = Readonly<{
  facts: Facts;
  identity: Identity;
  intent: Intent;
  streams: Streams;
}>;
export type SideFold = FoldCore & Claimant & Readonly<{ side: 'acc' | 'own' }>;
/** A candidate merge's fold. It names no identity and no intent of its own: a side's changes grant both. */
export type MergedFold = FoldCore &
  Readonly<{
    identity?: never;
    intent?: never;
    /** Own's changes as the merge wrote them on the accepted head. */
    views: readonly ChangeView[];
  }>;

type Start = Readonly<{
  facts: Facts;
  identity: Identity;
  records: Records;
  streams: Streams;
}>;

const foldChain = (
  from: Start,
  views: readonly ChangeView[],
  tag: string,
  each?: (step: Step, before: Facts, after: Facts) => void
) => {
  let { facts, identity, records, streams } = from;
  const steps: Step[] = [];
  for (const [at, view] of views.entries()) {
    const folded = foldChange(streams, view, `${tag}:${at}`);
    const after = factsOf(folded.streams);
    if (each !== undefined) {
      identity = stepIdentity(identity, after, folded.streams);
      each(folded.step, facts, after);
    }
    facts = after;
    records = foldRecords(records, view);
    ({ streams } = folded);
    steps.push(folded.step);
  }
  return { facts, identity, records, steps, streams };
};
const streamsOf = (value: LedgerValue): Streams => {
  const streams = new Map<string, Token[]>();
  let next = 0;
  const encode = (root: string, nodes: readonly JsonNode[]) =>
    streams.set(
      root,
      shapesOf(encodeNodes(nodes).slice.tokens).map((shape) => ({
        ...shape,
        id: `base:${(next += 1) - 1}`,
      }))
    );
  encode('main', value.children);
  for (const [root, nodes] of Object.entries(value.roots ?? {})) {
    encode(root, nodes);
  }
  return streams;
};

export const shapesOfFold = (fold: Readonly<{ streams: Streams }>) =>
  new Map(
    [...fold.streams].map(([root, stream]) => [
      root,
      stream.map(({ id: _id, ...shape }) => shape),
    ])
  );

const pairKey = (left: string, right: string) =>
  JSON.stringify(left < right ? [left, right] : [right, left]);
const present = (facts: Facts, id: string | undefined) =>
  id !== undefined && (facts.letters.has(id) || facts.elements.has(id));
const before = (facts: Facts, left: string, right: string) =>
  (facts.index.get(left) ?? -1) < (facts.index.get(right) ?? -1);
const rootOf = (facts: Facts, id: string) =>
  facts.letters.get(id)?.root ?? facts.elements.get(id)?.root;
const blockOf = (facts: Facts, id: string) => facts.letters.get(id)?.block;
const ancestorsIn = (facts: Facts, id: string) => {
  const chain: string[] = [];
  for (
    let at = facts.elements.get(id)?.parent;
    at !== undefined;
    at = facts.elements.get(at)?.parent
  ) {
    chain.push(at);
  }
  return chain;
};
const parentOf = (facts: Facts, id: string) => {
  const block = blockOf(facts, id);
  return block === undefined
    ? undefined
    : (facts.elements.get(block)?.parent ?? block);
};

// Each change of one chain pairs with the change of another at its place, so
// their births pair by shape, change by change.
const birthsAcross = (
  from: Readonly<{ steps: readonly Step[] }>,
  to: Readonly<{ steps: readonly Step[] }>
) => {
  const translated = new Map<string, string>();
  const unexplained = new Set<string>();
  for (const [at, step] of from.steps.entries()) {
    const into = to.steps[at];
    if (into === undefined) continue;
    for (const root of new Set([
      ...step.births.keys(),
      ...into.births.keys(),
    ])) {
      const left = step.births.get(root) ?? [];
      const right = into.births.get(root) ?? [];
      const pairs = commonPairs(
        left,
        right,
        (a, b) => alignKey(a) === alignKey(b)
      );
      for (const [i, j] of pairs) translated.set(left[i].id, right[j].id);
      const matched = new Set(pairs.map(([, j]) => j));
      for (const [j, token] of right.entries()) {
        if (!matched.has(j)) unexplained.add(token.id);
      }
    }
  }
  return { translated, unexplained };
};

export type Ledger = Readonly<{
  fold: (views: readonly ChangeView[], side: 'acc' | 'own') => SideFold;
  foldMerged: (accepted: SideFold, views: readonly ChangeView[]) => MergedFold;
  judge: (accepted: SideFold, own: SideFold, merged: MergedFold) => Verdict;
  /**
   * Judges the merge after the rest of the accepted side, in the frame a held
   * verdict left, against what own changed from the base it was written on:
   * a fact the front already shows still counts as own's.
   */
  resume: (
    proof: HeldProof,
    rest: Readonly<{
      accepted: readonly ChangeView[];
      merged: readonly ChangeView[];
    }>
  ) => Verdict;
}>;

export const createEffectLedger = (
  base: LedgerValue,
  options: Readonly<{ isSetValued?: SetValued }> = {}
): Ledger => {
  const streams = streamsOf(base);
  const facts = factsOf(streams);
  return ledgerAt(
    {
      facts,
      identity: baseIdentity(facts, streams),
      records: recordsOf(base),
      streams,
    },
    '',
    options.isSetValued ?? (() => false),
    NO_CLAIMS
  );
};

const ledgerAt = (
  start: Start,
  generation: string,
  isSetValued: SetValued,
  claims: Claims,
  firstBase?: (id: string) => boolean
): Ledger &
  Readonly<{
    carry: (
      own: SideFold,
      origin: Claimant,
      rebased: readonly ChangeView[]
    ) => Readonly<{ origin: Claimant; own: SideFold }>;
    judgeAfter: (
      accepted: SideFold,
      own: SideFold,
      merged: MergedFold,
      origin: Claimant
    ) => Verdict;
  }> => {
  const setsAt =
    (placement: 'element' | 'text', place: Place, root: string) =>
    (key: string) =>
      isSetValued(placement, key, {
        ...place,
        root: root === 'main' ? null : root,
      });
  const facetsByFacts = new WeakMap<Facts, Map<string, Map<string, string>>>();
  const facetsIn = (facts: Facts, id: string) => {
    let cached = facetsByFacts.get(facts);
    if (cached === undefined) {
      cached = new Map();
      facetsByFacts.set(facts, cached);
    }
    let facets = cached.get(id);
    if (facets === undefined) {
      const letter = facts.letters.get(id);
      const element = facts.elements.get(letter?.block ?? id);
      const elementFacets = (prefix: string) =>
        element
          ? facetsOf(
              prefix,
              element.props,
              setsAt('element', element.place, element.root)
            )
          : new Map<string, string>();
      facets = letter
        ? new Map([
            ...facetsOf(
              'text.',
              letter.text,
              setsAt('text', letter.textPlace, letter.root)
            ),
            ...elementFacets('block.'),
            ['anc', letter.anc],
          ])
        : elementFacets('self.');
      cached.set(id, facets);
    }
    return facets;
  };
  const B = start.facts;
  const baseRecords = start.records;
  const baseIds = new Set<string>();
  const baseChars = new Map<string, string>();
  const baseContent = new Set<string>();
  for (const stream of start.streams.values()) {
    for (const token of stream) {
      baseIds.add(token.id);
      if (token.ch) baseChars.set(token.id, token.ch);
      if (token.kind !== 'close') baseContent.add(token.id);
    }
  }
  const isBase = (id: string) => baseIds.has(id);
  const inFirstBase = firstBase ?? isBase;
  const baseCarriers = [...B.letters.keys(), ...B.elements.keys()];

  const judge = (
    acceptedFold: SideFold,
    ownFold: SideFold,
    mergedFold: MergedFold,
    firstOwn?: Claimant
  ): Verdict => {
    const losses: string[] = [];
    const harms: string[] = [];
    const contests: string[] = [];
    const O = ownFold.facts;
    const A = acceptedFold.facts;
    const M = mergedFold.facts;
    if (mergedFold.steps.length !== ownFold.steps.length) {
      return {
        contests,
        harms,
        kind: 'lost',
        losses: [
          `the merge has ${mergedFold.steps.length} changes for ${ownFold.steps.length}`,
        ],
      };
    }

    const { translated, unexplained } = birthsAcross(ownFold, mergedFold);
    for (const [at, step] of ownFold.steps.entries()) {
      if (step.ambiguous) {
        losses.push(`own change ${at} moves a node with several equal copies`);
      }
    }
    const inOwn = (id: string) => (isBase(id) ? id : translated.get(id));
    const ownOf = new Map([...translated].map(([from, to]) => [to, from]));
    // A merged element continues what a side's element of the same name
    // continues there, and nothing else: the merge's own token flow is evidence
    // of what the rebase did, not a split or join either side made.
    const continuesInMerge = new Map<string, readonly string[]>();
    const heirsInMerge = new Map<string, string[]>();
    for (const id of M.elements.keys()) {
      const lineage = new Set<string>([id]);
      const own = ownOf.get(id) ?? id;
      for (const origin of [
        ...(acceptedFold.identity.elements.get(id)?.continues ?? []),
        ...(ownFold.identity.elements.get(own)?.continues ?? []),
      ]) {
        lineage.add(origin);
      }
      continuesInMerge.set(id, [...lineage]);
      for (const origin of lineage) {
        const heirs = heirsInMerge.get(origin);
        if (heirs === undefined) heirsInMerge.set(origin, [id]);
        else heirs.push(id);
      }
    }
    const mergedContinues = (id: string | undefined, origin: string) =>
      id !== undefined &&
      (id === origin || continuesInMerge.get(id)?.includes(origin) === true);
    const aliveInMerge = (origin: string) =>
      M.letters.has(origin) || (heirsInMerge.get(origin)?.length ?? 0) > 0;
    const describe = (facts: Facts, id: string) => {
      if (facts.letters.has(id)) {
        let ch = baseChars.get(id);
        if (ch === undefined) {
          for (const fold of [ownFold, acceptedFold, mergedFold]) {
            for (const stream of fold.streams.values()) {
              ch ??= stream.find((token) => token.id === id)?.ch;
            }
          }
        }
        return `'${ch ?? '?'}' (${id})`;
      }
      const element = facts.elements.get(id);
      return element ? `<${element.props.type as string}> (${id})` : id;
    };
    const threeWay = (
      what: () => string,
      baseValue: unknown,
      ownValue: unknown,
      accValue: unknown,
      mergedValue: unknown,
      claimed = false
    ) => {
      const ownChanged = claimed || ownValue !== baseValue;
      const accChanged = accValue !== baseValue;
      if (ownChanged && accChanged && ownValue !== accValue) {
        losses.push(`both sides changed ${what()}`);
        return;
      }
      const expected = ownChanged ? ownValue : accValue;
      if (mergedValue === expected) return;
      if (ownChanged) losses.push(`the merge drops own's ${what()}`);
      else if (accChanged) harms.push(`the merge undoes accepted ${what()}`);
      else harms.push(`the merge changes ${what()}`);
    };
    const continuesOf = (fold: Claimant, id: string) =>
      fold.identity.elements.get(id)?.continues ?? [id];
    const movedBy = (fold: Claimant, id: string) =>
      [...fold.intent.moves.values()].some((move) => move.carried.has(id));
    // A letter whose neighbors are gone stays on its line. The merged block
    // that holds it continues the base line its block continues, or its birth
    // where it has none, holds exactly the births of its side that its block
    // continues, and keeps it after the lines a join put ahead of its own.
    const holdsLine = (
      fold: Claimant,
      other: Claimant,
      letter: string,
      into: string,
      landed: string
    ) => {
      const block = blockOf(fold.facts, letter) as string;
      // Both halves of a split continue the line, so lineage cannot tell them
      // apart: a letter typed alone in one half stays out of a block holding
      // base letters its side split off, unless the other side joined them
      // into a line its block continues.
      const blockLines = new Set(continuesOf(fold, block).filter(isBase));
      const apart = (held: string) => {
        const ours = blockOf(fold.facts, held);
        const theirs = blockOf(other.facts, held);
        if (ours === undefined || theirs === undefined || ours === block) {
          return false;
        }
        const was = blockOf(B, held);
        return !continuesOf(other, theirs).some(
          (origin) => origin !== was && blockLines.has(origin)
        );
      };
      if (
        (M.blocks.get(landed) ?? []).some(
          (held) => B.letters.has(held) && apart(held)
        )
      ) {
        return false;
      }
      const lineage = continuesOf(fold, block);
      const bases = lineage.filter(isBase);
      const mine = lineage.filter((origin) => !isBase(origin));
      const there = continuesInMerge.get(landed) ?? [landed];
      const anchors = bases.length > 0 ? bases : mine;
      if (!anchors.some((origin) => there.includes(origin))) return false;
      // A birth names a merged block by alignment alone, and a rebased split
      // may make the other half new: a birth whose base letters the merge
      // keeps in another block named this one by that swap alone.
      const swapped = (origin: string) =>
        (fold.facts.blocks.get(origin) ?? []).some(
          (id) =>
            isBase(id) &&
            M.owners.get(id) !== undefined &&
            M.owners.get(id) !== landed
        );
      const births = there.filter(
        (origin) =>
          !isBase(origin) &&
          fold.identity.elements.has(origin) &&
          (mine.includes(origin) || !swapped(origin))
      );
      // Own's rebased split of the same line may make the half that holds an
      // accepted letter new and leave accepted's name on the other half.
      const renamedHalf = (origin: string) =>
        fold === acceptedFold &&
        ownOf.has(landed) &&
        !A.elements.has(landed) &&
        (heirsInMerge.get(origin) ?? []).every((heir) => heir !== landed) &&
        continuesOf(fold, origin).some(
          (line) => isBase(line) && there.includes(line)
        );
      if (
        births.some((origin) => !mine.includes(origin)) ||
        mine.some((origin) => !there.includes(origin) && !renamedHalf(origin))
      ) {
        return false;
      }
      const lines = there.filter(isBase);
      // A block a join made continues several lines, and the letter was typed
      // in the one whose base letters stand next before it.
      const row = fold.facts.blocks.get(block) ?? [];
      const typedAt = row.indexOf(letter);
      const typedAfter =
        row.slice(0, typedAt).findLast((held) => B.letters.has(held)) ??
        row.slice(typedAt + 1).find((held) => B.letters.has(held));
      const typedIn =
        typedAfter === undefined
          ? -1
          : lines.indexOf(blockOf(B, typedAfter) as string);
      const at =
        typedIn === -1
          ? lines.findIndex((origin) => bases.includes(origin))
          : typedIn;
      if (at === -1) return true;
      // A letter's line is its base block, or for a birth the one base line
      // its side's block continues, so lines a join emptied still order.
      const lineOf = (held: string) => {
        if (B.letters.has(held)) return blockOf(B, held);
        const ownName = ownOf.get(held);
        const [side, id] =
          ownName === undefined ? [acceptedFold, held] : [ownFold, ownName];
        const home = blockOf(side.facts, id);
        if (home === undefined) return undefined;
        const named = continuesOf(side, home).filter((origin) =>
          lines.includes(origin)
        );
        return named.length === 1 ? named[0] : undefined;
      };
      return (M.blocks.get(landed) ?? []).every((held) => {
        if (held === into) return true;
        const line = lineOf(held);
        const spot = line === undefined ? -1 : lines.indexOf(line);
        return (
          spot === -1 || spot === at || spot < at === before(M, held, into)
        );
      });
    };
    const lostWithItsBlock = (fold: Claimant, other: Claimant, id: string) =>
      (fold.identity.elements.get(id)?.continues ?? []).some(
        (origin) => isBase(origin) && !alive(other, origin)
      );

    // A birth stands where its move put it while the merge keeps it on the
    // side's side of every block the move passed.
    const keeps =
      (facts: Facts, inMerged: (id: string) => string | undefined) =>
      (node: string, past: ReadonlySet<string>) => {
        const into = inMerged(node);
        return (
          !isBase(node) &&
          into !== undefined &&
          present(M, into) &&
          [...past].every(
            (stood) =>
              !present(M, stood) ||
              before(M, into, stood) === before(facts, node, stood)
          )
        );
      };
    const ownKeeps = keeps(O, inOwn);
    const accKeeps = keeps(A, (id) => id);
    const kept: string[] = [];
    for (const id of baseCarriers) {
      const o = alive(ownFold, id);
      const a = alive(acceptedFold, id);
      const m = aliveInMerge(id);
      if (
        o &&
        a &&
        (!m ||
          (B.elements.has(id) &&
            O.elements.has(id) &&
            A.elements.has(id) &&
            !M.elements.has(id)))
      ) {
        losses.push(`the merge deletes kept ${describe(B, id)}`);
      }
      // An edit to what the other side deleted goes with it, so it counts as
      // lost, as a letter typed there does. A merge that keeps a line of it
      // keeps the edit against that deletion, which loses work too.
      const fate = m ? 'keeps' : 'drops';
      if (o && !a && editTaken(ownFold, acceptedFold, id, ownKeeps)) {
        losses.push(
          `the merge ${fate} own's edit of ${describe(
            B,
            id
          )}, which accepted deleted`
        );
      }
      if (a && !o && editTaken(acceptedFold, ownFold, id, accKeeps)) {
        harms.push(
          `the merge ${fate} accepted's edit of ${describe(
            B,
            id
          )}, which own deleted`
        );
      }
      const [po, pa, pm] = [O, A, M].map((facts) => present(facts, id));
      if (!po && pm) {
        losses.push(`the merge keeps ${describe(B, id)}, which own deleted`);
      }
      if (!pa && pm) {
        harms.push(
          `the merge keeps ${describe(B, id)}, which accepted deleted`
        );
      }
      if (po && pa && pm) kept.push(id);
    }
    // Own's edits of what the front deleted, which a later frame keeps by
    // their first names.
    for (const id of new Set([
      ...ownFold.intent.elements,
      ...ownFold.intent.letters,
      ...ownFold.intent.moves.keys(),
    ])) {
      if (isBase(id) || !inFirstBase(id) || alive(acceptedFold, id)) continue;
      if (editTaken(ownFold, acceptedFold, id, ownKeeps)) {
        losses.push(
          `the merge drops own's edit of ${id}, which accepted deleted`
        );
      }
    }
    // The merge starts from accepted, so only own's changes can drop a line
    // accepted made, and they may only while own deleted what it continues.
    for (const id of A.elements.keys()) {
      if (isBase(id) || M.elements.has(id)) continue;
      const bases = continuesOf(acceptedFold, id).filter(isBase);
      if (bases.length > 0 && bases.every((origin) => alive(ownFold, origin))) {
        harms.push(`the merge deletes accepted's ${describe(A, id)}`);
      }
    }

    const containerOf = (facts: Facts, id: string) =>
      B.letters.has(id) ? parentOf(facts, id) : facts.elements.get(id)?.parent;
    const mergedContainers = (id: string) => {
      const container = containerOf(M, id);
      return container === undefined
        ? []
        : [container, ...ancestorsIn(M, container)];
    };
    const movedInto = (side: SideFold, id: string) => {
      const was = containerOf(B, id) as string;
      const now = containerOf(side.facts, id);
      if (now === undefined || now === was) return undefined;
      return side.identity.elements.get(now)?.continues.includes(was)
        ? undefined
        : now;
    };
    // A join is no edit of the line it absorbs, so an edit of that line is
    // kept only when the line it joined carries the same values.
    const joinedAway = (side: SideFold, other: SideFold, id: string) => {
      if (
        !B.elements.has(id) ||
        !side.intent.elements.has(id) ||
        !side.facts.elements.has(id) ||
        other.facts.elements.has(id)
      ) {
        return false;
      }
      const heirs = other.identity.heirs.get(id) ?? [];
      if (heirs.length === 0) return false;
      if (movedInto(side, id) !== undefined) return true;
      return !heirs.some((heir) => {
        const [then, now, there] = asSets([
          facetsIn(B, id),
          facetsIn(side.facts, id),
          facetsIn(other.facts, heir),
        ]);
        return [...new Set([...then.keys(), ...now.keys()])].every(
          (key) =>
            then.get(key) === now.get(key) || there.get(key) === now.get(key)
        );
      });
    };
    for (const id of baseCarriers) {
      if (joinedAway(ownFold, acceptedFold, id)) {
        losses.push(
          `the merge drops own's edit of ${describe(B, id)}, which accepted joined away`
        );
      }
      if (joinedAway(acceptedFold, ownFold, id)) {
        harms.push(
          `the merge drops accepted's edit of ${describe(B, id)}, which own joined away`
        );
      }
    }
    for (const id of kept) {
      const [fb, fo, fa, fm] = asSets(
        [B, O, A, M].map((facts) => facetsIn(facts, id))
      );
      const keys = new Set([
        ...fb.keys(),
        ...fo.keys(),
        ...fa.keys(),
        ...fm.keys(),
      ]);
      for (const key of keys) {
        threeWay(
          () => `${key} of ${describe(B, id)}`,
          fb.get(key),
          fo.get(key),
          fa.get(key),
          fm.get(key),
          claims.facet(id, key)
        );
      }
      if (!B.letters.has(id) && !B.elements.get(id)?.block) continue;
      const ownInto = movedInto(ownFold, id) ?? claims.container(id);
      const accInto = movedInto(acceptedFold, id);
      if (
        ownInto !== undefined &&
        accInto !== undefined &&
        isBase(ownInto) &&
        isBase(accInto) &&
        ownInto !== accInto
      ) {
        losses.push(`both sides changed the parent of ${describe(B, id)}`);
        continue;
      }
      const chain = mergedContainers(id);
      // A container a side made answers wherever it sits above the block, as
      // the other side may wrap the block again inside it.
      const holds = (container: string) =>
        chain.some((there) => mergedContinues(there, container));
      // Both sides made one container around the same base blocks, which the
      // merge keeps once, not one inside the other. Own's container is read as
      // own first wrote it, since a front may widen it over its own births.
      const wrapped = (on: Facts, container: string) =>
        [...on.elements.keys()]
          .filter(
            (block) =>
              isBase(block) && ancestorsIn(on, block).includes(container)
          )
          .sort()
          .join(' ');
      const ownWrote = (firstOwn ?? ownFold).facts;
      if (
        ownInto !== undefined &&
        accInto !== undefined &&
        !isBase(ownInto) &&
        !isBase(accInto) &&
        canonicalRecordJson(ownWrote.elements.get(ownInto)?.props ?? {}) ===
          canonicalRecordJson(A.elements.get(accInto)?.props ?? {}) &&
        wrapped(ownWrote, ownInto) === wrapped(A, accInto) &&
        chain.some(
          (there) =>
            mergedContinues(there, ownInto) && !mergedContinues(there, accInto)
        ) &&
        chain.some(
          (there) =>
            mergedContinues(there, accInto) && !mergedContinues(there, ownInto)
        )
      ) {
        losses.push(
          `the merge doubles the container both sides put ${describe(B, id)} in`
        );
      }
      if (ownInto !== undefined && !holds(ownInto)) {
        losses.push(
          `the merge moves ${describe(
            B,
            id
          )} out of the container own put it in`
        );
      }
      if (accInto !== undefined && !holds(accInto)) {
        harms.push(
          `the merge moves ${describe(
            B,
            id
          )} out of the container accepted put it in`
        );
      }
      if (ownInto === undefined && accInto === undefined) {
        const was = containerOf(B, id) as string;
        const stands = was.startsWith(ROOT)
          ? M.roots.has(was.slice(ROOT.length))
          : aliveInMerge(was);
        if (stands && !mergedContinues(chain[0], was)) {
          losses.push(
            `the merge moves ${describe(
              B,
              id
            )} out of the container both sides kept it in`
          );
        }
      }
    }
    // Which half of a split keeps the block's name depends on where the caret
    // sat, and a rebased split may pick the other half, so a split block's
    // place is read through its letters, never its name.
    const splitBySide = (id: string) =>
      B.elements.has(id) &&
      [ownFold, acceptedFold].some(
        (fold) => (fold.identity.heirs.get(id)?.length ?? 0) > 1
      );
    for (let i = 0; i < kept.length; i += 1) {
      const left = kept[i];
      for (let j = i + 1; j < kept.length; j += 1) {
        const right = kept[j];
        if (rootOf(B, left) !== rootOf(B, right)) continue;
        const pair = () => `${describe(B, left)} and ${describe(B, right)}`;
        if (splitBySide(left) || splitBySide(right)) {
          // An empty block has no letters to read its place by, so its
          // halves read it, when they all stand on one side of the other.
          if (
            [left, right].some(
              (id) => splitBySide(id) && (B.blocks.get(id)?.length ?? 1) > 0
            )
          ) {
            continue;
          }
          const heirsIn = (fold: SideFold | 'merged', id: string) =>
            (!B.elements.has(id)
              ? [id]
              : fold === 'merged'
                ? (heirsInMerge.get(id) ?? [])
                : (fold.identity.heirs.get(id) ?? [])
            ).filter((heir) =>
              present(fold === 'merged' ? M : fold.facts, heir)
            );
          const orderIn = (fold: SideFold | 'merged') => {
            const facts = fold === 'merged' ? M : fold.facts;
            const lefts = heirsIn(fold, left);
            const rights = heirsIn(fold, right);
            if (lefts.length === 0 || rights.length === 0) return undefined;
            const all = lefts.flatMap((l) =>
              rights.map((r) => before(facts, l, r))
            );
            return all.every(Boolean)
              ? true
              : all.some(Boolean)
                ? undefined
                : false;
          };
          const [own, acc, merged] = [
            ownFold,
            acceptedFold,
            'merged' as const,
          ].map(orderIn);
          if (own === undefined || acc === undefined || merged === undefined) {
            continue;
          }
          threeWay(
            () => `the order of ${pair()}`,
            before(B, left, right),
            own,
            acc,
            merged,
            claims.order(left, right)
          );
          continue;
        }
        threeWay(
          () => `the order of ${pair()}`,
          before(B, left, right),
          before(O, left, right),
          before(A, left, right),
          before(M, left, right),
          claims.order(left, right)
        );
      }
    }
    // A cut or a join moves one boundary between two letters, so only letters
    // next to each other among the kept ones answer for it, and a side
    // answers only for the letters its own order puts side by side: a join
    // after a move does not part what the move put apart.
    const keptLetters = kept.filter((id) => B.letters.has(id));
    const sideBySide = (facts: Facts) => {
      const pairs = new Map<string, readonly [string, string]>();
      const order = [...keptLetters].sort(
        (x, y) =>
          (rootOf(facts, x) as string).localeCompare(
            rootOf(facts, y) as string
          ) || (facts.index.get(x) as number) - (facts.index.get(y) as number)
      );
      for (const [at, right] of order.entries()) {
        const left = order[at - 1];
        if (
          left !== undefined &&
          rootOf(facts, left) === rootOf(facts, right)
        ) {
          pairs.set(pairKey(left, right), [left, right]);
        }
      }
      return pairs;
    };
    const [baseSides, ownSides, accSides] = [B, O, A].map(sideBySide);
    // The blocks holding letters, and the base blocks holding base content,
    // that start between two letters name the boundary between them, so a side
    // that cuts where the other joined keeps its cut. A new empty line between
    // them parts nothing, though a split at a block's end leaves it the block's
    // closing tokens or its empty trailing text.
    const groundedIn = (facts: Facts) =>
      new Set(
        [...facts.owners].flatMap(([token, block]) =>
          (baseContent.has(token) && isBase(block)) || facts.letters.has(token)
            ? [block]
            : []
        )
      );
    // A letter the other side typed where a side split may land in either
    // half, and a new half it lands in is a line of its own.
    const typedInto = (byOther: (id: string) => boolean) =>
      [...M.letters].flatMap(([id, letter]) =>
        !isBase(id) && byOther(id) ? [letter.block] : []
      );
    const baseGround = groundedIn(B);
    const ownGround = new Set([
      ...groundedIn(O),
      ...typedInto((id) => !ownOf.has(id)).flatMap((block) => {
        const mine = ownOf.get(block);
        return mine === undefined ? [] : [mine];
      }),
    ]);
    const accGround = new Set([
      ...groundedIn(A),
      ...typedInto((id) => ownOf.has(id)).filter(
        (block) => !isBase(block) && A.elements.has(block)
      ),
    ]);
    // A letter the other side deleted leaves a half as empty as the merge sees it.
    const letteredIn = (fold: Claimant, other: Claimant) =>
      new Set(
        [...fold.facts.letters].flatMap(([id, letter]) =>
          !isBase(id) || alive(other, id) ? [letter.block] : []
        )
      );
    const ownLettered = letteredIn(ownFold, acceptedFold);
    const accLettered = letteredIn(acceptedFold, ownFold);
    const boundaryOf = (
      facts: Facts,
      grounded: ReadonlySet<string>,
      left: string,
      right: string
    ) => {
      const from = facts.index.get(left) as number;
      const to = facts.index.get(right) as number;
      return new Set(
        [...grounded].filter((block) => {
          const at = facts.index.get(block);
          return at !== undefined && from < at && at < to;
        })
      );
    };
    for (const [key, [left, right]] of new Map([
      ...baseSides,
      ...ownSides,
      ...accSides,
    ])) {
      const [was, own, acc, merged] = [B, O, A, M].map(
        (facts) => blockOf(facts, left) !== blockOf(facts, right)
      );
      const what = () =>
        `the boundary between ${describe(B, left)} and ${describe(B, right)}`;
      const claimed = claims.boundary(left, right);
      const baseCut = boundaryOf(B, baseGround, left, right);
      const sides = [
        [O, ownGround],
        [A, accGround],
      ] as const;
      // A move reorders the blocks between two letters without cutting or
      // joining any, so a pair whose blocks on either side a move carries is
      // read by whether its letters share a block. A base block a side split
      // and moved away from both letters does not count.
      if (
        sides.some(([facts, grounded]) =>
          [
            blockOf(facts, left),
            blockOf(facts, right),
            ...boundaryOf(facts, grounded, left, right),
          ].some(
            (block) =>
              block !== undefined &&
              (movedBy(ownFold, block) || movedBy(acceptedFold, block))
          )
        )
      ) {
        const ownClaims = claimed || (ownSides.has(key) && own !== was);
        const accClaims = accSides.has(key) && acc !== was;
        if (ownClaims || accClaims) {
          threeWay(
            what,
            was,
            ownClaims ? own : was,
            accClaims ? acc : was,
            merged,
            ownClaims
          );
        } else if (merged !== was && merged !== own && merged !== acc) {
          harms.push(`the merge changes ${what()}`);
        }
        continue;
      }
      // A half split off a base block of the cut, whose own half kept none of
      // the side's letters, may stand for that block or make a cut of its own:
      // an Enter at the line's start and a split whose first half the side
      // then emptied leave the same halves.
      // A half that holds every base letter of its line, which the side kept
      // whole, was split off at the line's start, so it stands for that line.
      const atStart = (fold: Claimant, block: string, origin: string) => {
        const row = B.blocks.get(origin) ?? [];
        return (
          row.length > 0 &&
          row.every((held) => blockOf(fold.facts, held) === block)
        );
      };
      const cutOf = (
        fold: Claimant,
        grounded: ReadonlySet<string>,
        lettered: ReadonlySet<string>,
        stands: boolean
      ): ReadonlySet<string> =>
        new Set(
          [...boundaryOf(fold.facts, grounded, left, right)]
            // A line inserted between two lines cuts neither, so it parts
            // nothing a join of theirs put together.
            .filter((block) => continuesOf(fold, block).some(isBase))
            .map(
              (block) =>
                (!baseCut.has(block) &&
                  continuesOf(fold, block).find(
                    (origin) =>
                      baseCut.has(origin) &&
                      present(fold.facts, origin) &&
                      !lettered.has(origin) &&
                      (stands || atStart(fold, block, origin))
                  )) ||
                block
            )
        );
      const moves = (cut: ReadonlySet<string>) =>
        cut.size !== baseCut.size ||
        [...cut].some((block) => !baseCut.has(block));
      const readings = [true, false].map((stands) => {
        const ownCut = cutOf(ownFold, ownGround, ownLettered, stands);
        const accCut = cutOf(acceptedFold, accGround, accLettered, stands);
        const ownMoves = ownSides.has(key) && moves(ownCut);
        const accMoves = accSides.has(key) && moves(accCut);
        // A side removes the cuts it joined and adds the ones it made, so the
        // letters stay apart while one stands.
        const apartWith = (ownToo: boolean) => {
          const cuts = [
            ...(ownToo && ownMoves ? [ownCut] : []),
            ...(accMoves ? [accCut] : []),
          ];
          return (
            [...baseCut].some((block) => cuts.every((cut) => cut.has(block))) ||
            cuts.some((cut) => [...cut].some((block) => !baseCut.has(block)))
          );
        };
        return {
          accMoves,
          apartWith,
          moving: ownMoves || (accMoves && !claimed),
        };
      });
      const moving = readings.filter((reading) => reading.moving);
      // Letters a side's order no longer puts side by side may end either way
      // that side or the base leaves them.
      if (moving.length > 0) {
        if (moving.some(({ apartWith }) => merged === apartWith(true))) {
          continue;
        }
        const [{ apartWith }] = moving;
        const expected = apartWith(true);
        if (expected !== apartWith(false)) {
          losses.push(`the merge drops own's ${what()}`);
        } else if (expected === was) {
          harms.push(`the merge changes ${what()}`);
        } else {
          harms.push(`the merge undoes accepted ${what()}`);
        }
      } else if (claimed) {
        threeWay(
          what,
          was,
          own,
          readings[0].accMoves ? acc : was,
          merged,
          true
        );
      } else if (merged !== was && merged !== own && merged !== acc) {
        harms.push(`the merge changes ${what()}`);
      }
    }

    const anchor = (
      side: 'accepted' | 'own',
      fold: Claimant,
      other: Claimant,
      translate: (id: string) => string | undefined,
      fromMerged: (id: string) => string | undefined,
      onBase = isBase
    ) => {
      const report = side === 'own' ? losses : harms;
      const { facts } = fold;
      // The births of an earlier front are accepted's births too, which the
      // rest keeps in their place as the whole does.
      const unborn = side === 'own' ? isBase : inFirstBase;
      for (const [id, letter] of facts.letters) {
        if (unborn(id)) continue;
        const into = translate(id);
        if (into === undefined) continue;
        const name = () => `${side} birth ${describe(facts, id)}`;
        const landed = M.letters.get(into);
        if (!landed) {
          report.push(`the merge drops ${name()}`);
          continue;
        }
        const row = facts.blocks.get(letter.block) ?? [];
        // A letter goes with the lines it was typed in when the other side
        // deletes them all.
        const typedIn = [...(fold.intent.typed.get(id) ?? [])].filter(
          (line) => !line.startsWith(ROOT)
        );
        if (
          typedIn.length > 0 &&
          typedIn.every((line) => !alive(other, line))
        ) {
          report.push(
            `the merge keeps ${name()}, typed in a line the other side deleted`
          );
        }
        const [ownBlock, mergedBlock] = asSets([
          facetsIn(facts, id),
          facetsIn(M, into),
        ]).map(
          (facets) =>
            new Map([...facets].filter(([key]) => key.startsWith('block.')))
        );
        const changedByOther = (key: string, value: string | undefined) =>
          continuesOf(fold, letter.block)
            .filter(isBase)
            .some((line) =>
              (other.identity.heirs.get(line) ?? []).some((heir) => {
                const [then, there] = asSets([
                  facetsIn(B, line),
                  facetsIn(other.facts, heir),
                ]);
                const self = `self.${key.slice('block.'.length)}`;
                return there.get(self) === value && then.get(self) !== value;
              })
            );
        for (const key of new Set([
          ...ownBlock.keys(),
          ...mergedBlock.keys(),
        ])) {
          const value = mergedBlock.get(key);
          if (ownBlock.get(key) !== value && !changedByOther(key, value)) {
            report.push(`the merge changes ${key} of ${name()}`);
          }
        }
        const at = row.indexOf(id);
        // A letter typed between letters of the base follows what the other
        // side did to the nearest of them it kept, such as a bold over the run
        // it was typed in, whatever its own side did to them later.
        const standing = (held: string) =>
          onBase(held) && other.facts.letters.has(held) && present(M, held);
        const baseAround = [
          row.slice(0, at).findLast(standing),
          row.slice(at + 1).find(standing),
        ].filter((held) => held !== undefined);
        const followsAround = (
          readFact: (facts: Facts, held: string) => string | undefined
        ) =>
          baseAround.some(
            (held) =>
              readFact(other.facts, held) === readFact(M, into) &&
              readFact(other.facts, held) !== readFact(B, held) &&
              readFact(M, held) === readFact(M, into)
          );
        for (const key of new Set([
          ...Object.keys(letter.text),
          ...Object.keys(landed.text),
        ])) {
          const markOf = (held: Facts, token: string) =>
            canonicalRecordJson(held.letters.get(token)?.text[key]);
          if (
            markOf(M, into) !== markOf(facts, id) &&
            (Object.hasOwn(letter.text, key) || !followsAround(markOf))
          ) {
            report.push(`the merge changes ${key} of ${name()}`);
          }
        }
        if (
          landed.inline !== letter.inline &&
          !followsAround((held, token) => held.letters.get(token)?.inline)
        ) {
          report.push(`the merge moves ${name()} out of its inline elements`);
        }
        const [left, right] = [row[at - 1], row[at + 1]];
        const prev = left === undefined ? undefined : translate(left);
        const next = right === undefined ? undefined : translate(right);
        const near = [prev, next].filter((neighbor) => present(M, neighbor));
        if (near.length === 0) {
          if (!holdsLine(fold, other, id, into, landed.block)) {
            report.push(`the merge moves ${name()} out of its block`);
          }
          // It keeps its place between the base letters that ride the moves its
          // line rides, and no others.
          const ridden = (carried: (move: Move) => boolean) =>
            [fold, other]
              .map((claimant) =>
                [...claimant.intent.moves]
                  .filter(([, move]) => carried(move))
                  .map(([head]) => head)
                  .join(' ')
              )
              .join('|');
          const line = continuesOf(fold, letter.block);
          const rides = ridden((move) =>
            line.some((block) => move.carried.has(block))
          );
          const steady = [...facts.letters.keys()].filter(
            (held) =>
              onBase(held) &&
              rootOf(facts, held) === letter.root &&
              other.facts.letters.has(held) &&
              present(M, held) &&
              ridden((move) => move.carried.has(held)) === rides
          );
          const spot = facts.index.get(id) as number;
          const baseBefore = steady.findLast(
            (held) => (facts.index.get(held) as number) < spot
          );
          const baseAfter = steady.find(
            (held) => (facts.index.get(held) as number) > spot
          );
          if (
            (baseBefore !== undefined && !before(M, baseBefore, into)) ||
            (baseAfter !== undefined && !before(M, into, baseAfter))
          ) {
            report.push(
              `the merge moves ${name()} past the base letters around it`
            );
          }
          continue;
        }
        const place = facts.index.get(id) as number;
        const around = [...facts.letters.keys()].filter(
          (held) => onBase(held) && rootOf(facts, held) === letter.root
        );
        const baseLeft = around.findLast(
          (held) => (facts.index.get(held) as number) < place
        );
        const baseRight = around.find(
          (held) => (facts.index.get(held) as number) > place
        );
        // A letter this side deleted beside this one was a neighbor too.
        const indexIn = (held: string) => B.index.get(held) as number;
        const from = baseLeft === undefined ? -1 : indexIn(baseLeft);
        const to = baseRight === undefined ? Infinity : indexIn(baseRight);
        const deletedBeside = [...B.letters.keys()].filter(
          (held) =>
            onBase(held) &&
            !facts.letters.has(held) &&
            rootOf(B, held) === letter.root &&
            from < indexIn(held) &&
            indexIn(held) < to
        );
        const span = [baseLeft, ...deletedBeside, baseRight].filter(
          (held) => held !== undefined
        );
        // The other side turned its neighbors around, so it stands by one.
        const together = (on: Facts, first: string, second: string) =>
          blockOf(on, first) !== undefined &&
          blockOf(on, first) === blockOf(on, second);
        const turned = span.some(
          (held, spot) =>
            spot > 0 &&
            (together(B, span[spot - 1], held) ||
              together(facts, span[spot - 1], held)) &&
            other.facts.letters.has(span[spot - 1]) &&
            other.facts.letters.has(held) &&
            before(other.facts, held, span[spot - 1])
        );
        const afterPrev = present(M, prev) && before(M, prev as string, into);
        const beforeNext = present(M, next) && before(M, into, next as string);
        const standsBy = turned && (afterPrev || beforeNext);
        if (present(M, prev) && !afterPrev && !standsBy) {
          report.push(`the merge puts ${name()} before its previous letter`);
        }
        if (present(M, next) && !beforeNext && !standsBy) {
          report.push(`the merge puts ${name()} after its next letter`);
        }
        // The other side split the base letters around this one apart, so it
        // stays beside one neighbor at most, and a letter with one neighbor may
        // fall on either side of the split.
        const parted = (first?: string, second?: string) =>
          first !== undefined &&
          second !== undefined &&
          other.facts.letters.has(first) &&
          other.facts.letters.has(second) &&
          blockOf(other.facts, first) !== blockOf(other.facts, second);
        // A letter the other side deleted parts nothing, so a split that side
        // made past it still falls around this one.
        const keptByOther = (held: string) => other.facts.letters.has(held);
        // The other side typed at the edge of the base letters around this
        // one and split its line right there, so this one ties with its letter
        // and may fall on either side of the split.
        const splitAtEdge = (held: string | undefined) => {
          if (held === undefined || !other.facts.letters.has(held)) {
            return false;
          }
          const edge = other.facts.index.get(held) as number;
          let previous: string | undefined;
          for (const there of other.facts.letters.keys()) {
            const spot = other.facts.index.get(there) as number;
            if (
              spot < edge &&
              rootOf(other.facts, there) === letter.root &&
              (previous === undefined ||
                spot > (other.facts.index.get(previous) as number))
            ) {
              previous = there;
            }
          }
          return (
            previous !== undefined &&
            !onBase(previous) &&
            blockOf(other.facts, previous) === blockOf(B, held) &&
            blockOf(other.facts, held) !== blockOf(B, held)
          );
        };
        // The other side cut this letter's line right at the gap it was
        // typed in, so it ties with the cut and may fall on either side.
        const cutAtGap = () => {
          const lines = continuesOf(fold, letter.block).filter(isBase);
          if (lines.length !== 1) return false;
          const heirs = other.identity.heirs.get(lines[0]) ?? [];
          if (heirs.length < 2) return false;
          const line = (B.blocks.get(lines[0]) ?? []).filter(keptByOther);
          const last = line.findLast((held) => indexIn(held) <= from);
          const first = line.find((held) => indexIn(held) >= to);
          const theirs = other.facts;
          if (last !== undefined && first !== undefined) {
            return blockOf(theirs, last) !== blockOf(theirs, first);
          }
          if (last !== undefined) {
            return heirs.some(
              (heir) =>
                heir !== blockOf(theirs, last) && before(theirs, last, heir)
            );
          }
          return (
            first !== undefined &&
            heirs.some(
              (heir) =>
                heir !== blockOf(theirs, first) && before(theirs, heir, first)
            )
          );
        };
        const split =
          cutAtGap() ||
          (baseLeft === undefined && splitAtEdge(span[0])) ||
          parted(
            around
              .filter((held) => (facts.index.get(held) as number) < place)
              .findLast(keptByOther),
            around
              .filter((held) => (facts.index.get(held) as number) > place)
              .find(keptByOther)
          ) ||
          span
            .filter(keptByOther)
            .some(
              (held, spot, still) =>
                spot > 0 &&
                blockOf(B, still[spot - 1]) === blockOf(B, held) &&
                parted(still[spot - 1], held)
            );
        // A letter this side keeps in another block is another block here too,
        // which neither a tie nor a split can make it, unless the other side
        // joined that block to a letter this one stood beside.
        const joinedBeside = (held: string) =>
          deletedBeside.some(
            (gone) =>
              blockOf(B, gone) !== blockOf(B, held) &&
              blockOf(other.facts, gone) === blockOf(other.facts, held)
          );
        const apart = () =>
          [...facts.letters].some(([held, fact]) => {
            if (fact.block === letter.block || joinedBeside(held)) return false;
            const there = translate(held);
            return there !== undefined && blockOf(M, there) === landed.block;
          });
        // Two letters typed at one place tie, and the other side's split of the
        // neighbor's block past its own letter parts this one from its neighbor
        // whichever way the tie falls.
        const tied = (neighbor: string) => {
          const far = blockOf(other.facts, fromMerged(neighbor) ?? neighbor);
          if (far === undefined || apart()) return false;
          const mate = (M.blocks.get(landed.block) ?? []).some((held) => {
            const theirs = isBase(held) ? undefined : fromMerged(held);
            const block = theirs && blockOf(other.facts, theirs);
            return (
              block !== undefined &&
              block !== far &&
              !(isBase(block) && isBase(far)) &&
              continuesOf(other, block).some((source) =>
                continuesOf(other, far).includes(source)
              )
            );
          });
          if (!mate) return false;
          const [low, high] = [M.index.get(into), M.index.get(neighbor)].sort(
            (x, y) => (x as number) - (y as number)
          ) as [number, number];
          return ![...M.letters.keys()].some((held) => {
            const spot = M.index.get(held) as number;
            return (
              onBase(held) &&
              rootOf(M, held) === landed.root &&
              low < spot &&
              spot < high
            );
          });
        };
        const sharing = near.filter(
          (neighbor) =>
            blockOf(M, neighbor as string) === landed.block ||
            tied(neighbor as string)
        );
        // Either side of a split is a block made of this letter's own block.
        const onItsLine = () =>
          continuesOf(fold, letter.block).some((source) =>
            mergedContinues(landed.block, source)
          );
        const stays = split
          ? sharing.length > 0 || (near.length === 1 && onItsLine() && !apart())
          : sharing.length === near.length;
        if (!stays) {
          report.push(`the merge moves ${name()} away from its neighbors`);
        }
      }
      for (const [id, element] of facts.elements) {
        if (unborn(id) || !element.block) continue;
        const into = translate(id);
        if (into === undefined) continue;
        const name = () => `${side} birth ${describe(facts, id)}`;
        const landed = M.elements.get(into);
        if (!landed) {
          if (!lostWithItsBlock(fold, other, id)) {
            report.push(`the merge drops ${name()}`);
          }
          continue;
        }
        const heldBase = (block: string) =>
          [...facts.owners]
            .filter(([token, owner]) => owner === block && isBase(token))
            .map(([token]) => token);
        const held = heldBase(id);
        // A birth in a container the other side removed with all it held goes
        // with that container.
        const removedByOther = (container: string) =>
          isBase(container) &&
          B.elements.has(container) &&
          !alive(other, container) &&
          ![...B.elements].some(
            ([block, fact]) =>
              fact.block &&
              alive(other, block) &&
              ancestorsIn(B, block).includes(container)
          );
        if (removedByOther(element.parent)) {
          report.push(
            `the merge keeps ${name()}, made in a container the other side removed`
          );
          continue;
        }
        // A block that holds base letters goes where they go, so it answers
        // only for holding them, or for what a later split took of them.
        if (held.some((token) => facts.letters.has(token))) {
          // Twin splits make one line, not an empty one beside it.
          if (
            (M.blocks.get(into) ?? []).length === 0 &&
            held.some(
              (token) =>
                facts.letters.has(token) &&
                present(M, token) &&
                other.facts.owners.get(token) !== B.owners.get(token)
            )
          ) {
            report.push(
              `the merge leaves ${name()} empty and its letters elsewhere`
            );
          }
          // It still answers for the parent this side gave it, as a half does
          // not follow its source into a container the other side moved that
          // source to, unless the other side's container holds a block it
          // came from.
          const madeParent =
            element.parent.startsWith(ROOT) || unborn(element.parent)
              ? element.parent
              : translate(element.parent);
          const otherParent = fromMerged(landed.parent) ?? landed.parent;
          if (
            madeParent !== undefined &&
            (madeParent.startsWith(ROOT)
              ? M.roots.has(madeParent.slice(ROOT.length))
              : present(M, madeParent)) &&
            landed.parent !== madeParent &&
            !(
              !isBase(otherParent) &&
              [...other.facts.elements].some(
                ([block, fact]) =>
                  fact.parent === otherParent &&
                  continuesOf(fold, id).includes(block)
              )
            )
          ) {
            report.push(`the merge moves ${name()} to another parent`);
          }
          // A rebased split may make the other half new: when the block this
          // birth names holds none of its letters, the half of the same line
          // that holds them stands for it.
          const swapped = (holder: string) =>
            !held.some(
              (token) =>
                facts.letters.has(token) && M.owners.get(token) === into
            ) &&
            continuesOf(fold, id).some(
              (origin) => isBase(origin) && mergedContinues(holder, origin)
            );
          // The other side's split of a line this birth extends takes the
          // letters past its cut, those this birth brought with them too.
          const splitOff = (holder: string) => {
            const half = fromMerged(holder) ?? holder;
            return continuesOf(fold, id).some(
              (origin) =>
                isBase(origin) &&
                half !== origin &&
                (other.identity.heirs.get(origin) ?? []).includes(half)
            );
          };
          for (const token of held) {
            if (!facts.letters.has(token)) continue;
            const holder = M.owners.get(token);
            if (
              holder !== undefined &&
              other.facts.owners.get(token) === B.owners.get(token) &&
              !mergedContinues(holder, id) &&
              !swapped(holder) &&
              !splitOff(holder)
            ) {
              report.push(`the merge takes base letters out of ${name()}`);
              break;
            }
          }
          continue;
        }
        // A wrapper goes where the other side moves what it wraps.
        const wrapsMoved = (wrapper: string) =>
          [...facts.elements.keys()].some(
            (block) =>
              isBase(block) &&
              movedBy(other, block) &&
              ancestorsIn(facts, block).includes(wrapper)
          );
        if (
          canonicalRecordJson(element.props) !==
          canonicalRecordJson(landed.props)
        ) {
          report.push(`the merge changes the properties of ${name()}`);
        }
        if (wrapsMoved(id)) continue;
        // A sibling the other side moved says nothing about this block, and
        // neither does an open whose letters the other side's split took. One
        // the other side deleted or joined away still orders a birth that
        // continues it.
        const carriedAway = (block: string) =>
          movedBy(other, block) ||
          (other.facts.elements.has(block) &&
            other.facts.elements.get(block)?.parent !==
              B.elements.get(block)?.parent) ||
          (other.identity.heirs.get(block) ?? []).some(
            (heir) => heir !== block && !isBase(heir)
          );
        const steady = (sibling: string | undefined) => {
          if (sibling === undefined) return undefined;
          const carried =
            heldBase(sibling).some((token) => movedBy(other, token)) ||
            continuesOf(fold, sibling).some(
              (block) => isBase(block) && carriedAway(block)
            ) ||
            wrapsMoved(sibling);
          return carried ? undefined : translate(sibling);
        };
        const prev = steady(element.prev);
        const next = steady(element.next);
        // The other side turned its two siblings around, so it stands by one.
        const left = element.prev && translate(element.prev);
        const right = element.next && translate(element.next);
        const turned =
          present(M, left) &&
          present(M, right) &&
          before(M, right as string, left as string);
        if (
          present(M, prev) &&
          !before(M, prev as string, into) &&
          !(turned && before(M, into, right as string))
        ) {
          report.push(`the merge puts ${name()} before its previous sibling`);
        }
        if (
          present(M, next) &&
          !before(M, into, next as string) &&
          !(turned && before(M, left as string, into))
        ) {
          report.push(`the merge puts ${name()} after its next sibling`);
        }
        // A birth keeps its side's order with that side's other births up to
        // the nearest base sibling that neither side moved, wrapped or joined
        // away, even a birth that holds letters the other side's move
        // carried, which no turn of the siblings between them excuses.
        const pins = (sibling: string) =>
          !movedBy(fold, sibling) &&
          !movedBy(other, sibling) &&
          [fold, other].every((claimant) => {
            const fact = claimant.facts.elements.get(sibling);
            if (fact === undefined) return !alive(claimant, sibling);
            return fact.parent.startsWith(ROOT) || isBase(fact.parent);
          });
        const nearestBirth = (step: 'next' | 'prev') => {
          let sibling = element[step];
          while (sibling !== undefined && unborn(sibling)) {
            if (pins(sibling)) return undefined;
            sibling = facts.elements.get(sibling)?.[step];
          }
          return sibling === undefined ? undefined : translate(sibling);
        };
        // A sibling the other side split but did not move still bounds this
        // birth by the part that kept its name, so a birth does not follow
        // the half that the other side's move carried off. Either side of that
        // part will do, as either half of a split at a line's edge may keep
        // the line's name.
        const splitInPlace = (step: 'next' | 'prev') => {
          const sibling = element[step];
          if (sibling === undefined || !unborn(sibling) || !pins(sibling)) {
            return undefined;
          }
          // A birth beside a line the other side moved may follow that line.
          if (
            [element.prev, element.next].some(
              (beside) => beside !== undefined && movedBy(other, beside)
            )
          ) {
            return undefined;
          }
          return other.facts.elements.has(sibling)
            ? translate(sibling)
            : undefined;
        };
        const besideIn = (block: string) =>
          landed.prev === block || landed.next === block;
        const earlierKept = splitInPlace('prev');
        if (
          prev === undefined &&
          present(M, earlierKept) &&
          !before(M, earlierKept as string, into) &&
          !besideIn(earlierKept as string)
        ) {
          report.push(`the merge puts ${name()} before the line it came after`);
        }
        const laterKept = splitInPlace('next');
        if (
          next === undefined &&
          present(M, laterKept) &&
          !before(M, into, laterKept as string) &&
          !besideIn(laterKept as string)
        ) {
          report.push(`the merge puts ${name()} after the line it came before`);
        }
        const laterBirth = nearestBirth('next');
        if (present(M, laterBirth) && !before(M, into, laterBirth as string)) {
          report.push(`the merge turns ${name()} and its later sibling around`);
        }
        const earlierBirth = nearestBirth('prev');
        if (
          present(M, earlierBirth) &&
          !before(M, earlierBirth as string, into)
        ) {
          report.push(
            `the merge turns ${name()} and its earlier sibling around`
          );
        }
        const parents = [prev, next]
          .filter((sibling) => present(M, sibling))
          .map((sibling) => M.elements.get(sibling as string)?.parent);
        const wrappedByOther =
          !isBase(landed.parent) &&
          !landed.parent.startsWith(ROOT) &&
          other.facts.elements.has(fromMerged(landed.parent) ?? landed.parent);
        // A sibling the other side wrapped may take this block into its
        // wrapper, as the two tie at the wrapper's edge.
        const withWrapped = [left, right].some(
          (sibling) =>
            sibling !== prev &&
            sibling !== next &&
            present(M, sibling) &&
            M.elements.get(sibling as string)?.parent === landed.parent
        );
        if (parents.length === 0) {
          const parent = element.parent.startsWith(ROOT)
            ? element.parent
            : translate(element.parent);
          if (
            parent !== undefined &&
            (parent.startsWith(ROOT) || present(M, parent)) &&
            parent !== landed.parent &&
            !(wrappedByOther && withWrapped)
          ) {
            report.push(`the merge moves ${name()} to another parent`);
          }
        } else if (
          !parents.includes(landed.parent) &&
          !(wrappedByOther && withWrapped)
        ) {
          report.push(`the merge moves ${name()} away from its siblings`);
        }
      }
    };
    anchor('own', ownFold, acceptedFold, inOwn, (id) => id);
    // A front may place own's birth by a tie its rest takes back, so each
    // birth also answers to the place own first gave it.
    if (firstOwn !== undefined) {
      anchor(
        'own',
        firstOwn,
        acceptedFold,
        inOwn,
        (id) => id,
        (id) => isBase(id) && inFirstBase(id)
      );
    }
    anchor(
      'accepted',
      acceptedFold,
      ownFold,
      (id) => id,
      (id) => (isBase(id) ? id : ownOf.get(id))
    );

    for (const step of ownFold.steps) {
      for (const tokens of step.births.values()) {
        for (const token of tokens) {
          const into = translated.get(token.id);
          if (
            into === undefined &&
            present(O, token.id) &&
            !(
              O.elements.has(token.id) &&
              lostWithItsBlock(ownFold, acceptedFold, token.id)
            )
          ) {
            losses.push(`the merge drops own birth ${describe(O, token.id)}`);
          }
          if (into !== undefined && !present(O, token.id) && present(M, into)) {
            losses.push(
              `the merge keeps own birth ${
                token.ch ?? token.id
              }, which own deleted`
            );
          }
        }
      }
    }
    for (const id of unexplained) {
      if (present(M, id)) {
        harms.push(`the merge adds ${describe(M, id)}, which no side wrote`);
      }
    }

    const recordIds = new Set([
      ...baseRecords.keys(),
      ...ownFold.records.keys(),
      ...acceptedFold.records.keys(),
      ...mergedFold.records.keys(),
    ]);
    for (const key of recordIds) {
      threeWay(
        () => `record ${(JSON.parse(key) as string[]).join(' / ')}`,
        baseRecords.get(key),
        ownFold.records.get(key),
        acceptedFold.records.get(key),
        mergedFold.records.get(key)
      );
    }
    for (const root of new Set([
      ...B.roots,
      ...O.roots,
      ...A.roots,
      ...M.roots,
    ])) {
      threeWay(
        () => `root ${root}`,
        B.roots.has(root),
        O.roots.has(root),
        A.roots.has(root),
        M.roots.has(root)
      );
    }

    for (const ownStep of ownFold.steps) {
      for (const ownRewrite of ownStep.rewrites) {
        if (ownRewrite.letters === 0) continue;
        for (const accStep of acceptedFold.steps) {
          for (const accRewrite of accStep.rewrites) {
            const shared = ownRewrite.deleted.filter((id) =>
              accRewrite.deleted.includes(id)
            );
            if (accRewrite.letters > 0 && shared.length > 0) {
              contests.push(
                `both sides rewrote ${shared
                  .map((id) => describe(B, id))
                  .join(', ')}`
              );
            }
          }
        }
      }
    }

    const kind =
      losses.length > 0 || harms.length > 0
        ? 'lost'
        : contests.length > 0
          ? 'contested'
          : 'held';
    if (kind !== 'held') return { contests, harms, kind, losses };
    return {
      contests,
      harms,
      kind,
      losses,
      proof: {
        [proofState]: {
          accepted: acceptedFold,
          claims: claimsOf(
            O,
            (id) =>
              B.elements.has(id) || B.letters.has(id)
                ? movedInto(ownFold, id)
                : undefined,
            ownSides
          ),
          merged: mergedFold,
          origin: firstOwn ?? ownFold,
          own: ownFold,
        },
      },
    };
  };
  const claimsOf = (
    O: Facts,
    movedInto: (id: string) => string | undefined,
    sideBySide: ReadonlyMap<string, unknown>
  ): Claims => {
    const inBoth = (id: string) => present(B, id) && present(O, id);
    const together = (facts: Facts, left: string, right: string) =>
      blockOf(facts, left) === blockOf(facts, right);
    return {
      boundary: (left, right) =>
        claims.boundary(left, right) ||
        (sideBySide.has(pairKey(left, right)) &&
          together(B, left, right) !== together(O, left, right)),
      // A container own made is its birth, which the next frame's own holds.
      container: (id) => {
        const earlier = claims.container(id);
        if (earlier !== undefined) return earlier;
        const into = movedInto(id);
        return into !== undefined && (isBase(into) || into.startsWith(ROOT))
          ? into
          : undefined;
      },
      facet: (id, key) => {
        if (claims.facet(id, key)) return true;
        if (!inBoth(id)) return false;
        const [fb, fo] = asSets([facetsIn(B, id), facetsIn(O, id)]);
        return fb.get(key) !== fo.get(key);
      },
      order: (left, right) =>
        claims.order(left, right) ||
        (inBoth(left) &&
          inBoth(right) &&
          rootOf(B, left) === rootOf(B, right) &&
          rootOf(O, left) === rootOf(O, right) &&
          before(B, left, right) !== before(O, left, right)),
    };
  };

  const sameFacets = (
    left: ReadonlyMap<string, string>,
    right: ReadonlyMap<string, string>
  ) => {
    const [a, b] = asSets([left, right]);
    return (
      a.size === b.size && [...a].every(([key, value]) => b.get(key) === value)
    );
  };
  const marksOf = (facts: Facts, id: string) =>
    new Map(
      [...facetsIn(facts, id)].filter(([key]) => key.startsWith('text.'))
    );
  const same = {
    element: (left: Facts, leftId: string, right: Facts, rightId: string) =>
      sameFacets(facetsIn(left, leftId), facetsIn(right, rightId)),
    letter: (left: Facts, right: Facts, id: string) =>
      sameFacets(marksOf(left, id), marksOf(right, id)),
  };
  const fold = (
    views: readonly ChangeView[],
    side: 'acc' | 'own'
  ): SideFold => {
    const moves: MoveStep[] = [];
    const chain = foldChain(
      start,
      views,
      `${side}${generation}`,
      (step, prior, after) =>
        moves.push({ after, moved: movesOf(step.trees, prior) })
    );
    return { ...chain, intent: intentOf(start, chain, moves, same), side };
  };
  const foldMerged = (accepted: SideFold, views: readonly ChangeView[]) => {
    const { facts, records, steps, streams } = foldChain(
      accepted,
      views,
      `mrg${generation}`
    );
    return { facts, records, steps, streams, views };
  };
  // Own seen from this base: facts and places from the chain the merge wrote,
  // and what own meant from its own changes, named here, since a rebased
  // change can record another node as the mover. The blocks a move ends past
  // stay base names, which this base keeps where they still stand.
  const carry = (
    own: SideFold,
    origin: Claimant,
    rebased: readonly ChangeView[]
  ) => {
    const there = fold(rebased, 'own');
    if (there.steps.length !== own.steps.length) {
      throw new Error(
        `${rebased.length} rebased changes carry ${own.steps.length} of own`
      );
    }
    const { translated } = birthsAcross(own, there);
    const named = (ids: Iterable<string>) =>
      new Set(
        [...ids].flatMap((id) => {
          const here = isBase(id) ? id : translated.get(id);
          return here === undefined ? [] : [here];
        })
      );
    // An edit of what the front deleted keeps its claim under its first name,
    // as a move survives an unwrap through what it carried.
    const claimed = (ids: Iterable<string>) =>
      new Set(
        [...ids].flatMap((id) => {
          const [here] = named([id]);
          if (here !== undefined) return [here];
          return inFirstBase(id) && alive(own, id) ? [id] : [];
        })
      );
    const moves = new Map<string, Move>();
    for (const [head, move] of own.intent.moves) {
      const [name] = claimed([head]);
      if (name === undefined) continue;
      moves.set(name, { carried: named(move.carried), past: move.past });
    }
    // A rebased chain's token flow is the rebase's doing, so an element here
    // continues only what own's own changes made it continue.
    const original = new Map([...translated].map(([from, to]) => [to, from]));
    const identity = withLineage(there.identity, (id) => {
      const name =
        isBase(id) && own.identity.elements.has(id) ? id : original.get(id);
      const continues =
        name === undefined
          ? []
          : (own.identity.elements.get(name)?.continues ?? []);
      return [...new Set([id, ...named(continues)])];
    });
    const rename = (id: string) => translated.get(id) ?? id;
    const streams = new Map(
      [...origin.streams].map(([root, stream]) => [
        root,
        stream.map((token) => ({ ...token, id: rename(token.id) })),
      ])
    );
    return {
      origin: {
        facts: factsOf(streams),
        identity: renamedIdentity(origin.identity, rename),
        intent: renamedIntent(origin.intent, rename),
        streams,
      },
      own: {
        ...there,
        identity,
        intent: {
          elements: claimed(own.intent.elements),
          letters: claimed(own.intent.letters),
          moves,
          typed: new Map(
            [...own.intent.typed].flatMap(([letter, lines]) => {
              const [here] = named([letter]);
              return here === undefined ? [] : [[here, lines] as const];
            })
          ),
        },
      },
    };
  };
  return {
    fold,
    foldMerged,
    judge: (accepted, own, merged) => judge(accepted, own, merged),
    resume: (proof, rest) => {
      const front = proof[proofState];
      const later = ledgerAt(
        front.accepted,
        String(Number(generation) + 1),
        isSetValued,
        front.claims,
        inFirstBase
      );
      const accepted = later.fold(rest.accepted, 'acc');
      const { origin, own } = later.carry(
        front.own,
        front.origin,
        front.merged.views
      );
      return later.judgeAfter(
        accepted,
        own,
        later.foldMerged(accepted, rest.merged),
        origin
      );
    },
    carry,
    judgeAfter: judge,
  };
};
