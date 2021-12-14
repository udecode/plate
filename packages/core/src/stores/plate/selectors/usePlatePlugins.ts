import { usePlateSelectors } from '../platesStore';
import { getPlateEditorRef } from './usePlateEditorRef';

export const getPlatePlugins = <T = {}>(id?: string) =>
  getPlateEditorRef<T>(id)?.plugins;

export const usePlatePlugins = <T = {}>(id?: string) => {
  usePlateSelectors(id).keyPlugins();

  return getPlatePlugins<T>(id);
};
