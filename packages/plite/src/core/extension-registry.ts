import type {
  Editor,
  EditorCommitListener,
  EditorElementSpec,
  EditorExtensionStateGroup,
  EditorExtensionTxGroup,
  EditorNodeNormalizer,
  EditorOperationMiddleware,
  EditorQueryGroup,
  EditorQueryMiddlewareMap,
  RegisteredEditorExtension,
  ValueOf,
} from '../interfaces/editor';

export type EditorStateGroupRegistration<TEditor extends Editor = Editor> = {
  extensionName: string;
  factory: EditorExtensionStateGroup<TEditor>;
};

export type EditorTxGroupRegistration<TEditor extends Editor = Editor> = {
  extensionName: string;
  factory: EditorExtensionTxGroup<TEditor>;
};

export type ExtensionRegistry<TEditor extends Editor = Editor> = {
  capabilities: Map<string, unknown[]>;
  commands: Map<string, unknown[]>;
  commitListeners: Set<EditorCommitListener<ValueOf<TEditor>>>;
  elementMatchers: EditorElementSpecRegistration[];
  elementSpecs: Map<string, EditorElementSpecRegistration>;
  extensions: Map<string, RegisteredEditorExtension>;
  normalizers: Map<string, EditorNodeNormalizer<TEditor>>;
  operationMiddlewares: Set<EditorOperationMiddleware<TEditor>>;
  queryMiddlewares: Map<string, unknown[]>;
  stateGroups: Map<string, EditorStateGroupRegistration<TEditor>>;
  txGroups: Map<string, EditorTxGroupRegistration<TEditor>>;
};

export type EditorElementSpecRegistration = {
  extensionName: string;
  spec: EditorElementSpec;
};

const reservedElementPropertyNames = new Set([
  '__proto__',
  'children',
  'constructor',
  'prototype',
  'type',
]);

const EXTENSION_REGISTRIES = new WeakMap<Editor, ExtensionRegistry>();

const reservedStateGroupNames = new Set([
  'marks',
  'nodes',
  'operations',
  'points',
  'ranges',
  'schema',
  'selection',
  'text',
  'value',
]);

const reservedTxGroupNames = new Set([
  ...reservedStateGroupNames,
  'normalize',
  'roots',
  'withoutNormalizing',
]);

export const getExtensionRegistry = <TEditor extends Editor>(
  editor: TEditor
): ExtensionRegistry<TEditor> => {
  let registry = EXTENSION_REGISTRIES.get(editor);

  if (!registry) {
    registry = {
      capabilities: new Map(),
      commands: new Map(),
      commitListeners: new Set(),
      elementMatchers: [],
      elementSpecs: new Map(),
      extensions: new Map(),
      normalizers: new Map(),
      operationMiddlewares: new Set(),
      queryMiddlewares: new Map(),
      stateGroups: new Map(),
      txGroups: new Map(),
    };
    EXTENSION_REGISTRIES.set(editor, registry);
  }

  return registry as ExtensionRegistry<TEditor>;
};

export const inheritExtensionRegistry = <
  TEditor extends Editor,
  TSourceEditor extends Editor,
>(
  editor: TEditor,
  source: TSourceEditor
) => {
  EXTENSION_REGISTRIES.set(
    editor,
    getExtensionRegistry(source) as ExtensionRegistry
  );
};

export const registerElementSpec = (
  editor: Editor,
  extensionName: string,
  spec: EditorElementSpec
) => {
  const registry = getExtensionRegistry(editor);
  const existing = registry.elementSpecs.get(spec.type);

  if (existing) {
    throw new Error(
      `Editor element spec "${spec.type}" from "${extensionName}" conflicts with "${existing.extensionName}".`
    );
  }

  for (const property of Object.keys(spec.properties ?? {})) {
    if (reservedElementPropertyNames.has(property)) {
      throw new Error(
        `Editor element spec "${spec.type}" from "${extensionName}" cannot define reserved element property "${property}".`
      );
    }
  }

  const properties = spec.properties
    ? Object.freeze(
        Object.fromEntries(
          Object.entries(spec.properties).map(([property, descriptor]) => [
            property,
            Object.freeze({ ...descriptor }),
          ])
        )
      )
    : undefined;

  const frozenSpec = properties
    ? Object.freeze({ ...spec, properties })
    : Object.freeze({ ...spec });

  const registration = {
    extensionName,
    spec: frozenSpec,
  };
  registry.elementSpecs.set(spec.type, registration);
  if (spec.match) {
    registry.elementMatchers.push(registration);
  }

  return () => {
    if (registry.elementSpecs.get(spec.type) === registration) {
      registry.elementSpecs.delete(spec.type);
    }
    const matcherIndex = registry.elementMatchers.indexOf(registration);
    if (matcherIndex !== -1) {
      registry.elementMatchers.splice(matcherIndex, 1);
    }
  };
};

export const registerCapability = (
  editor: Editor,
  name: string,
  capability: unknown
) => {
  const registry = getExtensionRegistry(editor);
  const capabilities = registry.capabilities.get(name) ?? [];

  capabilities.push(capability);
  registry.capabilities.set(name, capabilities);

  return () => {
    const current = registry.capabilities.get(name);

    if (!current) {
      return;
    }

    const index = current.indexOf(capability);
    if (index >= 0) {
      current.splice(index, 1);
    }

    if (current.length === 0) {
      registry.capabilities.delete(name);
    }
  };
};

export const registerNormalizer = <TEditor extends Editor>(
  editor: TEditor,
  id: string,
  normalizer: EditorNodeNormalizer<TEditor>
) => {
  const registry = getExtensionRegistry(editor);
  registry.normalizers.set(id, normalizer);

  return () => {
    if (registry.normalizers.get(id) === normalizer) {
      registry.normalizers.delete(id);
    }
  };
};

export const registerCommitListener = <TEditor extends Editor>(
  editor: TEditor,
  listener: EditorCommitListener<ValueOf<TEditor>>
) => {
  const registry = getExtensionRegistry(editor);
  registry.commitListeners.add(listener);

  return () => {
    registry.commitListeners.delete(listener);
  };
};

export const registerOperationMiddleware = <TEditor extends Editor>(
  editor: TEditor,
  middleware: EditorOperationMiddleware<TEditor>
) => {
  const registry = getExtensionRegistry(editor);
  registry.operationMiddlewares.add(middleware);

  return () => {
    registry.operationMiddlewares.delete(middleware);
  };
};

export const getQueryMiddlewareKey = (
  group: EditorQueryGroup,
  method: string
) => `${group}.${method}`;

export const registerQueryMiddleware = <
  TEditor extends Editor,
  TGroup extends EditorQueryGroup,
  TMethod extends keyof NonNullable<EditorQueryMiddlewareMap<TEditor>[TGroup]>,
>(
  editor: TEditor,
  group: TGroup,
  method: TMethod,
  middleware: NonNullable<EditorQueryMiddlewareMap<TEditor>[TGroup]>[TMethod]
) => {
  const registry = getExtensionRegistry(editor);
  const key = getQueryMiddlewareKey(group, String(method));
  const middlewares = registry.queryMiddlewares.get(key) ?? [];

  middlewares.push(middleware);
  registry.queryMiddlewares.set(key, middlewares);

  return () => {
    const current = registry.queryMiddlewares.get(key);

    if (!current) {
      return;
    }

    const index = current.indexOf(middleware);
    if (index >= 0) {
      current.splice(index, 1);
    }

    if (current.length === 0) {
      registry.queryMiddlewares.delete(key);
    }
  };
};

const registerViewGroup = <TRegistration>(
  groups: Map<string, { extensionName: string; factory: TRegistration }>,
  reservedNames: Set<string>,
  kind: 'editor' | 'state' | 'tx',
  extensionName: string,
  groupName: string,
  factory: TRegistration
) => {
  if (reservedNames.has(groupName)) {
    throw new Error(
      `Editor extension "${extensionName}" ${kind} group "${groupName}" is reserved by Plite core.`
    );
  }

  const existing = groups.get(groupName);

  if (existing) {
    throw new Error(
      `Editor extension ${kind} group "${groupName}" from "${extensionName}" conflicts with "${existing.extensionName}".`
    );
  }

  const registration = { extensionName, factory };
  groups.set(groupName, registration);

  return () => {
    if (groups.get(groupName) === registration) {
      groups.delete(groupName);
    }
  };
};

export const registerStateGroup = <TEditor extends Editor>(
  editor: TEditor,
  extensionName: string,
  groupName: string,
  factory: EditorExtensionStateGroup<TEditor>
) => {
  const registry = getExtensionRegistry(editor);

  return registerViewGroup(
    registry.stateGroups,
    reservedStateGroupNames,
    'state',
    extensionName,
    groupName,
    factory
  );
};

export const registerTxGroup = <TEditor extends Editor>(
  editor: TEditor,
  extensionName: string,
  groupName: string,
  factory: EditorExtensionTxGroup<TEditor>
) => {
  const registry = getExtensionRegistry(editor);

  return registerViewGroup(
    registry.txGroups,
    reservedTxGroupNames,
    'tx',
    extensionName,
    groupName,
    factory
  );
};
