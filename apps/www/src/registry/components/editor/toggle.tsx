'use client';

import * as React from 'react';

import {
  type PlateElementProps,
  PlateElement,
  useEditor,
  useEditorPlugin,
  usePluginStore,
} from 'platejs/react';
import { BaseTogglePlugin } from '@platejs/toggle';
import { TogglePlugin } from '@platejs/toggle/react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IndentKit } from '@/registry/components/editor/indent';

export function ToggleElement(props: PlateElementProps<typeof TogglePlugin>) {
  const editor = useEditor();
  const element = props.element;
  const toggleKey = editor.key(element);
  const open = usePluginStore(BaseTogglePlugin, 'openKeys').has(toggleKey);
  const { api } = useEditorPlugin(BaseTogglePlugin);

  return (
    <PlateElement {...props} className="pl-6">
      <Button
        size="icon"
        variant="ghost"
        className="-left-0.5 absolute top-0 size-6 cursor-pointer select-none items-center justify-center rounded-md p-px text-muted-foreground transition-colors hover:bg-accent [&_svg]:size-4"
        contentEditable={false}
        onClick={(event) => {
          event.preventDefault();
          api.toggleKeys([toggleKey]);
        }}
        onMouseDown={(event) => event.preventDefault()}
      >
        <ChevronRight
          className={
            open
              ? 'rotate-90 transition-transform duration-75'
              : 'rotate-0 transition-transform duration-75'
          }
        />
      </Button>
      {props.children}
    </PlateElement>
  );
}

export const ToggleKit = [
  ...IndentKit,
  TogglePlugin.configure({ component: ToggleElement }),
];
