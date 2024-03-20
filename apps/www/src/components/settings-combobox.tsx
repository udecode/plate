import React from 'react';
import Link from 'next/link';
import { cn } from '@udecode/cn';
import { Check } from 'lucide-react';

import { customizerItems, SettingPlugin } from '@/config/customizer-items';
import { customizerPlugins, ValueId } from '@/config/customizer-plugins';
import { useFixHydration } from '@/hooks/use-fix-hydration';
import { Button, buttonVariants } from '@/registry/default/plate-ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/registry/default/plate-ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/registry/default/plate-ui/popover';

import { settingsStore } from './context/settings-store';
import { Icons } from './icons';

const categories = [
  {
    value: 'root',
    label: '',
    items: [customizerPlugins.playground],
  },
  {
    value: 'plugins',
    label: 'Plugins',
    items: [
      customizerPlugins.align,
      customizerPlugins.autoformat,
      customizerPlugins.basicnodes,
      customizerPlugins.blockselection,
      customizerPlugins.comment,
      customizerPlugins.cursoroverlay,
      customizerPlugins.deserializecsv,
      customizerPlugins.deserializedocx,
      customizerPlugins.deserializehtml,
      customizerPlugins.deserializemd,
      customizerPlugins.emoji,
      customizerPlugins.excalidraw,
      customizerPlugins.exitbreak,
      customizerPlugins.font,
      customizerPlugins.forcedlayout,
      customizerPlugins.highlight,
      customizerPlugins.hr,
      customizerPlugins.indent,
      customizerPlugins.indentlist,
      customizerPlugins.lineheight,
      customizerPlugins.link,
      customizerPlugins.list,
      customizerPlugins.media,
      customizerPlugins.mention,
      customizerPlugins.playground,
      customizerPlugins.resetnode,
      customizerPlugins.singleline,
      customizerPlugins.softbreak,
      customizerPlugins.tabbable,
      customizerPlugins.table,
      customizerPlugins.todoli,
      customizerPlugins.toggle,
      customizerPlugins.trailingblock,
    ],
  },
];

export function SettingsCombobox() {
  const [open, setOpen] = React.useState(false);
  const valueId = settingsStore.use.valueId();

  const loaded = useFixHydration();

  const route: string | undefined = (customizerPlugins as any)[valueId]?.route;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {loaded && (
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="min-w-fit justify-between md:w-[220px]"
              onClick={() => {
                // quick fix: drawer is closing it
                setTimeout(() => {
                  setOpen(!open);
                }, 0);
              }}
            >
              {(customizerPlugins as any)[valueId]?.label ??
                'Select a value...'}
              <Icons.chevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="z-[99999999] w-[220px] p-0" align="start">
          <Command defaultValue={valueId}>
            <CommandInput placeholder="Search example..." />
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
                          settingsStore.set.valueId(newId as ValueId);

                          const valuePlugins: string[] =
                            (customizerPlugins as any)[newId]?.plugins ?? [];

                          valuePlugins.forEach((pluginKey) => {
                            const deps = (
                              customizerItems[pluginKey] as
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
                            'mr-2 size-4',
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
          <Icons.externalLink className="size-4 text-muted-foreground" />
        </Link>
      )}
    </>
  );
}
