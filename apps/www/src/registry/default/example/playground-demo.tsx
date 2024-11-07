'use client';

import React, { useRef } from 'react';

import type { ValueId } from '@/config/customizer-plugins';

import { cn } from '@udecode/cn';
import { SingleLinePlugin } from '@udecode/plate-break/react';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import { Plate, usePlateEditor } from '@udecode/plate-common/react';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { ListPlugin, TodoListPlugin } from '@udecode/plate-list/react';
import { NormalizeTypesPlugin } from '@udecode/plate-normalizers';
import { PlaywrightPlugin } from '@udecode/plate-playwright';
import { TablePlugin } from '@udecode/plate-table/react';

import { CheckPlugin } from '@/components/context/check-plugin';
import { settingsStore } from '@/components/context/settings-store';
import { createPlateUI } from '@/plate/create-plate-ui';
import { isEnabled } from '@/plate/demo/is-enabled';
import { usePlaygroundValue } from '@/plate/demo/values/usePlaygroundValue';
import { autoformatPlugin as autoformatListPlugin } from '@/registry/default/components/editor/plugins/autoformat-list-plugin';
import { autoformatPlugin } from '@/registry/default/components/editor/plugins/autoformat-plugin';
import { editorPlugins } from '@/registry/default/components/editor/plugins/editor-plugins';
import { tabbablePlugin } from '@/registry/default/components/editor/plugins/tabbable-plugin';
import { CommentsPopover } from '@/registry/default/plate-ui/comments-popover';
import { CursorOverlay } from '@/registry/default/plate-ui/cursor-overlay';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';
import { FixedToolbar } from '@/registry/default/plate-ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/registry/default/plate-ui/fixed-toolbar-buttons';
import { FixedToolbarButtonsList } from '@/registry/default/plate-ui/fixed-toolbar-buttons-list';
import { FloatingToolbar } from '@/registry/default/plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/registry/default/plate-ui/floating-toolbar-buttons';

import { usePlaygroundEnabled } from './usePlaygroundEnabled';

export const usePlaygroundEditor = (id: any = '') => {
  const overridePlugins = usePlaygroundEnabled(id);

  const value = usePlaygroundValue(id);
  const key = settingsStore.use.version();
  const editorId = id || 'playground-' + key;

  const plugins: any[] = [
    ...editorPlugins,

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
  const containerRef = useRef(null);
  const enabled = settingsStore.use.checkedComponents();

  const editor = usePlaygroundEditor(id);

  return (
    <DemoId id={id}>
      <Plate editor={editor}>
        <CheckPlugin componentId="fixed-toolbar">
          <FixedToolbar className="no-scrollbar">
            <CheckPlugin componentId="fixed-toolbar-buttons">
              {id === 'list' ? (
                <FixedToolbarButtonsList />
              ) : (
                <FixedToolbarButtons />
              )}
            </CheckPlugin>
          </FixedToolbar>
        </CheckPlugin>

        <div id="editor-playground" className="flex w-full">
          <EditorContainer
            ref={containerRef}
            variant="demo"
            className={cn(id && 'max-h-[500px]', className)}
          >
            <Editor
              variant="demo"
              className={cn(!id && 'pb-[20vh] pt-4', id && 'pb-8 pt-2')}
              spellCheck={false}
            />

            <CheckPlugin componentId="floating-toolbar">
              <FloatingToolbar
                state={{
                  // hideToolbar: aiOpen,
                  showWhenReadOnly: isEnabled(
                    'comment',
                    id,
                    enabled[CommentsPlugin.key]
                  ),
                }}
              >
                <CheckPlugin componentId="floating-toolbar-buttons">
                  <FloatingToolbarButtons />
                </CheckPlugin>
              </FloatingToolbar>
            </CheckPlugin>

            <CursorOverlay containerRef={containerRef} />
          </EditorContainer>

          <CheckPlugin
            id="comment"
            componentId="comments-popover"
            plugin={CommentsPlugin}
          >
            <CommentsPopover />
          </CheckPlugin>
        </div>
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
