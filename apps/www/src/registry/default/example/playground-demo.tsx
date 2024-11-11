'use client';

import React from 'react';

import type { ValueId } from '@/config/customizer-plugins';

import { cn } from '@udecode/cn';
import { SingleLinePlugin } from '@udecode/plate-break/react';
import { Plate, usePlateEditor } from '@udecode/plate-common/react';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { ListPlugin, TodoListPlugin } from '@udecode/plate-list/react';
import { NormalizeTypesPlugin } from '@udecode/plate-normalizers';
import { PlaywrightPlugin } from '@udecode/plate-playwright';
import { TablePlugin } from '@udecode/plate-table/react';

import { settingsStore } from '@/components/context/settings-store';
import { createPlateUI } from '@/plate/create-plate-ui';
import { isEnabled } from '@/plate/demo/is-enabled';
import { usePlaygroundValue } from '@/plate/demo/values/usePlaygroundValue';
import { autoformatPlugin as autoformatListPlugin } from '@/registry/default/components/editor/plugins/autoformat-list-plugin';
import { autoformatPlugin } from '@/registry/default/components/editor/plugins/autoformat-plugin';
import { copilotPlugins } from '@/registry/default/components/editor/plugins/copilot-plugins';
import { editorPlugins } from '@/registry/default/components/editor/plugins/editor-plugins';
import { FixedToolbarListPlugin } from '@/registry/default/components/editor/plugins/fixed-toolbar-list-plugin';
import { FixedToolbarPlugin } from '@/registry/default/components/editor/plugins/fixed-toolbar-plugin';
import { FloatingToolbarPlugin } from '@/registry/default/components/editor/plugins/floating-toolbar-plugin';
import { tabbablePlugin } from '@/registry/default/components/editor/plugins/tabbable-plugin';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

import { usePlaygroundEnabled } from './usePlaygroundEnabled';

export const usePlaygroundEditor = (id: any = '') => {
  const overridePlugins = usePlaygroundEnabled(id);

  const value = usePlaygroundValue(id);
  const key = settingsStore.use.version();
  const editorId = id || 'playground-' + key;

  const plugins: any[] = [
    ...copilotPlugins,
    ...editorPlugins,
    id === 'list' ? FixedToolbarListPlugin : FixedToolbarPlugin,
    FloatingToolbarPlugin,

    id === 'list' ? autoformatListPlugin : autoformatPlugin,
    TablePlugin.configure({
      options: {
        enableMerging: id === 'tableMerge',
      },
    }),
    ListPlugin,
    TodoListPlugin,
    ExcalidrawPlugin,
    NormalizeTypesPlugin.configure({
      options: {
        rules: [{ path: [0], strictType: HEADING_KEYS.h1 }],
      },
    }),
    SingleLinePlugin,

    // Testing
    PlaywrightPlugin.configure({
      enabled: process.env.NODE_ENV !== 'production',
    }),
  ];

  if (id === 'tabbable') {
    plugins.push(tabbablePlugin);
  }

  return usePlateEditor(
    {
      id: editorId,
      override: {
        components: createPlateUI({
          draggable: isEnabled('dnd', id),
          placeholder: isEnabled('placeholder', id),
        }),
        plugins: overridePlugins,
      },
      plugins,
      value: value,
    },
    []
  );
};

export default function PlaygroundDemo({
  id,
  className,
}: {
  id?: ValueId;
  className?: string;
  scrollSelector?: string;
}) {
  const editor = usePlaygroundEditor(id);

  return (
    <DemoId id={id}>
      <Plate editor={editor}>
        <EditorContainer
          className={cn(id ? 'h-[500px]' : 'h-[650px]', className)}
        >
          <Editor
            variant="demo"
            className={cn(!id && 'pb-[20vh]', id && 'h-[463px] pb-8')}
            spellCheck={false}
          />
        </EditorContainer>
      </Plate>
    </DemoId>
  );
}

const DemoIdContext = React.createContext<string | undefined>(undefined);

export function DemoId({
  id,
  children,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  return <DemoIdContext.Provider value={id}>{children}</DemoIdContext.Provider>;
}

export function useDemoId() {
  return React.useContext(DemoIdContext);
}
