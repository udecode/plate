import { getEditorRuntimeOwner } from '../../core';
import type { YjsController } from './controller';
import type { YjsEditor } from './editor-types';

const activeControllers = new WeakMap<YjsEditor, YjsController<any>>();

export const getActiveYjsController = (
  editor: YjsEditor
): YjsController<any> | undefined =>
  activeControllers.get(getEditorRuntimeOwner(editor));

export const setActiveYjsController = (
  editor: YjsEditor,
  controller: YjsController<any>
): void => {
  activeControllers.set(getEditorRuntimeOwner(editor), controller);
};

export const deleteActiveYjsController = (
  editor: YjsEditor,
  controller: YjsController<any>
): void => {
  const owner = getEditorRuntimeOwner(editor);

  if (activeControllers.get(owner) === controller) {
    activeControllers.delete(owner);
  }
};
