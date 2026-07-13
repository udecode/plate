import { type PluginConfig, createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export type BaseToggleConfig = PluginConfig<
  'toggle',
  {
    openIds: Set<string>;
  },
  {
    toggle: {
      toggleIds: (ids: string[], force?: boolean | null) => void;
    };
  },
  {},
  {
    isOpen?: (toggleId: string) => boolean;
    someClosed?: (toggleIds: string[]) => boolean;
  }
>;

export const BaseTogglePlugin = createBasePlugin<BaseToggleConfig>({
  key: KEYS.toggle,
  node: { isElement: true },
  options: {
    openIds: new Set(),
  },
})
  .extendSelectors<BaseToggleConfig['selectors']>(({ getOptions }) => ({
    isOpen: (toggleId) => getOptions().openIds.has(toggleId),
    someClosed: (toggleIds) => {
      const { openIds } = getOptions();

      return toggleIds.some((id) => !openIds.has(id));
    },
  }))
  .extendApi<BaseToggleConfig['api']['toggle']>(({ setOptions }) => ({
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
