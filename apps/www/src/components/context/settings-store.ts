import { createStore } from '@udecode/plate-common';

import { toast } from '@/components/ui/use-toast';
import {
  CheckedId,
  SettingPlugin,
  settingPluginItems,
  settingPlugins,
} from '@/config/setting-plugins';
import { settingValues } from '@/config/setting-values';

export const categoryIds = settingPlugins.map((item) => item.id);

const defaultCheckedPlugins = settingPlugins.reduce((acc, item) => {
  item.children.forEach((child) => {
    acc[child.id] = true;
  });
  return acc;
}, {} as Record<CheckedId, boolean>);

export const getDefaultCheckedPlugins = () => {
  return {
    ...defaultCheckedPlugins,
    normalizeTypes: false,
    singleLine: false,
    list: false,
  } as Record<CheckedId, boolean>;
};

export const settingsStore = createStore('settings')({
  showSettings: true,

  valueId: settingValues.playground.id,

  checkedPluginsNext: getDefaultCheckedPlugins(),

  checkedPlugins: getDefaultCheckedPlugins(),
})
  .extendActions((set) => ({
    reset: ({
      exclude,
    }: {
      exclude?: string[];
    } = {}) => {
      set.state((draft) => {
        draft.checkedPluginsNext = getDefaultCheckedPlugins();

        exclude?.forEach((item) => {
          draft.checkedPluginsNext[item] = false;
        });
      });
    },
    setCheckedIdNext: (id: CheckedId | CheckedId[], checked: boolean) => {
      set.state((draft) => {
        draft.checkedPluginsNext = { ...draft.checkedPluginsNext };

        const conflicts =
          (settingPluginItems[id as string] as SettingPlugin)?.conflicts ?? [];

        conflicts.forEach((item) => {
          if (!draft.checkedPluginsNext[item]) return;

          draft.checkedPluginsNext[item] = false;

          const label = settingPluginItems[item]?.label;
          if (label) {
            toast({
              description: `${label} plugin disabled.`,
              variant: 'default',
            });
          }
        });

        draft.checkedPluginsNext[id as string] = checked;
      });
    },
    syncChecked: () => {
      set.state((draft) => {
        draft.checkedPlugins = { ...draft.checkedPluginsNext };
      });
    },
  }))
  .extendSelectors((get) => ({
    checkedIdNext: (id: CheckedId) => get.checkedPluginsNext[id],
    checkedId: (id: CheckedId) => get.checkedPlugins[id],
  }));
