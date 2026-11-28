import type {
  Descendant,
  AnyEditor as Editor,
  EditorDocumentValue,
  EditorSchemaVocabulary,
  Element,
  NamedRootKey,
  Range,
  RootKey,
  Selection,
  Value,
} from '../interfaces';
import { ElementApi, NodeApi, SelectionApi } from '../interfaces';
import { ChangeDraft } from './change/builder';
import { isDocumentRootKey } from './change/document-change';
import type { DocumentIndex } from './change/document-index';
import type { DocumentPropertyContext, RootChange } from './change/root-change';
import type { JsonEditorValue, JsonNode } from './change/tokens';
import { cloneFrozen } from './clone';
import { ContentSlice as ContentSliceValue } from './content-slice';
import {
  getEditorDocumentShapeIssueMessage,
  readEditorDocument,
} from './document-shape';
import {
  getValueRecords,
  hasValueRecords,
  showValueRecords,
  withValueRecords,
} from './record-store';
import {
  constructCanonicalDocumentChange,
  isLoadedDocumentCanonical,
  type RepresentationSchema,
} from './representation';
import type {
  CompiledEditorSchema,
  CompiledSchemaContentProgram,
} from './schema-compiler';
import { EditorSchemaValidationError } from './schema-validation';
import type { SliceFitterDelegate } from './slice-fit/compiled-slice-fitter';
import {
  type EditorSchemaFitReport,
  EditorSchemaFitRepairCollector,
  type EditorSchemaRepair,
  type RepresentationRepairEvent,
  resolveRepresentationRepairs,
  type RootCanonicalizationPass,
  schemaModelLocation,
  schemaRepair,
} from './slice-fit/fit-report';
import {
  createRootFitPathProvenance,
  type FitInputPaths,
} from './slice-fit/provenance';
import { assertEditorJsonValue, snapshotEditorJsonValue } from './value-codec';

type FitSelectionInput = Readonly<{
  root: RootKey;
  selection: NonNullable<Selection>;
}>;

export type FitDocumentPositions = Readonly<{
  ranges: readonly Range[];
  selection?: FitSelectionInput;
}>;

export type FittedDocumentPositions<V extends Value = Value> = Readonly<{
  document: EditorDocumentValue<V>;
  ranges: ReadonlyArray<Range | null>;
  selection?: NonNullable<Selection>;
}>;

type FitPositions = Readonly<{
  ranges?: readonly Range[];
  omitSelectionSpacers?: true;
  selection?: FitSelectionInput;
}>;

export type CompiledDocumentFitter<V extends Value = Value> = Readonly<{
  fitDocument: <TValue extends Value>(
    input: EditorDocumentValue<TValue>
  ) => EditorDocumentValue<V>;
  fitDocumentRaw: <TValue extends Value>(
    input: EditorDocumentValue<TValue>
  ) => EditorDocumentValue<V>;
  fitDocumentWithReport: <TValue extends Value>(
    input: EditorDocumentValue<TValue>
  ) => EditorSchemaFitReport<V>;
  fitDocumentWithSelection: <TValue extends Value>(
    input: EditorDocumentValue<TValue>,
    options: Readonly<{
      root: RootKey;
      selection: NonNullable<Selection>;
    }>
  ) => Readonly<{
    document: EditorDocumentValue<V>;
    selection: NonNullable<Selection>;
  }>;
  fitDocumentAndMapPositions: <TValue extends Value>(
    input: EditorDocumentValue<TValue>,
    options: FitDocumentPositions
  ) => FittedDocumentPositions<V>;
  revision: number;
  schema: CompiledEditorSchema | null;
}>;

type DocumentFitterDependencies<V extends Value> = Readonly<{
  collectPropertyRepairs: (
    input: readonly Descendant[],
    output: readonly Descendant[],
    root: RootKey,
    inputPaths: FitInputPaths
  ) => readonly EditorSchemaRepair[];
  fit: SliceFitterDelegate['fit'];
  fitDirectContent: SliceFitterDelegate['fitDirectContent'];
  generateReservedElementId?: () => string | undefined;
  getDescendant: (
    children: readonly Descendant[],
    path: readonly number[]
  ) => Descendant | null;
  getDocumentRoot: (
    value: EditorDocumentValue,
    root: string
  ) => readonly Descendant[];
  getEditor: () => Editor<V>;
  getElementContentRoots: (
    element: Element
  ) => Readonly<Record<string, NamedRootKey>>;
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
  loadElementIds?: (incoming: EditorDocumentValue) => Readonly<{
    fill: (
      document: EditorDocumentValue
    ) => Readonly<{ value: EditorDocumentValue }> | null;
    withStandInIds: <T>(read: () => T) => T;
  }> | null;
  observeRootCanonicalization: <T>(
    root: RootKey,
    run: () => T
  ) => Readonly<{
    events: readonly RepresentationRepairEvent[];
    passes: readonly RootCanonicalizationPass[];
    value: T;
  }>;
  revision: number;
  schema: CompiledEditorSchema | null;
  schemaApi: RepresentationSchema;
  validateDocument: (value: EditorDocumentValue) => void;
  withDocumentOwnershipTracker: <T>(
    initial: EditorDocumentValue,
    run: (
      beginRoot: (root: RootKey) => void,
      syncRoot: (root: RootKey, value: EditorDocumentValue) => void
    ) => T
  ) => T;
  withoutGeneration: <T>(read: () => T) => T;
}>;

export type DocumentFitterDelegate<V extends Value = Value> = Pick<
  CompiledDocumentFitter<V>,
  | 'fitDocument'
  | 'fitDocumentRaw'
  | 'fitDocumentWithReport'
  | 'fitDocumentAndMapPositions'
  | 'fitDocumentWithSelection'
>;

export const compileDocumentFitter = <V extends Value>(
  dependencies: DocumentFitterDependencies<V>
): CompiledDocumentFitter<V> => {
  const {
    collectPropertyRepairs,
    fit,
    fitDirectContent,
    generateReservedElementId,
    getDescendant,
    getDocumentRoot,
    getEditor,
    getElementContentRoots,
    getRootContent,
    getVocabulary,
    indexConstructedRoot,
    isSetValuedProperty,
    loadElementIds,
    observeRootCanonicalization,
    revision,
    schema,
    schemaApi: api,
    validateDocument,
    withDocumentOwnershipTracker,
    withoutGeneration,
  } = dependencies;

  const fitKeepsSelection = (
    document: EditorDocumentValue,
    {
      root,
      selection,
    }: Readonly<{ root: RootKey; selection: NonNullable<Selection> }>
  ) => {
    if (root !== 'main' && !Object.hasOwn(document.roots ?? {}, root)) {
      return false;
    }

    const children = getDocumentRoot(document, root);
    const namesRoot = (named: RootKey | undefined, unnamed: RootKey) =>
      (named ?? unnamed) === root;

    if (SelectionApi.isNode(selection)) {
      return (
        namesRoot(selection.root, 'main') &&
        selection.paths.every((path) => getDescendant(children, path) !== null)
      );
    }
    const text = Object.hasOwn(selection, 'kind')
      ? selection
      : SelectionApi.text(selection);

    if (!SelectionApi.isText(text)) return false;

    return [text.anchor, text.focus].every((point) => {
      const node = getDescendant(children, point.path);

      return (
        namesRoot(point.root, root) &&
        node !== null &&
        NodeApi.isText(node) &&
        point.offset <= node.text.length
      );
    });
  };

  const placesEachNodeOnce = (document: EditorDocumentValue) => {
    const placed = new Set<object>();
    const places = (children: readonly Descendant[]): boolean =>
      children.every((node) => {
        if (placed.has(node)) return false;
        placed.add(node);

        return !ElementApi.isElement(node) || places(node.children);
      });

    return (
      places(document.children) &&
      Object.values(document.roots ?? {}).every(places)
    );
  };

  const ownDocument = (raw: EditorDocumentValue) => {
    const { records, roots, ...value } = raw;
    const named = Object.entries(roots ?? {});
    const owned = snapshotEditorJsonValue(
      {
        ...value,
        children: [...value.children],
        ...(named.length > 0
          ? {
              roots: Object.fromEntries(
                named.map(([root, children]) => [root, [...children]])
              ),
            }
          : {}),
      },
      'Editor schema document'
    );

    if (records !== undefined) {
      snapshotEditorJsonValue(records, 'Editor schema document');

      return Object.freeze(
        showValueRecords({ ...owned }, getValueRecords(raw))
      ) as unknown as EditorDocumentValue<V>;
    }

    const store = getValueRecords(raw);

    return (Object.keys(store).length > 0
      ? withValueRecords(owned, store)
      : owned) as unknown as EditorDocumentValue<V>;
  };

  const reuseCanonicalDocument = (
    raw: EditorDocumentValue,
    positions?: FitPositions
  ) => {
    if (!placesEachNodeOnce(raw)) return null;

    try {
      const document = ownDocument(raw);

      if (
        (positions?.selection &&
          !fitKeepsSelection(document, positions.selection)) ||
        positions?.ranges?.some(
          (range) =>
            !fitKeepsSelection(document, {
              root: SelectionApi.root(range) ?? 'main',
              selection: SelectionApi.text(range),
            })
        ) ||
        !withoutGeneration(() =>
          isLoadedDocumentCanonical(getEditor(), document, api)
        )
      ) {
        return null;
      }

      return Object.freeze({
        document,
        ranges: positions?.ranges,
        selection:
          positions?.selection &&
          snapshotEditorJsonValue(
            positions.selection.selection,
            'Editor selection'
          ),
      });
    } catch {
      return null;
    }
  };

  const fillMissingReservedElementIds = (
    document: EditorDocumentValue
  ): EditorDocumentValue | null => {
    if (!schema?.everyElementHasId || !generateReservedElementId) {
      return document;
    }

    const seen = new Set<string>();
    let missing = false;
    let duplicateOrInvalid = false;

    const scan = (children: readonly Descendant[]): void => {
      for (const node of children) {
        if (!ElementApi.isElement(node)) continue;
        const { id } = node as Element & { id?: unknown };

        if (id === undefined) {
          missing = true;
        } else if (typeof id !== 'string' || id.length === 0 || seen.has(id)) {
          duplicateOrInvalid = true;

          return;
        } else {
          seen.add(id);
        }
        scan(node.children);
        if (duplicateOrInvalid) return;
      }
    };

    scan(document.children);
    if (!duplicateOrInvalid && document.roots) {
      for (const children of Object.values(document.roots)) {
        scan(children);
        if (duplicateOrInvalid) break;
      }
    }
    if (duplicateOrInvalid) return null;
    if (!missing) return document;

    const mint = (): string => {
      let fresh = generateReservedElementId();

      while (fresh === undefined || seen.has(fresh)) {
        if (fresh === undefined) return '';
        fresh = generateReservedElementId();
      }
      seen.add(fresh);

      return fresh;
    };

    const fillList = <T extends readonly Descendant[]>(children: T): T => {
      let changed = false;
      const next = children.map((node) => {
        if (!ElementApi.isElement(node)) return node;
        const nextChildren = fillList(node.children);
        const hasId = (node as Element & { id?: unknown }).id !== undefined;

        if (hasId && nextChildren === node.children) return node;
        changed = true;

        return hasId
          ? { ...node, children: nextChildren }
          : { ...node, children: nextChildren, id: mint() };
      });

      return (changed ? next : children) as unknown as T;
    };

    const children = fillList(document.children);
    const roots = document.roots
      ? Object.fromEntries(
          Object.entries(document.roots).map(([root, list]) => [
            root,
            fillList(list),
          ])
        )
      : undefined;

    return withValueRecords(
      {
        ...document,
        children,
        ...(roots === undefined ? {} : { roots }),
      },
      getValueRecords(document)
    );
  };

  const fitDocumentInput = <TValue extends Value>(
    rawInput: EditorDocumentValue<TValue>,
    positions?: FitPositions,
    repairCollector?: EditorSchemaFitRepairCollector,
    fillElementIds = true
  ) => {
    const input = readEditorDocument(
      rawInput,
      (issue) => {
        if (issue.kind === 'json' || issue.kind === 'record') {
          assertEditorJsonValue(rawInput, 'Editor schema document');
        }
        throw new EditorSchemaValidationError(
          getEditorDocumentShapeIssueMessage(issue)
        );
      },
      (record) => assertEditorJsonValue(record, 'Editor schema document')
    ) as EditorDocumentValue<TValue>;

    if (!repairCollector && placesEachNodeOnce(input)) {
      const candidate =
        (fillElementIds
          ? loadElementIds?.(input)?.fill(input)?.value
          : fillMissingReservedElementIds(input)) ?? input;
      const reused = reuseCanonicalDocument(candidate, positions);

      if (reused) return reused;
    }

    const ids = fillElementIds ? (loadElementIds?.(input) ?? null) : null;
    const runFit = () => {
      const inputRoots = input.roots ?? {};
      const seededRoots: Record<string, readonly Descendant[]> = {};

      if (schema) {
        for (const root of getVocabulary().rootNames) {
          const content = getRootContent(root, input);

          if (!content?.min) continue;
          const provided = Object.hasOwn(inputRoots, root)
            ? inputRoots[root]
            : undefined;
          const children =
            (provided && provided.length > 0
              ? fitDirectContent(schema, content, provided, [], { root })
              : null) ?? fitDirectContent(schema, content, [], [], { root });

          if (!children) {
            throw new Error(
              `Editor root "${root}" requires defaultable content.`
            );
          }
          seededRoots[root] = children;
        }
      }

      const initial = cloneFrozen({
        children: [],
        ...(input.meta !== undefined ? { meta: input.meta } : {}),
        ...(Object.keys(seededRoots).length > 0 ? { roots: seededRoots } : {}),
      }) as JsonEditorValue;
      const builder = new ChangeDraft(initial, {
        construct: (
          { after, before, change, indexedAfter, indexedBefore },
          preparation
        ) =>
          constructCanonicalDocumentChange(getEditor(), after, change, {
            before,
            fitPreparation: preparation,
            indexedAfter,
            indexedBefore,
            schema: api,
          }),
        indexConstructedRoot,
        isSetValued: (node, key, context) =>
          isSetValuedProperty(node, key, context),
        preparationAuthority: api,
        preparationRevision: () => api,
        recordV4: false,
      });
      const roots = new Map<string, readonly Descendant[]>([
        ['main', input.children],
        ...Object.entries(inputRoots).sort(([left], [right]) =>
          left.localeCompare(right)
        ),
      ]);

      for (const root of getVocabulary().rootNames) {
        if (getRootContent(root, input)?.min) {
          roots.set(root, inputRoots[root] ?? []);
        }
      }

      const collectProjectedRoots = (children: readonly Descendant[]) => {
        for (const node of children) {
          if (!ElementApi.isElement(node)) continue;

          for (const root of Object.values(getElementContentRoots(node))) {
            if (roots.has(root)) continue;
            if (!isDocumentRootKey(root)) {
              throw new EditorSchemaValidationError(
                `Invalid document root key ${root}.`
              );
            }
            roots.set(root, []);
          }
          collectProjectedRoots(node.children);
        }
      };

      collectProjectedRoots(input.children);
      for (const children of Object.values(inputRoots)) {
        collectProjectedRoots(children);
      }

      let mappedSelection: NonNullable<Selection> | undefined;
      const mappedRanges: Array<Range | null> =
        positions?.ranges?.map(() => null) ?? [];
      const fitRoot = (root: string, children: readonly Descendant[]) => {
        const selectionInput = positions?.selection;
        const mapsSelection = selectionInput?.root === root;
        const owned =
          positions?.ranges?.flatMap((range, index) =>
            (SelectionApi.root(range) ?? 'main') === root
              ? [{ index, range }]
              : []
          ) ?? [];
        const ranges =
          owned.length > 0 ? owned.map(({ range }) => range) : undefined;
        const repairs: EditorSchemaRepair[] = [];
        const report = repairCollector
          ? { provenance: createRootFitPathProvenance(children), repairs }
          : undefined;
        const run = () =>
          fit(ContentSliceValue.closed(children), {
            apply:
              mapsSelection || ranges
                ? (_step, selection, _landing, rangesAfter) => {
                    if (mapsSelection) mappedSelection = selection;
                    owned.forEach(({ index }, at) => {
                      mappedRanges[index] = rangesAfter?.[at] ?? null;
                    });
                  }
                : undefined,
            builder,
            target: {
              kind: 'root' as const,
              ...(report ? { report } : {}),
              ...(ranges ? { ranges } : {}),
              root,
              ...(mapsSelection ? { selection: selectionInput.selection } : {}),
              ...(positions?.omitSelectionSpacers
                ? { omitSelectionSpacers: true as const }
                : {}),
            },
          });
        const observed = report
          ? observeRootCanonicalization(root, run)
          : { events: [], passes: [], value: run() };
        const fitted = observed.value;

        if (!fitted) {
          validateDocument(input);
          throw new EditorSchemaValidationError(
            `Editor ${
              root === 'main' ? 'primary root' : `root "${root}"`
            } cannot fit external content.`
          );
        }
        if (repairCollector && report) {
          const [propertyPass, representationPass, ...unmapped] =
            observed.passes;

          if (unmapped.length > 0) {
            throw new Error(
              `Unclassified canonical pass in editor root "${root}".`
            );
          }

          const { inputPaths } = report.provenance;
          const representation =
            propertyPass && representationPass
              ? resolveRepresentationRepairs(
                  propertyPass.output,
                  representationPass.input,
                  observed.events,
                  root,
                  inputPaths
                )
              : null;
          const canonicalRepairs = [
            ...(propertyPass
              ? collectPropertyRepairs(
                  propertyPass.input,
                  propertyPass.output,
                  root,
                  inputPaths
                )
              : []),
            ...(representationPass && representation
              ? collectPropertyRepairs(
                  representationPass.input,
                  representationPass.output,
                  root,
                  (path) => {
                    const node = getDescendant(representationPass.input, path);

                    return node ? representation.inputsOf(node) : [];
                  }
                )
              : []),
            ...(representation?.repairs ?? []),
          ];

          repairCollector.replaceRoot(root, [
            ...(root !== 'main' && !Object.hasOwn(inputRoots, root)
              ? [
                  schemaRepair({
                    code: 'create-root',
                    impact: 'lossless',
                    outputs: [schemaModelLocation(root, [])],
                    owner: 'document',
                  }),
                ]
              : []),
            ...repairs,
            ...canonicalRepairs,
          ]);
        }
      };

      withDocumentOwnershipTracker(
        builder.value as EditorDocumentValue,
        (beginRoot, syncRoot) => {
          const firstPassProjectedContent = new Map<
            string,
            ReturnType<typeof getRootContent>
          >();

          for (const [root, children] of roots) {
            beginRoot(root);
            if (root !== 'main' && !schema?.roots.has(root)) {
              firstPassProjectedContent.set(
                root,
                getRootContent(root, builder.value as EditorDocumentValue)
              );
            }
            fitRoot(root, children);
            syncRoot(root, builder.value as EditorDocumentValue);
          }

          for (const [root, children] of roots) {
            beginRoot(root);
            if (
              root !== 'main' &&
              !schema?.roots.has(root) &&
              getRootContent(root, builder.value as EditorDocumentValue) !==
                firstPassProjectedContent.get(root)
            ) {
              fitRoot(root, children);
              syncRoot(root, builder.value as EditorDocumentValue);
            }
          }
        }
      );

      builder.finalize();
      const fittedDocument = (
        !hasValueRecords(input)
          ? builder.value
          : Object.freeze(
              showValueRecords({ ...builder.value }, getValueRecords(input))
            )
      ) as EditorDocumentValue<V>;
      const document = (ids?.fill(fittedDocument)?.value ??
        fittedDocument) as EditorDocumentValue<V>;

      validateDocument(document);
      if (positions?.selection && !mappedSelection) {
        throw new Error(
          'Initial selection cannot be mapped through schema fitting.'
        );
      }

      return Object.freeze({
        document,
        ranges: mappedRanges,
        selection: mappedSelection,
      });
    };

    return ids ? ids.withStandInIds(runFit) : runFit();
  };

  const fitDocument = <TValue extends Value>(
    input: EditorDocumentValue<TValue>
  ): EditorDocumentValue<V> => fitDocumentInput(input).document;

  const fitDocumentRaw = <TValue extends Value>(
    input: EditorDocumentValue<TValue>
  ): EditorDocumentValue<V> =>
    fitDocumentInput(input, undefined, undefined, false).document;

  const fitDocumentWithReport = <TValue extends Value>(
    input: EditorDocumentValue<TValue>
  ): EditorSchemaFitReport<V> => {
    const collector = new EditorSchemaFitRepairCollector();
    const { document } = fitDocumentInput(input, undefined, collector);

    return Object.freeze({ document, repairs: collector.snapshot() });
  };

  const fitDocumentWithSelection = <TValue extends Value>(
    input: EditorDocumentValue<TValue>,
    options: FitSelectionInput
  ) => {
    const fitted = fitDocumentInput(input, { selection: options });

    return Object.freeze({
      document: fitted.document,
      selection: fitted.selection as NonNullable<Selection>,
    });
  };

  const fitDocumentAndMapPositions = <TValue extends Value>(
    rawValue: EditorDocumentValue<TValue>,
    options: FitDocumentPositions
  ): FittedDocumentPositions<V> => {
    const fitted = fitDocumentInput(rawValue, {
      ...options,
      omitSelectionSpacers: true,
    });

    return Object.freeze({
      document: fitted.document,
      ranges: fitted.ranges ?? [],
      ...(fitted.selection ? { selection: fitted.selection } : {}),
    });
  };

  return Object.freeze({
    fitDocument,
    fitDocumentRaw,
    fitDocumentAndMapPositions,
    fitDocumentWithReport,
    fitDocumentWithSelection,
    revision,
    schema,
  });
};

export const createCompiledDocumentFitterDelegate = <V extends Value>(
  getDependencies: () => DocumentFitterDependencies<V>
): DocumentFitterDelegate<V> => {
  let compiled: CompiledDocumentFitter<V> | null = null;
  const getCompiled = () => {
    const dependencies = getDependencies();

    if (
      compiled?.schema !== dependencies.schema ||
      compiled.revision !== dependencies.revision
    ) {
      compiled = compileDocumentFitter(dependencies);
    }

    return compiled;
  };

  return Object.freeze({
    fitDocument: (input) => getCompiled().fitDocument(input),
    fitDocumentRaw: (input) => getCompiled().fitDocumentRaw(input),
    fitDocumentWithReport: (input) =>
      getCompiled().fitDocumentWithReport(input),
    fitDocumentAndMapPositions: (input, options) =>
      getCompiled().fitDocumentAndMapPositions(input, options),
    fitDocumentWithSelection: (input, options) =>
      getCompiled().fitDocumentWithSelection(input, options),
  });
};
