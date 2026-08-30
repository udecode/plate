import {
  type ContentSlice,
  type Descendant,
  type Element,
  ElementApi,
  type Path,
  type Point,
  TextApi,
} from '../interfaces';
import type { AnyEditor as Editor } from '../interfaces/editor';
import { getDefined } from '../internal/get-defined';
import { inheritNodeKey } from '../utils/node-keys';
import {
  createInternalDocumentChange,
  type DocumentChange,
  getInternalDocumentChangeEntries,
  getInternalDocumentRootChange,
  mapInternalDocumentChangePosition,
} from './change/document-change';
import { DocumentIndex } from './change/document-index';
import { RootChange, reconcileChildrenStep } from './change/root-change';
import type { JsonEditorValue, PreparedTokenSlice } from './change/tokens';
import {
  ContentSlice as ContentSliceValue,
  getContentSliceCanonicalAuthority,
} from './content-slice';
import { getEditorSchema } from './editor-runtime';
import { profileCoreDuration } from './profiling';
import { areEditorJsonValuesEqual } from './value-codec';

type RepresentationSchema = ReturnType<typeof getEditorSchema>;

const isInline = (
  editor: Editor,
  node: Descendant,
  schema: RepresentationSchema = getEditorSchema(editor)
) => ElementApi.isElement(node) && schema.isInline(node);

const collectInlineContent = (
  editor: Editor,
  node: Descendant,
  schema: RepresentationSchema = getEditorSchema(editor)
): Descendant[] => {
  if (TextApi.isText(node) || isInline(editor, node, schema)) return [node];

  return (node.children as Descendant[]).flatMap((child) =>
    collectInlineContent(editor, child, schema)
  );
};

const mergeText = (
  editor: Editor,
  left: Extract<Descendant, { text: string }>,
  right: Extract<Descendant, { text: string }>
) => {
  const merged = { ...left, text: left.text + right.text };

  inheritNodeKey(merged, left, editor);

  return merged;
};

const textPropertiesEqual = (
  left: Extract<Descendant, { text: string }>,
  right: Extract<Descendant, { text: string }>
) => {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);

  keys.delete('text');

  return [...keys].every((key) =>
    areEditorJsonValuesEqual(left[key], right[key])
  );
};

type CanonicalizeOptions = Readonly<{
  preserveInlineSpacersAdjacentTo?: ReadonlySet<Descendant>;
  schema?: RepresentationSchema;
}>;

const hasInlineContent = (
  editor: Editor,
  parent: Editor | Element,
  children: readonly Descendant[],
  schema: RepresentationSchema = getEditorSchema(editor)
) => {
  if (!ElementApi.isElement(parent)) return false;

  const first = children[0];

  return (
    schema.isInline(parent) ||
    TextApi.isText(first) ||
    (first !== undefined && isInline(editor, first, schema))
  );
};

const canonicalizeInlineChildren = (
  editor: Editor,
  children: readonly Descendant[],
  {
    after,
    before,
    preserveInlineSpacersAdjacentTo,
    schema = getEditorSchema(editor),
  }: Readonly<{
    after?: Descendant;
    before?: Descendant;
  }> &
    CanonicalizeOptions = {}
) => {
  const flattened = children.flatMap((child) =>
    TextApi.isText(child) || isInline(editor, child, schema)
      ? [child]
      : collectInlineContent(editor, child, schema)
  );
  const content = flattened.filter((child, index) => {
    if (!TextApi.isText(child) || child.text !== '') return true;
    if (flattened.length === 1 && before === undefined && after === undefined) {
      return true;
    }

    return (
      isInline(editor, flattened[index - 1] ?? before, schema) ||
      isInline(editor, flattened[index + 1] ?? after, schema)
    );
  });
  const canonical: Descendant[] = [];

  for (const [index, child] of content.entries()) {
    if (isInline(editor, child, schema)) {
      if (!TextApi.isText(canonical.at(-1) ?? before)) {
        canonical.push({ text: '' });
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
      isInline(editor, previousInline as Descendant, schema) &&
      preservePreviousInlineSpacer;
    const childIsInlineSpacer =
      child.text === '' &&
      isInline(editor, nextInline, schema) &&
      preserveChildInlineSpacer;

    if (
      TextApi.isText(previous) &&
      !previousIsInlineSpacer &&
      !childIsInlineSpacer &&
      textPropertiesEqual(previous, child)
    ) {
      canonical[canonical.length - 1] = mergeText(editor, previous, child);
    } else {
      canonical.push(child);
    }
  }

  if (
    isInline(editor, canonical.at(-1) as Descendant, schema) &&
    !TextApi.isText(after)
  ) {
    canonical.push({ text: '' });
  }
  if (canonical.length === 0 && before === undefined && after === undefined) {
    canonical.push({ text: '' });
  }
  const result = canonical;

  return result.length === children.length &&
    result.every((child, index) => child === children[index])
    ? children
    : result;
};

const canonicalizeDirectChildren = (
  editor: Editor,
  parent: Editor | Element,
  source: readonly Descendant[],
  root = 'main',
  options: CanonicalizeOptions = {}
) => {
  const schema = options.schema ?? getEditorSchema(editor);
  const contentSpec = ElementApi.isElement(parent)
    ? schema.getElementContent(parent.type)
    : schema.getRootContent(root);
  let children =
    ElementApi.isElement(parent) || contentSpec?.allowsText
      ? source
      : source.filter((child): child is Element => ElementApi.isElement(child));

  if (contentSpec) {
    while (children.length < contentSpec.min) {
      if (children === source) children = [...source];

      if (contentSpec.defaultPlan?.kind === 'text') {
        (children as Descendant[]).push({ text: '' });
      } else if (contentSpec.defaultPlan?.kind === 'element') {
        (children as Descendant[]).push(
          schema.create(contentSpec.defaultPlan.type)
        );
      } else {
        const owner = ElementApi.isElement(parent)
          ? `element "${parent.type}"`
          : `root "${root}"`;

        throw new Error(`Editor ${owner} requires defaultable content.`);
      }
    }
  }

  if (hasInlineContent(editor, parent, children, schema)) {
    return canonicalizeInlineChildren(editor, children, options);
  }

  if (contentSpec) return children;

  const blocks = children.filter(
    (child) => ElementApi.isElement(child) && !isInline(editor, child)
  );

  if (ElementApi.isElement(parent) && blocks.length === 0) {
    return [{ text: '' }];
  }

  return blocks.length === children.length ? children : blocks;
};

const canonicalizeNode = (
  editor: Editor,
  node: Descendant,
  options: CanonicalizeOptions = {}
): Descendant => {
  if (TextApi.isText(node)) return node;

  const source = node.children;
  const nested = source.map((child) =>
    canonicalizeNode(editor, child, options)
  );
  const unchangedNested = nested.every(
    (child, index) => child === source[index]
  );
  const candidate = unchangedNested
    ? node
    : ({ ...node, children: nested } as Element);
  const children = canonicalizeDirectChildren(
    editor,
    candidate,
    unchangedNested ? source : nested,
    'main',
    options
  );

  if (candidate === node && children === source) return node;

  const canonical =
    children === candidate.children
      ? candidate
      : ({ ...candidate, children } as Element);

  inheritNodeKey(canonical, node, editor);

  return canonical;
};

/**
 * Canonicalize detached children against one concrete parent.
 *
 * @internal
 */
export const canonicalizeElementChildren = (
  editor: Editor,
  parent: Element,
  current: readonly Descendant[]
) => {
  const nested = current.map((child) => canonicalizeNode(editor, child));
  const candidate = {
    ...parent,
    children: nested,
  } as Element;
  const canonical = canonicalizeDirectChildren(
    editor,
    candidate,
    candidate.children
  );

  return canonical.length === current.length &&
    canonical.every((child, index) => child === current[index])
    ? current
    : canonical;
};

/** Full-root canonicalization for explicit snapshot replacement/maintenance. */
export const canonicalizeRootChildren = (
  editor: Editor,
  current: readonly Descendant[],
  topLevelIndexes: ReadonlySet<number> | null,
  root = 'main',
  options: CanonicalizeOptions = {}
) => {
  const nested = current.map((child, index) =>
    topLevelIndexes === null || topLevelIndexes.has(index)
      ? canonicalizeNode(editor, child, options)
      : child
  );

  const canonical = canonicalizeDirectChildren(
    editor,
    editor,
    nested,
    root,
    options
  );

  return canonical.length === current.length &&
    canonical.every((child, index) => child === current[index])
    ? current
    : canonical;
};

const getRootChildren = (value: JsonEditorValue, root: string) =>
  (root === 'main'
    ? value.children
    : (value.roots?.[root] ?? [])) as readonly Descendant[];

const getDescendant = (
  children: readonly Descendant[],
  path: readonly number[]
) => {
  let descendants = children;
  let node: Descendant | undefined;

  for (const index of path) {
    node = descendants[index];
    if (!node) return undefined;
    descendants = ElementApi.isElement(node) ? node.children : [];
  }

  return node;
};

/**
 * Resolve inline nodes whose adjacent spacers carry selection.
 *
 * @internal
 */
export const getProtectedInlineSpacerEntries = (
  editor: Editor,
  children: readonly Descendant[],
  points: readonly Point[],
  schema: RepresentationSchema = getEditorSchema(editor)
): ReadonlyArray<Readonly<{ node: Descendant; path: Path }>> => {
  const entries = new Map<Descendant, Path>();

  for (const point of points) {
    for (let depth = point.path.length - 1; depth > 0; depth--) {
      const node = getDescendant(children, point.path.slice(0, depth));

      if (node && ElementApi.isElement(node) && schema.isInline(node)) {
        entries.set(node, point.path.slice(0, depth));
        break;
      }
    }
  }

  return [...entries].map(([node, path]) => Object.freeze({ node, path }));
};

const carryProtectedInlineNodes = (
  source: readonly Descendant[],
  canonical: readonly Descendant[],
  protectedNodes?: ReadonlySet<Descendant>
) => {
  if (!protectedNodes || protectedNodes.size === 0) return protectedNodes;
  const result = new Set(protectedNodes);
  const visit = (
    sourceChildren: readonly Descendant[],
    canonicalChildren: readonly Descendant[]
  ) => {
    sourceChildren.forEach((node, index) => {
      const next = canonicalChildren[index];

      if (!next) return;
      if (protectedNodes.has(node)) result.add(next);
      if (ElementApi.isElement(node) && ElementApi.isElement(next)) {
        visit(node.children, next.children);
      }
    });
  };

  visit(source, canonical);

  return result;
};

const getTextOffsetWithin = (
  editor: Editor,
  children: readonly Descendant[],
  ancestorPath: readonly number[],
  point: Point
): number | null => {
  const ancestor = getDescendant(children, ancestorPath);

  if (!ancestor || !ElementApi.isElement(ancestor)) return null;

  let offset = 0;
  let result: number | null = null;
  const visit = (
    nodes: readonly Descendant[],
    path: readonly number[]
  ): boolean => {
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];
      const nodePath = [...path, index];

      if (TextApi.isText(node)) {
        if (
          nodePath.length === point.path.length &&
          nodePath.every((part, depth) => part === point.path[depth])
        ) {
          result = offset + point.offset;

          return true;
        }

        offset += node.text.length;
        continue;
      }

      if (getEditorSchema(editor).isVoid(node)) continue;
      if (visit(node.children, nodePath)) return true;
    }

    return false;
  };

  visit(ancestor.children, ancestorPath);

  return result;
};

const getPointAtTextOffset = (
  editor: Editor,
  children: readonly Descendant[],
  ancestorPath: readonly number[],
  targetOffset: number,
  association: -1 | 1
): Point | null => {
  const ancestor = getDescendant(children, ancestorPath);

  if (!ancestor || !ElementApi.isElement(ancestor)) return null;

  let offset = 0;
  let previous: Point | null = null;
  const visit = (
    nodes: readonly Descendant[],
    path: readonly number[]
  ): Point | null => {
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];
      const nodePath = [...path, index];

      if (TextApi.isText(node)) {
        const end = offset + node.text.length;

        if (targetOffset < end || (targetOffset === end && association < 0)) {
          return {
            offset: Math.max(0, targetOffset - offset),
            path: nodePath,
          };
        }

        previous = { offset: node.text.length, path: nodePath };
        offset = end;
        continue;
      }

      if (getEditorSchema(editor).isVoid(node)) continue;
      const nested = visit(node.children, nodePath);

      if (nested) return nested;
    }

    return null;
  };

  return visit(ancestor.children, ancestorPath) ?? previous;
};

/**
 * Preserve one logical text point through canonical representation.
 *
 * @internal
 */
export const mapCanonicalRepresentationPoint = (
  editor: Editor,
  beforeDocument: DocumentIndex,
  afterDocument: DocumentIndex,
  change: DocumentChange,
  root: string,
  point: Point,
  association: -1 | 1
): Point | null => {
  const beforeChildren = beforeDocument.value as readonly Descendant[];
  const afterChildren = afterDocument.value as readonly Descendant[];

  for (let depth = point.path.length - 1; depth > 0; depth--) {
    const ancestorPath = point.path.slice(0, depth);
    const ancestor = getDescendant(beforeChildren, ancestorPath);

    if (
      !ancestor ||
      !ElementApi.isElement(ancestor) ||
      getEditorSchema(editor).isInline(ancestor)
    ) {
      continue;
    }

    const textOffset = getTextOffsetWithin(
      editor,
      beforeChildren,
      ancestorPath,
      point
    );

    if (textOffset === null) continue;

    const ancestorFrom = beforeDocument.nodeRange(ancestorPath).from;
    const mappedFrom = mapInternalDocumentChangePosition(
      change,
      root,
      ancestorFrom,
      1
    );
    const mappedAncestor =
      mappedFrom === null ? null : afterDocument.nodeStartingAt(mappedFrom);

    if (!mappedAncestor || mappedAncestor.kind !== 'element') continue;

    const mapped = getPointAtTextOffset(
      editor,
      afterChildren,
      mappedAncestor.path,
      textOffset,
      association
    );

    if (mapped) return mapped;
  }

  const position = beforeDocument.positionAt(point);
  const mapped = mapInternalDocumentChangePosition(
    change,
    root,
    position,
    association
  );

  if (mapped === null) return null;

  const result =
    afterDocument.pointAt(mapped, association) ??
    afterDocument.pointAt(mapped, association === -1 ? 1 : -1);

  return result ? { offset: result.offset, path: [...result.path] } : null;
};

const comparePathsDeepestFirst = (
  left: readonly number[],
  right: readonly number[]
) => {
  if (left.length !== right.length) return right.length - left.length;

  for (let index = 0; index < left.length; index++) {
    if (left[index] !== right[index]) return right[index] - left[index];
  }

  return 0;
};

type ChildWindow = {
  from: number;
  to: number;
};

type CanonicalRootDraft = {
  change: RootChange;
  document: DocumentIndex;
};

declare const CANONICAL_FIT_PREPARATION: unique symbol;

/**
 * Opaque proof that closed slice interiors match one schema revision.
 *
 * @internal
 */
export type CanonicalFitPreparation = Readonly<{
  [CANONICAL_FIT_PREPARATION]: true;
}>;

type CanonicalFitPreparationDescriptor = Readonly<{
  currentSchema: () => object | null;
  forceRoots?: ReadonlySet<string>;
  insert?: PreparedTokenSlice;
  protectedInlineSpacerPaths?: ReadonlyMap<string, readonly Path[]>;
  schema: object | null;
  trustedNodes: WeakSet<object>;
}>;

const CANONICAL_FIT_PREPARATIONS = new WeakMap<
  object,
  CanonicalFitPreparationDescriptor
>();

/**
 * Canonicalize and brand only fully closed slice subtrees.
 *
 * @internal
 */
export const prepareCanonicalFitSlice = (
  editor: Editor,
  schema: object | null,
  slice: ContentSlice,
  currentSchema: () => object | null,
  representationSchema: RepresentationSchema = getEditorSchema(editor)
) => {
  if (getContentSliceCanonicalAuthority(slice) === representationSchema) {
    const preparation = Object.freeze({}) as CanonicalFitPreparation;

    CANONICAL_FIT_PREPARATIONS.set(preparation, {
      currentSchema,
      schema,
      trustedNodes: new WeakSet(slice.content),
    });

    return Object.freeze({ preparation, slice });
  }

  const trustedPaths: number[][] = [];
  const prepareChildren = (
    children: readonly Descendant[],
    openStart: number,
    openEnd: number,
    parentPath: readonly number[]
  ): readonly Descendant[] => {
    const prepared = children.map((child, index) => {
      const path = [...parentPath, index];
      const opensStart = openStart > 0 && index === 0;
      const opensEnd = openEnd > 0 && index === children.length - 1;

      if (!opensStart && !opensEnd) {
        trustedPaths.push(path);

        return canonicalizeNode(editor, child, {
          schema: representationSchema,
        });
      }
      if (!ElementApi.isElement(child)) return child;

      const nested = prepareChildren(
        child.children,
        opensStart ? openStart - 1 : 0,
        opensEnd ? openEnd - 1 : 0,
        path
      );

      return nested === child.children ||
        (nested.length === child.children.length &&
          nested.every(
            (node, childIndex) => node === child.children[childIndex]
          ))
        ? child
        : { ...child, children: nested };
    });

    return prepared.every((child, index) => child === children[index])
      ? children
      : prepared;
  };
  const content = prepareChildren(
    slice.content,
    slice.openStart,
    slice.openEnd,
    []
  );
  const preparedSlice =
    content === slice.content
      ? slice
      : ContentSliceValue.withContent(slice, content, { open: 'preserve' });
  const trustedNodes = new WeakSet<object>();

  for (const path of trustedPaths) {
    const node = getDescendant(preparedSlice.content, path);

    if (node) trustedNodes.add(node);
  }

  const preparation = Object.freeze({}) as CanonicalFitPreparation;

  CANONICAL_FIT_PREPARATIONS.set(preparation, {
    currentSchema,
    schema,
    trustedNodes,
  });

  return Object.freeze({ preparation, slice: preparedSlice });
};

/**
 * Force canonical construction of one externally fitted root.
 *
 * @internal
 */
export const prepareCanonicalRootFit = (
  schema: object | null,
  currentSchema: () => object | null,
  root: string,
  protectedInlineSpacerPaths?: readonly Path[]
): CanonicalFitPreparation => {
  const preparation = Object.freeze({}) as CanonicalFitPreparation;

  CANONICAL_FIT_PREPARATIONS.set(preparation, {
    currentSchema,
    forceRoots: new Set([root]),
    ...(protectedInlineSpacerPaths && protectedInlineSpacerPaths.length > 0
      ? {
          protectedInlineSpacerPaths: new Map([
            [root, protectedInlineSpacerPaths],
          ]),
        }
      : {}),
    schema,
    trustedNodes: new WeakSet<object>(),
  });

  return preparation;
};

/**
 * Bind a canonical slice proof to the exact lowerer insertion.
 *
 * @internal
 */
export const bindCanonicalFitPreparation = (
  preparation: CanonicalFitPreparation,
  insert: PreparedTokenSlice
): CanonicalFitPreparation => {
  const source = CANONICAL_FIT_PREPARATIONS.get(preparation);

  if (!source) throw new Error('Unknown canonical fit preparation.');

  const bound = Object.freeze({}) as CanonicalFitPreparation;

  CANONICAL_FIT_PREPARATIONS.set(bound, { ...source, insert });

  return bound;
};

const addChildWindow = (
  windows: Map<string, { path: readonly number[]; window: ChildWindow }>,
  path: readonly number[],
  from: number,
  to: number
) => {
  const key = path.join('.');
  const current = windows.get(key);

  if (current) {
    current.window.from = Math.min(current.window.from, from);
    current.window.to = Math.max(current.window.to, to);
  } else {
    windows.set(key, {
      path: Object.freeze([...path]),
      window: { from, to },
    });
  }
};

const replaceCanonicalChildWindow = (
  draft: CanonicalRootDraft,
  editor: Editor,
  schema: RepresentationSchema,
  root: string,
  rootContent: ReturnType<RepresentationSchema['getRootContent']>,
  path: readonly number[],
  window: ChildWindow,
  options: CanonicalizeOptions = {}
) => {
  const rootChildren = draft.document.value as readonly Descendant[];
  const node = path.length === 0 ? editor : getDescendant(rootChildren, path);

  if (!node || TextApi.isText(node as Descendant)) return;

  const source = path.length === 0 ? rootChildren : (node as Element).children;
  const parent = ElementApi.isElement(node) ? node : editor;
  const contentSpec = ElementApi.isElement(parent)
    ? schema.getElementContent(parent.type)
    : rootContent;
  const ancestors: Element[] = [];

  for (let depth = path.length; depth > 0; depth--) {
    const ancestor = getDescendant(rootChildren, path.slice(0, depth));

    if (ancestor && ElementApi.isElement(ancestor)) ancestors.push(ancestor);
  }
  const propertyNodes = new Map<number, Descendant>();
  const propertyNodeAt = (index: number) => {
    const cached = propertyNodes.get(index);

    if (cached) return cached;
    const canonical = schema.canonicalizeChildren(
      [source[index]],
      root,
      ancestors,
      false
    )[0];

    propertyNodes.set(index, canonical);

    return canonical;
  };
  const inlineContent =
    ElementApi.isElement(parent) &&
    hasInlineContent(editor, parent, source, schema);
  // The changed range plus two unchanged children contains each radius-one
  // representation dependency. Edge context below prevents the local window
  // from behaving like the start or end of its parent.
  let from = Math.max(0, Math.min(source.length, window.from) - 2);
  let to = Math.min(source.length, Math.max(window.to, window.from) + 2);

  if (inlineContent) {
    while (from > 0) {
      const left = propertyNodeAt(from - 1);
      const right = propertyNodeAt(from);

      if (
        !TextApi.isText(left) ||
        !TextApi.isText(right) ||
        !textPropertiesEqual(left, right)
      ) {
        break;
      }
      from -= 1;
    }
    while (to < source.length) {
      const left = propertyNodeAt(to - 1);
      const right = propertyNodeAt(to);

      if (
        !TextApi.isText(left) ||
        !TextApi.isText(right) ||
        !textPropertiesEqual(left, right)
      ) {
        break;
      }
      to += 1;
    }
  }

  const selected = source.slice(from, to);
  const propertyCanonical = schema.canonicalizeChildren(
    selected,
    root,
    ancestors,
    false
  );
  const preserveInlineSpacersAdjacentTo = carryProtectedInlineNodes(
    selected,
    propertyCanonical,
    options.preserveInlineSpacersAdjacentTo
  );
  const representationCanonical = ElementApi.isElement(parent)
    ? inlineContent
      ? canonicalizeInlineChildren(editor, propertyCanonical, {
          ...(from > 0 ? { before: propertyNodeAt(from - 1) } : {}),
          ...(to < source.length ? { after: propertyNodeAt(to) } : {}),
          ...options,
          preserveInlineSpacersAdjacentTo,
          schema,
        })
      : contentSpec
        ? propertyCanonical
        : canonicalizeDirectChildren(
            editor,
            parent,
            propertyCanonical,
            'main',
            { schema }
          )
    : contentSpec
      ? propertyCanonical.filter((child): child is Element =>
          ElementApi.isElement(child)
        )
      : canonicalizeDirectChildren(editor, parent, propertyCanonical, root, {
          schema,
        });
  const canonical = schema.canonicalizeChildren(
    representationCanonical,
    root,
    ancestors,
    false
  );

  if (
    canonical.length !== selected.length ||
    canonical.some((child, index) => child !== selected[index])
  ) {
    const step = reconcileChildrenStep(
      draft.document,
      path,
      from,
      selected.length,
      canonical
    );

    draft.change = draft.change.empty
      ? step.change
      : draft.change.compose(step.change);
    draft.document = step.after;
  }

  if (!contentSpec) return;

  const current = (
    path.length === 0
      ? draft.document.value
      : (draft.document.node(path) as Element).children
  ) as readonly Descendant[];
  const minimum = contentSpec.min;

  if (current.length >= minimum) return;

  const defaults: Descendant[] = [];

  while (current.length + defaults.length < minimum) {
    if (contentSpec.defaultPlan?.kind === 'text') {
      defaults.push({ text: '' });
    } else if (contentSpec.defaultPlan?.kind === 'element') {
      defaults.push(schema.create(contentSpec.defaultPlan.type));
    } else {
      throw new Error(
        ElementApi.isElement(node)
          ? `Editor element "${node.type}" requires defaultable content.`
          : `Editor root "${root}" requires defaultable content.`
      );
    }
  }

  const step = reconcileChildrenStep(
    draft.document,
    path,
    current.length,
    0,
    defaults
  );

  draft.change = draft.change.empty
    ? step.change
    : draft.change.compose(step.change);
  draft.document = step.after;
};

/** Build the sparse representation change required by one raw document change. */
export const constructCanonicalDocumentChange = (
  editor: Editor,
  after: JsonEditorValue,
  change: DocumentChange,
  options: Readonly<{
    before?: JsonEditorValue;
    fitPreparation?: object;
    indexedAfter?: ReadonlyMap<string, DocumentIndex>;
    indexedBefore?: ReadonlyMap<string, DocumentIndex>;
    preserveInlineSpacersAdjacentTo?: (
      root: string
    ) => ReadonlySet<Descendant> | undefined;
    schema?: RepresentationSchema;
  }> = {}
): DocumentChange => {
  const schema = options.schema ?? getEditorSchema(editor);
  const changes = new Map<string, RootChange>();
  const fitPreparation = options.fitPreparation
    ? CANONICAL_FIT_PREPARATIONS.get(options.fitPreparation)
    : undefined;
  const preparationIsCurrent =
    !fitPreparation || fitPreparation.currentSchema() === fitPreparation.schema;

  if (fitPreparation?.forceRoots && !preparationIsCurrent) {
    throw new Error('Stale canonical root-fit preparation.');
  }
  const fitChanges = [...getInternalDocumentChangeEntries(change)].map(
    ([, rootChange]) => rootChange
  );
  const trustedFitNodes =
    fitPreparation?.insert &&
    preparationIsCurrent &&
    fitChanges.length === 1 &&
    fitChanges[0].data.some((value) => value === fitPreparation.insert)
      ? fitPreparation.trustedNodes
      : undefined;

  if (trustedFitNodes) {
    profileCoreDuration('representation-fit-proof-hit', () => undefined);
  }
  const protectedInlineSpacersFor = (root: string) => {
    const fromOptions = options.preserveInlineSpacersAdjacentTo?.(root);
    const current = getRootChildren(after, root);
    const fromPreparation = new Set(
      (fitPreparation?.protectedInlineSpacerPaths?.get(root) ?? []).flatMap(
        (path) => {
          const node = getDescendant(current, path);

          return node && ElementApi.isElement(node) && schema.isInline(node)
            ? [node]
            : [];
        }
      )
    );

    if (!fromOptions?.size) {
      return fromPreparation.size > 0 ? fromPreparation : undefined;
    }
    if (fromPreparation.size === 0) return fromOptions;

    return new Set([...fromOptions, ...fromPreparation]);
  };
  const touchedRoots = new Set([
    ...[...getInternalDocumentChangeEntries(change)].map(([root]) => root),
    ...change.createRoots,
    ...(fitPreparation?.forceRoots ?? []),
  ]);

  for (const root of touchedRoots) {
    if (change.deleteRoots.has(root)) continue;

    const current = getRootChildren(after, root);
    const document =
      options.indexedAfter?.get(root) ?? DocumentIndex.fromValue(current);
    const draft: CanonicalRootDraft = {
      change: RootChange.empty(document.length),
      document,
    };
    const rootChange = getInternalDocumentRootChange(change, root);
    const move =
      options.before && rootChange
        ? rootChange.movedNode(
            options.indexedBefore?.get(root) ??
              DocumentIndex.fromValue(getRootChildren(options.before, root))
          )
        : null;
    const movedNode = move ? document.node(move.targetPath) : undefined;
    const moveParent = move?.path.slice(0, -1);
    const targetParent = move?.targetPath.slice(0, -1);
    const localBlockMove =
      move &&
      moveParent &&
      targetParent &&
      moveParent.length === targetParent.length &&
      moveParent.every((part, index) => part === targetParent[index]) &&
      movedNode &&
      ElementApi.isElement(movedNode) &&
      !schema.isInline(movedNode)
        ? [
            {
              path: moveParent,
              window: {
                from: getDefined(move.path.at(-1)),
                to: getDefined(move.path.at(-1)) + 1,
              },
            },
            {
              path: targetParent,
              window: {
                from: getDefined(move.targetPath.at(-1)),
                to: getDefined(move.targetPath.at(-1)) + 1,
              },
            },
          ]
        : null;
    const windows = new Map<
      string,
      { path: readonly number[]; window: ChildWindow }
    >();

    if (fitPreparation?.forceRoots?.has(root)) {
      const propertyCanonical = schema.canonicalizeChildren(
        current,
        root,
        [],
        false
      );
      const preserveInlineSpacersAdjacentTo = carryProtectedInlineNodes(
        current,
        propertyCanonical,
        protectedInlineSpacersFor(root)
      );
      const representationCanonical = canonicalizeRootChildren(
        editor,
        propertyCanonical,
        null,
        root,
        { preserveInlineSpacersAdjacentTo, schema }
      );
      const canonical = schema.canonicalizeChildren(
        representationCanonical,
        root,
        [],
        false
      );

      if (
        canonical.length !== current.length ||
        canonical.some((child, index) => child !== current[index])
      ) {
        const step = reconcileChildrenStep(
          draft.document,
          [],
          0,
          current.length,
          canonical
        );

        draft.change = step.change;
        draft.document = step.after;
      }

      if (!draft.change.empty) changes.set(root, draft.change);
      continue;
    }

    if (localBlockMove) {
      profileCoreDuration('representation-move-locality-hit', () => undefined);
    } else if (rootChange) {
      profileCoreDuration('representation-window-discovery', () => {
        rootChange.iterChangedRanges(
          (_fromBefore, _toBefore, fromAfter, toAfter) => {
            for (const position of [fromAfter, toAfter]) {
              const boundary = document.childBoundaryAt(position);

              if (boundary) {
                addChildWindow(
                  windows,
                  boundary.parentPath,
                  boundary.index,
                  boundary.index
                );
              }
            }

            const touching = document.nodeRangesTouching(fromAfter, toAfter);
            const seenPaths = new Set<string>();

            for (const { path } of touching) {
              const pathId = path.join('.');

              if (seenPaths.has(pathId)) continue;
              seenPaths.add(pathId);

              const index = path.at(-1);

              if (index === undefined) continue;

              addChildWindow(windows, path.slice(0, -1), index, index + 1);

              const node = document.node(path);
              const range = document.nodeRange(path);

              if (trustedFitNodes?.has(node)) continue;

              if (
                ElementApi.isElement(node) &&
                range.from >= fromAfter &&
                range.to <= toAfter
              ) {
                addChildWindow(windows, path, 0, node.children.length);
              }
            }
          }
        );
      });
    }

    const rootSpec = schema.getRootContent(
      root,
      after as import('../interfaces/editor').EditorDocumentValue
    );

    if (rootSpec && current.length < rootSpec.min) {
      addChildWindow(windows, [], current.length, current.length);
    }

    profileCoreDuration('representation-window-apply', () => {
      for (const { path, window } of [
        ...(localBlockMove ?? []),
        ...windows.values(),
      ].sort((left, right) =>
        comparePathsDeepestFirst(left.path, right.path)
      )) {
        replaceCanonicalChildWindow(
          draft,
          editor,
          schema,
          root,
          rootSpec,
          path,
          window,
          {
            preserveInlineSpacersAdjacentTo: protectedInlineSpacersFor(root),
          }
        );
      }
    });

    if (!draft.change.empty) changes.set(root, draft.change);
  }

  return createInternalDocumentChange(changes);
};
