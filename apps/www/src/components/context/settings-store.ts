'use client';

import { SingleLinePlugin } from '@udecode/plate-break/react';
import { createZustandStore } from '@udecode/plate-common';
import { NormalizeTypesPlugin } from '@udecode/plate-normalizers';
import { SelectOnBackspacePlugin } from '@udecode/plate-select';

import { customizerList } from '@/config/customizer-items';

export const categoryIds = customizerList.map((item) => item.id);

const defaultCheckedComponents = {} as Record<string, boolean>;

const defaultCheckedPlugins = customizerList.reduce(
  (acc, item) => {
    item.children.forEach((child) => {
      child.components?.forEach((component) => {
        defaultCheckedComponents[component.id] = true;
      });

      acc[child.id] = true;
    });

    return acc;
  },
  {} as Record<string, boolean>
);

export const getDefaultCheckedPlugins = () => {
  return {
    ...defaultCheckedPlugins,
    [NormalizeTypesPlugin.key]: false,
    [SelectOnBackspacePlugin.key]: false,
    [SingleLinePlugin.key]: false,
    list: false,
  } as Record<string, boolean>;
};

export const getDefaultCheckedComponents = () => {
  return {
    ...defaultCheckedComponents,
  } as Record<string, boolean>;
};

export type SettingsStoreValue = {
  checkedComponents: Record<string, boolean>;
  checkedPlugins: Record<string, boolean>;
  checkedPluginsNext: Record<string, boolean>;
  customizerTab: string;
  homeTab: string;
  loadingSettings: boolean;
  showComponents: boolean;
  showSettings: boolean;
  valueId: string;
  version: number;
};

const initialState: SettingsStoreValue = {
  checkedComponents: getDefaultCheckedComponents(),
  checkedPlugins: getDefaultCheckedPlugins(),
  checkedPluginsNext: getDefaultCheckedPlugins(),
  // homeTab: 'installation',
  customizerTab: 'plugins',
  homeTab: 'playground',
  loadingSettings: true,

  showComponents: true,

  showSettings: false,

  valueId: 'playground',
  version: 1,
};

export const settingsStore = createZustandStore('settings')(initialState)
  .extendActions((set) => ({
    resetComponents: ({
      exclude,
    }: {
      exclude?: string[];
    } = {}) => {
      set.state((draft) => {
        draft.checkedComponents = getDefaultCheckedComponents();

        exclude?.forEach((item) => {
          draft.checkedComponents[item] = false;
        });
      });
    },
    resetPlugins: ({
      exclude,
    }: {
      exclude?: string[];
    } = {}) => {
      set.state((draft) => {
        // draft.checkedPluginsNext = getDefaultCheckedPlugins();
        draft.checkedPlugins = getDefaultCheckedPlugins();
        exclude?.forEach((item) => {
          // draft.checkedPluginsNext[item] = false;
          draft.checkedPlugins[item] = false;
        });
      });
    },
    setCheckedComponentId: (id: string[] | string, checked: boolean) => {
      set.state((draft) => {
        draft.checkedComponents[id as string] = checked;
      });
    },
    setCheckedIdNext: (id: string[] | string, checked: boolean) => {
      set.state((draft) => {
        draft.checkedPlugins[id as string] = checked;

        // draft.checkedPluginsNext = { ...draft.checkedPluginsNext };

        // const conflicts =
        //   (customizerItems[id as string] as SettingPlugin)?.conflicts ?? [];

        // conflicts.forEach((item) => {
        //   if (!draft.checkedPluginsNext[item]) return;

        //   draft.checkedPluginsNext[item] = false;

        //   const label = customizerItems[item]?.label;

        //   if (label) {
        //     toast(`${label} plugin disabled.`);
        //   }
        // });

        // draft.checkedPluginsNext[id as string] = checked;
      });
    },
    syncChecked: () => {
      set.state((draft) => {
        draft.checkedPlugins = { ...draft.checkedPluginsNext };
      });
    },
  }))
  .extendSelectors((get) => ({
    checkedComponentId: (id?: string) => id && get.checkedComponents[id],
    checkedId: (id: string) => get.checkedPlugins[id],
    checkedIdNext: (id: string) => get.checkedPluginsNext[id],
  }));
