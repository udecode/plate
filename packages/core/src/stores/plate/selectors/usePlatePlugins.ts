import { Value } from '../../../slate/types/TEditor';
import { usePlateSelectors } from '../platesStore';
import { getPlateEditorRef } from './usePlateEditorRef';

export const getPlatePlugins = <V extends Value, T = {}>(id?: string) =>
  getPlateEditorRef<V, T>(id)?.plugins;

export const usePlatePlugins = <V extends Value, T = {}>(id?: string) => {
  usePlateSelectors(id).keyPlugins();

  return getPlatePlugins<V, T>(id);
};
