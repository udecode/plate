import { SlatePluginsOptions } from '../types/SlatePluginsStore';
import { useSlatePluginsEditor } from './useSlatePluginsEditor';

export const useSlatePluginsOptions = (id = 'main') =>
  useSlatePluginsEditor(id).options as SlatePluginsOptions;
