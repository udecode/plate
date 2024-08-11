'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import type { ValueId } from '@/config/customizer-plugins';

import { cn } from '@udecode/cn';
import { AlignPlugin } from '@udecode/plate-alignment';
import { AutoformatPlugin } from '@udecode/plate-autoformat';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks';
import {
  BlockquotePlugin,
  ELEMENT_BLOCKQUOTE,
} from '@udecode/plate-block-quote';
import {
  ExitBreakPlugin,
  SingleLinePlugin,
  SoftBreakPlugin,
} from '@udecode/plate-break';
import { CaptionPlugin } from '@udecode/plate-caption';
import { CodeBlockPlugin, ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import { CommentsPlugin } from '@udecode/plate-comments';
import { Plate, type Value, usePlateEditor } from '@udecode/plate-common';
import { DndPlugin } from '@udecode/plate-dnd';
import { EmojiPlugin } from '@udecode/plate-emoji';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw';
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontSizePlugin,
} from '@udecode/plate-font';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  HeadingPlugin,
} from '@udecode/plate-heading';
import { HighlightPlugin } from '@udecode/plate-highlight';
import {
  ELEMENT_HR,
  HorizontalRulePlugin,
} from '@udecode/plate-horizontal-rule';
import { IndentPlugin } from '@udecode/plate-indent';
import { IndentListPlugin } from '@udecode/plate-indent-list';
import { JuicePlugin } from '@udecode/plate-juice';
import { KbdPlugin } from '@udecode/plate-kbd';
import { ColumnPlugin } from '@udecode/plate-layout';
import { LineHeightPlugin } from '@udecode/plate-line-height';
import { LinkPlugin } from '@udecode/plate-link';
import { ListPlugin, TodoListPlugin } from '@udecode/plate-list';
import {
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  ImagePlugin,
  MediaEmbedPlugin,
} from '@udecode/plate-media';
import { MentionPlugin } from '@udecode/plate-mention';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { NormalizeTypesPlugin } from '@udecode/plate-normalizers';
import { ELEMENT_PARAGRAPH, ParagraphPlugin } from '@udecode/plate-paragraph';
import { ResetNodePlugin } from '@udecode/plate-reset-node';
import { DeletePlugin, SelectOnBackspacePlugin } from '@udecode/plate-select';
import { BlockSelectionPlugin } from '@udecode/plate-selection';
import { DeserializeDocxPlugin } from '@udecode/plate-serializer-docx';
import { DeserializeMdPlugin } from '@udecode/plate-serializer-md';
import { SlashPlugin } from '@udecode/plate-slash-command';
import { TablePlugin } from '@udecode/plate-table';
import { ELEMENT_TOGGLE, TogglePlugin } from '@udecode/plate-toggle';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';
import Prism from 'prismjs';

import { settingsStore } from '@/components/context/settings-store';
import { PlaygroundFixedToolbarButtons } from '@/components/plate-ui/playground-fixed-toolbar-buttons';
import { PlaygroundFloatingToolbarButtons } from '@/components/plate-ui/playground-floating-toolbar-buttons';
import { getAutoformatOptions } from '@/lib/plate/demo/plugins/autoformatOptions';
import { createPlateUI } from '@/plate/create-plate-ui';
import { CommentsProvider } from '@/plate/demo/comments/CommentsProvider';
import { editableProps } from '@/plate/demo/editableProps';
import { isEnabled } from '@/plate/demo/is-enabled';
import { DragOverCursorPlugin } from '@/plate/demo/plugins/DragOverCursorPlugin';
import { TabbablePlugin } from '@/plate/demo/plugins/TabbablePlugin';
import { exitBreakOptions } from '@/plate/demo/plugins/exitBreakOptions';
import { resetBlockTypeOptions } from '@/plate/demo/plugins/resetBlockTypeOptions';
import { softBreakOptions } from '@/plate/demo/plugins/softBreakOptions';
import { usePlaygroundValue } from '@/plate/demo/values/usePlaygroundValue';
import { CommentsPopover } from '@/registry/default/plate-ui/comments-popover';
import { CursorOverlay } from '@/registry/default/plate-ui/cursor-overlay';
import { Editor } from '@/registry/default/plate-ui/editor';
import { FixedToolbar } from '@/registry/default/plate-ui/fixed-toolbar';
import { FloatingToolbar } from '@/registry/default/plate-ui/floating-toolbar';
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

export default function PlaygroundDemo({ id }: { id?: ValueId }) {
  const containerRef = useRef(null);
  const enabled = settingsStore.use.checkedComponents();
  const value = usePlaygroundValue(id);
  const key = useInitialValueVersion(value);

  const autoformatOptions = getAutoformatOptions(id, enabled);
  const overridePlugins = usePlaygroundEnabled(id);

  const editor = usePlateEditor(
    {
      override: {
        components: createPlateUI({
          draggable: isEnabled('dnd', id),
          placeholder: isEnabled('placeholder', id),
        }),
        plugins: overridePlugins,
      },
      plugins: [
        // Nodes
        ParagraphPlugin,
        HeadingPlugin,
        BlockquotePlugin,
        CodeBlockPlugin.configure({
          prism: Prism,
        }),
        HorizontalRulePlugin,
        LinkPlugin.extend({
          renderAfterEditable: () => <LinkFloatingToolbar />,
        }),
        ListPlugin,
        ImagePlugin.extend({
          renderAfterEditable: ImagePreview,
        }),
        MediaEmbedPlugin,
        CaptionPlugin.configure({
          pluginKeys: [ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED],
        }),
        MentionPlugin.configure({
          triggerPreviousCharPattern: /^$|^[\s"']$/,
        }),
        SlashPlugin,
        TablePlugin.configure({
          enableMerging: id === 'tableMerge',
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
            props: {
              validPlugins: [
                ELEMENT_PARAGRAPH,
                ELEMENT_MEDIA_EMBED,
                ELEMENT_H1,
                ELEMENT_H2,
                ELEMENT_H3,
                ELEMENT_H4,
                ELEMENT_H5,
                ELEMENT_IMAGE,
                ELEMENT_H6,
              ],
            },
          },
        }),
        IndentPlugin.extend({
          inject: {
            props: {
              validPlugins: [
                ELEMENT_PARAGRAPH,
                ELEMENT_H1,
                ELEMENT_H2,
                ELEMENT_H3,
                ELEMENT_H4,
                ELEMENT_H5,
                ELEMENT_H6,
                ELEMENT_BLOCKQUOTE,
                ELEMENT_CODE_BLOCK,
                ELEMENT_TOGGLE,
              ],
            },
          },
        }),
        IndentListPlugin.extend({
          inject: {
            props: {
              validPlugins: [
                ELEMENT_PARAGRAPH,
                ELEMENT_H1,
                ELEMENT_H2,
                ELEMENT_H3,
                ELEMENT_H4,
                ELEMENT_H5,
                ELEMENT_H6,
                ELEMENT_BLOCKQUOTE,
                ELEMENT_CODE_BLOCK,
                ELEMENT_TOGGLE,
              ],
            },
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
            props: {
              defaultNodeValue: 1.5,
              validNodeValues: [1, 1.2, 1.5, 2, 3],
              validPlugins: [
                ELEMENT_PARAGRAPH,
                ELEMENT_H1,
                ELEMENT_H2,
                ELEMENT_H3,
                ELEMENT_H4,
                ELEMENT_H5,
                ELEMENT_H6,
              ],
            },
          },
        }),

        // Functionality
        AutoformatPlugin.configure(autoformatOptions),
        BlockSelectionPlugin.configure({
          disableContextMenu: true,
          sizes: {
            bottom: 0,
            top: 0,
          },
        }),
        DndPlugin.configure({ enableScroller: true }),
        EmojiPlugin,
        ExitBreakPlugin.configure(exitBreakOptions),
        NodeIdPlugin,
        NormalizeTypesPlugin.configure({
          rules: [{ path: [0], strictType: ELEMENT_H1 }],
        }),
        ResetNodePlugin.configure(resetBlockTypeOptions),
        SelectOnBackspacePlugin.configure({
          query: {
            allow: [ELEMENT_IMAGE, ELEMENT_HR],
          },
        }),
        DeletePlugin,
        SingleLinePlugin,
        SoftBreakPlugin.configure(softBreakOptions),
        TabbablePlugin,
        TrailingBlockPlugin.configure({ type: ELEMENT_PARAGRAPH }),
        DragOverCursorPlugin,

        // Collaboration
        CommentsPlugin,

        // Deserialization
        DeserializeDocxPlugin,
        DeserializeMdPlugin,
        JuicePlugin,
        ColumnPlugin,
      ],
      shouldNormalizeEditor: true,
      value: value,
    },
    [enabled]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="relative">
        <Plate editor={editor} key={key}>
          <CommentsProvider>
            {enabled['fixed-toolbar'] && (
              <FixedToolbar className="no-scrollbar">
                {enabled['fixed-toolbar-buttons'] && (
                  <PlaygroundFixedToolbarButtons id={id} />
                )}
              </FixedToolbar>
            )}

            <div
              className="flex w-full"
              id="editor-playground"
              style={
                {
                  '--editor-px': 'max(5%,24px)',
                } as any
              }
            >
              <div
                className={cn(
                  'relative flex w-full overflow-x-auto',
                  '[&_.slate-start-area-top]:!h-4',
                  '[&_.slate-start-area-left]:!w-[var(--editor-px)] [&_.slate-start-area-right]:!w-[var(--editor-px)]'
                )}
                ref={containerRef}
              >
                <Editor
                  {...editableProps}
                  className={cn(
                    editableProps.className,
                    'max-h-[800px] overflow-x-hidden px-[var(--editor-px)]',
                    !id && 'pb-[20vh] pt-4',
                    id && 'pb-8 pt-2'
                  )}
                  focusRing={false}
                  placeholder=""
                  size="md"
                  variant="ghost"
                />

                {enabled['floating-toolbar'] && (
                  <FloatingToolbar>
                    {enabled['floating-toolbar-buttons'] && (
                      <PlaygroundFloatingToolbarButtons id={id} />
                    )}
                  </FloatingToolbar>
                )}

                {isEnabled('cursoroverlay', id) && (
                  <CursorOverlay containerRef={containerRef} />
                )}
              </div>

              {isEnabled('comment', id, enabled['comments-popover']) && (
                <CommentsPopover />
              )}
            </div>
          </CommentsProvider>
        </Plate>
      </div>
    </DndProvider>
  );
}

// reset editor when initialValue changes
export const useInitialValueVersion = (initialValue: Value) => {
  const enabled = settingsStore.use.checkedPlugins();
  const [version, setVersion] = useState(1);
  const prevEnabled = useRef(enabled);
  const prevInitialValueRef = useRef(initialValue);

  useEffect(() => {
    if (enabled === prevEnabled.current) return;

    prevEnabled.current = enabled;
    setVersion((v) => v + 1);
  }, [enabled]);

  useEffect(() => {
    if (initialValue === prevInitialValueRef.current) return;

    prevInitialValueRef.current = initialValue;
    setVersion((v) => v + 1);
  }, [initialValue]);

  return version;
};
