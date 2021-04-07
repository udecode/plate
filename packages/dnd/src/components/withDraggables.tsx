import { withHOC } from '@udecode/slate-plugins-common';
import { withDraggable, WithDraggableOptions } from './withDraggable';

export const withDraggables = <T,>(
  components: T,
  {
    pluginKeys,
    rootPluginKeys = [],
    ...draggableOptions
  }: {
    pluginKeys: string[];

    /**
     * Plugin keys which will be draggable at the root of the document only.
     */
    rootPluginKeys: string[];
  } & WithDraggableOptions
) => {
  return withHOC(components, {
    pluginKeys,
    hoc: (component, key) => {
      return withDraggable(component, {
        ...draggableOptions,
        level: rootPluginKeys.includes(key) ? 0 : undefined,
      });
    },
  });
};
