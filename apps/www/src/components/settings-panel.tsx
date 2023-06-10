import React, { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import {
  categories,
  categoryIds,
  CheckedId,
  PluginLabels,
  SettingBadge,
  settingsStore,
} from './context/settings-store';
import { useDebounce } from './hooks/use-debounce';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Badge } from './ui/badge';
import { buttonVariants } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Icons } from './icons';
import { SettingsCombobox } from './settings-combobox';

import { cn } from '@/lib/utils';

export function SettingsSwitch({
  // icon: Icon,
  id,
  label,
  tooltip,
  route,
  badges,
  conflicts,
  dependencies,
}: {
  label: string;
  id: CheckedId;
  tooltip: string;
  route?: string;
  icon?: LucideIcon;
  badges?: SettingBadge[];
  dependencies?: CheckedId[];
  conflicts?: CheckedId[];
}) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="overflow-hidden text-left">
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Checkbox
                  id={id}
                  checked={settingsStore.use.checkedIdNext(id)}
                  onCheckedChange={(_checked: boolean) => {
                    settingsStore.set.setCheckedIdNext(
                      id,
                      _checked,
                      _checked ? conflicts : []
                    );
                  }}
                />
                <Label htmlFor={id} className="flex p-2">
                  {label}
                </Label>
              </div>
            </TooltipTrigger>

            <TooltipContent className="max-w-[200px]">{tooltip}</TooltipContent>
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
                          {PluginLabels[dependency]}
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
                    <div className="mb-2 font-semibold">Incompatible with</div>
                    <div>
                      {conflicts.map((conflict) => (
                        <Badge
                          key={conflict}
                          variant="secondary"
                          className="inline leading-none"
                        >
                          {PluginLabels[conflict]}
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

      <div>
        <Link
          href={route ?? '/docs'}
          className={cn(buttonVariants({ variant: 'ghost' }), 'h-9 w-9 p-0')}
        >
          <Icons.arrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}

export function SettingsEffect() {
  const checkedIdsNext = settingsStore.use.checkedIdsNext();

  const [key, setKey] = useState(1);
  const debouncedKey = useDebounce(key, 1000);

  useEffect(() => {
    if (checkedIdsNext) {
      setKey(Math.random());
    }
  }, [checkedIdsNext]);

  useEffect(() => {
    if (debouncedKey) {
      settingsStore.set.syncCheckedIds();
    }
  }, [debouncedKey]);

  return null;
}

export function SettingsPanel() {
  const showSettings = settingsStore.use.showSettings();

  if (!showSettings) return null;

  return (
    <div className="absolute right-0 top-[44px] z-40 h-full">
      <SettingsEffect />

      <div className="sticky right-0 top-[102px] grow border-l border-l-border bg-background">
        <ScrollArea className="relative h-[calc(100vh-102px)]">
          <div className="w-[433px]">
            {/* <h3 className="px-6 py-4 text-lg font-semibold">Value</h3> */}
            {/* <h3 className="px-6 py-4 text-lg font-semibold">Plugins</h3> */}
            <div className="px-6 pb-1 pt-4">
              <SettingsCombobox />
            </div>
            <Accordion type="multiple" defaultValue={categoryIds}>
              {categories.map((item) => (
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
        </ScrollArea>
      </div>
    </div>
  );
}
