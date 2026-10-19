import {
  type Descendant,
  type Element,
  ElementApi,
  type Node,
  TextApi,
} from '../interfaces';
import type { AnyEditor as Editor } from '../interfaces/editor';
import { failInvariant } from '../internal/fail-invariant';
import { inheritNodeKey } from '../utils/node-keys';
import type { NodeList } from './change/document-index';
import type { CompiledSchemaContentProgram } from './schema-compiler';
import type { RepresentationRepairSink } from './slice-fit/fit-report';
import { textPropertiesEqual } from './value-codec';

type Text = Extract<Descendant, { text: string }>;
type InlineSchema = Readonly<{ isInline: (node: Node) => boolean }>;

export type ContentKind = 'block' | 'inline' | 'mixed';

/**
 * The schema a completion builds through, already bound to the completed
 * element's site: `create` builds an element there in its canonical empty
 * form, and `fitsPrefix` reads a child against one prefix slot there.
 */
export type ContentCompletionSchema = InlineSchema &
  Readonly<{
    create: (
      type: string,
      properties: Readonly<Record<string, unknown>> | undefined
    ) => Element;
    fitsPrefix: (child: Descendant, slot: number) => boolean;
  }>;

export type ContentCompletion = Readonly<{
  built: ReadonlyArray<
    Readonly<{
      index: number;
      node: Element;
      slot: number | null;
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

const mergeEqualTexts = (
  children: readonly Descendant[],
  {
    editor,
    preserveInlineSpacersAdjacentTo,
    report,
    schema,
    siblingAfter: after,
    siblingBefore: before,
  }: Readonly<{
    editor?: Editor;
    preserveInlineSpacersAdjacentTo?: ReadonlySet<Descendant>;
    report?: RepresentationRepairSink;
    schema: InlineSchema;
    siblingAfter?: Descendant;
    siblingBefore?: Descendant;
  }>
) => {
  const protectedSpacer = (text: Text, neighbour: Descendant | undefined) =>
    text.text === '' &&
    neighbour !== undefined &&
    isInlineNode(schema, neighbour) &&
    preserveInlineSpacersAdjacentTo?.has(neighbour) === true;
  const merged: Descendant[] = [];
  const merger = runMerger(editor, report);

  for (const [index, child] of children.entries()) {
    const previous = merged.at(-1);

    if (
      TextApi.isText(previous) &&
      TextApi.isText(child) &&
      !protectedSpacer(previous, merged.at(-2) ?? before) &&
      !protectedSpacer(child, children[index + 1] ?? after) &&
      textPropertiesEqual(previous, child)
    ) {
      merged[merged.length - 1] = merger.merge(previous, child);
    } else {
      merged.push(child);
    }
  }
  merger.flush();

  return merged;
};

export const admitsEmptyText = (content: CompiledSchemaContentProgram) =>
  content.allowsText && (content.max === null || content.max > 0);

export const canonicalizeInlineChildren = (
  children: readonly Descendant[],
  {
    dropsFromEmptyText,
    editor,
    fillsEmpty = true,
    flattenInto,
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
  const content = flattened.filter((child, index) => {
    if (!TextApi.isText(child) || child.text !== '') return true;
    if (flattened.length === 1 && before === undefined && after === undefined) {
      return true;
    }

    const keep =
      isInlineNode(schema, flattened[index - 1] ?? before) ||
      isInlineNode(schema, flattened[index + 1] ?? after);

    if (!keep) report?.({ code: 'remove-empty-text', inputs: [child] });

    return keep;
  });
  const canonical: Descendant[] = [];
  const merger = runMerger(editor, report);
  const insert = (code: 'insert-empty-text' | 'insert-inline-spacer') => {
    const text = { text: '' };

    canonical.push(text);
    report?.({ code, inputs: [], output: text });
  };

  for (const [index, child] of content.entries()) {
    if (isInlineNode(schema, child)) {
      if (!TextApi.isText(canonical.at(-1) ?? before)) {
        insert('insert-inline-spacer');
      }
      canonical.push(child);
      continue;
    }
    if (!TextApi.isText(child)) continue;

    const previous = canonical.at(-1);
    const previousInline = canonical.at(-2) ?? before;
    const nextInline = content[index + 1] ?? after;
    const preservePreviousInlineSpacer =
      previousInline !== undefined &&
      preserveInlineSpacersAdjacentTo?.has(previousInline) === true;
    const preserveChildInlineSpacer =
      nextInline !== undefined &&
      preserveInlineSpacersAdjacentTo?.has(nextInline) === true;
    const previousIsInlineSpacer =
      TextApi.isText(previous) &&
      previous.text === '' &&
      isInlineNode(schema, previousInline) &&
      preservePreviousInlineSpacer;
    const childIsInlineSpacer =
      child.text === '' &&
      isInlineNode(schema, nextInline) &&
      preserveChildInlineSpacer;

    if (
      TextApi.isText(previous) &&
      !previousIsInlineSpacer &&
      !childIsInlineSpacer &&
      textPropertiesEqual(previous, child)
    ) {
      canonical[canonical.length - 1] = merger.merge(previous, child);
    } else {
      canonical.push(child);
    }
  }
  merger.flush();

  if (isInlineNode(schema, canonical.at(-1)) && !TextApi.isText(after)) {
    insert('insert-inline-spacer');
  }
  if (
    fillsEmpty &&
    canonical.length === 0 &&
    before === undefined &&
    after === undefined
  ) {
    insert('insert-empty-text');
  }
  let stripped = false;

  if (dropsFromEmptyText) {
    const lone =
      canonical.length === 1 && before === undefined && after === undefined;

    for (const [index, child] of canonical.entries()) {
      if (
        TextApi.isText(child) &&
        child.text === '' &&
        (lone ||
          isInlineNode(schema, canonical[index - 1] ?? before) ||
          isInlineNode(schema, canonical[index + 1] ?? after))
      ) {
        const plain = plainEmptyText(child, dropsFromEmptyText, editor);

        if (plain === child) continue;
        stripped = true;
        canonical[index] = plain;
        report?.({
          code: 'omit-empty-text-property',
          inputs: [child],
          output: plain,
          properties: Object.keys(child).filter(
            (key) => !Object.hasOwn(plain, key)
          ),
        });
      }
    }
  }

  // A spacer that lost its formatting can now equal the text beside it.
  const result = stripped
    ? mergeEqualTexts(canonical, {
        editor,
        preserveInlineSpacersAdjacentTo,
        report,
        schema,
        siblingAfter: after,
        siblingBefore: before,
      })
    : canonical;

  return sameChildren(result, children) ? children : result;
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

const isLoneEmptyText = (run: readonly Descendant[]) =>
  run.length === 1 && TextApi.isText(run[0]) && run[0].text === '';

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
  const runOptions = { ...options, fillsEmpty: false };
  let run: Descendant[] = [];
  const flush = () => {
    if (run.length > 0) {
      const runCanonical = canonicalizeInlineChildren(run, runOptions);

      if (isLoneEmptyText(runCanonical)) {
        options.report?.({ code: 'remove-empty-text', inputs: runCanonical });
      } else {
        canonical.push(...runCanonical);
      }
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

type CompletionInput = Readonly<{
  children: NodeList<Descendant>;
  content: CompiledSchemaContentProgram;
  dropsFromEmptyText?: (key: string, value: unknown) => boolean;
  editing?: Readonly<{
    vacated: (slot: number, candidate: Descendant) => boolean;
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
  const builtSlots = new Map<Element, number>();
  const inserted = new Set<Descendant>();
  let consumed = 0;

  for (const [slot, prefix] of (content.prefix ?? []).entries()) {
    const candidate = children.at(consumed);
    const displaced =
      candidate !== undefined && editing?.vacated(slot, candidate) === true;

    if (candidate && !displaced && schema.fitsPrefix(candidate, slot)) {
      required.push(candidate);
      consumed += 1;
      continue;
    }
    if (candidate && !displaced && editing) return null;

    const node = schema.create(prefix.type, prefix.properties);

    builtSlots.set(node, slot);
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

/**
 * Required prefix slots come first; a slot the caller's change
 * vacated takes a fresh element and its candidate moves past it. After the
 * prefix, an empty stretch that admits a text holds one empty text, which
 * counts toward the minimum, so a default element is built only past it.
 * Defaults are added one canonical unit at a time until the minimum holds.
 * Children that are already complete come back as the same array.
 */
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
        : schema.create(plan.type, plan.properties);
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
    if (ElementApi.isElement(unit)) built.push(unit);
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
      slot: builtSlots.get(node) ?? null,
    })),
    children: completed,
  };
};
