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
import { freezePluginDescriptorValue } from '../utils/mergePlugins';
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
  const pluginNames = new Set(plugins.map((plugin) => plugin.name));
  const registry = Object.freeze({
    has: (plugin: PluginReference | string) =>
      pluginNames.has(typeof plugin === 'string' ? plugin : plugin.name),
    type: (plugin: PluginReference | string) =>
      model.byName[typeof plugin === 'string' ? plugin : plugin.name]
        ?.elementType ?? undefined,
  }) satisfies PluginFormatRegistry;
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
      }) satisfies PluginFormatSchemaView;

      contexts = new Map(
        plugins.map((candidate) => [
          candidate.name,
          Object.freeze({
            name: candidate.name,
            pluginState: freezePluginDescriptorValue({
              ...(pluginStates.get(candidate.name) as Record<string, unknown>),
            }) as Readonly<Record<string, unknown>>,
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
