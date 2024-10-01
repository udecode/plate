'use client';

import React, { useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import type { ValueId } from '@/config/customizer-plugins';

import { cn } from '@udecode/cn';
import { AIPlugin } from '@udecode/plate-ai/react';
import { AlignPlugin } from '@udecode/plate-alignment/react';
import { AutoformatPlugin } from '@udecode/plate-autoformat/react';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { SingleLinePlugin } from '@udecode/plate-break/react';
import { CaptionPlugin } from '@udecode/plate-caption/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import {
  ParagraphPlugin,
  Plate,
  usePlateEditor,
} from '@udecode/plate-common/react';
import { DatePlugin } from '@udecode/plate-date/react';
import { DndPlugin } from '@udecode/plate-dnd';
import { DocxPlugin } from '@udecode/plate-docx';
import { EmojiPlugin } from '@udecode/plate-emoji/react';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontSizePlugin,
} from '@udecode/plate-font/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { HeadingPlugin, TocPlugin } from '@udecode/plate-heading/react';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { JuicePlugin } from '@udecode/plate-juice';
import { KbdPlugin } from '@udecode/plate-kbd/react';
import { ColumnPlugin } from '@udecode/plate-layout/react';
import { LineHeightPlugin } from '@udecode/plate-line-height/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { ListPlugin, TodoListPlugin } from '@udecode/plate-list/react';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import { ImagePlugin, MediaEmbedPlugin } from '@udecode/plate-media/react';
import { MentionPlugin } from '@udecode/plate-mention/react';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { NormalizeTypesPlugin } from '@udecode/plate-normalizers';
import { PlaywrightPlugin } from '@udecode/plate-playwright';
import { DeletePlugin, SelectOnBackspacePlugin } from '@udecode/plate-select';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import { SlashPlugin } from '@udecode/plate-slash-command/react';
import { TablePlugin } from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';
import Prism from 'prismjs';

import { CheckPlugin } from '@/components/context/check-plugin';
import { settingsStore } from '@/components/context/settings-store';
import { PlaygroundFixedToolbarButtons } from '@/components/plate-ui/playground-fixed-toolbar-buttons';
import { PlaygroundFloatingToolbar } from '@/components/plate-ui/playground-floating-toolbar';
import { PlaygroundFloatingToolbarButtons } from '@/components/plate-ui/playground-floating-toolbar-buttons';
import { getAutoformatOptions } from '@/lib/plate/demo/plugins/autoformatOptions';
import { copilotPlugin } from '@/lib/plate/demo/plugins/copilotPlugin';
import { createPlateUI } from '@/plate/create-plate-ui';
import { editableProps } from '@/plate/demo/editableProps';
import { isEnabled } from '@/plate/demo/is-enabled';
import { DragOverCursorPlugin } from '@/plate/demo/plugins/DragOverCursorPlugin';
import { exitBreakPlugin } from '@/plate/demo/plugins/exitBreakPlugin';
import { resetBlockTypePlugin } from '@/plate/demo/plugins/resetBlockTypePlugin';
import { softBreakPlugin } from '@/plate/demo/plugins/softBreakPlugin';
import { tabbablePlugin } from '@/plate/demo/plugins/tabbablePlugin';
import { commentsData, usersData } from '@/plate/demo/values/commentsValue';
import { usePlaygroundValue } from '@/plate/demo/values/usePlaygroundValue';
import { AIMenu } from '@/registry/default/plate-ui/ai-menu';
import { createAIEditor } from '@/registry/default/plate-ui/ai-previdew-editor';
import { CommentsPopover } from '@/registry/default/plate-ui/comments-popover';
import {
  CursorOverlay,
  SelectionOverlayPlugin,
} from '@/registry/default/plate-ui/cursor-overlay';
import { Editor } from '@/registry/default/plate-ui/editor';
import { FixedToolbar } from '@/registry/default/plate-ui/fixed-toolbar';
import { ImagePreview } from '@/registry/default/plate-ui/image-preview';
import {
  FireLiComponent,
  FireMarker,
} from '@/registry/default/plate-ui/indent-fire-marker-component';
import {
  TodoLi,
  TodoMarker,
} from '@/registry/default/plate-ui/indent-todo-marker-component';
import { LinkFloatingToolbar } from '@/registry/default/plate-ui/link-floating-toolbar';

import { usePlaygroundEnabled } from './usePlaygroundEnabled';

export const usePlaygroundEditor = (id: any = '', scrollSelector?: string) => {
  const enabledPlugins = settingsStore.use.checkedPlugins();
  const overridePlugins = usePlaygroundEnabled(id);
  const autoformatOptions = getAutoformatOptions(id, enabledPlugins);

  const value = usePlaygroundValue(id);
  const key = settingsStore.use.version();

  const editorId = id || 'playground-' + key;

  const a = usePlateEditor(
    {
      id: editorId,
      override: {
        components: createPlateUI({
          draggable: isEnabled('dnd', id),
          placeholder: isEnabled('placeholder', id),
        }),
        plugins: overridePlugins,
      },
      plugins: [
        //ai
        copilotPlugin,
        // Nodes
        HeadingPlugin,
        TocPlugin.configure({
          options: {
            scrollContainerSelector: `#${scrollSelector}`,
            topOffset: 80,
          },
        }),
        BlockquotePlugin,
        CodeBlockPlugin.configure({
          options: {
            prism: Prism,
          },
        }),
        HorizontalRulePlugin,
        LinkPlugin.extend({
          render: { afterEditable: () => <LinkFloatingToolbar /> },
        }),
        ListPlugin,
        ImagePlugin.extend({
          render: { afterEditable: ImagePreview },
        }),
        MediaEmbedPlugin,
        CaptionPlugin.configure({
          options: {
            plugins: [ImagePlugin, MediaEmbedPlugin],
          },
        }),
        DatePlugin,
        MentionPlugin.configure({
          options: {
            triggerPreviousCharPattern: /^$|^[\s"']$/,
          },
        }),
        SlashPlugin,
        TablePlugin.configure({
          options: {
            enableMerging: id === 'tableMerge',
          },
        }),
        SelectionOverlayPlugin,
        AIPlugin.configure({
          options: {
            createAIEditor: createAIEditor,
            // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
            fetchSuggestion: async ({ abortSignal, prompt, system }) => {
              const response = await fetch('/api/stream', {
                body: JSON.stringify({ prompt, system }),
                headers: {
                  'Content-Type': 'application/json',
                },
                method: 'POST',
                signal: abortSignal.signal,
              }).catch((error) => {
                console.error(error);
              });

              if (!response || !response.body) {
                throw new Error('Response or response body is null or abort');
              }

              return response.body;
            },
            scrollContainerSelector: `#${scrollSelector}`,
          },
          render: { aboveEditable: AIMenu },
        }),
        TodoListPlugin,
        TogglePlugin,
        ExcalidrawPlugin,
        // Marks
        BoldPlugin,
        ItalicPlugin,
        UnderlinePlugin,
        StrikethroughPlugin,
        CodePlugin,
        SubscriptPlugin,
        SuperscriptPlugin,
        FontColorPlugin,
        FontBackgroundColorPlugin,
        FontSizePlugin,
        HighlightPlugin,
        KbdPlugin,

        // Block Style
        AlignPlugin.extend({
          inject: {
            targetPlugins: [
              ParagraphPlugin.key,
              MediaEmbedPlugin.key,
              HEADING_KEYS.h1,
              HEADING_KEYS.h2,
              HEADING_KEYS.h3,
              HEADING_KEYS.h4,
              HEADING_KEYS.h5,
              ImagePlugin.key,
              HEADING_KEYS.h6,
            ],
          },
        }),
        IndentPlugin.extend({
          inject: {
            targetPlugins: [
              ParagraphPlugin.key,
              HEADING_KEYS.h1,
              HEADING_KEYS.h2,
              HEADING_KEYS.h3,
              HEADING_KEYS.h4,
              HEADING_KEYS.h5,
              HEADING_KEYS.h6,
              BlockquotePlugin.key,
              CodeBlockPlugin.key,
              TogglePlugin.key,
            ],
          },
        }),
        IndentListPlugin.extend({
          inject: {
            targetPlugins: [
              ParagraphPlugin.key,
              HEADING_KEYS.h1,
              HEADING_KEYS.h2,
              HEADING_KEYS.h3,
              HEADING_KEYS.h4,
              HEADING_KEYS.h5,
              HEADING_KEYS.h6,
              BlockquotePlugin.key,
              CodeBlockPlugin.key,
              TogglePlugin.key,
            ],
          },
          options: {
            listStyleTypes: {
              fire: {
                liComponent: FireLiComponent,
                markerComponent: FireMarker,
                type: 'fire',
              },
              todo: {
                liComponent: TodoLi,
                markerComponent: TodoMarker,
                type: 'todo',
              },
            },
          },
        }),
        LineHeightPlugin.extend({
          inject: {
            nodeProps: {
              defaultNodeValue: 1.5,
              validNodeValues: [1, 1.2, 1.5, 2, 3],
            },
            targetPlugins: [
              ParagraphPlugin.key,
              HEADING_KEYS.h1,
              HEADING_KEYS.h2,
              HEADING_KEYS.h3,
              HEADING_KEYS.h4,
              HEADING_KEYS.h5,
              HEADING_KEYS.h6,
            ],
          },
        }),

        // Functionality
        AutoformatPlugin.configure({ options: autoformatOptions }),
        BlockSelectionPlugin.configure({
          options: {
            areaOptions: {
              behaviour: {
                startThreshold: 10,
              },
              boundaries: `#${scrollSelector}`,
              container: `#${scrollSelector}`,
              selectables: [`#${scrollSelector} .slate-selectable`],
              selectionAreaClass: 'slate-selection-area',
            },
            enableContextMenu: false,
          },
        }),
        DndPlugin.configure({ options: { enableScroller: true } }),
        EmojiPlugin,
        exitBreakPlugin,
        NodeIdPlugin,
        NormalizeTypesPlugin.configure({
          options: {
            rules: [{ path: [0], strictType: HEADING_KEYS.h1 }],
          },
        }),
        resetBlockTypePlugin,
        SelectOnBackspacePlugin.configure({
          options: {
            query: {
              allow: [ImagePlugin.key, HorizontalRulePlugin.key],
            },
          },
        }),
        DeletePlugin,
        SingleLinePlugin,
        softBreakPlugin,
        tabbablePlugin,
        TrailingBlockPlugin.configure({
          options: { type: ParagraphPlugin.key },
        }),
        DragOverCursorPlugin,

        // Collaboration
        CommentsPlugin.configure({
          options: {
            comments: commentsData,
            myUserId: '1',
            users: usersData,
          },
        }),

        // Deserialization
        DocxPlugin,
        MarkdownPlugin,
        JuicePlugin,
        ColumnPlugin,

        // Testing
        PlaywrightPlugin.configure({
          enabled: process.env.NODE_ENV !== 'production',
        }),
      ],
      value: value,
    },
    []
  );

  return a;
};

export default function PlaygroundDemo({
  id,
  className,
  scrollSelector,
}: {
  id?: ValueId;
  className?: string;
  scrollSelector?: string;
}) {
  const containerRef = useRef(null);
  const enabled = settingsStore.use.checkedComponents();

  const editor = usePlaygroundEditor(
    id,
    scrollSelector ?? `blockSelection-${id}`
  );

  return (
    <DemoId id={id}>
      <DndProvider backend={HTML5Backend}>
        <Plate editor={editor}>
          <CheckPlugin componentId="fixed-toolbar">
            <FixedToolbar className="no-scrollbar">
              <CheckPlugin componentId="fixed-toolbar-buttons">
                <PlaygroundFixedToolbarButtons />
              </CheckPlugin>
            </FixedToolbar>
          </CheckPlugin>

          <div
            id="editor-playground"
            className="flex w-full"
            style={
              {
                '--editor-px': 'max(5%,24px)',
              } as any
            }
          >
            <div
              id={scrollSelector ?? `blockSelection-${id}`}
              ref={containerRef}
              className={cn(
                'relative flex max-h-[800px] w-full overflow-x-auto',
                // block selection area
                '[&_.slate-selection-area]:border [&_.slate-selection-area]:border-brand/25 [&_.slate-selection-area]:bg-brand/15',
                className
              )}
              data-plate-selectable
            >
              <Editor
                {...editableProps}
                size="md"
                variant="ghost"
                className={cn(
                  editableProps.className,
                  'overflow-x-auto rounded-none px-[var(--editor-px)]',
                  !id && 'pb-[20vh] pt-4',
                  id && 'pb-8 pt-2'
                )}
                placeholder=""
                focusRing={false}
              />

              <CheckPlugin componentId="floating-toolbar">
                <PlaygroundFloatingToolbar
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
                    <PlaygroundFloatingToolbarButtons />
                  </CheckPlugin>
                </PlaygroundFloatingToolbar>
              </CheckPlugin>

              <CheckPlugin id="cursoroverlay" plugin={DragOverCursorPlugin}>
                <CursorOverlay containerRef={containerRef} />
              </CheckPlugin>
            </div>

            <CheckPlugin
              id="comment"
              componentId="comments-popover"
              plugin={CommentsPlugin}
            >
              <CommentsPopover />
            </CheckPlugin>
          </div>
        </Plate>
      </DndProvider>
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
