import { createStore } from '@udecode/plate-common';

import { toast } from '@/components/ui/use-toast';
import { SettingValue, SettingValues } from '@/config/setting-badges';
import { CheckedId, settingItems, settingValues } from '@/config/setting-items';

export const categoryIds = settingValues.map((item) => item.id);

const defaultCheckedPlugins = settingValues.reduce((acc, item) => {
  item.children.forEach((child) => {
    acc[child.id] = true;
  });
  return acc;
}, {} as Record<CheckedId, boolean>);

export const settingsStore = createStore('settings')({
  showSettings: true,

  value: SettingValues.playground as SettingValue,

  checkedPluginsNext: {
    ...defaultCheckedPlugins,
    singleLine: false,
    list: false,
  } as Record<CheckedId, boolean>,

  checkedPlugins: {
    ...defaultCheckedPlugins,
    singleLine: false,
    list: false,
  } as Record<CheckedId, boolean>,

  key: 1,
})
  .extendActions((set) => ({
    setCheckedIdNext: (id: CheckedId, checked: boolean, uncheck?: string[]) => {
      set.state((draft) => {
        draft.checkedPluginsNext = { ...draft.checkedPluginsNext };

        uncheck?.forEach((item) => {
          draft.checkedPluginsNext[item] = false;

          const label = settingItems[item]?.label;
          if (label) {
            toast({
              description: `${label} unchecked.`,
              variant: 'default',
            });
          }
        });

        draft.checkedPluginsNext[id] = checked;
      });
    },
    syncChecked: () => {
      set.state((draft) => {
        draft.key += 1;
        draft.checkedPlugins = { ...draft.checkedPluginsNext };
      });
    },
  }))
  .extendSelectors((get) => ({
    checkedIdNext: (id: CheckedId) => get.checkedPluginsNext[id],
    checkedId: (id: CheckedId) => get.checkedPlugins[id],
  }));
