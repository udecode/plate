import { useCallback } from 'react';
import { SlatePluginOptionKey } from '../types/SlatePluginsStore';
import { useSlatePluginsStore } from './useSlatePluginsStore';

export const useSlatePluginsOption = ({
  pluginKey,
  optionKey,
  id = 'main',
}: {
  pluginKey: string;
  optionKey: SlatePluginOptionKey;
  id?: string;
}) =>
  useSlatePluginsStore(
    useCallback((state) => state.byId[id]?.options[pluginKey]?.[optionKey], [
      id,
      optionKey,
      pluginKey,
    ])
  );
