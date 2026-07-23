import {
  type InferConfig,
  type PluginConfig,
  createBasePlugin,
} from '@platejs/core';
import { schema } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

type BaseToggleContract = PluginConfig<
  'toggle',
  {
    openIds: Set<string>;
  },
  {},
  {},
  {
    isOpen?: (toggleId: string) => boolean;
    someClosed?: (toggleIds: string[]) => boolean;
  },
  {},
  readonly [],
  readonly [],
  never,
  {
    toggleIds: (ids: string[], force?: boolean | null) => void;
  }
>;

export const BaseTogglePlugin = createBasePlugin({
  key: KEYS.toggle,
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
  options: {
    openIds: new Set<string>(),
  },
})
  .extendSelectors<BaseToggleContract['selectors']>(({ getOptions }) => ({
    isOpen: (toggleId) => getOptions().openIds.has(toggleId),
    someClosed: (toggleIds) => {
      const { openIds } = getOptions();

      return toggleIds.some((id) => !openIds.has(id));
    },
  }))
  .extendApi<BaseToggleContract['pluginApi']>(({ setOptions }) => ({
    toggleIds: (ids, force = null) => {
      setOptions((draft) => {
        if (!draft.openIds) draft.openIds = new Set();

        const { openIds } = draft;

        ids.forEach((id) => {
          const isCurrentlyOpen = openIds.has(id);
          const newIsOpen = force === null ? !isCurrentlyOpen : force;

          if (newIsOpen) {
            openIds.add(id);
          } else {
            openIds.delete(id);
          }
        });
      });
    },
  }));

export type BaseToggleConfig = InferConfig<typeof BaseTogglePlugin>;
