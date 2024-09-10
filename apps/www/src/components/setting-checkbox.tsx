import React from 'react';

import { cn } from '@udecode/cn';
import Link from 'next/link';

import { type SettingPlugin, customizerItems } from '@/config/customizer-items';
import { descriptions } from '@/config/descriptions';
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
  badges,
  components,
  conflicts,
  dependencies,
  id,
  label,
  route,
}: SettingPlugin) {
  const description = descriptions[id];

  if (!description) {
    throw new Error(`No description found for ${id}`);
  }

  // const checked = settingsStore.use.checkedIdNext(id);
  const checked = settingsStore.use.checkedId(id);
  const showComponents = settingsStore.use.showComponents();
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
                    checked={checked}
                    id={id}
                    onCheckedChange={(_checked: boolean) => {
                      settingsStore.set.setCheckedIdNext(id, _checked);
                    }}
                  />
                  <Label className="flex p-2" htmlFor={id}>
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
                  className="leading-none"
                  key={badge.label}
                  variant="secondary"
                >
                  {badge.label}
                </Badge>
              ))}

              {!!dependencies?.length && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Badge
                      className="cursor-pointer leading-none"
                      variant="secondary"
                    >
                      {dependencies.length}
                      <Icons.dependency className="ml-1 size-2.5 text-muted-foreground" />
                    </Badge>
                  </PopoverTrigger>

                  <PopoverContent>
                    <div className="gap-2 text-sm">
                      <div className="mb-2 font-semibold">Depends on</div>
                      <div>
                        {dependencies.map((dependency) => (
                          <Badge
                            className="inline leading-none"
                            key={dependency}
                            variant="secondary"
                          >
                            {customizerItems[dependency].label}
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
                      className="cursor-pointer leading-none"
                      variant="secondary"
                    >
                      {conflicts.length}
                      <Icons.conflict className="ml-1 size-2.5 text-muted-foreground" />
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
                            className="inline leading-none"
                            key={conflict}
                            variant="secondary"
                          >
                            {customizerItems[conflict].label}
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
              className={cn(buttonVariants({ variant: 'ghost' }), 'size-9 p-0')}
              href={route}
              target="_blank"
            >
              <Icons.arrowRight className="size-4 text-muted-foreground" />
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
                className="flex items-center justify-between"
                key={componentId}
              >
                <div className="flex items-center">
                  <TreeIcon
                    className="mx-1"
                    isFirst={isFirst}
                    isLast={isLast}
                  />

                  <SettingComponentCheckbox
                    componentId={componentId}
                    htmlId={componentHtmlId}
                  />

                  <Label className="flex p-2" htmlFor={componentHtmlId}>
                    <Code>{componentLabel}</Code>
                  </Label>
                </div>

                {!!componentRoute && (
                  <div>
                    <Link
                      className={cn(
                        buttonVariants({ variant: 'ghost' }),
                        'size-9 p-0'
                      )}
                      href={componentRoute}
                      target="_blank"
                    >
                      <Icons.arrowRight className="size-4 text-muted-foreground" />
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

export function SettingComponentCheckbox({
  componentId,
  htmlId,
}: {
  componentId: string;
  htmlId: string;
}) {
  const checked = settingsStore.use.checkedComponentId(componentId);

  return (
    <Checkbox
      checked={!!checked}
      id={htmlId}
      onCheckedChange={(value) => {
        settingsStore.set.setCheckedComponentId(componentId, !!value);
      }}
    />
  );
}
