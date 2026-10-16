import {
  type ContentSlice,
  type Descendant,
  type Element,
  ElementApi,
  type Path,
  type Point,
  TextApi,
} from '../interfaces';
import type {
  AnyEditor as Editor,
  EditorDocumentValue,
} from '../interfaces/editor';
import { getDefined } from '../internal/get-defined';
import { inheritNodeKey } from '../utils/node-keys';
import {
  createInternalDocumentChange,
  type DocumentChange,
  getInternalDocumentChangeEntries,
  getInternalDocumentRootChange,
  mapInternalDocumentChangePosition,
  valueRootIndex,
} from './change/document-change';
import { DocumentIndex, type NodeList } from './change/document-index';
import { jsonEqual } from './change/json';
import { RootChange, reconcileChildrenStep } from './change/root-change';
import type { JsonEditorValue, PreparedTokenSlice } from './change/tokens';
import {
  admitsEmptyText,
  canonicalizeContentChildren,
  canonicalizeInlineChildren,
  type ContentCompletion,
  type ContentCompletionSchema,
  completeContent,
  contentKindOf,
  holdsContent,
  mixedContentWindow,
  textPropertiesEqual,
} from './content-completion';
import {
  ContentSlice as ContentSliceValue,
  getContentSliceCanonicalAuthority,
} from './content-slice';
import { getEditorSchema } from './editor-runtime';
import { profileCoreDuration } from './profiling';
import type { CompiledSchemaContentProgram } from './schema-compiler';
import { EditorSchemaValidationError } from './schema-validation';
import type { RepresentationRepairSink } from './slice-fit/fit-report';

type RepresentationSchema = ReturnType<typeof getEditorSchema>;
type RepresentationContext = Editor &
  Partial<Readonly<{ getSchema: () => RepresentationSchema }>>;
const resolveRepresentationSchema = (context: RepresentationContext) =>
  context.getSchema?.() ?? getEditorSchema(context);

const isInline = (
  editor: Editor,
  node: Descendant,
  schema: RepresentationSchema = resolveRepresentationSchema(editor)
) => ElementApi.isElement(node) && schema.isInline(node);

type CanonicalizeOptions = Readonly<{
  /**
   * `identity` vacates a prefix slot whose occupant the change displaced, by
   * node identity against the change's before, as Editing's own pass does.
   * `none` reads the document alone, for a check of an external change.
   */
  displacement?: 'identity' | 'none';
  document?: import('../interfaces/editor').EditorDocumentValue;
  preserveInlineSpacersAdjacentTo?: ReadonlySet<Descendant>;
  report?: RepresentationRepairSink;
  schema?: RepresentationSchema;
}>;

/**
 * `site` is the completed element and its ancestors, nearest first, or empty
 * at a root.
 */
const completionSchemaAt = (
  schema: RepresentationSchema,
  site: readonly Element[],
  root: string
): ContentCompletionSchema => ({
  create: (type, properties) =>
    schema.createAt(type, properties, { ancestors: site, root }),
  fitsPrefix: (child, slot) =>
    schema.canContainAt(site[0] ?? null, child, slot, root),
  isInline: schema.isInline,
});

export const emptyTextDrops = (
  schema: RepresentationSchema,
  at: Readonly<{
    ancestors: readonly Element[];
    parent: Element | undefined;
    root: string;
  }>
) => {
  const { parent } = at;

  if (!parent || schema.isVoid(parent)) return undefined;

  return (key: string, value: unknown) =>
    !schema.emptyTextKeeps(key, value, { ...at, parent });
};

const inlineContentWithoutProgram = (
  editor: Editor,
  parent: Editor | Element,
  children: readonly Descendant[],
  schema: RepresentationSchema = resolveRepresentationSchema(editor)
) => {
  if (!ElementApi.isElement(parent)) return false;

  const first = children[0];

  return (
    schema.isInline(parent) ||
    TextApi.isText(first) ||
    (first !== undefined && isInline(editor, first, schema))
  );
};

const completeAt = (
  schema: RepresentationSchema,
  content: CompiledSchemaContentProgram,
  site: readonly Element[],
  children: readonly Descendant[],
  root: string,
  options: Readonly<{
    dropsFromEmptyText?: (key: string, value: unknown) => boolean;
    editing?: Readonly<{
      vacated: (slot: number, candidate: Descendant) => boolean;
    }>;
    editor?: Editor;
    flattenInto?: Element;
    preserveInlineSpacersAdjacentTo?: ReadonlySet<Descendant>;
    report?: RepresentationRepairSink;
  }>
) =>
  completeContent({
    ...options,
    children:
      site.length > 0
        ? canonicalizeContentChildren(children, content, {
            ...options,
            schema,
          })
        : children,
    content,
    element: site.length > 0,
    schema: completionSchemaAt(schema, site, root),
  });

/**
 * A run of a root's children completed apart from the rest. The head starts
 * the root and fills its prefix slots. `min` is the share of the root's
 * minimum the run fills: the minimum appends at the root's end, so only the
 * run that ends the root fills any, the count the other runs leave.
 *
 * @internal
 */
export type RootPart = Readonly<{ head: boolean; min: number }>;

/**
 * Canonical children at their element's site, as the canonical pass would
 * give them, and each element completion built. `sources` holds, at each
 * index of `children`, the node before the canonical pass, so a given child
 * the pass rewrote can still be traced. `site` is the element and its
 * ancestors, nearest first, or empty at a root; `vacated` names the prefix
 * slots whose occupant was displaced.
 *
 * @internal
 */
export const completeChildrenAt = (
  editor: Editor,
  site: readonly Element[],
  children: readonly Descendant[],
  root: string,
  vacated?: (slot: number, candidate: Descendant) => boolean,
  part?: RootPart
): ContentCompletion & Readonly<{ sources: readonly Descendant[] }> => {
  const completion = completeDirectChildren(
    editor,
    site[0] ?? editor,
    children,
    root,
    {},
    site.slice(1),
    vacated,
    site.length === 0 ? part : undefined
  );
  // As the canonical pass does after completion, so an empty text it builds
  // takes the properties its site declares. The pass maps child for child.
  const canonical = resolveRepresentationSchema(editor).canonicalizeChildren(
    completion.children,
    root,
    site,
    false
  );

  return {
    built: completion.built.map((item) => ({
      ...item,
      node: canonical[item.index] as Element,
    })),
    children: canonical,
    sources: completion.children,
  };
};

const partOf = (
  content: CompiledSchemaContentProgram | null | undefined,
  part: RootPart | undefined
) => {
  if (!content || !part) return content;

  const { prefix, ...rest } = content;

  return { ...rest, min: part.min, ...(part.head && prefix ? { prefix } : {}) };
};

const canonicalizeDirectChildren = (
  editor: Editor,
  parent: Editor | Element,
  source: readonly Descendant[],
  root: string,
  options: CanonicalizeOptions = {},
  ancestors: readonly Element[] = []
) =>
  completeDirectChildren(editor, parent, source, root, options, ancestors)
    .children;

const completeDirectChildren = (
  editor: Editor,
  parent: Editor | Element,
  source: readonly Descendant[],
  root: string,
  options: CanonicalizeOptions,
  ancestors: readonly Element[],
  vacated?: (slot: number, candidate: Descendant) => boolean,
  part?: RootPart
): ContentCompletion => {
  const schema = options.schema ?? resolveRepresentationSchema(editor);
  const element = ElementApi.isElement(parent);
  const contentSpec = element
    ? schema.getElementContent(parent.type)
    : partOf(schema.getRootContent(root, options.document), part);
  const { report } = options;
  const children =
    element || contentSpec?.allowsText
      ? source
      : source.filter((child): child is Element => {
          if (ElementApi.isElement(child)) return true;
          report?.({
            code: 'remove-noncanonical-child',
            impact: 'lossy',
            inputs: [child],
          });

          return false;
        });
  const runOptions = {
    dropsFromEmptyText: emptyTextDrops(schema, {
      ancestors,
      parent: element ? parent : undefined,
      root,
    }),
    editor,
    ...(element ? { flattenInto: parent } : {}),
    preserveInlineSpacersAdjacentTo: options.preserveInlineSpacersAdjacentTo,
    report,
    schema,
  };

  if (contentSpec) {
    return completeAt(
      schema,
      contentSpec,
      element ? [parent, ...ancestors] : [],
      children,
      root,
      { ...runOptions, ...(vacated ? { editing: { vacated } } : {}) }
    );
  }

  if (inlineContentWithoutProgram(editor, parent, children, schema)) {
    return {
      built: [],
      children: canonicalizeInlineChildren(children, runOptions),
    };
  }

  const blocks = children.filter((child) => {
    if (ElementApi.isElement(child) && !isInline(editor, child)) return true;
    report?.({
      code: 'remove-noncanonical-child',
      impact: 'lossy',
      inputs: [child],
    });

    return false;
  });

  if (element && blocks.length === 0) {
    const emptyText = { text: '' };

    report?.({ code: 'insert-empty-text', inputs: [], output: emptyText });

    return { built: [], children: [emptyText] };
  }

  return {
    built: [],
    children: blocks.length === children.length ? children : blocks,
  };
};

const canonicalizeNode = (
  editor: Editor,
  node: Descendant,
  root: string,
  options: CanonicalizeOptions = {},
  ancestors: readonly Element[] = []
): Descendant => {
  if (TextApi.isText(node)) return node;

  const source = node.children;
  const site = [node, ...ancestors];
  const nested = source.map((child) =>
    canonicalizeNode(editor, child, root, options, site)
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
    root,
    options,
    ancestors
  );

  if (candidate === node && children === source) return node;

  const canonical =
    children === candidate.children
      ? candidate
      : ({ ...candidate, children } as Element);

  inheritNodeKey(canonical, node, editor);
  options.report?.({
    from: candidate === node ? [node] : [node, candidate],
    rebuilt: canonical,
  });

  return canonical;
};

/**
 * Fits one imported top-level block as fitting the whole document would:
 * `fitRootChildren`'s pass, then its element's content grammar. The root is
 * never completed, so the caller checks where the block sits. Throws when the
 * content cannot fit.
 *
 * @internal
 */
export const fitImportedBlock = (
  editor: Editor,
  node: Descendant,
  root: string
): Descendant => {
  const schema = resolveRepresentationSchema(editor);
  const [properties] = schema.canonicalizeChildren([node], root, [], false);
  const [canonical] = schema.canonicalizeChildren(
    [canonicalizeNode(editor, getDefined(properties), root, { schema })],
    root,
    [],
    false
  );
  const block = getDefined(canonical);

  if (!ElementApi.isElement(block) || !schema.getElementContent(block.type)) {
    return block;
  }

  const children = schema.fitContent(ContentSliceValue.closed(block.children), {
    parent: block,
    root,
  });

  if (children === null) {
    throw new EditorSchemaValidationError(
      `Editor element "${block.type}" cannot fit its imported content.`
    );
  }

  return jsonEqual(children, block.children) ? block : { ...block, children };
};

/** Full-root canonicalization for explicit snapshot replacement/maintenance. */
export const canonicalizeRootChildren = (
  editor: Editor,
  current: readonly Descendant[],
  topLevelIndexes: ReadonlySet<number> | null,
  root: string,
  options: CanonicalizeOptions = {}
) => {
  const nested = current.map((child, index) =>
    topLevelIndexes === null || topLevelIndexes.has(index)
      ? canonicalizeNode(editor, child, root, options)
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
  children: NodeList<Descendant>,
  path: readonly number[]
) => {
  let descendants = children;
  let node: Descendant | undefined;

  for (const index of path) {
    node = descendants.at(index);
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
  schema: RepresentationSchema = resolveRepresentationSchema(editor)
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
  point: Point,
  edgeWidth: 0 | 1
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

      const isVoid = resolveRepresentationSchema(editor).isVoid(node);

      offset += edgeWidth;
      if (!isVoid && visit(node.children, nodePath)) return true;
      offset += edgeWidth;
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
  association: -1 | 1,
  edgeWidth: 0 | 1
): Point | null => {
  const ancestor = getDescendant(children, ancestorPath);

  if (!ancestor || !ElementApi.isElement(ancestor)) return null;

  let offset = 0;
  let previous: Point | null = null;
  let endingAt: Point | null = null;
  const visit = (
    nodes: readonly Descendant[],
    path: readonly number[]
  ): Point | null => {
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];
      const nodePath = [...path, index];

      if (TextApi.isText(node)) {
        const end = offset + node.text.length;

        if (edgeWidth) {
          if (offset <= targetOffset && targetOffset <= end) {
            const point = { offset: targetOffset - offset, path: nodePath };

            if (association < 0 || targetOffset < end || offset === end) {
              return point;
            }
            endingAt = point;
          }
        } else if (
          targetOffset < end ||
          (targetOffset === end && association < 0)
        ) {
          return {
            offset: Math.max(0, targetOffset - offset),
            path: nodePath,
          };
        }

        previous = { offset: node.text.length, path: nodePath };
        offset = end;
        continue;
      }

      const isVoid = resolveRepresentationSchema(editor).isVoid(node);

      offset += edgeWidth;
      const nested = isVoid ? null : visit(node.children, nodePath);

      if (nested) return nested;
      offset += edgeWidth;
    }

    return null;
  };

  return visit(ancestor.children, ancestorPath) ?? endingAt ?? previous;
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
  association: -1 | 1,
  options: Readonly<{ countInlineEdges?: true }> = {}
): Point | null => {
  const edgeWidth = options.countInlineEdges ? 1 : 0;
  const beforeChildren = beforeDocument.value as readonly Descendant[];
  const afterChildren = afterDocument.value as readonly Descendant[];

  for (let depth = point.path.length - 1; depth > 0; depth--) {
    const ancestorPath = point.path.slice(0, depth);
    const ancestor = getDescendant(beforeChildren, ancestorPath);

    if (
      !ancestor ||
      !ElementApi.isElement(ancestor) ||
      resolveRepresentationSchema(editor).isInline(ancestor)
    ) {
      continue;
    }

    const textOffset = getTextOffsetWithin(
      editor,
      beforeChildren,
      ancestorPath,
      point,
      edgeWidth
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
      association,
      edgeWidth
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
  root: string,
  representationSchema: RepresentationSchema = resolveRepresentationSchema(
    editor
  )
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

        return canonicalizeNode(editor, child, root, {
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

const isRangeInsideOneText = (
  document: DocumentIndex,
  from: number,
  to: number
) => {
  const start = document.textAt(from);
  const end = document.textAt(to);

  return Boolean(
    start &&
    end &&
    start.path.length === end.path.length &&
    start.path.every((part, index) => part === end.path[index]) &&
    start.contentFrom <= from &&
    to <= start.contentTo
  );
};

const isTextOnlyRepresentationChange = (
  change: RootChange,
  before: DocumentIndex,
  after: DocumentIndex
) => {
  let changed = false;
  let textOnly = true;

  change.iterChangedRanges((fromBefore, toBefore, fromAfter, toAfter) => {
    changed = true;
    if (
      !isRangeInsideOneText(before, fromBefore, toBefore) ||
      !isRangeInsideOneText(after, fromAfter, toAfter)
    ) {
      textOnly = false;
    }
  });

  return changed && textOnly;
};

const holdsAfter = (
  nodes: NodeList<Descendant>,
  node: Descendant,
  from: number
) => {
  for (let index = from; index < nodes.length; index += 1) {
    if (nodes.at(index) === node) return true;
  }

  return false;
};

const replaceCanonicalChildWindow = (
  draft: CanonicalRootDraft,
  editor: Editor,
  schema: RepresentationSchema,
  root: string,
  rootContent: ReturnType<RepresentationSchema['getRootContent']>,
  path: readonly number[],
  window: ChildWindow,
  beforeDocument: DocumentIndex | null,
  options: CanonicalizeOptions = {}
) => {
  const rootChildren = draft.document.nodes as NodeList<Descendant>;
  const { document } = draft;
  const rootData = {
    get children() {
      return document.value;
    },
  } as unknown as Editor;
  const node = path.length === 0 ? rootData : getDescendant(rootChildren, path);

  if (!node || TextApi.isText(node as Descendant)) return;

  const source: NodeList<Descendant> =
    path.length === 0 ? rootChildren : (node as Element).children;
  const parent = ElementApi.isElement(node) ? node : rootData;
  const contentSpec = ElementApi.isElement(parent)
    ? schema.getElementContent(parent.type)
    : rootContent;
  const ancestors: Element[] = [];

  for (let depth = path.length; depth > 0; depth--) {
    const ancestor = getDescendant(rootChildren, path.slice(0, depth));

    if (ancestor && ElementApi.isElement(ancestor)) ancestors.push(ancestor);
  }
  const dropsFromEmptyText = emptyTextDrops(schema, {
    ancestors: ancestors.slice(1),
    parent: ancestors[0],
    root,
  });
  const baselineAt = (from: number) =>
    beforeDocument ? { document: beforeDocument, from, path } : undefined;
  const propertyNodes = new Map<number, Descendant>();
  const propertyNodeAt = (index: number) => {
    const cached = propertyNodes.get(index);

    if (cached) return cached;
    const canonical = schema.canonicalizeChildren(
      [getDefined(source.at(index))],
      root,
      ancestors,
      false,
      baselineAt(index)
    )[0];

    propertyNodes.set(index, canonical);

    return canonical;
  };
  const kind =
    ElementApi.isElement(parent) && contentSpec
      ? contentKindOf(contentSpec, schema)
      : null;
  const inlineContent =
    ElementApi.isElement(parent) &&
    (kind === null
      ? inlineContentWithoutProgram(editor, parent, parent.children, schema)
      : kind === 'inline');
  // The changed range plus two unchanged children on each side contains each
  // radius-one representation dependency. Inline content's edge context below
  // prevents the local window from behaving like the start or end of its parent.
  let from = Math.max(0, Math.min(source.length, window.from) - 2);
  let to = Math.min(source.length, Math.max(window.to, window.from) + 2);
  let program = contentSpec;

  if (kind === 'mixed' && contentSpec && ElementApi.isElement(parent)) {
    ({ from, program, to } = mixedContentWindow(
      parent.children,
      contentSpec,
      schema,
      {
        from,
        to,
      }
    ));
  }

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
    false,
    baselineAt(from)
  );
  const preserveInlineSpacersAdjacentTo = carryProtectedInlineNodes(
    selected,
    propertyCanonical,
    options.preserveInlineSpacersAdjacentTo
  );
  const representationCanonical = ElementApi.isElement(parent)
    ? inlineContent
      ? canonicalizeInlineChildren(propertyCanonical, {
          ...(from > 0 ? { siblingBefore: propertyNodeAt(from - 1) } : {}),
          ...(to < source.length ? { siblingAfter: propertyNodeAt(to) } : {}),
          dropsFromEmptyText,
          editor,
          fillsEmpty: !contentSpec || admitsEmptyText(contentSpec),
          preserveInlineSpacersAdjacentTo,
          schema,
        })
      : kind === 'mixed' && program
        ? canonicalizeContentChildren(propertyCanonical, program, {
            dropsFromEmptyText,
            editor,
            preserveInlineSpacersAdjacentTo,
            schema,
          })
        : contentSpec
          ? propertyCanonical
          : canonicalizeDirectChildren(
              editor,
              parent,
              propertyCanonical,
              root,
              { schema },
              ancestors.slice(1)
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
    false,
    baselineAt(from)
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

  const children =
    path.length === 0 ? null : (draft.document.node(path) as Element).children;
  const nodes = children ?? (draft.document.nodes as NodeList<Descendant>);
  const previousParent = beforeDocument
    ? path.length === 0
      ? null
      : getDescendant(beforeDocument.nodes as NodeList<Descendant>, path)
    : null;
  const previousChildren =
    beforeDocument && options.displacement !== 'none'
      ? path.length === 0
        ? (beforeDocument.nodes as NodeList<Descendant>)
        : previousParent && ElementApi.isElement(previousParent)
          ? previousParent.children
          : null
      : null;
  const completion = {
    content: contentSpec,
    dropsFromEmptyText,
    editor,
    element: ElementApi.isElement(parent),
    preserveInlineSpacersAdjacentTo: options.preserveInlineSpacersAdjacentTo,
    schema: completionSchemaAt(schema, ancestors, root),
    ...(previousChildren
      ? {
          editing: {
            vacated: (slot: number, child: Descendant) =>
              nodes.length < previousChildren.length &&
              previousChildren.at(slot) !== child &&
              holdsAfter(previousChildren, child, slot + 1),
          },
        }
      : {}),
  };

  if (holdsContent({ ...completion, children: nodes })) return;

  const current = children ?? (draft.document.value as readonly Descendant[]);
  const { children: completed } = completeContent({
    ...completion,
    children: current,
  });

  if (completed === current) return;

  const step = reconcileChildrenStep(
    draft.document,
    path,
    0,
    current.length,
    completed
  );

  draft.change = draft.change.empty
    ? step.change
    : draft.change.compose(step.change);
  draft.document = step.after;
};

const fitRootChildren = (
  editor: Editor,
  current: readonly Descendant[],
  root: string,
  options: CanonicalizeOptions & Readonly<{ schema: RepresentationSchema }>
) => {
  const { schema } = options;
  const propertyCanonical = schema.canonicalizeChildren(
    current,
    root,
    [],
    false
  );
  const representationCanonical = canonicalizeRootChildren(
    editor,
    propertyCanonical,
    null,
    root,
    {
      ...options,
      preserveInlineSpacersAdjacentTo: carryProtectedInlineNodes(
        current,
        propertyCanonical,
        options.preserveInlineSpacersAdjacentTo
      ),
      report: schema.fitReportSink(root),
    }
  );
  const canonical =
    representationCanonical === propertyCanonical
      ? propertyCanonical
      : schema.canonicalizeChildren(representationCanonical, root, [], false);

  return canonical.length === current.length &&
    canonical.every((child, index) => child === current[index])
    ? current
    : canonical;
};

/** An explicit initial value loads canonical under the schema it publishes with. */
export const constructLoadedDocumentChange = (
  editor: Editor,
  document: JsonEditorValue,
  schema: RepresentationSchema = resolveRepresentationSchema(editor)
) => {
  const changes = new Map<string, RootChange>();

  schema.assertDocument(document);

  for (const root of ['main', ...Object.keys(document.roots ?? {})]) {
    const current = getRootChildren(document, root);
    const canonical = fitRootChildren(editor, current, root, {
      document,
      schema,
    });

    if (canonical === current) continue;
    changes.set(
      root,
      reconcileChildrenStep(
        DocumentIndex.fromValue(current),
        [],
        0,
        current.length,
        canonical
      ).change
    );
  }

  return createInternalDocumentChange(changes);
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
    displacement?: CanonicalizeOptions['displacement'];
  }> = {}
): DocumentChange => {
  const schema = options.schema ?? resolveRepresentationSchema(editor);
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
    const fromPreparation = new Set(
      (fitPreparation?.protectedInlineSpacerPaths?.get(root) ?? []).flatMap(
        (path) => {
          const node = getDescendant(getRootChildren(after, root), path);

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

    const document =
      options.indexedAfter?.get(root) ?? valueRootIndex(after, root);
    const draft: CanonicalRootDraft = {
      change: RootChange.empty(document.length),
      document,
    };
    const rootChange = getInternalDocumentRootChange(change, root);
    const beforeDocument = options.before
      ? (options.indexedBefore?.get(root) ??
        valueRootIndex(options.before, root))
      : null;
    const move =
      beforeDocument && rootChange
        ? rootChange.movedNode(beforeDocument)
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
    const textOnlyRepresentationChange =
      beforeDocument && rootChange
        ? isTextOnlyRepresentationChange(rootChange, beforeDocument, document)
        : false;

    if (textOnlyRepresentationChange) {
      profileCoreDuration('representation-text-locality-hit', () => undefined);
    }

    if (fitPreparation?.forceRoots?.has(root)) {
      const current = getRootChildren(after, root);
      const canonical = fitRootChildren(editor, current, root, {
        document: after as EditorDocumentValue,
        preserveInlineSpacersAdjacentTo: protectedInlineSpacersFor(root),
        schema,
      });

      if (canonical !== current) {
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

              const node = document.node(path);
              const range = document.nodeRange(path);

              if (
                !textOnlyRepresentationChange ||
                TextApi.isText(node) ||
                (ElementApi.isElement(node) && schema.isInline(node))
              ) {
                addChildWindow(windows, path.slice(0, -1), index, index + 1);
              }

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

    if (rootSpec && document.size < rootSpec.min) {
      addChildWindow(windows, [], document.size, document.size);
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
          beforeDocument,
          {
            displacement: options.displacement,
            document: after as EditorDocumentValue,
            preserveInlineSpacersAdjacentTo: protectedInlineSpacersFor(root),
          }
        );
      }
    });

    if (!draft.change.empty) changes.set(root, draft.change);
  }

  return createInternalDocumentChange(changes);
};
