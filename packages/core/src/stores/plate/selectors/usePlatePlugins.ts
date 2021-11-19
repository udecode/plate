import { getPlateEditorRef } from './usePlateEditorRef';
import { usePlateKey } from './usePlateKey';

export const getPlatePlugins = <T = {}>(id?: string | null) =>
  getPlateEditorRef<T>(id)?.plugins;

export const usePlatePlugins = <T = {}>(id?: string | null) => {
  usePlateKey('keyPlugins', id);

  return getPlatePlugins<T>(id);
};
