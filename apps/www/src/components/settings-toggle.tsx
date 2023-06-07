import React from 'react';
import { LucideIcon } from 'lucide-react';
import {
  categories,
  categoryIds,
  CheckedId,
  settingsStore,
} from './context/settings-store';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { Toggle } from './ui/toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Icons } from './icons';

export function SettingsToggle() {
  const showSettings = settingsStore.use.showSettings();

  return (
    <div className="absolute right-0 top-0 z-50 pr-1 pt-1">
      <div className="right-0 top-[100px] z-10">
        <Toggle
          className="h-9 w-9 p-0"
          pressed={showSettings}
          onPressedChange={(pressed) => settingsStore.set.showSettings(pressed)}
        >
          <Icons.plugin className="h-6 w-6" />
        </Toggle>
      </div>
    </div>
  );
}

export function SettingsSwitch({
  // icon: Icon,
  id,
  label,
  tooltip,
}: {
  label: string;
  id: CheckedId;
  tooltip: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex w-full items-center justify-between">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-left">
            <div className="flex items-center">
              <Checkbox
                id={id}
                checked={settingsStore.use.checkedId(id)}
                onCheckedChange={(_checked: boolean) => {
                  settingsStore.set.setCheckedId(id, _checked);
                }}
              />
              <Label htmlFor={id} className="flex p-2">
                {label}
              </Label>
              <div className="flex gap-1">
                <Badge variant="secondary">Element</Badge>
                <Badge variant="secondary">Inline</Badge>
                <Badge variant="secondary">Void</Badge>
              </div>
            </div>
          </div>
        </TooltipTrigger>

        <TooltipContent className="max-w-[200px]">{tooltip}</TooltipContent>
      </Tooltip>

      {/* <Toggle */}
      {/*  id={id} */}
      {/*  pressed={settingsStore.use.checkedId(id)} */}
      {/*  size="sm" */}
      {/*  className="flex max-w-[144px] flex-nowrap text-ellipsis pr-2" */}
      {/*  onPressedChange={(pressed) => { */}
      {/*    settingsStore.set.setCheckedId(id, pressed); */}
      {/*  }} */}
      {/* > */}
      {/*  {settingsStore.use.checkedId(id) ? ( */}
      {/*    <Icons.check className="mr-2 !h-4 !w-4" /> */}
      {/*  ) : ( */}
      {/*    <div className="mr-2 w-4" /> */}
      {/*  )} */}

      {/* </Toggle> */}

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="h-9 w-9 p-0">
            <Icons.arrowRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[265px]" side="top">
          {tooltip}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function SettingsPanel() {
  const showSettings = settingsStore.use.showSettings();

  if (!showSettings) return null;

  return (
    <div className="sticky top-[102px] z-10 h-full grow border-l border-l-border">
      <ScrollArea className="relative h-[calc(100vh-102px)] w-[434px]">
        <h3 className="px-6 py-4 text-lg font-semibold">Plugins</h3>

        <Accordion type="multiple" defaultValue={categoryIds}>
          {categories.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="px-6 py-4">
                {item.label}
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2 pl-6 pr-3.5">
                  {item.children.map((child) => (
                    <SettingsSwitch
                      key={child.id}
                      id={child.id}
                      label={child.label}
                      tooltip={child.tooltip}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
}
