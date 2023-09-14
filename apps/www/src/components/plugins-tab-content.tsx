'use client';

// eslint-disable-next-line import/no-unresolved
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Eye, EyeOff } from 'lucide-react';

import { customizerList } from '@/config/customizer-list';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/registry/default/plate-ui/button';
import { Checkbox } from '@/registry/default/plate-ui/checkbox';

import { categoryIds, settingsStore } from './context/settings-store';
import { Icons } from './icons';
import { SettingCheckbox } from './setting-checkbox';
import { SettingsCombobox } from './settings-combobox';
import { TreeIcon } from './tree-icon';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Label } from './ui/label';

export function SettingsEffect() {
  const checkedPluginsNext = settingsStore.use.checkedPluginsNext();
  const valueId = settingsStore.use.valueId();

  const [key, setKey] = useState(1);
  const debouncedKey = useDebounce(key, 1000);

  useEffect(() => {
    if (checkedPluginsNext || valueId) {
      setKey(Math.random());
    }
  }, [checkedPluginsNext, valueId]);

  useEffect(() => {
    if (debouncedKey) {
      settingsStore.set.syncChecked();
    }
  }, [debouncedKey]);

  return null;
}

export function PluginsTabContentLazy() {
  const checkedPlugins = settingsStore.use.checkedPluginsNext();
  const checkedComponents = settingsStore.use.checkedComponents();
  const showComponents = settingsStore.use.showComponents();

  const somePluginChecked = useMemo(
    () => Object.values(checkedPlugins).some(Boolean),
    [checkedPlugins]
  );

  const someComponentChecked = useMemo(
    () => Object.values(checkedComponents).some(Boolean),
    [checkedComponents]
  );

  return (
    <div>
      <SettingsEffect />

      <div className="flex items-center">
        <Checkbox
          id="check-plugins"
          checked={somePluginChecked}
          onCheckedChange={(_checked: boolean) => {
            if (somePluginChecked) {
              settingsStore.set.checkedPluginsNext({} as any);
            } else {
              settingsStore.set.resetPlugins();
            }
          }}
        />
        <Label htmlFor="check-plugins" className="flex p-2">
          Plugins
        </Label>
      </div>

      <div className="flex items-center">
        <TreeIcon isFirst isLast className="mx-1" />

        <Checkbox
          id="check-components"
          checked={someComponentChecked}
          onCheckedChange={(_checked: boolean) => {
            if (someComponentChecked) {
              settingsStore.set.checkedComponents({} as any);
            } else {
              settingsStore.set.showComponents(true);
              settingsStore.set.resetComponents();
            }
          }}
        />

        <Label htmlFor="check-components" className="flex p-2">
          Components
        </Label>

        <Button
          size="xs"
          variant="ghost"
          className="px-2"
          onClick={() => {
            if (showComponents) {
              settingsStore.set.checkedComponents({} as any);
            }
            settingsStore.set.showComponents(!showComponents);
          }}
        >
          {showComponents ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={categoryIds} className="-mx-6">
        {customizerList.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="py-4 pl-6 pr-[34px]">
              {item.label}
            </AccordionTrigger>
            <AccordionContent className="px-6">
              <div className="flex flex-col gap-2 ">
                {item.children.map((child) => (
                  <SettingCheckbox key={child.id} {...child} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export function PluginsTabContent() {
  const loadingSettings = settingsStore.use.loadingSettings();

  return (
    <div>
      <div className="space-y-4">
        <div className="flex justify-between">
          <SettingsCombobox />
        </div>

        <div className="gap-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1 pb-4 pr-2 pt-2">
              <div className="font-semibold leading-none tracking-tight">
                Customize
              </div>
              <div className="text-xs text-muted-foreground">
                Pick the plugins and components for your editor.
              </div>
            </div>

            <Button
              onClick={() => {
                settingsStore.set.homeTab('installation');
                settingsStore.set.showSettings(false);
              }}
            >
              Done
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        {loadingSettings ? (
          <div className="mt-4 flex h-[30px] items-center justify-center">
            <Icons.spinner className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <PluginsTabContentLazy />
        )}
      </div>
    </div>
  );
}
