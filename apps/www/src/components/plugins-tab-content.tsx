'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Eye, EyeOff } from 'lucide-react';

import { descriptions } from '@/config/descriptions';
import {
  SettingPlugin,
  settingPluginItems,
  settingPlugins,
} from '@/config/setting-plugins';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { Button, buttonVariants } from '@/registry/default/plate-ui/button';
import { Checkbox } from '@/registry/default/plate-ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/registry/default/plate-ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/registry/default/plate-ui/tooltip';
// eslint-disable-next-line import/no-unresolved
import { TreeIcon } from '@/app/_components/tree-icon';

import { Code } from './code';
import { categoryIds, settingsStore } from './context/settings-store';
import { Icons } from './icons';
import { SettingsCombobox } from './settings-combobox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Badge } from './ui/badge';
import { Label } from './ui/label';

export function SettingsSwitch({
  id,
  label,
  route,
  badges,
  conflicts,
  dependencies,
  components,
}: SettingPlugin) {
  const description = descriptions[id];

  if (!description) {
    throw new Error(`No description found for ${id}`);
  }

  const checked = settingsStore.use.checkedIdNext(id);
  const showComponents = settingsStore.use.showComponents();
  const checkedComponents = settingsStore.use.checkedComponents();
  const pluginHtmlId = `plugin-${id}`;

  return (
    <div>
      <div className="flex w-full items-center justify-between">
        <div className="overflow-hidden text-left">
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={(_checked: boolean) => {
                      settingsStore.set.setCheckedIdNext(id, _checked);
                    }}
                  />
                  <Label htmlFor={id} className="flex p-2">
                    {label}
                  </Label>
                </div>
              </TooltipTrigger>

              <TooltipContent className="max-w-[200px]">
                {description}
              </TooltipContent>
            </Tooltip>

            <div className="flex flex-wrap gap-1">
              {badges?.map((badge) => (
                <Badge
                  key={badge.label}
                  variant="secondary"
                  className="leading-none"
                >
                  {badge.label}
                </Badge>
              ))}

              {!!dependencies?.length && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer leading-none"
                    >
                      {dependencies.length}
                      <Icons.dependency className="ml-1 h-2.5 w-2.5 text-muted-foreground" />
                    </Badge>
                  </PopoverTrigger>

                  <PopoverContent>
                    <div className="gap-2 text-sm">
                      <div className="mb-2 font-semibold">Depends on</div>
                      <div>
                        {dependencies.map((dependency) => (
                          <Badge
                            key={dependency}
                            variant="secondary"
                            className="inline leading-none"
                          >
                            {settingPluginItems[dependency].label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {!!conflicts?.length && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer leading-none"
                    >
                      {conflicts.length}
                      <Icons.conflict className="ml-1 h-2.5 w-2.5 text-muted-foreground" />
                    </Badge>
                  </PopoverTrigger>

                  <PopoverContent>
                    <div className="gap-2 text-sm">
                      <div className="mb-2 font-semibold">
                        Incompatible with
                      </div>
                      <div>
                        {conflicts.map((conflict) => (
                          <Badge
                            key={conflict}
                            variant="secondary"
                            className="inline leading-none"
                          >
                            {settingPluginItems[conflict].label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </div>

        {!!route && (
          <div>
            <Link
              href={route}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'h-9 w-9 p-0'
              )}
            >
              <Icons.arrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        )}
      </div>

      {showComponents &&
        checked &&
        components?.map(
          ({ id: componentId, label: componentLabel }, componentIndex) => {
            const isFirst = componentIndex === 0;
            const isLast = componentIndex === components.length - 1;
            const componentHtmlId = `${pluginHtmlId}-${componentId}`;

            return (
              <div key={componentId} className="flex items-center">
                <TreeIcon isFirst={isFirst} isLast={isLast} className="mx-1" />

                <Checkbox
                  id={componentHtmlId}
                  checked={checkedComponents[componentId]}
                  onCheckedChange={(value) => {
                    settingsStore.set.setCheckedComponentId(
                      componentId,
                      !!value
                    );
                  }}
                />

                <Label htmlFor={componentHtmlId} className="flex p-2">
                  <Code>{componentLabel}</Code>
                </Label>
              </div>
            );
          }
        )}
    </div>
  );
}

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
        {settingPlugins.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="px-6 py-4">
              {item.label}
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2 pl-6 pr-3.5">
                {item.children.map((child) => (
                  <SettingsSwitch key={child.id} {...child} />
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
