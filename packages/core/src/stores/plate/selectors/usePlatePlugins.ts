import { getPlateEditorRef } from './usePlateEditorRef';
import { usePlateKey } from './usePlateKey';

export const getPlatePlugins = <T = {}>(id?: string | null) =>
  getPlateEditorRef(id)?.plugins;

export const usePlatePlugins = (id?: string | null) => {
  usePlateKey('keyPlugins', id);

  return getPlatePlugins(id);
};
