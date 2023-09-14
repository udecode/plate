import React from 'react';
import Link from 'next/link';

import { descriptions } from '@/config/descriptions';
import { SettingPlugin, settingPluginItems } from '@/config/setting-plugins';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/registry/default/plate-ui/button';
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

import { Code } from './code';
import { settingsStore } from './context/settings-store';
import { Icons } from './icons';
import { TreeIcon } from './tree-icon';
import { Badge } from './ui/badge';
import { Label } from './ui/label';

export function SettingCheckbox({
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
              target="_blank"
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
          (
            { id: componentId, label: componentLabel, route: componentRoute },
            componentIndex
          ) => {
            const isFirst = componentIndex === 0;
            const isLast = componentIndex === components.length - 1;
            const componentHtmlId = `${pluginHtmlId}-${componentId}`;

            return (
              <div
                key={componentId}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <TreeIcon
                    isFirst={isFirst}
                    isLast={isLast}
                    className="mx-1"
                  />

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

                {!!componentRoute && (
                  <div>
                    <Link
                      href={componentRoute}
                      target="_blank"
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
            );
          }
        )}
    </div>
  );
}
