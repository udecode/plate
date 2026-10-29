import {
  type Descendant,
  type Element,
  ElementApi,
  type Node,
  TextApi,
} from '../interfaces';
import type { AnyEditor as Editor } from '../interfaces/editor';
import { failInvariant } from '../internal/fail-invariant';
import { getDefined } from '../internal/get-defined';
import { inheritNodeKey } from '../utils/node-keys';
import type { NodeList } from './change/document-index';
import type { CompiledSchemaContentProgram } from './schema-compiler';
import type { RepresentationRepairSink } from './slice-fit/fit-report';
import { textPropertiesEqual } from './value-codec';

type Text = Extract<Descendant, { text: string }>;
type InlineSchema = Readonly<{ isInline: (node: Node) => boolean }>;

export type ContentKind = 'block' | 'inline' | 'mixed';

/**
 * Where completion builds an element: prefix slot `prefix`, or the `min`th
 * element a minimum adds past the prefix, counted from 0 in build order.
 */
export type ConstructionSlot =
  | Readonly<{ prefix: number }>
  | Readonly<{ min: number }>;

/**
 * The stored element a build of `type` at `slot` takes instead of building
 * one, or null when it builds its own.
 */
export type ConstructionTake = (
  type: string,
  slot: ConstructionSlot
) => Element | null;

/**
 * The schema a completion builds through, already bound to the completed
 * element's site: `create` builds an element there at `slot` in its
 * canonical empty form, and `fitsPrefix` reads a child against one prefix
 * slot there.
 */
export type ContentCompletionSchema = InlineSchema &
  Readonly<{
    create: (
      type: string,
      properties: Readonly<Record<string, unknown>> | undefined,
      slot: ConstructionSlot
    ) => Element;
    fitsPrefix: (child: Descendant, slot: number) => boolean;
  }>;

export type ContentCompletion = Readonly<{
  built: ReadonlyArray<
    Readonly<{
      index: number;
      node: Element;
      slot: ConstructionSlot;
    }>
  >;
  children: readonly Descendant[];
}>;

const sameChildren = (
  canonical: readonly Descendant[],
  children: readonly Descendant[]
) =>
  canonical.length === children.length &&
  canonical.every((child, index) => child === children[index]);

const plainEmptyText = (
  text: Text,
  drops: (key: string, value: unknown) => boolean,
  editor?: Editor
): Text => {
  const entries = Object.entries(text);
  const kept = entries.filter(
    ([key, value]) => key === 'text' || !drops(key, value)
  );

  if (kept.length === entries.length) return text;

  const plain = Object.fromEntries(kept) as Text;

  inheritNodeKey(plain, text, editor);

  return plain;
};

const isInlineNode = (schema: InlineSchema, node: Descendant | undefined) =>
  node !== undefined && ElementApi.isElement(node) && schema.isInline(node);

const collectInlineContent = (
  schema: InlineSchema,
  node: Descendant
): Descendant[] => {
  if (TextApi.isText(node) || isInlineNode(schema, node)) return [node];

  return (node.children as Descendant[]).flatMap((child) =>
    collectInlineContent(schema, child)
  );
};

const mergeText = (left: Text, right: Text, editor?: Editor) => {
  const merged = { ...left, text: left.text + right.text };

  inheritNodeKey(merged, left, editor);

  return merged;
};

const runMerger = (
  editor: Editor | undefined,
  report: RepresentationRepairSink | undefined
) => {
  const runs = new Map<Descendant, Descendant[]>();

  return {
    flush: () => {
      for (const [output, inputs] of runs) {
        report?.({ code: 'merge-text', inputs, output });
      }
    },
    merge: (previous: Text, child: Text) => {
      const text = mergeText(previous, child, editor);

      if (report) {
        const inputs = runs.get(previous) ?? [previous];

        inputs.push(child);
        runs.delete(previous);
        runs.set(text, inputs);
      }

      return text;
    },
  };
};

export const admitsEmptyText = (content: CompiledSchemaContentProgram) =>
  content.allowsText && (content.max === null || content.max > 0);

/**
 * The texts between two inline elements, or between one and the edge of the
 * children. `before` and `after` are those inline elements, a sibling text
 * when the run goes on past a window, or undefined at the element's edge.
 */
type TextRun = Readonly<{
  after: Descendant | undefined;
  before: Descendant | undefined;
  texts: readonly Text[];
}>;

const splitAtInlines = (
  content: readonly Descendant[],
  before: Descendant | undefined,
  after: Descendant | undefined
) => {
  const inlines: Descendant[] = [];
  const runs: TextRun[] = [];
  let texts: Text[] = [];

  for (const child of content) {
    if (TextApi.isText(child)) {
      texts.push(child);
      continue;
    }
    runs.push({ after: child, before: inlines.at(-1) ?? before, texts });
    inlines.push(child);
    texts = [];
  }
  runs.push({ after, before: inlines.at(-1) ?? before, texts });

  return { inlines, runs };
};

/**
 * The one place that decides which empty texts survive, read off one run. A
 * run with letters keeps no empty text but a protected spacer at its edge. A
 * run without letters keeps or builds exactly one where an inline element
 * needs a spacer or the line needs an anchor, unless a sibling text past the
 * window holds that place.
 */
const keptTexts = (
  { after, before, texts }: TextRun,
  {
    anchorsLine,
    dropsFromEmptyText,
    editor,
    fillsEmpty,
    preserveInlineSpacersAdjacentTo,
    report,
    schema,
  }: Readonly<{
    anchorsLine: boolean;
    dropsFromEmptyText?: (key: string, value: unknown) => boolean;
    editor?: Editor;
    fillsEmpty: boolean;
    preserveInlineSpacersAdjacentTo?: ReadonlySet<Descendant>;
    report?: RepresentationRepairSink;
    schema: InlineSchema;
  }>
): Text[] => {
  const protects = (node: Descendant | undefined) =>
    node !== undefined &&
    isInlineNode(schema, node) &&
    preserveInlineSpacersAdjacentTo?.has(node) === true;
  const protectedAt = (index: number) =>
    texts[index]?.text === '' &&
    ((index === 0 && protects(before)) ||
      (index === texts.length - 1 && protects(after)));
  const spaces = isInlineNode(schema, before) || isInlineNode(schema, after);
  const needsOne =
    !TextApi.isText(before) &&
    !TextApi.isText(after) &&
    (spaces || anchorsLine) &&
    texts.every((text, index) => text.text === '' && !protectedAt(index));
  const survivor = !needsOne
    ? -1
    : isInlineNode(schema, before)
      ? 0
      : isInlineNode(schema, after) || texts.length === 1
        ? texts.length - 1
        : -1;
  const kept = texts.filter((text, index) => {
    if (text.text !== '' || index === survivor || protectedAt(index)) {
      return true;
    }
    report?.({ code: 'remove-empty-text', inputs: [text] });

    return false;
  });

  if (kept.length === 0 && needsOne && (spaces || fillsEmpty)) {
    const text = { text: '' };

    report?.({
      code: spaces ? 'insert-inline-spacer' : 'insert-empty-text',
      inputs: [],
      output: text,
    });

    return [text];
  }

  return kept.map((text) => {
    if (text.text !== '' || !dropsFromEmptyText) return text;

    const plain = plainEmptyText(text, dropsFromEmptyText, editor);

    if (plain !== text) {
      report?.({
        code: 'omit-empty-text-property',
        inputs: [text],
        output: plain,
        properties: Object.keys(text).filter(
          (key) => !Object.hasOwn(plain, key)
        ),
      });
    }

    return plain;
  });
};

export const canonicalizeInlineChildren = (
  children: readonly Descendant[],
  {
    dropsFromEmptyText,
    editor,
    fillsEmpty = true,
    flattenInto,
    lineAnchor = true,
    preserveInlineSpacersAdjacentTo,
    report,
    schema,
    siblingAfter: after,
    siblingBefore: before,
  }: Readonly<{
    dropsFromEmptyText?: (key: string, value: unknown) => boolean;
    editor?: Editor;
    fillsEmpty?: boolean;
    flattenInto?: Element;
    /** False for a run between blocks, which a block already anchors. */
    lineAnchor?: boolean;
    preserveInlineSpacersAdjacentTo?: ReadonlySet<Descendant>;
    report?: RepresentationRepairSink;
    schema: InlineSchema;
    siblingAfter?: Descendant;
    siblingBefore?: Descendant;
  }>
) => {
  const flattened = children.flatMap((child) => {
    if (TextApi.isText(child) || isInlineNode(schema, child)) return [child];

    const content = collectInlineContent(schema, child);

    report?.(
      content.length > 0
        ? {
            code: 'flatten-block-content',
            impact: 'lossy',
            inputs: [child],
            into: flattenInto,
          }
        : {
            code: 'remove-noncanonical-child',
            impact: 'lossy',
            inputs: [child],
          }
    );

    return content;
  });
  const { inlines, runs } = splitAtInlines(flattened, before, after);
  const site = {
    anchorsLine:
      lineAnchor &&
      inlines.length === 0 &&
      before === undefined &&
      after === undefined,
    dropsFromEmptyText,
    editor,
    fillsEmpty,
    preserveInlineSpacersAdjacentTo,
    report,
    schema,
  };
  const canonical: Descendant[] = [];
  const merger = runMerger(editor, report);

  for (const [index, run] of runs.entries()) {
    for (const text of keptTexts(run, site)) {
      const previous = canonical.at(-1);

      if (
        TextApi.isText(previous) &&
        previous.text !== '' &&
        text.text !== '' &&
        textPropertiesEqual(previous, text)
      ) {
        canonical[canonical.length - 1] = merger.merge(previous, text);
      } else {
        canonical.push(text);
      }
    }

    const inline = inlines[index];

    if (inline) canonical.push(inline);
  }
  merger.flush();

  return sameChildren(canonical, children) ? children : canonical;
};

const CONTENT_KINDS = new WeakMap<CompiledSchemaContentProgram, ContentKind>();

/** Prefix slots are blocks, so text after a prefix makes the content mixed. */
export const contentKindOf = (
  content: CompiledSchemaContentProgram,
  schema: InlineSchema
): ContentKind => {
  const cached = CONTENT_KINDS.get(content);

  if (cached) return cached;

  let inline = content.allowsText;
  let block = content.allowsUnknownElements;

  for (const type of content.allowedElementTypes) {
    if (schema.isInline({ children: [], type } as Element)) inline = true;
    else block = true;
  }

  const kind = inline ? (block ? 'mixed' : 'inline') : 'block';

  CONTENT_KINDS.set(content, kind);

  return kind;
};

const isBlock = (child: Descendant | undefined, schema: InlineSchema) =>
  child !== undefined && ElementApi.isElement(child) && !schema.isInline(child);

const prefixHead = (
  children: readonly Descendant[],
  content: CompiledSchemaContentProgram,
  schema: InlineSchema
) => {
  let head = 0;

  while (
    head < (content.prefix?.length ?? 0) &&
    head < children.length &&
    isBlock(children[head], schema)
  ) {
    head += 1;
  }

  return head;
};

type RunOptions = Readonly<{
  dropsFromEmptyText?: (key: string, value: unknown) => boolean;
  editor?: Editor;
  fillsEmpty?: boolean;
  flattenInto?: Element;
  preserveInlineSpacersAdjacentTo?: ReadonlySet<Descendant>;
  report?: RepresentationRepairSink;
  schema: InlineSchema;
}>;

/**
 * An empty remainder after a prefix stays empty for completion to fill,
 * and mixed content drops a run that is only an empty text once a block
 * holds the line.
 */
export const canonicalizeContentChildren = (
  children: readonly Descendant[],
  content: CompiledSchemaContentProgram,
  options: RunOptions
): readonly Descendant[] => {
  const kind = contentKindOf(content, options.schema);

  if (kind === 'block') return children;

  const runOptions = { ...options, fillsEmpty: admitsEmptyText(content) };

  if (kind === 'inline') {
    return canonicalizeInlineChildren(children, runOptions);
  }
  if (content.prefix && content.remainder) {
    const head = prefixHead(children, content, options.schema);
    const tail = children.slice(head);
    const tailCanonical =
      tail.length === 0
        ? tail
        : canonicalizeContentChildren(tail, content.remainder, options);

    return tailCanonical === tail
      ? children
      : [...children.slice(0, head), ...tailCanonical];
  }

  return canonicalizeRuns(children, runOptions);
};

/**
 * Mixed content canonicalizes each inline run between blocks on its own, so a
 * window over it grows to the blocks around the change. A window past the
 * prefix reads by the remainder's program, as the whole tail does, since the
 * full program would take the window's leading blocks for prefix slots.
 */
export const mixedContentWindow = (
  children: readonly Descendant[],
  content: CompiledSchemaContentProgram,
  schema: InlineSchema,
  window: Readonly<{ from: number; to: number }>
) => {
  const head = prefixHead(children, content, schema);
  let { from, to } = window;

  while (from > head && !isBlock(children[from], schema)) from -= 1;
  while (to > 0 && to < children.length && !isBlock(children[to - 1], schema)) {
    to += 1;
  }
  if (from < head) return { from: 0, program: content, to };

  return {
    from,
    program:
      from > 0 && content.prefix && content.remainder
        ? content.remainder
        : content,
    to,
  };
};

const canonicalizeRuns = (
  children: readonly Descendant[],
  options: RunOptions
): readonly Descendant[] => {
  const blocks = children.filter(
    (child) => ElementApi.isElement(child) && !options.schema.isInline(child)
  );

  if (blocks.length === 0) {
    return canonicalizeInlineChildren(children, options);
  }

  const canonical: Descendant[] = [];
  const runOptions = { ...options, fillsEmpty: false, lineAnchor: false };
  let run: Descendant[] = [];
  const flush = () => {
    if (run.length > 0) {
      canonical.push(...canonicalizeInlineChildren(run, runOptions));
      run = [];
    }
  };

  for (const child of children) {
    if (ElementApi.isElement(child) && !options.schema.isInline(child)) {
      flush();
      canonical.push(child);
    } else {
      run.push(child);
    }
  }
  flush();

  return sameChildren(canonical, children) ? children : canonical;
};

export type PrefixOccupantFate = 'displaced' | 'joined' | 'kept';

type CompletionInput = Readonly<{
  children: NodeList<Descendant>;
  content: CompiledSchemaContentProgram;
  dropsFromEmptyText?: (key: string, value: unknown) => boolean;
  editing?: Readonly<{
    occupant: (slot: number, candidate: Descendant) => PrefixOccupantFate;
  }>;
  editor?: Editor;
  /** False for a root, which takes no empty text and no inline runs. */
  element: boolean;
  preserveInlineSpacersAdjacentTo?: ReadonlySet<Descendant>;
  report?: RepresentationRepairSink;
  schema: ContentCompletionSchema;
}>;

const startCompletion = ({
  children,
  content,
  editing,
  element,
  schema,
}: CompletionInput) => {
  const remainder = content.remainder ?? content;
  const built: Element[] = [];
  const required: Descendant[] = [];
  const builtSlots = new Map<Element, ConstructionSlot>();
  const inserted = new Set<Descendant>();
  let consumed = 0;

  for (const [slot, prefix] of (content.prefix ?? []).entries()) {
    const candidate = children.at(consumed);
    const fate = candidate && editing?.occupant(slot, candidate);

    if (
      candidate &&
      fate !== 'displaced' &&
      schema.fitsPrefix(candidate, slot)
    ) {
      required.push(candidate);
      consumed += 1;
      continue;
    }
    if (fate === 'kept') return null;

    const node = schema.create(prefix.type, prefix.properties, {
      prefix: slot,
    });

    builtSlots.set(node, { prefix: slot });
    inserted.add(node);
    built.push(node);
    required.push(node);
  }

  const remaining = children.length - consumed;
  const emptyText: Text | null =
    remaining === 0 && element && admitsEmptyText(remainder)
      ? { text: '' }
      : null;

  if (
    built.length === 0 &&
    !emptyText &&
    required.length + remaining >= content.min
  ) {
    return null;
  }

  return { built, builtSlots, consumed, emptyText, inserted, required };
};

/**
 * Whether completion returns `children` as they are, read through the prefix
 * slots and the count only, so a root needs no array.
 */
export const holdsContent = (input: CompletionInput) =>
  startCompletion(input) === null;

export const completeContent = (
  input: CompletionInput & Readonly<{ children: readonly Descendant[] }>
): ContentCompletion => {
  const {
    children,
    content,
    dropsFromEmptyText,
    editor,
    element,
    preserveInlineSpacersAdjacentTo,
    report,
    schema,
  } = input;
  const started = startCompletion(input);

  if (!started) return { built: [], children };

  const { built, builtSlots, consumed, emptyText, inserted, required } =
    started;
  const remainder = content.remainder ?? content;
  let rest: readonly Descendant[] = emptyText
    ? [emptyText]
    : children.slice(consumed);
  const count = () => required.length + rest.length;
  let ordinal = 0;

  while (count() < content.min) {
    const plan = remainder.defaultPlan;

    if (!plan) {
      throw new Error(
        `Editor ${element ? 'element' : 'root'} content requires defaultable content.`
      );
    }

    const unit: Descendant =
      plan.kind === 'text'
        ? { text: '' }
        : schema.create(plan.type, plan.properties, { min: ordinal });
    const next = element
      ? canonicalizeContentChildren([...rest, unit], remainder, {
          dropsFromEmptyText,
          editor,
          preserveInlineSpacersAdjacentTo,
          report,
          schema,
        })
      : [...rest, unit];

    if (
      ElementApi.isElement(unit)
        ? !next.includes(unit)
        : next.length <= rest.length
    ) {
      failInvariant(
        `a text unit merged into a trailing text below a minimum of ${content.min}, which the compiler refuses`
      );
    }
    if (ElementApi.isElement(unit)) {
      built.push(unit);
      builtSlots.set(unit, { min: ordinal });
      ordinal += 1;
    }
    inserted.add(unit);
    rest = next;
  }

  const completed = [...required, ...rest];

  if (report) {
    for (const node of completed) {
      if (node === emptyText) {
        report({ code: 'insert-empty-text', inputs: [], output: node });
      } else if (inserted.has(node)) {
        report({ code: 'insert-required-content', inputs: [], output: node });
      }
    }
  }

  return {
    built: built.map((node) => ({
      index: completed.indexOf(node),
      node,
      slot: getDefined(builtSlots.get(node)),
    })),
    children: completed,
  };
};
