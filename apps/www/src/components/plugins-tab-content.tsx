'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { useStoreValue } from '@udecode/plate/react';
import { ArrowUpRight, Eye, EyeOff } from 'lucide-react';

import { customizerList } from '@/config/customizer-items';
import { useDebounce } from '@/registry/default/hooks/use-debounce';
import { Button } from '@/registry/default/plate-ui/button';
import { Checkbox } from '@/registry/default/plate-ui/checkbox';

import { Label } from '../registry/default/plate-ui/label';
import { categoryIds, SettingsStore } from './context/settings-store';
import { Icons } from './icons';
import { SettingCheckbox } from './setting-checkbox';
import { TreeIcon } from './tree-icon';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

export function SettingsEffect() {
  const checkedPluginsNext = useStoreValue(SettingsStore, 'checkedPluginsNext');
  const valueId = useStoreValue(SettingsStore, 'valueId');

  const [key, setKey] = useState(1);
  const debouncedKey = useDebounce(key, 1000);

  useEffect(() => {
    if (checkedPluginsNext || valueId) {
      setKey(Math.random());
    }
  }, [checkedPluginsNext, valueId]);

  useEffect(() => {
    if (debouncedKey) {
      SettingsStore.set('syncChecked');
    }
  }, [debouncedKey]);

  return null;
}

export function PluginsTabContentLazy() {
  const checkedPlugins = useStoreValue(SettingsStore, 'checkedPlugins');
  const checkedComponents = useStoreValue(SettingsStore, 'checkedComponents');
  const showComponents = useStoreValue(SettingsStore, 'showComponents');

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
      {/* <SettingsEffect /> */}

      <div className="flex items-center">
        <Checkbox
          id="check-plugins"
          checked={somePluginChecked}
          onCheckedChange={(_checked: boolean) => {
            if (somePluginChecked) {
              SettingsStore.set('checkedPlugins', {} as any);
              // settingsStore.set.checkedPluginsNext({} as any);
            } else {
              SettingsStore.set('resetPlugins');
            }
          }}
        />
        <Label className="flex p-2" htmlFor="check-plugins">
          Plugins
        </Label>
      </div>

      <div className="flex items-center">
        <TreeIcon className="mx-1" isFirst isLast />

        <Checkbox
          id="check-components"
          checked={someComponentChecked}
          onCheckedChange={(_checked: boolean) => {
            if (someComponentChecked) {
              SettingsStore.set('checkedComponents', {} as any);
            } else {
              SettingsStore.set('showComponents', true);
              SettingsStore.set('resetComponents');
            }
          }}
        />

        <Label className="flex p-2" htmlFor="check-components">
          Components
        </Label>

        <Button
          size="xs"
          variant="ghost"
          className="px-2"
          onClick={() => {
            if (showComponents) {
              SettingsStore.set('checkedComponents', {} as any);
            }

            SettingsStore.set('showComponents', !showComponents);
          }}
        >
          {showComponents ? (
            <Eye className="size-4" />
          ) : (
            <EyeOff className="size-4" />
          )}
        </Button>
      </div>

      <Accordion className="-mx-6" defaultValue={categoryIds} type="multiple">
        {customizerList.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="py-4 pr-[34px] pl-6">
              {item.label}
            </AccordionTrigger>
            <AccordionContent className="px-6">
              <div className="flex flex-col gap-2">
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
  const loadingSettings = useStoreValue(SettingsStore, 'loadingSettings');

  return (
    <div>
      <div className="space-y-4">
        <div className="gap-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1 pt-2 pr-2 pb-4">
              <div className="leading-none font-semibold tracking-tight">
                Customize
              </div>
              <div className="text-xs text-muted-foreground">
                Pick the plugins and components for your editor.
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => {
                // settingsStore.set.homeTab('installation');
                SettingsStore.set('showSettings', false);
                SettingsStore.set('state', (draft) => {
                  draft.version = draft.version! + 1;
                });
              }}
            >
              Done
              <ArrowUpRight />
            </Button>
          </div>
        </div>
        {loadingSettings ? (
          <div className="mt-4 flex h-[30px] items-center justify-center">
            <Icons.spinner className="size-5 animate-spin" />
          </div>
        ) : (
          <PluginsTabContentLazy />
        )}
      </div>
    </div>
  );
}
