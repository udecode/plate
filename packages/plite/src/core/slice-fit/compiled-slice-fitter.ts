import type {
  ContentSlice,
  Descendant,
  Editor,
  EditorDocumentValue,
  EditorElementBehavior,
  EditorSchemaVocabulary,
  EditorSelectionMapContext,
  Element,
  NamedRootKey,
  Path,
  Point,
  Range,
  RootKey,
  Selection,
  Text,
  Value,
} from '../../interfaces';
import { ElementApi, NodeApi, RangeApi, SelectionApi } from '../../interfaces';
import { ChangeDraft, type DocumentChangeStep } from '../change/builder';
import {
  createInternalDocumentChange,
  DocumentChange,
  mapInternalDocumentChangePosition,
} from '../change/document-change';
import { DocumentIndex } from '../change/document-index';
import {
  RootChange,
  reconcileChildrenStep,
  type DocumentPropertyContext,
} from '../change/root-change';
import {
  PreparedTokenSlice,
  PreparedTokenSliceStructureError,
  getPreparedDocumentSlice,
  type JsonEditorValue,
  type JsonNode,
} from '../change/tokens';
import { cloneFrozen } from '../clone';
import {
  ContentSlice as ContentSliceValue,
  encodeContentSlice,
  encodeContentSliceContent,
  isDetachedContentSlice,
} from '../content-slice';
import type { ExtensionRegistry } from '../extension-registry';
import { profileCoreDuration } from '../profiling';
import {
  bindCanonicalFitPreparation,
  type CanonicalFitPreparation,
  constructCanonicalDocumentChange,
  getProtectedInlineSpacerEntries,
  mapCanonicalRepresentationPoint,
  prepareCanonicalFitSlice,
  prepareCanonicalRootFit,
} from '../representation';
import {
  type CompiledEditorSchema,
  type CompiledSchemaContentProgram,
  type CompiledSchemaElement,
  resolveCompiledSchemaWrapperPlan,
} from '../schema-compiler';
import { EditorSchemaValidationError } from '../schema-validation';
import { mapSelectionWithContext } from '../selection-protocol';
import { assertEditorJsonValue, snapshotEditorJsonValue } from '../value-codec';
import {
  selectSliceFitCandidate,
  type MaterializedSliceFitCandidate,
  type SliceBoundaryCandidate,
  type SliceFitCandidate,
  type SliceFitSeed,
  type SliceVariant,
  type SliceVariantFamily,
} from './frontier';
import {
  createClosedFitOriginTracker,
  createRootFitPathProvenance,
  getTextEdge,
  isEmptyDescendant,
  pointsEqual,
  type ClosedFitOriginTracker,
  type RootFitPathProvenance,
  visitDescendantPaths,
} from './provenance';

export type InternalSliceFitTarget =
  | Readonly<{
      at: Range;
      contentBounds?: Readonly<{ from: number; to: number }>;
      exactBounds?: Readonly<{ from: number; to: number }>;
      kind: 'range';
    }>
  | Readonly<{
      kind: 'root';
      root: RootKey;
      selection?: NonNullable<Selection>;
    }>;

export type InternalSliceFitOptions = Readonly<{
  apply?: (
    step: DocumentChangeStep,
    selection?: NonNullable<Selection>
  ) => void;
  builder: ChangeDraft;
  target: InternalSliceFitTarget;
}>;

export type SliceFitRuntimeTargetOptions = Readonly<{
  ancestors?: readonly Element[];
  fitOrigins?: ClosedFitOriginTracker;
  root?: RootKey;
}>;

type RuntimeTargetOptions = SliceFitRuntimeTargetOptions;

type CanonicalRepresentationSchema = NonNullable<
  NonNullable<Parameters<typeof constructCanonicalDocumentChange>[3]>['schema']
>;

export type CompiledSliceFitter<V extends Value = Value> = Readonly<{
  fit: (slice: ContentSlice, options: InternalSliceFitOptions) => boolean;
  fitContent: (
    slice: ContentSlice,
    options: Readonly<{ parent: Element; root?: RootKey }>
  ) => readonly Descendant[] | null;
  fitDocument: <TValue extends Value>(
    input: EditorDocumentValue<TValue>
  ) => EditorDocumentValue<V>;
  findWrapping: (
    parent: Element,
    child: Descendant
  ) => readonly string[] | null;
  revision: number;
  schema: CompiledEditorSchema | null;
}>;

type SliceFitterDependencies<V extends Value> = Readonly<{
  canContain: (parent: Element, child: Descendant) => boolean;
  contentAllows: (
    schema: CompiledEditorSchema,
    content: CompiledSchemaContentProgram,
    child: Descendant
  ) => boolean;
  createDeclarativeAndFill: (
    schema: CompiledEditorSchema,
    type: string,
    properties?: Readonly<Record<string, unknown>>,
    creating?: ReadonlySet<string>,
    options?: SliceFitRuntimeTargetOptions
  ) => Element;
  editorRootLabel: (root: string) => string;
  elementUsesInlineContent: (element: Element) => boolean;
  getCompiledElement: (
    element: Readonly<{ type?: unknown }>
  ) => CompiledSchemaElement | null;
  getDescendant: (
    children: readonly Descendant[],
    path: readonly number[]
  ) => Descendant | null;
  getDocumentRoot: (
    value: EditorDocumentValue,
    root: string
  ) => readonly Descendant[];
  getDocumentRootProgram: (
    schema: CompiledEditorSchema,
    root: RootKey,
    value?: EditorDocumentValue
  ) => CompiledSchemaContentProgram | null | undefined;
  getEditor: () => Editor<V, any>;
  getElementAncestors: (
    children: readonly Descendant[],
    path: readonly number[],
    options?: Readonly<{ includeTarget?: boolean }>
  ) => readonly Element[];
  getElementBehavior: (element: Element) => EditorElementBehavior;
  getElementContentRoots: (
    element: Element
  ) => Readonly<Record<string, NamedRootKey>>;
  getElementSlicePolicy: (element: Element) => CompiledSchemaElement['slice'];
  getElementType: (element: Readonly<{ type?: unknown }>) => string | null;
  getRegistry: () => ExtensionRegistry<any>;
  getRootContent: (
    root?: RootKey,
    value?: EditorDocumentValue
  ) => CompiledSchemaContentProgram | null;
  getVocabulary: () => EditorSchemaVocabulary;
  indexConstructedRoot: (
    input: Readonly<{
      after: DocumentIndex;
      before: DocumentIndex;
      change?: RootChange;
      root: RootKey;
    }>
  ) => void;
  isSetValuedProperty: (
    node: JsonNode,
    key: string,
    context: DocumentPropertyContext
  ) => boolean;
  nodePropertiesEqual: (
    left: Readonly<Record<string, unknown>>,
    right: Readonly<Record<string, unknown>>,
    contentKey: 'children' | 'text',
    rightKeys: readonly string[]
  ) => boolean;
  revision: number;
  schema: CompiledEditorSchema | null;
  schemaApi: CanonicalRepresentationSchema;
  structurallyEqual: (left: unknown, right: unknown) => boolean;
  validateDeclarativeChildren: (
    children: readonly Descendant[],
    schema: CompiledEditorSchema,
    root: RootKey,
    ancestors: readonly Element[],
    parentPath: readonly number[],
    openAncestorBoundary?: boolean
  ) => void;
  validateDocument: (value: EditorDocumentValue) => void;
  validateSliceVocabulary: (children: readonly Descendant[]) => void;
}>;

export type SliceFitterDelegate<V extends Value = Value> = Pick<
  CompiledSliceFitter<V>,
  'fit' | 'fitContent' | 'fitDocument' | 'findWrapping'
>;

export const compileSliceFitter = <V extends Value>(
  input: SliceFitterDependencies<V>
): CompiledSliceFitter<V> => {
  const {
    canContain,
    contentAllows,
    createDeclarativeAndFill,
    editorRootLabel,
    elementUsesInlineContent,
    getCompiledElement,
    getDescendant,
    getDocumentRoot,
    getDocumentRootProgram,
    getEditor,
    getElementAncestors,
    getElementBehavior,
    getElementContentRoots,
    getElementSlicePolicy,
    getElementType,
    getRegistry,
    getRootContent,
    getVocabulary,
    indexConstructedRoot,
    isSetValuedProperty,
    nodePropertiesEqual,
    revision,
    schema,
    schemaApi: api,
    structurallyEqual,
    validateDeclarativeChildren,
    validateDocument,
    validateSliceVocabulary,
  } = input;
  const getDeclarativeSchema = () => schema;
  const allContentAllowed = (
    candidateSchema: CompiledEditorSchema,
    content: CompiledSchemaContentProgram,
    source: readonly Descendant[]
  ) => {
    const allowedByKind = new Map<string, boolean>();

    return source.every((child) => {
      const kind = NodeApi.isText(child)
        ? 'text'
        : `element:${getElementType(child) ?? ''}`;
      const cached = allowedByKind.get(kind);

      if (cached !== undefined) return cached;
      const allowed = contentAllows(candidateSchema, content, child);

      allowedByKind.set(kind, allowed);

      return allowed;
    });
  };

  const createDefaultForContent = (
    schema: CompiledEditorSchema,
    content: CompiledSchemaContentProgram,
    creating: ReadonlySet<string>,
    options: RuntimeTargetOptions
  ): Descendant | null => {
    const plan = content.defaultPlan;

    if (plan?.kind === 'text') return { text: '' };
    if (!plan || creating.has(plan.type)) return null;

    return createDeclarativeAndFill(
      schema,
      plan.type,
      undefined,
      creating,
      options
    );
  };

  const fitDirectContent = (
    schema: CompiledEditorSchema,
    content: CompiledSchemaContentProgram,
    source: readonly Descendant[],
    createdDefaults: readonly Descendant[] = [],
    options: RuntimeTargetOptions = {}
  ): readonly Descendant[] | null => {
    if (
      (content.max !== null && source.length > content.max) ||
      !allContentAllowed(schema, content, source)
    ) {
      return null;
    }

    const fitted = [...source];

    while (fitted.length < content.min) {
      const createdDefault = createdDefaults[fitted.length];
      const child =
        createdDefault && contentAllows(schema, content, createdDefault)
          ? createdDefault
          : createDefaultForContent(schema, content, new Set(), options);

      if (!child) return null;
      fitted.push(child);
    }

    return Object.freeze(fitted);
  };

  const createWrappedContent = (
    schema: CompiledEditorSchema,
    wrappers: readonly string[],
    source: readonly Descendant[],
    options: RuntimeTargetOptions = {}
  ): readonly Descendant[] | null => {
    const created: Element[] = [];
    let ancestors = options.ancestors ?? [];

    for (const type of wrappers) {
      const wrapper = createDeclarativeAndFill(
        schema,
        type,
        undefined,
        new Set(),
        {
          ancestors,
          root: options.root,
        }
      );

      created.push(wrapper);
      ancestors = [wrapper, ...ancestors];
    }

    let children = [...source];

    for (const wrapper of created.toReversed()) {
      const content = getCompiledElement(wrapper)?.content;
      const fitted = content
        ? fitDirectContent(schema, content, children, wrapper.children, options)
        : children;

      if (!fitted) return null;
      children = [{ ...wrapper, children: [...fitted] } as Element];
    }

    return children;
  };

  const wrapperGroupHasCapacity = (
    wrappers: readonly string[],
    childCount: number
  ) => {
    const innermost = wrappers.at(-1);
    const maximum = innermost
      ? getDeclarativeSchema()?.elements.byType.get(innermost)?.content?.max
      : null;

    return maximum === null || maximum === undefined || childCount < maximum;
  };

  const findWrapping = (
    parent: Element,
    child: Descendant
  ): readonly string[] | null => {
    if (canContain(parent, child)) return [];
    const schema = getDeclarativeSchema();
    const parentType = getElementType(parent);
    const childType = NodeApi.isText(child) ? null : getElementType(child);

    if (!schema || !parentType || (!NodeApi.isText(child) && !childType)) {
      return null;
    }

    return resolveCompiledSchemaWrapperPlan(
      schema,
      `element:${parentType}`,
      childType
    );
  };

  const findWrappingForContent = (
    schema: CompiledEditorSchema,
    programId: string,
    content: CompiledSchemaContentProgram,
    child: Descendant
  ): readonly string[] | null => {
    if (contentAllows(schema, content, child)) return [];
    const childType = NodeApi.isText(child) ? null : getElementType(child);

    if (!NodeApi.isText(child) && !childType) return null;

    return resolveCompiledSchemaWrapperPlan(schema, programId, childType);
  };

  const fitClosedNode = (
    schema: CompiledEditorSchema,
    node: Descendant,
    options: RuntimeTargetOptions
  ): Descendant | null => {
    const retainOrigin = (output: Descendant, subtree = false) => {
      options.fitOrigins?.record(output, node);
      if (subtree && ElementApi.isElement(node)) {
        visitDescendantPaths(node.children, (descendant) => {
          options.fitOrigins?.record(descendant, descendant);
        });
      }

      return output;
    };

    if (NodeApi.isText(node)) return retainOrigin(node);

    const type = getElementType(node);
    const element = type ? schema.elements.byType.get(type) : undefined;

    if (!element) {
      return schema.unknown === 'preserve' ? retainOrigin(node, true) : null;
    }
    if (!element.content) return retainOrigin(node, true);

    const children = fitClosedContent(
      schema,
      `element:${type}`,
      element.content,
      node.children,
      {
        ancestors: [node, ...(options.ancestors ?? [])],
        fitOrigins: options.fitOrigins,
        root: options.root,
      },
      true
    );

    if (!children) return null;
    if (
      children.length === node.children.length &&
      children.every((child, index) => child === node.children[index])
    ) {
      return retainOrigin(node, true);
    }

    return retainOrigin({ ...node, children: [...children] } as Element);
  };

  const fitClosedDefaultShell = (
    schema: CompiledEditorSchema,
    content: CompiledSchemaContentProgram,
    node: Element,
    options: RuntimeTargetOptions
  ): Element | null => {
    const plan = content.defaultPlan;

    if (plan?.kind !== 'element') return null;
    const shell = createDeclarativeAndFill(
      schema,
      plan.type,
      undefined,
      new Set(),
      options
    );
    const shellContent = schema.elements.byType.get(plan.type)?.content;

    if (!shellContent) return null;
    const children = fitClosedContent(
      schema,
      `element:${plan.type}`,
      shellContent,
      node.children,
      {
        ancestors: [shell, ...(options.ancestors ?? [])],
        fitOrigins: options.fitOrigins,
        root: options.root,
      },
      true
    );

    if (!children) return null;
    const fitted = { ...shell, children: [...children] } as Element;

    options.fitOrigins?.record(fitted, node);

    return fitted;
  };

  function fitClosedContent(
    schema: CompiledEditorSchema,
    programId: string,
    content: CompiledSchemaContentProgram,
    source: readonly Descendant[],
    options: RuntimeTargetOptions = {},
    coerceDefaultShell = false,
    dropMisplacedText = false
  ): readonly Descendant[] | null {
    const groups: Array<{
      children: Descendant[];
      wrappers: readonly string[];
    }> = [];

    for (const sourceChild of source) {
      const child = fitClosedNode(schema, sourceChild, options);

      if (!child) return null;
      let wrappers = findWrappingForContent(schema, programId, content, child);

      let fittedChild = child;

      if (!wrappers && coerceDefaultShell && ElementApi.isElement(child)) {
        const shell = fitClosedDefaultShell(schema, content, child, options);

        if (shell) {
          fittedChild = shell;
          wrappers = [];
        }
      }
      if (!wrappers) {
        if (dropMisplacedText && NodeApi.isText(child)) continue;

        return null;
      }
      const previous = groups.at(-1);

      if (
        wrappers.length > 0 &&
        previous &&
        previous.wrappers.length === wrappers.length &&
        wrappers.every((type, index) => type === previous.wrappers[index]) &&
        wrapperGroupHasCapacity(wrappers, previous.children.length)
      ) {
        previous.children.push(fittedChild);
      } else {
        groups.push({ children: [fittedChild], wrappers });
      }
    }

    const fitted: Descendant[] = [];

    for (const group of groups) {
      const children = createWrappedContent(
        schema,
        group.wrappers,
        group.children,
        options
      );

      if (!children) return null;
      fitted.push(...children);
    }

    if (content.max !== null && fitted.length > content.max) return null;

    return fitDirectContent(schema, content, fitted, [], options);
  }

  const fitClosedSliceInterior = (
    schema: CompiledEditorSchema,
    slice: ContentSlice,
    root: RootKey,
    provenance?: RootFitPathProvenance
  ): ContentSlice | null => {
    const fitOrigins = provenance ? createClosedFitOriginTracker() : undefined;
    const visit = (
      children: readonly Descendant[],
      openStart: number,
      openEnd: number,
      ancestors: readonly Element[]
    ): readonly Descendant[] | null => {
      let changed = false;
      const fitted: Descendant[] = [];

      for (const [index, child] of children.entries()) {
        const opensStart = openStart > 0 && index === 0;
        const opensEnd = openEnd > 0 && index === children.length - 1;
        let next: Descendant | null = child;

        if (!opensStart && !opensEnd) {
          next = fitClosedNode(schema, child, {
            ancestors,
            fitOrigins,
            root,
          });
        } else if (ElementApi.isElement(child)) {
          const nested = visit(
            child.children,
            opensStart ? openStart - 1 : 0,
            opensEnd ? openEnd - 1 : 0,
            [child, ...ancestors]
          );

          if (!nested) return null;
          if (
            nested.length !== child.children.length ||
            nested.some(
              (node, childIndex) => node !== child.children[childIndex]
            )
          ) {
            next = { ...child, children: [...nested] } as Element;
          }
        }

        if (!next) return null;
        changed ||= next !== child;
        fitted.push(next);
      }

      return changed ? Object.freeze(fitted) : children;
    };
    const content = visit(slice.content, slice.openStart, slice.openEnd, []);

    if (!content) return null;
    if (content !== slice.content && provenance && fitOrigins) {
      provenance.advance(slice.content, content, fitOrigins);
    }

    return content === slice.content
      ? slice
      : ContentSliceValue.withContent(slice, content, { open: 'preserve' });
  };

  const getSliceEdgeOpenDepth = (
    content: readonly Descendant[],
    edge: 'end' | 'start',
    canOpenPreservedContext: (element: Element) => boolean = () => false
  ) => {
    let children = content;
    let depth = 0;

    while (children.length > 0) {
      const node = edge === 'start' ? children[0] : children.at(-1);

      if (!ElementApi.isElement(node)) break;

      const behavior = getElementBehavior(node);

      if (
        behavior.isolating ||
        behavior.void ||
        (getElementSlicePolicy(node).preserveContext &&
          !canOpenPreservedContext(node))
      ) {
        break;
      }

      depth++;
      children = node.children;
    }

    return depth;
  };

  const fitContent = (
    slice: ContentSlice,
    options: Readonly<{ parent: Element; root?: RootKey }>
  ): readonly Descendant[] | null => {
    const schema = getDeclarativeSchema();
    const parentType = getElementType(options.parent);

    if (!schema || !parentType) return null;
    const element = schema.elements.byType.get(parentType);

    if (!element?.content) return null;
    const parentContent = element.content;
    const root = options.root ?? 'main';
    const structuralParent: Element = {
      children: options.parent.children,
      type: parentType,
      ...(element.contentRoots.size > 0 &&
      Object.hasOwn(options.parent, 'childRoots')
        ? {
            childRoots: (options.parent as { childRoots?: unknown }).childRoots,
          }
        : {}),
    };
    let parent = snapshotEditorJsonValue(
      structuralParent,
      'Detached slice-fit parent'
    );
    let virtualChildren = Object.freeze([parent]);
    let virtualDocument = DocumentIndex.fromValue(
      virtualChildren as readonly JsonNode[]
    );
    let parentRange = virtualDocument.nodeRange([0]);
    let anchor = virtualDocument.pointAt(parentRange.from + 1, 1);
    let focus = virtualDocument.pointAt(parentRange.to - 1, -1);

    if (!anchor || !focus) {
      parent = snapshotEditorJsonValue(
        { ...parent, children: [{ text: '' }] },
        'Detached slice-fit parent'
      );
      virtualChildren = Object.freeze([parent]);
      virtualDocument = DocumentIndex.fromValue(
        virtualChildren as readonly JsonNode[]
      );
      parentRange = virtualDocument.nodeRange([0]);
      anchor = virtualDocument.pointAt(parentRange.from + 1, 1);
      focus = virtualDocument.pointAt(parentRange.to - 1, -1);
    }

    if (!anchor || !focus) return null;

    const virtualValue = snapshotEditorJsonValue<EditorDocumentValue>(
      root === 'main'
        ? { children: [parent] }
        : { children: [], roots: { [root]: [parent] } },
      'Detached slice-fit document'
    );
    const builder = new ChangeDraft(virtualValue, {
      construct: ({ after, change }, preparation) =>
        constructCanonicalDocumentChange(getEditor(), after, change, {
          fitPreparation: preparation,
          schema: api,
        }),
      indexConstructedRoot,
      isSetValued: (node, key, context) =>
        isSetValuedProperty(node, key, context),
      validateConstructed: ({ after }) =>
        profileCoreDuration('slice-fit-content-validation', () => {
          const fittedParent = getDocumentRoot(
            after as EditorDocumentValue,
            root
          )[0];

          if (
            !fittedParent ||
            !ElementApi.isElement(fittedParent) ||
            getElementType(fittedParent) !== parentType
          ) {
            throw new EditorSchemaValidationError(
              'Detached slice fitting must retain its parent element.'
            );
          }
          const children = fittedParent.children;

          if (
            children.length < parentContent.min ||
            (parentContent.max !== null &&
              children.length > parentContent.max) ||
            !allContentAllowed(schema, parentContent, children)
          ) {
            throw new EditorSchemaValidationError(
              `Editor element "${parentType}" has invalid fitted content.`
            );
          }

          validateDeclarativeChildren(
            children,
            schema,
            root,
            [fittedParent],
            []
          );
        }),
    });
    const at: Range = {
      anchor: {
        offset: anchor.offset,
        path: [...anchor.path],
        ...(root === 'main' ? {} : { root }),
      },
      focus: {
        offset: focus.offset,
        path: [...focus.path],
        ...(root === 'main' ? {} : { root }),
      },
    };
    const input = ContentSliceValue.fromJSON(slice);
    const contentBounds = {
      from: parentRange.from + 1,
      to: parentRange.to - 1,
    };
    const fitted = fit(slice, {
      builder,
      target: {
        at,
        contentBounds,
        ...(input.openStart === 0 && input.openEnd === 0
          ? { exactBounds: contentBounds }
          : {}),
        kind: 'range',
      },
    });

    if (!fitted) return null;

    try {
      const after = builder.value as EditorDocumentValue;
      const fittedParent = getDocumentRoot(after, root)[0];

      return fittedParent && ElementApi.isElement(fittedParent)
        ? cloneFrozen(fittedParent.children)
        : null;
    } catch (error) {
      if (error instanceof EditorSchemaValidationError) return null;
      throw error;
    }
  };

  const getSliceVariantFamilies = (
    slice: ContentSlice,
    at: Range,
    root: string,
    rootChildren: readonly Descendant[],
    targetRootProgram: CompiledSchemaContentProgram | null
  ) => {
    const contents: Array<{
      content: readonly Descendant[];
      cost: number;
      openEnd?: number;
      openStart?: number;
      priority: number;
    }> = [{ content: slice.content, cost: 0, priority: 0 }];
    const contentPrograms = new Map<
      CompiledSchemaContentProgram,
      Readonly<{ id: string; options: RuntimeTargetOptions }>
    >();
    const declarative = getDeclarativeSchema();
    const rootProgram = targetRootProgram;

    if (rootProgram) {
      contentPrograms.set(rootProgram, {
        id: root === 'main' ? 'root' : `root:${root}`,
        options: { root },
      });
    }

    const [start] = RangeApi.edges(at);
    const nestedStructuralVariant = (() => {
      if (
        slice.openStart !== 0 ||
        slice.openEnd !== 0 ||
        slice.content.length !== 1
      ) {
        return null;
      }

      const targetPath = start.path.slice(0, -1);
      const target = getDescendant(rootChildren, targetPath);
      const targetParent = getDescendant(rootChildren, targetPath.slice(0, -1));
      const source = slice.content[0];

      if (
        targetPath.length < 2 ||
        !target ||
        !ElementApi.isElement(target) ||
        !elementUsesInlineContent(target) ||
        !targetParent ||
        !ElementApi.isElement(targetParent) ||
        elementUsesInlineContent(targetParent) ||
        !ElementApi.isElement(source)
      ) {
        return null;
      }

      const canOpenStructuralContext = (element: Element) => {
        const behavior = getElementBehavior(element);
        const policy = getElementSlicePolicy(element);

        return (
          !behavior.inline &&
          !behavior.isolating &&
          !behavior.void &&
          !policy.preserveContext &&
          !elementUsesInlineContent(element)
        );
      };

      if (!canOpenStructuralContext(source)) return null;

      let children = source.children;

      while (true) {
        const first = children[0];

        if (!first || !ElementApi.isElement(first)) return null;
        if (elementUsesInlineContent(first)) break;
        if (!canOpenStructuralContext(first)) return null;

        children = [...first.children, ...children.slice(1)];
      }

      const first = children[0];

      if (
        children.length < 2 ||
        !first ||
        !ElementApi.isElement(first) ||
        !children.every((child) => ElementApi.isElement(child)) ||
        getElementType(first) !== getElementType(target)
      ) {
        return null;
      }

      return children;
    })();

    if (nestedStructuralVariant) {
      contents.push({
        content: nestedStructuralVariant,
        cost: 0,
        openEnd: 0,
        openStart: 1,
        priority: -1,
      });
    }

    for (let depth = start.path.length - 1; depth > 0; depth--) {
      const node = getDescendant(rootChildren, start.path.slice(0, depth));
      const type =
        node && ElementApi.isElement(node) ? getElementType(node) : null;
      const content = type
        ? declarative?.elements.byType.get(type)?.content
        : null;

      if (content && node && ElementApi.isElement(node)) {
        contentPrograms.set(content, {
          id: `element:${type}`,
          options: {
            ancestors: getElementAncestors(
              rootChildren,
              start.path.slice(0, depth),
              { includeTarget: true }
            ),
            root,
          },
        });
      }
    }

    for (const [content, { id, options }] of contentPrograms) {
      const fitted = declarative
        ? fitClosedContent(declarative, id, content, slice.content, options)
        : null;

      if (
        fitted &&
        (fitted.length !== slice.content.length ||
          fitted.some((child, index) => child !== slice.content[index]))
      ) {
        contents.push({ content: fitted, cost: 2, priority: 0 });
      }
    }

    return contents.map(
      (
        { content, cost: contentCost, openEnd, openStart, priority },
        contentIndex
      ): SliceVariantFamily => {
        const preparedContent =
          contentIndex === 0
            ? slice
            : openStart === undefined || openEnd === undefined
              ? ContentSliceValue.closed(content)
              : ContentSliceValue.fromJSON({ content, openEnd, openStart });
        const baseOpenStart = preparedContent.openStart;
        const baseOpenEnd = preparedContent.openEnd;
        const targetTypes = new Set(
          start.path
            .slice(0, -1)
            .map((_part, index) =>
              getDescendant(rootChildren, start.path.slice(0, index + 1))
            )
            .filter((node): node is Element =>
              Boolean(node && ElementApi.isElement(node))
            )
            .map((element) => getElementType(element))
        );
        const canOpenInTargetContext = [content[0], content.at(-1)].some(
          (edge) =>
            ElementApi.isElement(edge) && targetTypes.has(getElementType(edge))
        );
        const canOpenAtRoot = declarative
          ? [declarative.primaryRoot, ...declarative.roots.values()].some(
              (compiledRoot) =>
                allContentAllowed(declarative, compiledRoot.content, content)
            )
          : content.every(
              (child) =>
                ElementApi.isElement(child) &&
                !getElementBehavior(child).inline &&
                child.children.every(
                  (grandchild) =>
                    NodeApi.isText(grandchild) ||
                    (ElementApi.isElement(grandchild) &&
                      getElementBehavior(grandchild).inline)
                )
            );
        const canOpenContent =
          contentIndex === 0 &&
          (slice.openStart > 0 ||
            slice.openEnd > 0 ||
            contents.length === 1 ||
            canOpenInTargetContext) &&
          (canOpenAtRoot || canOpenInTargetContext);
        const maxOpenStart = canOpenContent
          ? getSliceEdgeOpenDepth(content, 'start', (element) =>
              targetTypes.has(getElementType(element))
            )
          : baseOpenStart;
        const maxOpenEnd = canOpenContent
          ? getSliceEdgeOpenDepth(content, 'end', (element) =>
              targetTypes.has(getElementType(element))
            )
          : baseOpenEnd;

        return Object.freeze({
          baseOpenEnd,
          baseOpenStart,
          contentCost,
          index: contentIndex,
          maxOpenEnd,
          maxOpenStart,
          priority,
          source: preparedContent,
        });
      }
    );
  };

  const getBoundaryCandidates = (
    at: Range,
    rootChildren: readonly Descendant[],
    document: DocumentIndex,
    source: ContentSlice,
    targetRootProgram: CompiledSchemaContentProgram | null,
    contentBounds?: Readonly<{ from: number; to: number }>,
    exactBounds?: Readonly<{ from: number; to: number }>
  ) => {
    const [start, end] = RangeApi.edges(at);
    const from = exactBounds?.from ?? document.positionAt(start);
    const to = exactBounds?.to ?? document.positionAt(end);
    const candidates = new Map<string, SliceBoundaryCandidate>();
    const add = (candidate: SliceBoundaryCandidate) => {
      if (candidate.from > candidate.to) return;
      if (
        contentBounds &&
        (candidate.from < contentBounds.from || candidate.to > contentBounds.to)
      ) {
        return;
      }

      const key = `${candidate.from}:${candidate.to}`;
      const previous = candidates.get(key);

      if (!previous || candidate.cost < previous.cost) {
        candidates.set(key, candidate);
      }
    };

    add({ cost: 0, from, to });

    const collapsed = from === to;
    const startBounds = [{ cost: 0, position: from }];
    const endBounds = [{ cost: 0, position: to }];
    const deleting = source.content.length === 0;
    const directSourceContexts = (() => {
      const contexts: Descendant[] = [];
      let content = source.content;

      for (let depth = 0; depth <= source.openStart; depth++) {
        const node = content[0];

        if (!node) break;
        contexts.push(node);
        if (!ElementApi.isElement(node)) break;
        if (depth < source.openStart) {
          const behavior = getElementBehavior(node);

          if (
            behavior.isolating ||
            behavior.void ||
            getElementSlicePolicy(node).preserveContext
          ) {
            return [];
          }
        }
        content = node.children;
      }

      return contexts;
    })();
    const canReplaceCoveredNode = (path: readonly number[]) => {
      if (deleting) return true;
      if (directSourceContexts.length === 0) return false;
      const parentPath = path.slice(0, -1);
      const parent =
        parentPath.length > 0 ? getDescendant(rootChildren, parentPath) : null;

      if (parent) {
        return (
          ElementApi.isElement(parent) &&
          directSourceContexts.some((candidate) =>
            canContain(parent, candidate)
          )
        );
      }

      const declarative = getDeclarativeSchema();
      const rootContent = targetRootProgram;

      return directSourceContexts.some((candidate) =>
        declarative && rootContent
          ? contentAllows(declarative, rootContent, candidate)
          : ElementApi.isElement(candidate) &&
            !getElementBehavior(candidate).inline
      );
    };
    const coveredCost = (depth: number, distance: number) => {
      if (deleting) return -distance;

      return -2 + 1 / (depth + 1);
    };

    for (let depth = start.path.length - 1; depth > 0; depth--) {
      const path = start.path.slice(0, depth);
      const node = getDescendant(rootChildren, path);

      if (!node || !ElementApi.isElement(node)) continue;
      if (getElementBehavior(node).isolating) break;

      const range = document.nodeRange(path);
      const startEdge = getTextEdge(node, path, 'start');
      const endEdge = getTextEdge(node, path, 'end');
      const cost = start.path.length - depth + 2;
      const { preserveContext, replaceWhenCovered } =
        getElementSlicePolicy(node);

      if (startEdge && pointsEqual(start, startEdge)) {
        // At the exact start of a selected container, replace that container
        // instead of retaining its type around content from the far edge.
        if (!collapsed && replaceWhenCovered && canReplaceCoveredNode(path)) {
          startBounds.push({
            cost: coveredCost(depth, cost),
            position: range.from,
          });
        }
        if (collapsed) add({ cost, from: range.from, to: range.from });
      }
      if (collapsed && endEdge && pointsEqual(start, endEdge)) {
        add({ cost, from: range.to, to: range.to });
      }
      if (collapsed && isEmptyDescendant(node)) {
        add({ cost: cost - 2, from: range.from, to: range.to });
      }
      if (preserveContext) break;
    }

    if (!collapsed) {
      for (let depth = end.path.length - 1; depth > 0; depth--) {
        const path = end.path.slice(0, depth);
        const node = getDescendant(rootChildren, path);

        if (!node || !ElementApi.isElement(node)) continue;
        if (getElementBehavior(node).isolating) break;

        const range = document.nodeRange(path);
        const endEdge = getTextEdge(node, path, 'end');

        const { preserveContext, replaceWhenCovered } =
          getElementSlicePolicy(node);

        if (
          replaceWhenCovered &&
          endEdge &&
          pointsEqual(end, endEdge) &&
          canReplaceCoveredNode(path)
        ) {
          endBounds.push({
            cost: coveredCost(depth, end.path.length - depth + 2),
            position: range.to,
          });
        }
        if (preserveContext) break;
      }

      for (const startBound of startBounds) {
        for (const endBound of endBounds) {
          add({
            cost: startBound.cost + endBound.cost,
            from: startBound.position,
            to: endBound.position,
          });
        }
      }
    }

    return [...candidates.values()].sort(
      (left, right) => left.cost - right.cost
    );
  };

  const getNodeToken = (node: Descendant, kind: 'close' | 'open') => {
    if (kind === 'close') {
      return {
        kind,
        nodeKind: NodeApi.isText(node)
          ? ('text' as const)
          : ('element' as const),
      };
    }

    if (NodeApi.isText(node)) {
      const { text: _text, ...props } = node;

      return { kind, nodeKind: 'text' as const, props };
    }

    const { children: _children, ...props } = node;

    return { kind, nodeKind: 'element' as const, props };
  };

  const getContentEndOffset = (slice: PreparedTokenSlice) => {
    let offset = slice.length;

    for (let index = slice.tokens.length - 1; index >= 0; index--) {
      if (slice.tokens[index]?.kind !== 'close') break;

      offset -= 1;
    }

    return offset;
  };

  const endsInInlineVoid = (slice: ContentSlice) => {
    let node = slice.content.at(-1);

    while (node && ElementApi.isElement(node)) {
      const behavior = getElementBehavior(node);

      if (behavior.inline && behavior.void) return true;
      node = node.children.at(-1);
    }

    return false;
  };

  const restorePartiallyDeletedContext = (
    document: DocumentIndex,
    rootChildren: readonly Descendant[],
    start: Point,
    end: Point,
    boundary: SliceBoundaryCandidate,
    exactFrom: number,
    exactTo: number,
    insert: PreparedTokenSlice
  ) => {
    const tokens: ReturnType<typeof getNodeToken>[] = [];

    if (boundary.from < exactFrom && boundary.to === exactTo) {
      for (let depth = 1; depth <= end.path.length; depth++) {
        const path = end.path.slice(0, depth);
        const node = getDescendant(rootChildren, path);

        if (!node) continue;

        const range = document.nodeRange(path);

        if (range.from >= boundary.from && range.from < exactTo) {
          tokens.push(getNodeToken(node, 'open'));
        }
      }
    }

    const prefix = PreparedTokenSlice.fromJSON(tokens);

    tokens.length = 0;
    if (boundary.from === exactFrom && boundary.to > exactTo) {
      for (let depth = start.path.length; depth > 0; depth--) {
        const path = start.path.slice(0, depth);
        const node = getDescendant(rootChildren, path);

        if (!node) continue;

        const range = document.nodeRange(path);

        if (range.to > exactFrom && range.to <= boundary.to) {
          tokens.push(getNodeToken(node, 'close'));
        }
      }
    }

    const suffix = PreparedTokenSlice.fromJSON(tokens);

    const restored =
      prefix.length === 0 && suffix.length === 0
        ? insert
        : PreparedTokenSlice.concat([prefix, insert, suffix]);

    return {
      insert: restored,
      selectionOffset: prefix.length + getContentEndOffset(insert),
    };
  };

  const prepareFittedDocument = (
    builder: ChangeDraft,
    rawChange: DocumentChange,
    fitPreparation?: CanonicalFitPreparation,
    trustedCanonical?: Readonly<{
      createIndexes: () => ReadonlyMap<string, DocumentIndex>;
      runtimeCandidatePaths: ReadonlyMap<
        string,
        readonly (readonly number[])[]
      >;
    }>
  ) => {
    if (trustedCanonical) {
      const indexedAfter = profileCoreDuration(
        'slice-fit-changeset-apply',
        trustedCanonical.createIndexes
      );
      const runtimeCandidates = new Map(
        [...trustedCanonical.runtimeCandidatePaths].map(([root, paths]) => {
          const index = indexedAfter.get(root);

          if (!index) {
            throw new Error(
              `Missing trusted indexed result for runtime candidates in root "${root}".`
            );
          }

          return [
            root,
            Object.freeze(
              paths.map((path) =>
                Object.freeze({
                  node: index.node([...path] as Path),
                  path,
                })
              )
            ),
          ] as const;
        })
      );
      const step = builder.applyTrustedCanonical(rawChange, {
        indexedAfter,
        runtimeCandidates,
      });

      return {
        canonicalAfter: step.after as EditorDocumentValue,
        canonicalIndexes: step.indexedAfter,
        change: rawChange,
        constructionChange: DocumentChange.empty,
        prepared: builder.prepare(rawChange, { classify: false }),
        rawAfter: step.after as EditorDocumentValue,
        rawIndexes: step.indexedAfter,
      };
    }

    const rawStep = profileCoreDuration('slice-fit-changeset-apply', () =>
      builder.apply(rawChange, { classify: false })
    );
    const constructionStep = profileCoreDuration(
      'slice-fit-canonical-change-finalize',
      () => builder.finalize(fitPreparation, { classify: false })
    );
    const canonicalAfter = builder.value as EditorDocumentValue;
    const change = profileCoreDuration('slice-fit-canonical-change-map', () =>
      builder.classify()
    );
    const constructionChange = constructionStep?.change ?? DocumentChange.empty;

    return {
      canonicalAfter,
      canonicalIndexes: constructionStep?.indexedAfter ?? rawStep.indexedAfter,
      change,
      constructionChange,
      prepared: builder.prepare(change),
      rawAfter: rawStep.after as EditorDocumentValue,
      rawIndexes: rawStep.indexedAfter,
    };
  };

  const mapFittedSelectionPoint = (
    rawDocument: DocumentIndex,
    canonicalDocument: DocumentIndex,
    constructionChange: DocumentChange,
    root: string,
    rawPosition: number,
    selectionAssociation: -1 | 1 = -1
  ) => {
    const rawPoint = rawDocument.pointAt(rawPosition, selectionAssociation);

    return rawPoint
      ? mapCanonicalRepresentationPoint(
          getEditor(),
          rawDocument,
          canonicalDocument,
          constructionChange,
          root,
          { offset: rawPoint.offset, path: [...rawPoint.path] },
          selectionAssociation === 1 || rawPoint.offset === 0 ? 1 : -1
        )
      : null;
  };

  const resolveExternalDocumentPoint = (
    source: readonly Descendant[],
    document: DocumentIndex,
    point: Point
  ): Point | null => {
    const direct = getDescendant(source, point.path);

    if (direct && NodeApi.isText(direct)) {
      return {
        offset: Math.min(point.offset, direct.text.length),
        path: [...point.path],
        ...(point.root === undefined ? {} : { root: point.root }),
      };
    }
    if (direct && ElementApi.isElement(direct)) {
      const [first, path] = NodeApi.first(direct, []);

      if (NodeApi.isText(first)) {
        return {
          offset: Math.min(point.offset, first.text.length),
          path: [...point.path, ...path],
          ...(point.root === undefined ? {} : { root: point.root }),
        };
      }
    }

    const fallback = document.pointAt(0, 1);

    return fallback
      ? {
          offset: fallback.offset,
          path: [...fallback.path],
          ...(point.root === undefined ? {} : { root: point.root }),
        }
      : null;
  };

  const mapExternalRootSelection = (
    selection: NonNullable<Selection>,
    source: readonly Descendant[],
    provenance: RootFitPathProvenance,
    constructionChange: DocumentChange,
    root: RootKey,
    rawDocument: DocumentIndex,
    canonicalDocument: DocumentIndex
  ): NonNullable<Selection> | null => {
    const sourceDocument = DocumentIndex.fromValue(source);
    const resolveSourcePoint = (point: Point) =>
      resolveExternalDocumentPoint(source, sourceDocument, point);
    const getCanonicalAssociation = (point: Point, fallback: -1 | 1) => {
      const node = getDescendant(source, point.path);

      if (!node || !NodeApi.isText(node) || node.text !== '') return fallback;
      const index = point.path.at(-1);

      if (index === undefined) return fallback;
      const parent = getDescendant(source, point.path.slice(0, -1));

      if (!parent || !ElementApi.isElement(parent)) return fallback;
      const previous = parent.children[index - 1];

      return previous &&
        ElementApi.isElement(previous) &&
        api.isInline(previous)
        ? 1
        : fallback;
    };
    const mapPoint: EditorSelectionMapContext['mapPoint'] = (
      point,
      options = {}
    ) => {
      const sourcePoint = resolveSourcePoint(point);

      if (!sourcePoint) return null;
      const association = getCanonicalAssociation(
        sourcePoint,
        options.association === 'backward' ? -1 : 1
      );
      const rawPoint = provenance.mapPoint(
        sourcePoint,
        sourceDocument,
        rawDocument,
        association,
        options.deletion
      );

      if (!rawPoint) return null;
      const mapped = constructionChange.empty
        ? { offset: rawPoint.offset, path: [...rawPoint.path] }
        : mapCanonicalRepresentationPoint(
            getEditor(),
            rawDocument,
            canonicalDocument,
            constructionChange,
            root,
            { offset: rawPoint.offset, path: [...rawPoint.path] },
            association
          );

      return mapped
        ? {
            offset: mapped.offset,
            path: [...mapped.path],
            ...(point.root === undefined ? {} : { root }),
          }
        : null;
    };
    const mapPath: EditorSelectionMapContext['mapPath'] = (
      path,
      options = {}
    ) => {
      const association = options.association === 'backward' ? -1 : 1;
      const rawPath = provenance.mapPath(
        path,
        sourceDocument,
        association,
        options.deletion
      );
      const rawNode = rawPath ? rawDocument.nodeRange(rawPath) : null;

      if (!rawNode) return null;
      const mappedPosition = mapInternalDocumentChangePosition(
        constructionChange,
        root,
        rawNode.from,
        association,
        options.deletion === 'drop' ? 'around' : undefined
      );
      const mappedNode =
        mappedPosition === null
          ? null
          : canonicalDocument.nodeStartingAt(mappedPosition);

      return mappedNode ? [...mappedNode.path] : null;
    };
    const mapRange: EditorSelectionMapContext['mapRange'] = (
      range,
      options = {}
    ) => {
      const sourceAnchor = resolveSourcePoint(range.anchor);
      const sourceFocus = resolveSourcePoint(range.focus);

      if (!sourceAnchor || !sourceFocus) return null;
      const anchorPosition = sourceDocument.positionAt(sourceAnchor);
      const focusPosition = sourceDocument.positionAt(sourceFocus);
      const forward = anchorPosition <= focusPosition;
      const associations =
        options.association === 'backward'
          ? (['backward', 'backward'] as const)
          : options.association === 'forward'
            ? (['forward', 'forward'] as const)
            : options.association === 'outward'
              ? forward
                ? (['backward', 'forward'] as const)
                : (['forward', 'backward'] as const)
              : forward
                ? (['forward', 'backward'] as const)
                : (['backward', 'forward'] as const);
      const anchor = mapPoint(range.anchor, {
        association: associations[0],
        deletion: options.deletion,
      });
      const focus = mapPoint(range.focus, {
        association: associations[1],
        deletion: options.deletion,
      });

      return anchor && focus ? { anchor, focus } : null;
    };
    const composedChange = provenance
      .createContextChange(sourceDocument, rawDocument, root)
      .compose(constructionChange);
    const context = Object.freeze({
      change: composedChange,
      editor: getEditor(),
      mapPath,
      mapPoint,
      mapRange,
      root,
    }) satisfies EditorSelectionMapContext;

    return mapSelectionWithContext(
      getEditor(),
      selection,
      context,
      { association: 'backward' },
      getRegistry()
    );
  };

  const fit = (
    slice: ContentSlice,
    options: InternalSliceFitOptions
  ): boolean => {
    const value = options.builder.value as EditorDocumentValue;
    const sourceSlice = profileCoreDuration('slice-fit-input', () =>
      ContentSliceValue.fromJSON(slice)
    );
    const rootPathProvenance =
      options.target.kind === 'root' && options.target.selection
        ? createRootFitPathProvenance(sourceSlice.content)
        : null;
    const rangeTarget = options.target.kind === 'range' ? options.target : null;
    const root =
      options.target.kind === 'root'
        ? options.target.root
        : (RangeApi.edges(options.target.at)[0].root ?? 'main');
    const missingRoot =
      root !== 'main' && !Object.hasOwn(value.roots ?? {}, root);

    if (rangeTarget) {
      const [rangeStart, rangeEnd] = RangeApi.edges(rangeTarget.at);

      if ((rangeEnd.root ?? 'main') !== (rangeStart.root ?? 'main')) {
        throw new Error('A slice replacement cannot span editor roots.');
      }
    }
    if (rangeTarget && missingRoot) {
      throw new Error(
        `Cannot fit content into missing editor ${editorRootLabel(root)}.`
      );
    }
    if (
      options.target.kind === 'root' &&
      (sourceSlice.openStart !== 0 || sourceSlice.openEnd !== 0)
    ) {
      return false;
    }

    try {
      profileCoreDuration('slice-fit-vocabulary-validation', () =>
        validateSliceVocabulary(sourceSlice.content)
      );
    } catch (error) {
      if (error instanceof EditorSchemaValidationError) return false;

      throw error;
    }

    const declarative = getDeclarativeSchema();
    const grammarFittedInput = declarative
      ? fitClosedSliceInterior(
          declarative,
          sourceSlice,
          root,
          rootPathProvenance ?? undefined
        )
      : sourceSlice;

    if (!grammarFittedInput) return false;

    const preparedInput =
      options.target.kind === 'root'
        ? null
        : profileCoreDuration('slice-fit-canonical-preparation', () =>
            prepareCanonicalFitSlice(
              getEditor(),
              declarative,
              grammarFittedInput,
              getDeclarativeSchema,
              api
            )
          );
    let inputSlice = preparedInput?.slice ?? grammarFittedInput;
    const targetRootProgram = declarative
      ? (getDocumentRootProgram(declarative, root, value) ?? null)
      : null;

    if (options.target.kind === 'root' && declarative && targetRootProgram) {
      const fitOrigins = rootPathProvenance
        ? createClosedFitOriginTracker()
        : undefined;
      const fittedRoot = fitClosedContent(
        declarative,
        root === 'main' ? 'root' : `root:${root}`,
        targetRootProgram,
        inputSlice.content,
        { fitOrigins, root },
        false,
        true
      );

      if (!fittedRoot) return false;
      if (
        fittedRoot.length !== inputSlice.content.length ||
        fittedRoot.some((node, index) => node !== inputSlice.content[index])
      ) {
        if (rootPathProvenance && fitOrigins) {
          rootPathProvenance.advance(
            inputSlice.content,
            fittedRoot,
            fitOrigins
          );
        }
        inputSlice = ContentSliceValue.closed(fittedRoot);
      }
    }

    if (
      inputSlice.openStart >
        getSliceEdgeOpenDepth(inputSlice.content, 'start') ||
      inputSlice.openEnd > getSliceEdgeOpenDepth(inputSlice.content, 'end')
    ) {
      return false;
    }

    const rootChildren = getDocumentRoot(value, root);
    const document = profileCoreDuration('slice-fit-target-index', () =>
      DocumentIndex.fromValue(rootChildren as readonly JsonNode[])
    );
    const rootPoint: Point = {
      offset: 0,
      path: [],
      ...(root === 'main' ? {} : { root }),
    };
    const at: Range =
      options.target.kind === 'root'
        ? { anchor: rootPoint, focus: rootPoint }
        : options.target.at;
    const [start, end] = RangeApi.edges(at);
    const exactBounds =
      options.target.kind === 'root'
        ? { from: 0, to: document.length }
        : options.target.exactBounds;
    const exactFrom = exactBounds?.from ?? document.positionAt(start);
    const exactTo = exactBounds?.to ?? document.positionAt(end);
    const collapsed = exactFrom === exactTo;
    const sameTextPath =
      start.path.length === end.path.length &&
      start.path.every((part, index) => part === end.path[index]);
    const targetText =
      sameTextPath && start.path.length > 0 ? document.node(start.path) : null;
    const boundaries =
      options.target.kind === 'root'
        ? []
        : profileCoreDuration('slice-fit-boundaries', () =>
            getBoundaryCandidates(
              at,
              rootChildren,
              document,
              inputSlice,
              targetRootProgram,
              rangeTarget?.contentBounds,
              exactBounds
            )
          );
    let variantFamilies: readonly SliceVariantFamily[] | undefined;
    const getTargetVariantFamilies = () =>
      (variantFamilies ??=
        options.target.kind === 'root'
          ? []
          : profileCoreDuration('slice-fit-variants', () =>
              getSliceVariantFamilies(
                inputSlice,
                at,
                root,
                rootChildren,
                targetRootProgram
              )
            ));
    type FitToken = (typeof document.tokens.tokens)[number];
    type FitOpenToken = Extract<FitToken, { kind: 'open' }>;

    const tokenLength = (token: FitToken) =>
      token.kind === 'text' ? token.text.length : 1;
    const contextsShareContent = (left: Element, right: Element) => {
      if (getElementType(left) === getElementType(right)) return true;

      const leftBehavior = getElementBehavior(left);
      const rightBehavior = getElementBehavior(right);

      return (
        !leftBehavior.inline &&
        !rightBehavior.inline &&
        elementUsesInlineContent(left) &&
        elementUsesInlineContent(right)
      );
    };
    const openTokenNode = (token: FitOpenToken): Descendant => {
      if (token.sourceNode) return token.sourceNode as Descendant;

      return token.nodeKind === 'text'
        ? ({ ...token.props, text: '' } as Text)
        : ({ ...token.props, children: [] } as unknown as Element);
    };
    const rootContainmentByKind = new Map<string, boolean>();
    const rootCanContain = (child: Descendant) => {
      const kind = NodeApi.isText(child)
        ? 'text'
        : `element:${getElementType(child) ?? ''}`;
      const cached = rootContainmentByKind.get(kind);

      if (cached !== undefined) return cached;
      const schema = getDeclarativeSchema();
      const rootContent = targetRootProgram;
      const allowed =
        schema && rootContent
          ? contentAllows(schema, rootContent, child)
          : ElementApi.isElement(child) && !getElementBehavior(child).inline;

      rootContainmentByKind.set(kind, allowed);

      return allowed;
    };
    const getOpenContext = (position: number): FitOpenToken[] =>
      profileCoreDuration('slice-fit-open-context', () =>
        document
          .openContextAt(position)
          .filter(({ from, to }) => from < position && position < to)
          .map(({ from }) => {
            const token = document.slice(from, from + 1).tokens[0];

            if (token?.kind !== 'open') {
              throw new Error(
                `Missing open token at document position ${from}.`
              );
            }

            return token;
          })
      );
    const openContextsMatch = (left: FitOpenToken, right: FitOpenToken) => {
      const leftNode = openTokenNode(left);
      const rightNode = openTokenNode(right);

      return NodeApi.isText(leftNode) && NodeApi.isText(rightNode)
        ? true
        : ElementApi.isElement(leftNode) &&
            ElementApi.isElement(rightNode) &&
            getElementType(leftNode) === getElementType(rightNode);
    };
    let startContext: FitOpenToken[] | undefined;
    let endContext: FitOpenToken[] | undefined;
    const getStartContext = () => (startContext ??= getOpenContext(exactFrom));
    const getEndContext = () => (endContext ??= getOpenContext(exactTo));
    const getLocalSyncPosition = () => {
      let sync = exactTo;
      let parentPath = end.path.slice(0, -1);

      while (parentPath.length > 0) {
        const parent = getDescendant(rootChildren, parentPath);

        if (!parent || !ElementApi.isElement(parent)) break;

        const childIndex = end.path[parentPath.length];

        if (
          !elementUsesInlineContent(parent) &&
          childIndex !== parent.children.length - 1
        ) {
          break;
        }

        sync = document.nodeRange(parentPath).to;
        parentPath = parentPath.slice(0, -1);
      }

      return sync;
    };
    const targetHasInlineAncestor = start.path
      .slice(0, -1)
      .map((_part, index) =>
        getDescendant(rootChildren, start.path.slice(0, index + 1))
      )
      .some(
        (node) => ElementApi.isElement(node) && getElementBehavior(node).inline
      );
    const createLocalTextCandidate = (
      variant: ContentSlice,
      cost: number,
      allowAsymmetric = false
    ): SliceFitCandidate | null => {
      if (!targetText || !NodeApi.isText(targetText)) return null;
      if (
        !allowAsymmetric &&
        inputSlice.openStart === inputSlice.openEnd &&
        variant.openStart !== variant.openEnd
      ) {
        return null;
      }
      if (
        variant.openStart === inputSlice.openStart &&
        variant.openStart > 1 &&
        start.offset === end.offset &&
        start.offset === targetText.text.length &&
        targetText.text.length > 0
      ) {
        return null;
      }

      const preparedOpenBlockCandidate = (() => {
        if (
          variant.openStart !== 1 ||
          variant.openEnd !== 1 ||
          start.path.length !== 2 ||
          !sameTextPath
        ) {
          return null;
        }

        const targetPath = start.path.slice(0, -1);
        const targetBlock = getDescendant(rootChildren, targetPath);

        if (
          !targetBlock ||
          !ElementApi.isElement(targetBlock) ||
          targetBlock.children.length !== 1 ||
          targetBlock.children[0] !== targetText
        ) {
          return null;
        }

        const firstSourceBlock = variant.content[0];
        if (
          !firstSourceBlock ||
          !ElementApi.isElement(firstSourceBlock) ||
          !rootCanContain(firstSourceBlock)
        )
          return null;
        const sourceBlocks = variant.content as readonly Element[];
        const targetType = getElementType(targetBlock);
        const targetElementKeys = Object.keys(targetBlock).filter(
          (key) => key !== 'children'
        );
        const targetTextKeys = Object.keys(targetText).filter(
          (key) => key !== 'text'
        );

        if (
          sourceBlocks.some((block) => {
            const text = ElementApi.isElement(block)
              ? block.children[0]
              : undefined;

            return (
              !NodeApi.isText(text) ||
              getElementType(block) !== targetType ||
              block.children.length !== 1 ||
              !nodePropertiesEqual(
                block,
                targetBlock,
                'children',
                targetElementKeys
              ) ||
              !nodePropertiesEqual(text, targetText, 'text', targetTextKeys)
            );
          })
        ) {
          return null;
        }

        const prefix = targetText.text.slice(0, start.offset);
        const suffix = targetText.text.slice(end.offset);

        if (!isDetachedContentSlice(variant)) return null;
        const fullInsert = encodeContentSliceContent(variant);

        if (!getPreparedDocumentSlice(fullInsert)) return null;
        const openInsert = encodeContentSlice(variant);
        const semanticInsert = openInsert.slice(1, openInsert.length - 1);
        const targetRange = document.nodeRange(targetPath);

        return Object.freeze({
          cost,
          from: targetRange.from,
          preparedOpenBlock: Object.freeze({
            fullInsert,
            prefix,
            semanticInsert,
            sourceBlocks: Object.freeze(sourceBlocks),
            suffix,
            targetPath: Object.freeze(targetPath),
          }),
          to: targetRange.to,
        });
      })();

      if (preparedOpenBlockCandidate) return preparedOpenBlockCandidate;

      let encoded = encodeContentSlice(variant);

      if (
        collapsed &&
        variant.openStart === 0 &&
        variant.openEnd === 0 &&
        start.path.length === 2 &&
        start.offset === 0 &&
        targetText.text.length === 0 &&
        getPreparedDocumentSlice(encoded) &&
        variant.content.every(rootCanContain)
      ) {
        const targetRange = document.nodeRange(start.path.slice(0, -1));

        return Object.freeze({
          cost,
          from: targetRange.from,
          insert: encoded,
          selectionOffset:
            encoded.length - getSliceEdgeOpenDepth(variant.content, 'end') - 1,
          to: targetRange.to,
        });
      }

      if (
        variant.openEnd === 0 &&
        start.offset === 0 &&
        start.offset === end.offset
      ) {
        const targetParent = getDescendant(
          rootChildren,
          start.path.slice(0, -1)
        );
        const terminal = variant.content.at(-1);

        if (
          targetParent &&
          ElementApi.isElement(targetParent) &&
          terminal &&
          ElementApi.isElement(terminal) &&
          getElementType(targetParent) === getElementType(terminal) &&
          encoded.tokens.at(-1)?.kind === 'close'
        ) {
          encoded = encoded.slice(0, encoded.length - 1);
        }
      }

      if (encoded.length === 0) return null;

      const output: FitToken[] = [];
      const localStartContext = getStartContext();
      const stack = [...localStartContext];
      let outputPosition = 0;
      let selectionPosition: number | null = null;
      const append = (token: FitToken) => {
        output.push(token);
        outputPosition += tokenLength(token);
      };
      const closeTop = () => {
        const top = stack.pop();

        if (!top) return false;

        append({ kind: 'close', nodeKind: top.nodeKind });

        return true;
      };
      const canCurrentContain = (child: Descendant) => {
        const parentToken = stack.at(-1);

        if (!parentToken) return rootCanContain(child);
        if (parentToken.nodeKind === 'text') return false;

        const parent = openTokenNode(parentToken);

        if (!ElementApi.isElement(parent)) return false;

        const blockTypes = parent.children
          .filter(
            (current): current is Element =>
              ElementApi.isElement(current) &&
              !getElementBehavior(current).inline
          )
          .map((current) => getElementType(current));
        const homogeneousType = blockTypes[0];

        if (
          !getCompiledElement(parent)?.content &&
          homogeneousType &&
          parent.children.some(
            (current) =>
              ElementApi.isElement(current) &&
              getElementType(current) === homogeneousType &&
              elementUsesInlineContent(current)
          ) &&
          blockTypes.every((type) => type === homogeneousType) &&
          ElementApi.isElement(child) &&
          !getElementBehavior(child).inline
        ) {
          return getElementType(child) === homogeneousType;
        }

        return canContain(parent, child);
      };
      const openFitted = (token: FitOpenToken) => {
        const child = openTokenNode(token);

        while (!canCurrentContain(child)) {
          if (!closeTop()) {
            return false;
          }
        }

        append(token);
        stack.push(token);

        return true;
      };

      if (variant.openStart > 0) {
        let children = variant.content;
        let preferred: Element | null = null;

        for (let depth = 0; depth < variant.openStart; depth++) {
          const node = children[0];

          if (!node || !ElementApi.isElement(node)) return null;
          preferred = node;
          children = node.children;
        }

        const targetDepth = start.path
          .slice(0, -1)
          .map((_part, index) =>
            getDescendant(rootChildren, start.path.slice(0, index + 1))
          )
          .findLastIndex(
            (node) =>
              preferred &&
              ElementApi.isElement(node) &&
              contextsShareContent(node, preferred)
          );

        if (targetDepth < 0) return null;

        while (stack.length > targetDepth + 1) {
          closeTop();
        }
      }

      if (
        variant.openStart === 0 &&
        variant.openEnd === 0 &&
        targetHasInlineAncestor
      ) {
        while (stack.length > 0) {
          const top = openTokenNode(stack.at(-1)!);

          if (
            NodeApi.isText(top) ||
            (ElementApi.isElement(top) && getElementBehavior(top).inline)
          ) {
            closeTop();
            continue;
          }

          break;
        }
      }

      const localEndContext = getEndContext();
      const endTextToken = localEndContext.findLast(
        (token) => token.nodeKind === 'text'
      );
      const ensureTextContext = () => {
        if (stack.at(-1)?.nodeKind === 'text') return true;

        if (stack.length === 0) {
          for (const token of localEndContext) {
            if (!openFitted(token)) return false;
            if (token.nodeKind === 'text') return true;
          }
        }

        const token =
          endTextToken ??
          ({ kind: 'open', nodeKind: 'text', props: {} } as FitOpenToken);

        return openFitted(token);
      };
      const process = (token: FitToken) => {
        if (token.kind === 'open') return openFitted(token);
        if (token.kind === 'close') {
          if (stack.length === 0) return true;

          return closeTop();
        }
        if (!ensureTextContext()) return false;

        append(token);

        return true;
      };
      const selectionFollowsInlineVoid = endsInInlineVoid(variant);
      const contentEnd = selectionFollowsInlineVoid
        ? encoded.length
        : getContentEndOffset(encoded);
      let insertedPosition = 0;

      for (const token of encoded.tokens) {
        if (!process(token)) return null;

        insertedPosition += tokenLength(token);
        if (selectionPosition === null && insertedPosition >= contentEnd) {
          selectionPosition = outputPosition - (insertedPosition - contentEnd);
        }
      }

      selectionPosition ??= outputPosition;

      const syncPosition = getLocalSyncPosition();
      const expected =
        syncPosition === exactTo
          ? localEndContext
          : getOpenContext(syncPosition);
      const sourceAlreadyAtSync =
        allowAsymmetric &&
        stack.length === expected.length &&
        stack.every((token, index) =>
          openContextsMatch(token, expected[index]!)
        );

      if (
        !sourceAlreadyAtSync &&
        stack.length > 0 &&
        stack.length < localEndContext.length &&
        stack.every((token, index) =>
          openContextsMatch(token, localEndContext[index]!)
        )
      ) {
        for (
          let index = stack.length;
          index < localEndContext.length;
          index++
        ) {
          append(localEndContext[index]!);
          stack.push(localEndContext[index]!);
        }
      }

      if (!sourceAlreadyAtSync) {
        for (const token of document.tokens.slice(exactTo, syncPosition)
          .tokens) {
          if (!process(token)) return null;
        }
      }

      let shared = 0;

      while (shared < stack.length && shared < expected.length) {
        if (!openContextsMatch(stack[shared]!, expected[shared]!)) break;
        shared++;
      }

      while (stack.length > shared) closeTop();
      for (let index = shared; index < expected.length; index++) {
        append(expected[index]!);
        stack.push(expected[index]!);
      }

      let candidateFrom = exactFrom;
      let candidateOutput = output;
      let removedPrefixLength = 0;

      for (const boundary of boundaries) {
        if (boundary.from >= exactFrom || boundary.to !== exactTo) continue;
        const opened = document.tokens.slice(boundary.from, exactFrom).tokens;

        if (
          opened.length === 0 ||
          !opened.every((token) => token.kind === 'open') ||
          !opened.every((_token, index) => {
            const close = output[index];
            const open = opened.at(-(index + 1));

            return (
              close?.kind === 'close' &&
              open?.kind === 'open' &&
              close.nodeKind === open.nodeKind
            );
          })
        ) {
          continue;
        }

        candidateFrom = boundary.from;
        removedPrefixLength = opened.length;
        candidateOutput = output.slice(opened.length);
        break;
      }

      return Object.freeze({
        cost,
        from: candidateFrom,
        insert: PreparedTokenSlice.fromTokens(candidateOutput),
        ...(selectionFollowsInlineVoid
          ? { selectionAssociation: 1 as const }
          : {}),
        selectionOffset: selectionPosition - removedPrefixLength,
        to: syncPosition,
      });
    };

    const targetParent = getDescendant(rootChildren, start.path.slice(0, -1));
    const sourceEdges = [inputSlice.content[0], inputSlice.content.at(-1)];
    const sourceSharesTargetContent =
      ElementApi.isElement(targetParent) &&
      sourceEdges.some(
        (edge) =>
          ElementApi.isElement(edge) &&
          (getElementType(edge) === getElementType(targetParent) ||
            (NodeApi.string(edge).length > 0 &&
              contextsShareContent(targetParent, edge)))
      );
    const hasContextualStructuralVariant = () =>
      getTargetVariantFamilies().some((family) => family.priority < 0);
    const preserveClosedInlineBoundary =
      inputSlice.openStart === 0 &&
      inputSlice.openEnd === 0 &&
      targetHasInlineAncestor;
    const preserveClosedStructuralBoundary =
      sourceSlice.openStart === 0 &&
      sourceSlice.openEnd === 0 &&
      inputSlice.content.every(rootCanContain) &&
      !sourceSharesTargetContent;
    const shouldGenerateLocalCandidate = () =>
      !exactBounds &&
      sameTextPath &&
      inputSlice.content.length > 0 &&
      ((hasContextualStructuralVariant() &&
        start.path.length > 2 &&
        Boolean(targetText && NodeApi.isText(targetText) && targetText.text)) ||
        (inputSlice.openStart !== inputSlice.openEnd &&
          start.path.length > 2) ||
        (inputSlice.openStart === 1 &&
          inputSlice.openEnd === 1 &&
          start.path.length === 2) ||
        (inputSlice.content.length > 1 && start.path.length > 2) ||
        (inputSlice.openStart > 0 && targetHasInlineAncestor) ||
        (!collapsed && targetHasInlineAncestor) ||
        (inputSlice.openStart === 0 &&
          inputSlice.openEnd === 0 &&
          Boolean(
            targetText &&
              NodeApi.isText(targetText) &&
              (targetText.text
                ? sourceSharesTargetContent
                  ? start.offset > 0 || end.offset < targetText.text.length
                  : start.offset > 0 && end.offset < targetText.text.length
                : sourceSharesTargetContent && start.path.length > 2)
          )));
    const preferOpenVariants =
      !preserveClosedInlineBoundary &&
      !preserveClosedStructuralBoundary &&
      (!collapsed ||
        (start.offset > 0 &&
          targetText &&
          NodeApi.isText(targetText) &&
          start.offset < targetText.text.length) ||
        sourceSharesTargetContent);

    const getInsertionContent = (variant: ContentSlice) => {
      if (variant.openStart !== variant.openEnd) return null;

      let content = variant.content;

      for (let depth = 0; depth < variant.openStart; depth++) {
        const node = content.length === 1 ? content[0] : null;

        if (!node || !ElementApi.isElement(node)) return null;
        content = node.children;
      }

      return content;
    };
    const canInsertContentAtBoundary = (
      boundary: SliceBoundaryCandidate,
      content: readonly Descendant[]
    ) => {
      if (content.length === 0) return true;
      if (
        !exactBounds &&
        boundary.from === exactFrom &&
        boundary.to === exactTo &&
        sameTextPath
      ) {
        const parent = getDescendant(rootChildren, start.path.slice(0, -1));

        return (
          Boolean(parent && ElementApi.isElement(parent)) &&
          content.every((child) => canContain(parent as Element, child))
        );
      }

      const from = document.childBoundaryAt(boundary.from);
      const to = document.childBoundaryAt(boundary.to);

      if (
        !from ||
        !to ||
        from.parentPath.length !== to.parentPath.length ||
        from.parentPath.some((part, index) => part !== to.parentPath[index])
      ) {
        return false;
      }
      const schema = getDeclarativeSchema();
      const parent =
        from.parentPath.length === 0
          ? null
          : getDescendant(rootChildren, from.parentPath);
      const parentChildren = parent
        ? ElementApi.isElement(parent)
          ? parent.children
          : null
        : rootChildren;

      if (!parentChildren) return false;
      const nextChildren = [
        ...parentChildren.slice(0, from.index),
        ...content,
        ...parentChildren.slice(to.index),
      ];

      if (!schema) {
        if (parent) {
          if (!ElementApi.isElement(parent)) return false;

          return content.every((child) => canContain(parent, child));
        }

        if (options.target.kind === 'root') return true;

        return content.every((child) => {
          if (!ElementApi.isElement(child)) return false;

          return !getElementBehavior(child).inline;
        });
      }

      if (parent && !ElementApi.isElement(parent)) return false;
      const parentType = parent ? getElementType(parent) : null;
      const program = parentType
        ? schema.elements.byType.get(parentType)?.content
        : targetRootProgram;

      if (!program) return false;

      const fitted = fitDirectContent(schema, program, nextChildren, [], {
        ancestors:
          parent && ElementApi.isElement(parent)
            ? getElementAncestors(rootChildren, from.parentPath, {
                includeTarget: true,
              })
            : [],
        root,
      });

      return Boolean(
        fitted &&
          fitted.length === nextChildren.length &&
          fitted.every((child, index) => child === nextChildren[index])
      );
    };
    const materializeCandidate = (
      candidate: SliceFitCandidate
    ): MaterializedSliceFitCandidate => {
      if ('insert' in candidate) return candidate;
      const { preparedOpenBlock, ...base } = candidate;
      const {
        fullInsert,
        prefix,
        semanticInsert,
        sourceBlocks,
        suffix,
        targetPath,
      } = preparedOpenBlock;
      const mergeText = (block: Element, text: string): Element => {
        const sourceText = block.children[0];

        if (!sourceText || !NodeApi.isText(sourceText)) {
          throw new Error('Prepared open block fit requires one text leaf.');
        }

        const children: Descendant[] = [Object.freeze({ ...sourceText, text })];

        Object.freeze(children);

        return Object.freeze({ ...block, children });
      };
      const first = sourceBlocks[0];
      const last = sourceBlocks.at(-1);

      if (!first || !last) {
        throw new Error('Prepared open block fit requires source blocks.');
      }
      const firstText = first.children[0];
      const lastText = last.children[0];

      if (
        !firstText ||
        !lastText ||
        !NodeApi.isText(firstText) ||
        !NodeApi.isText(lastText)
      ) {
        throw new Error('Prepared open block fit requires text boundaries.');
      }

      const preparedContent: readonly Descendant[] =
        prefix.length === 0 && suffix.length === 0
          ? sourceBlocks
          : sourceBlocks.length === 1
            ? [mergeText(first, prefix + firstText.text + suffix)]
            : [
                mergeText(first, prefix + firstText.text),
                ...sourceBlocks.slice(1, -1),
                mergeText(last, lastText.text + suffix),
              ];

      Object.freeze(preparedContent);
      const insert =
        prefix.length === 0 && suffix.length === 0
          ? fullInsert
          : PreparedTokenSlice.fromPreparedNodes(preparedContent);
      const targetIndex = targetPath[0]!;
      const lastIndex = targetIndex + preparedContent.length - 1;
      const runtimeCandidatePaths: Array<readonly number[]> = [
        Object.freeze([targetIndex]),
        Object.freeze([targetIndex, 0]),
      ];

      if (lastIndex !== targetIndex) {
        runtimeCandidatePaths.push(
          Object.freeze([lastIndex]),
          Object.freeze([lastIndex, 0])
        );
      }
      Object.freeze(runtimeCandidatePaths);

      return Object.freeze({
        ...base,
        insert,
        runtimeCandidatePaths,
        semanticChange: Object.freeze({
          from: exactFrom,
          insert: semanticInsert,
          to: exactTo,
        }),
        selectionOffset:
          insert.length -
          suffix.length -
          getSliceEdgeOpenDepth(preparedContent, 'end') -
          1,
        trustedCanonical: true,
      });
    };
    const getStructuralContext = (position: number) =>
      document
        .openContextAt(position)
        .filter((entry) => entry.from < position && position < entry.to)
        .map((entry) => entry.kind);
    const isStructurallyApplicable = (candidate: SliceFitCandidate) => {
      if ('preparedOpenBlock' in candidate) {
        const from = document.childBoundaryAt(candidate.from);
        const to = document.childBoundaryAt(candidate.to);

        if (
          !from ||
          !to ||
          from.parentPath.length !== to.parentPath.length ||
          from.parentPath.some((part, index) => part !== to.parentPath[index])
        ) {
          return false;
        }

        const parent =
          from.parentPath.length === 0
            ? null
            : getDescendant(rootChildren, from.parentPath);

        return candidate.preparedOpenBlock.sourceBlocks.every((child) =>
          parent && ElementApi.isElement(parent)
            ? canContain(parent, child)
            : rootCanContain(child)
        );
      }

      const prepared = getPreparedDocumentSlice(candidate.insert);

      if (prepared) {
        const from = document.childBoundaryAt(candidate.from);
        const to = document.childBoundaryAt(candidate.to);

        if (
          !from ||
          !to ||
          from.parentPath.length !== to.parentPath.length ||
          from.parentPath.some((part, index) => part !== to.parentPath[index])
        ) {
          return false;
        }

        const parent =
          from.parentPath.length === 0
            ? null
            : getDescendant(rootChildren, from.parentPath);

        return prepared.nodes.every(
          (child) =>
            NodeApi.isDescendant(child) &&
            (parent && ElementApi.isElement(parent)
              ? canContain(parent, child)
              : rootCanContain(child))
        );
      }

      const stack = [...getStructuralContext(candidate.from)];

      for (const token of candidate.insert.tokens) {
        if (token.kind === 'open') {
          if (stack.at(-1) === 'text') return false;
          stack.push(token.nodeKind);
          continue;
        }
        if (token.kind === 'text') {
          if (stack.at(-1) !== 'text') return false;
          continue;
        }
        if (stack.pop() !== token.nodeKind) return false;
      }

      const expected = getStructuralContext(candidate.to);

      return (
        stack.length === expected.length &&
        stack.every((kind, index) => kind === expected[index])
      );
    };

    const createSeeds = () =>
      profileCoreDuration('slice-fit-candidate-scoring', () => {
        const result: SliceFitSeed[] = [];

        for (const family of getTargetVariantFamilies()) {
          if (shouldGenerateLocalCandidate()) {
            result.push({
              boundary: null,
              boundaryIndex: -1,
              family,
              kind: 'local',
              openEnd: preferOpenVariants
                ? family.maxOpenEnd
                : family.baseOpenEnd,
              openStart: preferOpenVariants
                ? family.maxOpenStart
                : family.baseOpenStart,
            });
          }

          boundaries.forEach((boundary, boundaryIndex) => {
            result.push({
              boundary,
              boundaryIndex,
              family,
              kind: 'structural',
              openEnd: family.baseOpenEnd,
              openStart: family.baseOpenStart,
            });
          });
        }

        return result;
      });

    const createStructuralCandidates = (
      boundary: SliceBoundaryCandidate,
      variant: SliceVariant,
      cost: number
    ) => {
      const sourceSpine = (depth: number, edge: 'end' | 'start'): Element[] => {
        const result: Element[] = [];
        let children = variant.slice.content;

        for (let index = 0; index < depth; index++) {
          const node = edge === 'start' ? children[0] : children.at(-1);

          if (!node || !ElementApi.isElement(node)) return [];
          result.push(node);
          children = node.children;
        }

        return result;
      };
      const matchesTargetContext = (
        depth: number,
        edge: 'end' | 'start',
        position: number
      ) => {
        if (depth === 0) return true;
        const source = sourceSpine(depth, edge);
        const target = getOpenContext(position)
          .map(openTokenNode)
          .filter((node): node is Element => ElementApi.isElement(node));

        if (source.length !== depth) {
          return false;
        }
        const preferred = source.at(-1)!;

        return target.some((targetNode) => {
          const sameType =
            getElementType(targetNode) === getElementType(preferred);

          return (
            contextsShareContent(targetNode, preferred) &&
            (!getElementSlicePolicy(targetNode).preserveContext || sameType)
          );
        });
      };

      if (
        !matchesTargetContext(
          variant.slice.openStart,
          'start',
          boundary.from
        ) ||
        !matchesTargetContext(variant.slice.openEnd, 'end', boundary.to)
      ) {
        return [];
      }

      const insertionContent = getInsertionContent(variant.slice);

      if (
        insertionContent &&
        !canInsertContentAtBoundary(boundary, insertionContent)
      ) {
        return [];
      }

      const encoded = encodeContentSlice(variant.slice);
      const contextInsert = restorePartiallyDeletedContext(
        document,
        rootChildren,
        start,
        end,
        boundary,
        exactFrom,
        exactTo,
        encoded
      );
      const inserts =
        contextInsert.insert === encoded
          ? [contextInsert]
          : [
              contextInsert,
              {
                insert: encoded,
                selectionOffset: getContentEndOffset(encoded),
              },
            ];

      if (
        boundary.from === exactFrom &&
        boundary.to === exactTo &&
        targetText &&
        NodeApi.isText(targetText)
      ) {
        const { text: _text, ...properties } = targetText;
        const closeTarget = PreparedTokenSlice.fromJSON([
          { kind: 'close', nodeKind: 'text' },
        ]);
        const openTarget = PreparedTokenSlice.fromJSON([
          { kind: 'open', nodeKind: 'text', props: properties },
        ]);

        inserts.unshift({
          insert: PreparedTokenSlice.concat([closeTarget, encoded, openTarget]),
          selectionOffset: closeTarget.length + getContentEndOffset(encoded),
        });
      }

      return (
        endsInInlineVoid(variant.slice)
          ? inserts.map(({ insert }) => ({
              insert,
              selectionAssociation: 1 as const,
              selectionOffset: insert.length,
            }))
          : inserts
      ).map(
        ({ insert, selectionOffset }): SliceFitCandidate => ({
          cost,
          from: boundary.from,
          insert,
          selectionOffset,
          to: boundary.to,
        })
      );
    };

    const directLocalCandidate =
      inputSlice.openStart === 1 && inputSlice.openEnd === 1
        ? createLocalTextCandidate(inputSlice, 0)
        : null;
    const selectedCandidate: SliceFitCandidate | null =
      options.target.kind === 'root'
        ? (() => {
            const insert = encodeContentSlice(inputSlice);

            return Object.freeze({
              cost: 0,
              from: 0,
              insert,
              selectionOffset: getContentEndOffset(insert),
              to: document.length,
            });
          })()
        : directLocalCandidate &&
            'preparedOpenBlock' in directLocalCandidate &&
            isStructurallyApplicable(directLocalCandidate)
          ? {
              ...directLocalCandidate,
              ...(preparedInput
                ? { preparation: preparedInput.preparation }
                : {}),
            }
          : selectSliceFitCandidate({
              candidates: ({ state, variant }) => {
                if (state.kind === 'local') {
                  const candidate = profileCoreDuration(
                    'slice-fit-local-candidates',
                    () =>
                      createLocalTextCandidate(
                        variant.slice,
                        state.cost,
                        state.family.priority < 0
                      )
                  );

                  if (candidate && isStructurallyApplicable(candidate)) {
                    return [
                      state.family.index === 0
                        ? {
                            ...candidate,
                            ...(preparedInput
                              ? {
                                  preparation: preparedInput.preparation,
                                }
                              : {}),
                          }
                        : candidate,
                    ];
                  }

                  return [];
                }

                const candidates = profileCoreDuration(
                  'slice-fit-structural-candidates',
                  () =>
                    createStructuralCandidates(
                      state.boundary!,
                      variant,
                      state.cost
                    )
                );

                const structurallyApplicable = candidates.filter(
                  isStructurallyApplicable
                );

                return state.family.index === 0
                  ? structurallyApplicable.map((candidate) => ({
                      ...candidate,
                      ...(preparedInput
                        ? {
                            preparation: preparedInput.preparation,
                          }
                        : {}),
                    }))
                  : structurallyApplicable;
              },
              exactFrom,
              inputSlice,
              preferOpenVariants,
              seeds: createSeeds(),
            });

    if (!selectedCandidate) return false;
    const materializedCandidate = profileCoreDuration(
      'slice-fit-candidate-materialize',
      () => materializeCandidate(selectedCandidate)
    );
    const candidate = materializedCandidate.preparation
      ? Object.freeze({
          ...materializedCandidate,
          preparation: bindCanonicalFitPreparation(
            materializedCandidate.preparation,
            materializedCandidate.insert
          ),
        })
      : materializedCandidate;

    const canonicalRootChange = profileCoreDuration(
      'slice-fit-changeset-build',
      () =>
        options.target.kind === 'root' &&
        candidate.from === 0 &&
        candidate.to === document.length
          ? reconcileChildrenStep(
              document,
              [],
              0,
              document.value.length,
              inputSlice.content as readonly JsonNode[]
            ).change
          : RootChange.create(document, {
              from: candidate.from,
              insert: candidate.insert,
              to: candidate.to,
            })
    );
    const rootChange = candidate.semanticChange
      ? RootChange.create(document, candidate.semanticChange)
      : canonicalRootChange;

    if (
      options.target.kind === 'range' &&
      rootChange.empty &&
      (inputSlice.content.length > 0 || exactFrom !== exactTo)
    ) {
      return false;
    }

    const candidateChange = createInternalDocumentChange(
      rootChange.empty ? new Map() : new Map([[root, rootChange]]),
      {
        ...(missingRoot ? { createRoots: [root] } : {}),
      }
    );
    const rootInputMatchesTarget =
      options.target.kind === 'root' &&
      !missingRoot &&
      structurallyEqual(rootChildren, inputSlice.content);
    const rawChange = rootInputMatchesTarget
      ? DocumentChange.empty
      : candidateChange;
    const rootFitProvenance =
      options.target.kind === 'root' &&
      options.target.selection &&
      rootPathProvenance
        ? Object.freeze({
            paths: rootPathProvenance,
            rawDocument: rootInputMatchesTarget
              ? document
              : rootChange.apply(document),
            sourceDocument: DocumentIndex.fromValue(sourceSlice.content),
          })
        : null;
    let fittedDocument: ReturnType<typeof prepareFittedDocument>;
    const protectedInlineSpacerPaths =
      options.target.kind === 'root' &&
      options.target.selection &&
      rootFitProvenance
        ? (() => {
            const provenance = rootFitProvenance;
            const points = [
              options.target.selection.anchor,
              options.target.selection.focus,
            ].flatMap((point) => {
              const sourcePoint = resolveExternalDocumentPoint(
                sourceSlice.content,
                provenance.sourceDocument,
                point
              );

              if (!sourcePoint) return [];
              const mapped = provenance.paths.mapPoint(
                sourcePoint,
                provenance.sourceDocument,
                provenance.rawDocument,
                -1
              );

              return mapped
                ? [{ offset: mapped.offset, path: [...mapped.path] }]
                : [];
            });

            return getProtectedInlineSpacerEntries(
              getEditor(),
              provenance.rawDocument.value as readonly Descendant[],
              points,
              api
            ).map(({ path }) => path);
          })()
        : undefined;
    const fitPreparation =
      options.target.kind === 'root'
        ? prepareCanonicalRootFit(
            getDeclarativeSchema(),
            getDeclarativeSchema,
            root,
            protectedInlineSpacerPaths
          )
        : candidate.preparation;

    try {
      fittedDocument = profileCoreDuration('slice-fit-canonicalize', () =>
        prepareFittedDocument(
          options.builder.fork(),
          rawChange,
          fitPreparation,
          candidate.trustedCanonical
            ? {
                createIndexes: () =>
                  new Map([[root, canonicalRootChange.apply(document)]]),
                runtimeCandidatePaths: new Map([
                  [root, candidate.runtimeCandidatePaths ?? Object.freeze([])],
                ]),
              }
            : undefined
        )
      );
    } catch (error) {
      if (
        error instanceof PreparedTokenSliceStructureError ||
        error instanceof EditorSchemaValidationError
      ) {
        return false;
      }

      throw error;
    }

    const { canonicalIndexes, constructionChange, prepared, rawIndexes } =
      fittedDocument;
    const rawIndex =
      rawIndexes.get(root) ?? rootFitProvenance?.rawDocument ?? null;
    const canonicalIndex = canonicalIndexes.get(root) ?? rawIndex;

    const point =
      options.target.kind === 'range'
        ? profileCoreDuration('slice-fit-selection-map', () => {
            if (!rawIndex || !canonicalIndex) {
              throw new Error('Fitted range did not retain its root indexes.');
            }
            const rawSelectionPosition =
              candidate.from + candidate.selectionOffset;

            return mapFittedSelectionPoint(
              rawIndex,
              canonicalIndex,
              constructionChange,
              root,
              rawSelectionPosition,
              candidate.selectionAssociation
            );
          })
        : null;

    const externalSelection =
      options.target.kind === 'root' && options.target.selection
        ? rootFitProvenance && rawIndex && canonicalIndex
          ? mapExternalRootSelection(
              options.target.selection,
              sourceSlice.content,
              rootFitProvenance.paths,
              constructionChange,
              root,
              rawIndex,
              canonicalIndex
            )
          : null
        : null;

    if (
      options.target.kind === 'root' &&
      options.target.selection &&
      !externalSelection
    ) {
      return false;
    }

    const selection = externalSelection
      ? externalSelection
      : point
        ? cloneFrozen(
            SelectionApi.text({
              anchor: {
                offset: point.offset,
                path: [...point.path],
                ...(root === 'main' ? {} : { root }),
              },
              focus: {
                offset: point.offset,
                path: [...point.path],
                ...(root === 'main' ? {} : { root }),
              },
            })
          )
        : undefined;
    const step = options.builder.adopt(prepared);

    if (!step) {
      throw new Error('Prepared slice fit does not match its transaction.');
    }

    options.apply?.(step, selection);

    return true;
  };

  const fitDocument = <TValue extends Value>(
    input: EditorDocumentValue<TValue>
  ): EditorDocumentValue<V> => {
    assertEditorJsonValue(input, 'Editor schema document');

    const inputRoots = input.roots ?? {};
    const initial = cloneFrozen({
      children: [],
      ...(input.meta !== undefined ? { meta: input.meta } : {}),
    }) as JsonEditorValue;
    const builder = new ChangeDraft(initial, {
      construct: ({ after, change }, preparation) =>
        constructCanonicalDocumentChange(getEditor(), after, change, {
          fitPreparation: preparation,
          schema: api,
        }),
      indexConstructedRoot,
      isSetValued: (node, key, context) =>
        isSetValuedProperty(node, key, context),
      preparationAuthority: api,
      preparationRevision: () => api,
    });
    const roots = new Map<string, readonly Descendant[]>([
      ['main', input.children],
      ...Object.entries(inputRoots).sort(([left], [right]) =>
        left.localeCompare(right)
      ),
    ]);

    for (const root of getVocabulary().rootNames) {
      if (getRootContent(root, input)?.min)
        roots.set(root, inputRoots[root] ?? []);
    }

    const collectProjectedRoots = (children: readonly Descendant[]) => {
      for (const node of children) {
        if (!ElementApi.isElement(node)) continue;

        for (const root of Object.values(getElementContentRoots(node))) {
          if (!roots.has(root)) roots.set(root, inputRoots[root] ?? []);
        }
        collectProjectedRoots(node.children);
      }
    };

    collectProjectedRoots(input.children);
    for (const children of Object.values(inputRoots)) {
      collectProjectedRoots(children);
    }

    const fitRoot = (root: string, children: readonly Descendant[]) => {
      const fitted = fit(ContentSliceValue.closed(children), {
        builder,
        target: { kind: 'root', root },
      });

      if (!fitted) {
        validateDocument(input);
        throw new EditorSchemaValidationError(
          `Editor ${
            root === 'main' ? 'primary root' : `root "${root}"`
          } cannot fit external content.`
        );
      }
    };

    for (const [root, children] of roots) fitRoot(root, children);

    // Projected root grammar depends on its owning element. Refit after every
    // input root exists so nested projections use their final compiled policy.
    for (const [root, children] of roots) fitRoot(root, children);

    builder.finalize();
    const document = builder.value as EditorDocumentValue<V>;

    validateDocument(document);
    return document;
  };

  return Object.freeze({
    fit,
    fitContent,
    fitDocument,
    findWrapping,
    revision,
    schema,
  });
};

export const createCompiledSliceFitterDelegate = <V extends Value>(
  getDependencies: () => SliceFitterDependencies<V>
): SliceFitterDelegate<V> => {
  let compiled: CompiledSliceFitter<V> | null = null;
  const getCompiled = () => {
    const dependencies = getDependencies();

    if (
      compiled?.schema !== dependencies.schema ||
      compiled.revision !== dependencies.revision
    ) {
      compiled = compileSliceFitter(dependencies);
    }

    return compiled;
  };

  return Object.freeze({
    fit: (slice, options) => getCompiled().fit(slice, options),
    fitContent: (slice, options) => getCompiled().fitContent(slice, options),
    fitDocument: (input) => getCompiled().fitDocument(input),
    findWrapping: (parent, child) => getCompiled().findWrapping(parent, child),
  });
};
