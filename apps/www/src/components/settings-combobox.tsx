import React from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { settingsStore } from './context/settings-store';
import { Icons } from './icons';

import { SettingPlugin, settingPluginItems } from '@/config/setting-plugins';
import { settingValues } from '@/config/setting-values';
import { useFixHydration } from '@/hooks/use-fix-hydration';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/registry/default/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/registry/default/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/registry/default/ui/popover';

const categories = [
  {
    value: 'root',
    label: '',
    items: [settingValues.playground],
  },
  {
    value: 'plugins',
    label: 'Plugins',
    items: [
      settingValues.align,
      settingValues.autoformat,
      settingValues.basicnodes,
      settingValues.blockselection,
      settingValues.comment,
      settingValues.cursoroverlay,
      settingValues.deserializecsv,
      settingValues.deserializedocx,
      settingValues.deserializehtml,
      settingValues.deserializemd,
      settingValues.emoji,
      settingValues.excalidraw,
      settingValues.exitbreak,
      settingValues.font,
      settingValues.forcedlayout,
      settingValues.highlight,
      settingValues.hr,
      settingValues.indent,
      settingValues.indentlist,
      settingValues.lineheight,
      settingValues.link,
      settingValues.list,
      settingValues.media,
      settingValues.mention,
      settingValues.playground,
      settingValues.resetnode,
      settingValues.singleline,
      settingValues.softbreak,
      settingValues.tabbable,
      settingValues.table,
      settingValues.todoli,
      settingValues.trailingblock,
    ],
  },
];

export function SettingsCombobox() {
  const [open, setOpen] = React.useState(false);
  const valueId = settingsStore.use.valueId();

  const loaded = useFixHydration();

  const route = settingValues[valueId]?.route;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {loaded && (
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[220px] justify-between"
            >
              {settingValues[valueId]?.label ?? 'Select a value...'}
              <Icons.chevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0">
          <Command defaultValue={valueId}>
            <CommandInput placeholder="Search value..." />
            <CommandEmpty>No value found.</CommandEmpty>

            <CommandList>
              {categories.map((category) => (
                <CommandGroup key={category.value} heading={category.label}>
                  {category.items.map((item) => {
                    return (
                      <CommandItem
                        key={item.id}
                        value={item.id}
                        onSelect={(newId) => {
                          settingsStore.set.valueId(newId);

                          const valuePlugins =
                            settingValues[newId]?.plugins ?? [];

                          valuePlugins.forEach((pluginKey) => {
                            const deps = (
                              settingPluginItems[pluginKey] as
                                | SettingPlugin
                                | undefined
                            )?.dependencies;

                            deps?.forEach((dep) => {
                              settingsStore.set.setCheckedIdNext(dep, true);
                            });
                            settingsStore.set.setCheckedIdNext(pluginKey, true);
                          });

                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            valueId === item.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {item.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {!!route && (
        <Link
          className={buttonVariants({
            size: 'sms',
            variant: 'ghost',
          })}
          href={route}
        >
          <Icons.externalLink className="h-4 w-4 text-muted-foreground" />
        </Link>
      )}
    </>
  );
}
