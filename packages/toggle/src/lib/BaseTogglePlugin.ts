import { type PluginConfig, createTSlatePlugin, KEYS } from 'platejs';

export type BaseToggleConfig = PluginConfig<
  'toggle',
  {
    openIds?: Set<string>;
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

export const BaseTogglePlugin = createTSlatePlugin<BaseToggleConfig>({
  key: KEYS.toggle,
  node: { isElement: true },
  options: {
    openIds: new Set(),
  },
})
  .extendSelectors<BaseToggleConfig['selectors']>(({ getOptions }) => ({
    isOpen: (toggleId) => getOptions().openIds!.has(toggleId),
    someClosed: (toggleIds) => {
      const { openIds } = getOptions();

      return toggleIds.some((id) => !openIds!.has(id));
    },
  }))
  .extendApi<BaseToggleConfig['api']['toggle']>(({ setOptions }) => ({
    toggleIds: (ids, force = null) => {
      setOptions((draft) => {
        ids.forEach((id) => {
          const isCurrentlyOpen = draft.openIds!.has(id);
          const newIsOpen = force === null ? !isCurrentlyOpen : force;

          if (newIsOpen) {
            draft.openIds!.add(id);
          } else {
            draft.openIds!.delete(id);
          }
        });
      });
    },
  }));
