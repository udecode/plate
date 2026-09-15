import type * as Y from 'yjs';

import { getEditorRuntimeOwner } from '../../index';
import type { YjsController } from './controller';
import type { YjsEditor } from './editor-types';
import type { YjsRemoteCursorData } from './types';

const activeControllers = new WeakMap<YjsEditor, object>();

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

    return Object.freeze({
      reused: true,
      release(reason: 'dispose' | 'rollback') {
        if (current.currentLease !== lease) return false;
        if (reason === 'rollback') {
          current.currentLease = previousLease;

          return false;
        }

        roots.delete(rootName);
        if (roots.size === 0) namespaces.delete(doc);

        return true;
      },
    });
  }

  const entry: NamespaceEntry = {
    currentLease: lease,
    factoryToken,
    owner,
  };

  roots.set(rootName, entry);
  namespaces.set(doc, roots);

  return Object.freeze({
    reused: false,
    release(_reason: 'dispose' | 'rollback') {
      if (entry.currentLease !== lease) return false;

      roots.delete(rootName);
      if (roots.size === 0) namespaces.delete(doc);

      return true;
    },
  });
};
