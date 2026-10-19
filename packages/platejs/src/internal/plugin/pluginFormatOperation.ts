import {
  ElementApi,
  type Descendant,
  type EditorDocumentValue,
  type EditorCoreStateView,
  type Path,
  type RootKey,
  type Value,
} from '../../facade';
import type { Editor } from '../../lib/editor';
import type {
  AnyBasePlugin,
  PluginFormatContext,
  PluginFormatModelView,
  PluginFormatRegistry,
  PluginFormatSchemaView,
  PluginReference,
} from '../../lib/plugin';
import {
  freezePluginDescriptorValue,
  isPluginDescriptorOf,
} from '../utils/mergePlugins';
import type { CompiledPlateModel } from './compilePlateModel';
import { getPluginStore } from './pluginStore';

const nodeAt = (
  nodes: readonly Descendant[],
  path: Path
): Descendant | undefined => {
  let current: Descendant | undefined;
  let children = nodes;

  for (const index of path) {
    current = children[index];
    if (!current) return undefined;
    children = ElementApi.isElement(current) ? current.children : [];
  }

  return current;
};

/**
 * The content being encoded as a whole document, so format mappings number and
 * nest a slice from its own first block.
 */
export const createContentFormatDocument = (
  input: Readonly<{
    content: readonly Descendant[];
    meta?: EditorDocumentValue['meta'];
    roots?: Readonly<Record<string, readonly Descendant[]>>;
  }>
) =>
  ({
    children: input.content,
    ...(input.meta ? { meta: input.meta } : {}),
    ...(input.roots ? { roots: input.roots } : {}),
  }) as EditorDocumentValue;

/** Build structural context from the same immutable document operation view. */
export const createPluginFormatModelView = <V extends Value>(
  document: EditorDocumentValue<V>,
  node: Descendant,
  path: Path,
  root: RootKey
): PluginFormatModelView<V> => {
  const rootNodes =
    root === 'main' ? document.children : (document.roots?.[root] ?? []);
  const parentNode =
    path.length > 1 ? nodeAt(rootNodes, path.slice(0, -1)) : undefined;
  const index = path.at(-1) ?? 0;
  const previousSibling =
    index > 0
      ? nodeAt(rootNodes, [...path.slice(0, -1), index - 1])
      : undefined;

  return Object.freeze({
    document,
    node,
    parent: ElementApi.isElement(parentNode) ? parentNode : null,
    path,
    previousSibling: previousSibling ?? null,
    root,
  }) as PluginFormatModelView<V>;
};

export const createPluginFormatRegistry = (
  pluginNamed: (name: string) => AnyBasePlugin | undefined,
  elementTypeOf: (name: string) => string | undefined
): PluginFormatRegistry => {
  const answers = new WeakMap<PluginReference, AnyBasePlugin | null>();
  const resolve = (plugin: PluginReference | string) => {
    if (typeof plugin === 'string') return pluginNamed(plugin);

    let answer = answers.get(plugin);

    if (answer === undefined) {
      const installed = pluginNamed(plugin.name);

      answer =
        installed && isPluginDescriptorOf(plugin, installed) ? installed : null;
      answers.set(plugin, answer);
    }

    return answer ?? undefined;
  };

  return Object.freeze({
    has: (plugin) => resolve(plugin) !== undefined,
    type: (plugin) => {
      const installed = resolve(plugin);

      return installed ? elementTypeOf(installed.name) : undefined;
    },
  });
};

type CapturedPluginFormatContext = PluginFormatContext &
  Readonly<{
    pluginState: Readonly<Record<string, unknown>>;
  }>;

const capturedPluginStatesByEditor = new WeakMap<
  object,
  WeakMap<object, ReadonlyMap<string, unknown>>
>();

/** Capture one immutable plugin/registry/schema view for each format operation. */
export const createPluginFormatOperationContext = (
  editor: Editor,
  model: CompiledPlateModel,
  plugins: readonly AnyBasePlugin[]
) => {
  const pluginsByName = new Map(plugins.map((plugin) => [plugin.name, plugin]));
  const registry = createPluginFormatRegistry(
    (name) => pluginsByName.get(name),
    (name) => model.byName[name]?.elementType ?? undefined
  );
  const operationContexts = new WeakMap<
    object,
    ReadonlyMap<string, CapturedPluginFormatContext>
  >();

  return (
    plugin: AnyBasePlugin,
    state: EditorCoreStateView,
    operationKey: object
  ): CapturedPluginFormatContext => {
    let contexts = operationContexts.get(operationKey);

    if (!contexts) {
      let editorOperations = capturedPluginStatesByEditor.get(editor);

      if (!editorOperations) {
        editorOperations = new WeakMap();
        capturedPluginStatesByEditor.set(editor, editorOperations);
      }
      let pluginStates = editorOperations.get(operationKey);

      if (!pluginStates) {
        pluginStates = new Map(
          plugins.map((candidate) => [
            candidate.name,
            getPluginStore(editor, candidate.name)?.public.get() ??
              candidate.initialState,
          ])
        );
        editorOperations.set(operationKey, pluginStates);
      }
      const schema = Object.freeze({
        allowsElementType: state.schema.allowsElementType,
        element: state.schema.element,
        getElementBehavior: state.schema.getElementBehavior,
        getProperty: state.schema.getProperty,
        getVocabulary: state.schema.getVocabulary,
        property: state.schema.property,
      }) satisfies PluginFormatSchemaView;

      contexts = new Map(
        plugins.map((candidate) => [
          candidate.name,
          Object.freeze({
            name: candidate.name,
            pluginState: freezePluginDescriptorValue({
              ...(pluginStates.get(candidate.name) as Record<string, unknown>),
            }),
            registry,
            schema,
          }),
        ])
      );
      operationContexts.set(operationKey, contexts);
    }

    const context = contexts.get(plugin.name);

    if (!context) {
      throw new Error(`Plate format owner "${plugin.name}" is not installed.`);
    }

    return context;
  };
};
