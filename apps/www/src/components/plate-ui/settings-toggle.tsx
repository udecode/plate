import React from 'react';
import { createStore } from '@udecode/plate-common';
import { LucideIcon } from 'lucide-react';

import { Icons } from '@/components/icons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Toggle } from '@/components/ui/toggle';

export type CheckedId = 'heading';

export const settingsStore = createStore('settings')({
  showSettings: true,

  checkedIds: {
    heading: true,
  } as Record<CheckedId, boolean>,
})
  .extendActions((set) => ({
    setCheckedId: (id: CheckedId, checked: boolean) => {
      set.state((draft) => {
        draft.checkedIds[id] = checked;
      });
    },
  }))
  .extendSelectors((get) => ({
    checkedId: (id: CheckedId) => get.checkedIds[id],
  }));

export function SettingsToggle() {
  const showSettings = settingsStore.use.showSettings();

  return (
    <div className="absolute right-0 top-0 z-50 pr-1 pt-1">
      <div className="right-0 top-[100px] z-10">
        <Toggle
          className="h-9 w-9 p-0"
          pressed={showSettings}
          onClick={() =>
            settingsStore.set.showSettings(!settingsStore.get.showSettings())
          }
        >
          <Icons.plugin className="h-6 w-6" />
        </Toggle>
      </div>
    </div>
  );
}

export function SettingsSwitch({
  icon: Icon,
  id,
  label,
  popoverContent,
}: {
  label: string;
  id: CheckedId;
  icon: LucideIcon;
  popoverContent: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        id={id}
        checked={settingsStore.use.checkedId(id)}
        onCheckedChange={(_checked) =>
          settingsStore.set.setCheckedId(id, _checked)
        }
      />
      <Label htmlFor={id}>{label}</Label>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="h-9 w-9 p-0">
            <Icon className="h-4 w-4 text-muted-foreground " />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[265px]" side="top">
          {popoverContent}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function SettingsPanel() {
  const showSettings = settingsStore.use.showSettings();

  return (
    showSettings && (
      <div className="absolute right-0 top-0 z-40 h-full w-[217px] border-l border-l-border">
        <div className="p-3 px-4">
          <h3 className="mb-2 text-lg font-semibold">Plugins</h3>

          <Accordion type="multiple">
            <AccordionItem value="item-1">
              <AccordionTrigger>Basic</AccordionTrigger>
              <AccordionContent>
                <SettingsSwitch
                  id="heading"
                  label="Heading"
                  icon={Icons.info}
                  popoverContent="Structure your content into well-defined sections using up to six different levels of headings."
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    )
  );
}
