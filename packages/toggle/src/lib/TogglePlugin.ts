import { type PluginConfig, createTSlatePlugin } from '@udecode/plate-common';

export type TToggleElement = {
  type: typeof TogglePlugin.key;
};

export type ToggleConfig = PluginConfig<
  'toggle',
  {
    openIds?: Set<string>;
  } & ToggleSelectors,
  {
    toggle: {
      toggleIds: (ids: string[], force?: boolean | null) => void;
    };
  }
>;

type ToggleSelectors = {
  isOpen?: (toggleId: string) => boolean;
  someClosed?: (toggleIds: string[]) => boolean;
};

export const TogglePlugin = createTSlatePlugin<ToggleConfig>({
  key: 'toggle',
  node: { isElement: true },
  options: {
    openIds: new Set(),
  },
})
  .extendOptions<ToggleSelectors>(({ getOptions }) => ({
    isOpen: (toggleId) => {
      return getOptions().openIds!.has(toggleId);
    },
    someClosed: (toggleIds: string[]): boolean => {
      const { openIds } = getOptions();

      return toggleIds.some((id) => !openIds!.has(id));
    },
  }))
  .extendApi(({ setOptions }) => ({
    toggleIds: (ids: string[], force: boolean | null = null): void => {
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
