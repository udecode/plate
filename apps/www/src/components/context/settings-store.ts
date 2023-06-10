import { createStore } from '@udecode/plate-common';

import { SettingValue, SettingValues } from '@/config/setting-badges';
import { CheckedId, settingPlugins } from '@/config/setting-plugins';

export const categoryIds = settingPlugins.map((item) => item.id);

const defaultCheckedIds = settingPlugins.reduce((acc, item) => {
  item.children.forEach((child) => {
    acc[child.id] = true;
  });
  return acc;
}, {} as Record<CheckedId, boolean>);

export const settingsStore = createStore('settings')({
  showSettings: true,

  value: SettingValues.playground as SettingValue,

  checkedIdsNext: {
    ...defaultCheckedIds,
    singleLine: false,
    list: false,
  } as Record<CheckedId, boolean>,

  checkedIds: {
    ...defaultCheckedIds,
    singleLine: false,
    list: false,
  } as Record<CheckedId, boolean>,

  key: 1,
})
  .extendActions((set) => ({
    setCheckedIdNext: (id: CheckedId, checked: boolean, uncheck?: string[]) => {
      set.state((draft) => {
        draft.checkedIdsNext = { ...draft.checkedIdsNext };

        uncheck?.forEach((item) => {
          draft.checkedIdsNext[item] = false;
        });

        draft.checkedIdsNext[id] = checked;
      });
    },
    syncCheckedIds: () => {
      set.state((draft) => {
        draft.key += 1;
        draft.checkedIds = { ...draft.checkedIdsNext };
      });
    },
  }))
  .extendSelectors((get) => ({
    checkedIdNext: (id: CheckedId) => get.checkedIdsNext[id],
    checkedId: (id: CheckedId) => get.checkedIds[id],
  }));
