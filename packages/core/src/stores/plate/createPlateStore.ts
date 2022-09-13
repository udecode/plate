import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import {
  createAtomStore,
  GetRecord,
  SetRecord,
  UseRecord,
} from '../../atoms/index';
import { withPlate } from '../../plugins/index';
import { Value } from '../../slate/editor/TEditor';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { PlateChangeKey, PlateStoreState } from '../../types/plate/PlateStore';
import { createTEditor, Scope } from '../../utils/index';

export type PlateId = Scope;
export const PLATE_SCOPE = Symbol('plate');

export const createPlateStore = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>({
  decorate = null,
  editableProps = null,
  editor = null as any,
  id,
  isRendered = false,
  keyDecorate = '1',
  keyEditor = '1',
  keyPlugins = '1',
  keySelection = '1',
  onChange = null,
  plugins = [],
  renderElement = null,
  renderLeaf = null,
  value = null as any,
  ...state
}: Partial<PlateStoreState<V, E>> = {}) =>
  createAtomStore(
    {
      decorate,
      editableProps,
      editor,
      id,
      isRendered,
      keyDecorate,
      keyEditor,
      keyPlugins,
      keySelection,
      onChange,
      plugins,
      renderElement,
      renderLeaf,
      value,
      ...state,
    } as PlateStoreState<V, E>,
    {
      scope: PLATE_SCOPE,
      name: 'plate',
    }
  );

export const { plateStore, usePlateStore } = createPlateStore();

export const usePlateSelectors = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: PlateId
): GetRecord<PlateStoreState<V, E>> => usePlateStore(id).get as any;
export const usePlateActions = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: PlateId
): SetRecord<PlateStoreState<V, E>> => usePlateStore(id).set as any;
export const usePlateState = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: PlateId
): UseRecord<PlateStoreState<V, E>> => usePlateStore(id).use as any;

export const useUpdatePlateKey = (key: PlateChangeKey, id?: PlateId) => {
  const set = usePlateActions(id)[key]();

  return useCallback(() => {
    set(nanoid());
  }, [set]);
};

export const useRedecorate = (id?: PlateId) => {
  const updateDecorate = useUpdatePlateKey('keyDecorate', id);

  return useCallback(() => {
    updateDecorate();
  }, [updateDecorate]);
};

/**
 * Set a new editor with plate.
 */
export const useResetPlateEditor = (id?: PlateId) => {
  const editor = usePlateSelectors(id).editor();
  const setEditor = usePlateActions(id).editor();

  return useCallback(() => {
    if (!editor) return;

    setEditor(
      withPlate(createTEditor(), {
        id: editor.id,
        plugins: editor.plugins as any,
      })
    );
  }, [editor, setEditor]);
};
