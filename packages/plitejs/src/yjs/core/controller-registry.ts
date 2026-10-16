import type * as Y from 'yjs';

import { getEditorRuntimeOwner } from '../../index';
import type { YjsBinding } from './binding';
import type { YjsController } from './controller';
import type { YjsEditor } from './editor-types';
import type { YjsRemoteCursorData } from './types';

const activeControllers = new WeakMap<YjsEditor, object>();
const activeBindings = new WeakMap<YjsEditor, object>();

type NamespaceEntry = {
  readonly factoryToken: object;
  readonly owner: YjsEditor;
  currentLease: object;
};

const namespaces = new WeakMap<Y.Doc, Map<string, NamespaceEntry>>();

export const getActiveYjsController = <
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
>(
  editor: YjsEditor
): YjsController<TCursorData> | undefined =>
  activeControllers.get(getEditorRuntimeOwner(editor)) as
    | YjsController<TCursorData>
    | undefined;

export const setActiveYjsController = <TCursorData extends YjsRemoteCursorData>(
  editor: YjsEditor,
  controller: YjsController<TCursorData>
): void => {
  activeControllers.set(getEditorRuntimeOwner(editor), controller);
};

export const deleteActiveYjsController = <
  TCursorData extends YjsRemoteCursorData,
>(
  editor: YjsEditor,
  controller: YjsController<TCursorData>
): void => {
  const owner = getEditorRuntimeOwner(editor);

  if (activeControllers.get(owner) === controller) {
    activeControllers.delete(owner);
  }
};

export const getActiveYjsBinding = <
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
>(
  editor: YjsEditor
): YjsBinding<TCursorData> | undefined =>
  activeBindings.get(getEditorRuntimeOwner(editor)) as
    | YjsBinding<TCursorData>
    | undefined;

export const setActiveYjsBinding = <TCursorData extends YjsRemoteCursorData>(
  editor: YjsEditor,
  binding: YjsBinding<TCursorData>
): void => {
  activeBindings.set(getEditorRuntimeOwner(editor), binding);
};

export const deleteActiveYjsBinding = <TCursorData extends YjsRemoteCursorData>(
  editor: YjsEditor,
  binding: YjsBinding<TCursorData>
): void => {
  const owner = getEditorRuntimeOwner(editor);

  if (activeBindings.get(owner) === binding) activeBindings.delete(owner);
};

type NamespaceRelease = (
  reason: 'dispose' | 'rollback',
  teardown?: () => void
) => void;

export const claimYjsNamespace = (
  doc: Y.Doc,
  rootName: string,
  editor: YjsEditor,
  factoryToken: object
) => {
  const owner = getEditorRuntimeOwner(editor);
  const roots = namespaces.get(doc) ?? new Map<string, NamespaceEntry>();
  const current = roots.get(rootName);
  const lease = {};

  if (current) {
    if (current.owner !== owner || current.factoryToken !== factoryToken) {
      throw new Error(
        `Yjs namespace "${rootName}" already has an independent binding.`
      );
    }

    const previousLease = current.currentLease;

    current.currentLease = lease;

    const release: NamespaceRelease = (reason, teardown) => {
      if (current.currentLease !== lease) return;
      if (reason === 'rollback') {
        current.currentLease = previousLease;

        return;
      }

      try {
        teardown?.();
      } finally {
        roots.delete(rootName);
        if (roots.size === 0) namespaces.delete(doc);
      }
    };

    return Object.freeze({ release, reused: true });
  }

  const entry: NamespaceEntry = {
    currentLease: lease,
    factoryToken,
    owner,
  };

  roots.set(rootName, entry);
  namespaces.set(doc, roots);

  const release: NamespaceRelease = (_reason, teardown) => {
    if (entry.currentLease !== lease) return;

    try {
      teardown?.();
    } finally {
      roots.delete(rootName);
      if (roots.size === 0) namespaces.delete(doc);
    }
  };

  return Object.freeze({ release, reused: false });
};
