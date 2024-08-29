import React from 'react';

import { cn } from '@udecode/cn';
import { Check } from 'lucide-react';
import Link from 'next/link';

import { type SettingPlugin, customizerItems } from '@/config/customizer-items';
import { type ValueId, customizerPlugins } from '@/config/customizer-plugins';
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
    items: [customizerPlugins.playground],
    label: '',
    value: 'root',
  },
  {
    items: [
      customizerPlugins.align,
      customizerPlugins.autoformat,
      customizerPlugins.basicnodes,
      customizerPlugins.blockselection,
      customizerPlugins.comment,
      customizerPlugins.cursoroverlay,
      customizerPlugins.column,
      customizerPlugins.csv,
      customizerPlugins.docx,
      customizerPlugins.html,
      customizerPlugins.markdown,
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
    label: 'Plugins',
    value: 'plugins',
  },
];

export function SettingsCombobox() {
  const [open, setOpen] = React.useState(false);
  const valueId = settingsStore.use.valueId();

  const loaded = useFixHydration();

  const route: string | undefined = (customizerPlugins as any)[valueId]?.route;

  return (
    <>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          {loaded && (
            <Button
              aria-expanded={open}
              className="min-w-fit justify-between md:w-[220px]"
              onClick={() => {
                // quick fix: drawer is closing it
                setTimeout(() => {
                  setOpen(!open);
                }, 0);
              }}
              role="combobox"
              variant="outline"
            >
              {(customizerPlugins as any)[valueId]?.label ??
                'Select a value...'}
              <Icons.chevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent align="start" className="z-[99999999] w-[220px] p-0">
          <Command defaultValue={valueId}>
            <CommandInput placeholder="Search example..." />
            <CommandEmpty>No value found.</CommandEmpty>

            <CommandList>
              {categories.map((category) => (
                <CommandGroup heading={category.label} key={category.value}>
                  {category.items.map((item) => {
                    return (
                      <CommandItem
                        key={item.id}
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
                        value={item.id}
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
