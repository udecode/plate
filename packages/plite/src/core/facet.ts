import type {
  Editor,
  EditorCommit,
  EditorFacet,
  EditorFacetDependency,
  EditorFacetDocumentDependency,
  EditorFacetProvider,
  EditorStateField,
  EditorStateView,
  Value,
} from '../interfaces/editor';
import { getExtensionRegistry } from './extension-registry';
import { getInternalDocumentChangeEntries } from './change/document-change';
import { toInternalRoot } from './public-root';
import { getInstalledStateField } from './state-fields';

export type DefineFacetOptions<TInput, TOutput> = Readonly<{
  combine?: (inputs: readonly TInput[]) => TOutput;
  compare?: (left: TOutput, right: TOutput) => boolean;
  compareInput?: (left: TInput, right: TInput) => boolean;
  key: string;
}>;

type FacetProviderCache = Readonly<{
  dependencies?: readonly unknown[];
  input: unknown;
  provider: EditorFacetProvider;
  revision: number;
}>;

type FacetCache = Readonly<{
  inputs: readonly unknown[];
  output: unknown;
  providerInputs: readonly FacetProviderCache[];
}>;

type FacetRuntime = {
  cache: Map<EditorFacet<any, any>, FacetCache>;
  documentRevision: number;
  documentRootRevisions: Map<string, number>;
  fieldRevisions: Map<string, number>;
  selectionRevision: number;
  stack: EditorFacet<any, any>[];
};

/** @internal Isolated facet state for one mutable transaction draft. */
export type EditorFacetDraft = FacetRuntime & {
  revision: number;
};

const FACET_RUNTIME = new WeakMap<Editor, FacetRuntime>();

const getFacetRuntime = (editor: Editor) => {
  let runtime = FACET_RUNTIME.get(editor);

  if (!runtime) {
    runtime = {
      cache: new Map(),
      documentRevision: 0,
      documentRootRevisions: new Map(),
      fieldRevisions: new Map(),
      selectionRevision: 0,
      stack: [],
    };
    FACET_RUNTIME.set(editor, runtime);
  }

  return runtime;
};

const bumpRevision = (revisions: Map<string, number>, key: string) => {
  revisions.set(key, (revisions.get(key) ?? 0) + 1);
};

/** @internal Fork committed or parent-draft facet state without sharing writes. */
export const createEditorFacetDraft = (
  editor: Editor,
  revision: number,
  parent?: EditorFacetDraft
): EditorFacetDraft => {
  const source = parent ?? getFacetRuntime(editor);

  return {
    cache: new Map(source.cache),
    documentRevision: source.documentRevision,
    documentRootRevisions: new Map(source.documentRootRevisions),
    fieldRevisions: new Map(source.fieldRevisions),
    revision: parent?.revision ?? revision,
    selectionRevision: source.selectionRevision,
    stack: [],
  };
};

const bumpDraftRevision = (draft: EditorFacetDraft) => {
  draft.revision++;
};

/** @internal Invalidate document-dependent providers inside one draft. */
export const recordFacetDraftDocumentRoots = (
  draft: EditorFacetDraft,
  roots: Iterable<string>
) => {
  const changedRoots = new Set(roots);

  if (changedRoots.size === 0) return;

  bumpDraftRevision(draft);
  draft.documentRevision++;

  for (const root of changedRoots) {
    bumpRevision(draft.documentRootRevisions, root);
  }
};

/** @internal Invalidate roots changed by one canonical document change. */
export const recordFacetDraftDocumentChange = (
  draft: EditorFacetDraft,
  change: EditorCommit['changes']
) =>
  recordFacetDraftDocumentRoots(draft, [
    ...[...getInternalDocumentChangeEntries(change)].map(([root]) => root),
    ...change.createRoots,
    ...change.deleteRoots,
  ]);

/** @internal Invalidate one field dependency inside one draft. */
export const recordFacetDraftFieldChange = (
  draft: EditorFacetDraft,
  key: string
) => {
  bumpDraftRevision(draft);
  bumpRevision(draft.fieldRevisions, key);
};

/** @internal Invalidate selection-dependent providers inside one draft. */
export const recordFacetDraftSelectionChange = (draft: EditorFacetDraft) => {
  bumpDraftRevision(draft);
  draft.selectionRevision++;
};

export const recordFacetCommit = (editor: Editor, commit: EditorCommit) => {
  const runtime = getFacetRuntime(editor);

  if (commit.changed.hasAny('document')) {
    runtime.documentRevision++;

    for (const root of new Set([
      ...[...getInternalDocumentChangeEntries(commit.changes)].map(
        ([root]) => root
      ),
      ...commit.changes.createRoots,
      ...commit.changes.deleteRoots,
    ])) {
      bumpRevision(runtime.documentRootRevisions, root);
    }
  }
  if (commit.selectionChanged) runtime.selectionRevision++;

  for (const key of commit.dirtyStateKeys) {
    if (key !== '$configuration') bumpRevision(runtime.fieldRevisions, key);
  }
};

const sameInputs = <TInput>(
  facet: EditorFacet<TInput, unknown>,
  left: readonly TInput[],
  right: readonly TInput[]
) =>
  left.length === right.length &&
  left.every((value, index) => facet.compareInput(value, right[index]!));

const sameDependencies = (
  left: readonly unknown[] | undefined,
  right: readonly unknown[]
) =>
  !!left &&
  left.length === right.length &&
  left.every((value, index) => Object.is(value, right[index]));

const isDocumentDependency = (
  dependency: EditorFacetDependency
): dependency is EditorFacetDocumentDependency =>
  typeof dependency === 'object' &&
  dependency !== null &&
  'kind' in dependency &&
  dependency.kind === 'document';

const isStateFieldDependency = (
  dependency: EditorFacetDependency
): dependency is EditorStateField<any> =>
  typeof dependency === 'object' &&
  dependency !== null &&
  'effect' in dependency &&
  'deserialize' in dependency;

const freezeDependency = (
  dependency: EditorFacetDependency
): EditorFacetDependency =>
  isDocumentDependency(dependency)
    ? Object.freeze({ ...dependency })
    : dependency;

export const defineFacet = <TInput, TOutput = readonly TInput[]>(
  options: DefineFacetOptions<TInput, TOutput>
): EditorFacet<TInput, TOutput> => {
  if (!options.key) throw new Error('Editor facet key cannot be empty.');

  const combine =
    options.combine ??
    ((inputs: readonly TInput[]) => Object.freeze([...inputs]) as TOutput);
  const facet: EditorFacet<TInput, TOutput> = Object.freeze({
    combine,
    compare: options.compare ?? Object.is,
    compareInput: options.compareInput ?? Object.is,
    compute: (compute, computeOptions) =>
      Object.freeze({
        compute,
        ...(computeOptions
          ? {
              dependencies: Object.freeze(
                computeOptions.dependencies.map(freezeDependency)
              ),
            }
          : {}),
        facet,
      }),
    default: combine([]),
    key: options.key,
    of: (value) => Object.freeze({ facet, value }),
  });

  return facet;
};

export const resolveFacet = <
  TInput,
  TOutput,
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: Editor<V, TExtensions>,
  state: EditorStateView<V, TExtensions>,
  facet: EditorFacet<TInput, TOutput>,
  revision: number,
  draft?: EditorFacetDraft
): TOutput => {
  const runtime = draft ?? getFacetRuntime(editor);
  const cycleStart = runtime.stack.indexOf(facet);

  if (cycleStart >= 0) {
    throw new Error(
      `Cyclic editor facet dependency: ${[
        ...runtime.stack.slice(cycleStart).map(({ key }) => key),
        facet.key,
      ].join(' -> ')}`
    );
  }

  runtime.stack.push(facet);

  try {
    const registry = getExtensionRegistry(editor);
    const providers = (registry.facets.get(facet.key) ??
      []) as readonly EditorFacetProvider<TInput>[];
    const previous = runtime.cache.get(facet);
    const resolveDependency = (dependency: EditorFacetDependency): unknown => {
      if (dependency === 'document') return runtime.documentRevision;
      if (dependency === 'selection') return runtime.selectionRevision;
      if (dependency === 'schema') return registry.schemaRevision;
      if (isDocumentDependency(dependency)) {
        return (
          runtime.documentRootRevisions.get(toInternalRoot(dependency.root)) ??
          0
        );
      }
      if (isStateFieldDependency(dependency)) {
        getInstalledStateField(editor, dependency);

        return runtime.fieldRevisions.get(dependency.key) ?? 0;
      }

      return resolveFacet(editor, state, dependency, revision, draft);
    };
    const providerInputs = providers.map((provider, index) => {
      const previousProvider = previous?.providerInputs[index];

      if (!provider.compute) {
        return {
          input: provider.value as TInput,
          provider,
          revision,
        };
      }

      if (provider.dependencies) {
        const dependencies = provider.dependencies.map(resolveDependency);

        if (
          previousProvider?.provider === provider &&
          sameDependencies(previousProvider.dependencies, dependencies)
        ) {
          return { ...previousProvider, revision };
        }

        return {
          dependencies,
          input: provider.compute(state as unknown as EditorStateView),
          provider,
          revision,
        };
      }

      if (
        previousProvider?.provider === provider &&
        previousProvider.revision === revision
      ) {
        return previousProvider;
      }

      return {
        input: provider.compute(state as unknown as EditorStateView),
        provider,
        revision,
      };
    });
    const inputs = providerInputs.map(({ input }) => input as TInput);

    if (
      previous &&
      sameInputs(
        facet as EditorFacet<TInput, unknown>,
        previous.inputs as readonly TInput[],
        inputs
      )
    ) {
      runtime.cache.set(facet, {
        ...previous,
        providerInputs,
      });
      return previous.output as TOutput;
    }

    const combined = facet.combine(inputs);
    const output =
      previous && facet.compare(previous.output as TOutput, combined)
        ? (previous.output as TOutput)
        : combined;

    runtime.cache.set(facet, {
      inputs,
      output,
      providerInputs,
    });

    return output;
  } finally {
    runtime.stack.pop();
  }
};
