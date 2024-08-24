'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import type { ValueId } from '@/config/customizer-plugins';

import { cn } from '@udecode/cn';
import { createAlignPlugin } from '@udecode/plate-alignment';
import { createAutoformatPlugin } from '@udecode/plate-autoformat';
import {
  createBoldPlugin,
  createCodePlugin,
  createItalicPlugin,
  createStrikethroughPlugin,
  createSubscriptPlugin,
  createSuperscriptPlugin,
  createUnderlinePlugin,
} from '@udecode/plate-basic-marks';
import {
  ELEMENT_BLOCKQUOTE,
  createBlockquotePlugin,
} from '@udecode/plate-block-quote';
import {
  createExitBreakPlugin,
  createSingleLinePlugin,
  createSoftBreakPlugin,
} from '@udecode/plate-break';
import { createCaptionPlugin } from '@udecode/plate-caption';
import {
  ELEMENT_CODE_BLOCK,
  createCodeBlockPlugin,
} from '@udecode/plate-code-block';
import { createCommentsPlugin } from '@udecode/plate-comments';
import {
  Plate,
  type PlatePluginComponent,
  type Value,
  createPlugins,
} from '@udecode/plate-common';
import { createInlineDatePlugin } from '@udecode/plate-date';
import { createDndPlugin } from '@udecode/plate-dnd';
import { createEmojiPlugin } from '@udecode/plate-emoji';
import { createExcalidrawPlugin } from '@udecode/plate-excalidraw';
import {
  createFontBackgroundColorPlugin,
  createFontColorPlugin,
  createFontSizePlugin,
} from '@udecode/plate-font';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  createHeadingPlugin,
} from '@udecode/plate-heading';
import { createHighlightPlugin } from '@udecode/plate-highlight';
import { createHorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { createIndentPlugin } from '@udecode/plate-indent';
import { createIndentListPlugin } from '@udecode/plate-indent-list';
import { createJuicePlugin } from '@udecode/plate-juice';
import { createKbdPlugin } from '@udecode/plate-kbd';
import { createColumnPlugin } from '@udecode/plate-layout';
import { createLineHeightPlugin } from '@udecode/plate-line-height';
import { createLinkPlugin } from '@udecode/plate-link';
import { createListPlugin, createTodoListPlugin } from '@udecode/plate-list';
import {
  createImagePlugin,
  createMediaEmbedPlugin,
} from '@udecode/plate-media';
import { createMentionPlugin } from '@udecode/plate-mention';
import { createNodeIdPlugin } from '@udecode/plate-node-id';
import { createNormalizeTypesPlugin } from '@udecode/plate-normalizers';
import {
  ELEMENT_PARAGRAPH,
  createParagraphPlugin,
} from '@udecode/plate-paragraph';
import { createResetNodePlugin } from '@udecode/plate-reset-node';
import {
  createDeletePlugin,
  createSelectOnBackspacePlugin,
} from '@udecode/plate-select';
import { createBlockSelectionPlugin } from '@udecode/plate-selection';
import { createDeserializeDocxPlugin } from '@udecode/plate-serializer-docx';
import { createDeserializeMdPlugin } from '@udecode/plate-serializer-md';
import { createSlashPlugin } from '@udecode/plate-slash-command';
import { createTabbablePlugin } from '@udecode/plate-tabbable';
import { createTablePlugin } from '@udecode/plate-table';
import { ELEMENT_TOGGLE, createTogglePlugin } from '@udecode/plate-toggle';
import { createTrailingBlockPlugin } from '@udecode/plate-trailing-block';

import { settingsStore } from '@/components/context/settings-store';
import { PlaygroundFixedToolbarButtons } from '@/components/plate-ui/playground-fixed-toolbar-buttons';
import { PlaygroundFloatingToolbarButtons } from '@/components/plate-ui/playground-floating-toolbar-buttons';
import { captionPlugin } from '@/lib/plate/demo/plugins/captionPlugin';
import { createPlateUI } from '@/plate/create-plate-ui';
import { CommentsProvider } from '@/plate/demo/comments/CommentsProvider';
import { editableProps } from '@/plate/demo/editableProps';
import { isEnabled } from '@/plate/demo/is-enabled';
import { alignPlugin } from '@/plate/demo/plugins/alignPlugin';
import { autoformatIndentLists } from '@/plate/demo/plugins/autoformatIndentLists';
import { autoformatLists } from '@/plate/demo/plugins/autoformatLists';
import { autoformatRules } from '@/plate/demo/plugins/autoformatRules';
import { dragOverCursorPlugin } from '@/plate/demo/plugins/dragOverCursorPlugin';
import { exitBreakPlugin } from '@/plate/demo/plugins/exitBreakPlugin';
import { forcedLayoutPlugin } from '@/plate/demo/plugins/forcedLayoutPlugin';
import { lineHeightPlugin } from '@/plate/demo/plugins/lineHeightPlugin';
import { linkPlugin } from '@/plate/demo/plugins/linkPlugin';
import { resetBlockTypePlugin } from '@/plate/demo/plugins/resetBlockTypePlugin';
import { selectOnBackspacePlugin } from '@/plate/demo/plugins/selectOnBackspacePlugin';
import { softBreakPlugin } from '@/plate/demo/plugins/softBreakPlugin';
import { tabbablePlugin } from '@/plate/demo/plugins/tabbablePlugin';
import { trailingBlockPlugin } from '@/plate/demo/plugins/trailingBlockPlugin';
import { usePlaygroundValue } from '@/plate/demo/values/usePlaygroundValue';
import { Prism } from '@/registry/default/plate-ui/code-block-combobox';
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

export const usePlaygroundPlugins = ({
  components = createPlateUI(),
  id,
}: {
  components?: Record<string, PlatePluginComponent>;
  id?: ValueId;
} = {}) => {
  const enabled = settingsStore.use.checkedPlugins();

  const autoformatOptions = {
    enableUndoOnDelete: true,
    rules: [...autoformatRules],
  };

  if (id === 'indentlist') {
    autoformatOptions.rules.push(...autoformatIndentLists);
  } else if (id === 'list') {
    autoformatOptions.rules.push(...autoformatLists);
  } else if (enabled.listStyleType) {
    autoformatOptions.rules.push(...autoformatIndentLists);
  } else if (enabled.list) {
    autoformatOptions.rules.push(...autoformatLists);
  }

  return useMemo(
    () => {
      return createPlugins(
        [
          // Nodes
          createParagraphPlugin({ enabled: !!enabled.p }),
          createHeadingPlugin({ enabled: !!enabled.heading }),
          createBlockquotePlugin({ enabled: !!enabled.blockquote }),
          createCodeBlockPlugin({
            enabled: !!enabled.code_block,
            options: {
              prism: Prism,
            },
          }),
          createHorizontalRulePlugin({ enabled: !!enabled.hr }),
          createLinkPlugin({ ...linkPlugin, enabled: !!enabled.a }),
          createListPlugin({
            enabled: id === 'list' || !!enabled.list,
          }),
          createImagePlugin({
            enabled: !!enabled.img,
            renderAfterEditable: ImagePreview,
          }),
          createMediaEmbedPlugin({ enabled: !!enabled.media_embed }),
          createCaptionPlugin({ ...captionPlugin, enabled: !!enabled.caption }),
          createInlineDatePlugin({ enabled: !!enabled.inline_date }),
          createMentionPlugin({
            enabled: !!enabled.mention,
            options: {
              triggerPreviousCharPattern: /^$|^[\s"']$/,
            },
          }),
          createSlashPlugin(),
          createTablePlugin({
            enabled: !!enabled.table,
            options: {
              enableMerging: id === 'tableMerge',
            },
          }),
          createTodoListPlugin({ enabled: !!enabled.action_item }),
          createTogglePlugin({ enabled: !!enabled.toggle }),
          createExcalidrawPlugin({ enabled: !!enabled.excalidraw }),

          // Marks
          createBoldPlugin({ enabled: !!enabled.bold }),
          createItalicPlugin({ enabled: !!enabled.italic }),
          createUnderlinePlugin({ enabled: !!enabled.underline }),
          createStrikethroughPlugin({ enabled: !!enabled.strikethrough }),
          createCodePlugin({ enabled: !!enabled.code }),
          createSubscriptPlugin({ enabled: !!enabled.subscript }),
          createSuperscriptPlugin({ enabled: !!enabled.superscript }),
          createFontColorPlugin({ enabled: !!enabled.color }),
          createFontBackgroundColorPlugin({
            enabled: !!enabled.backgroundColor,
          }),
          createFontSizePlugin({ enabled: !!enabled.fontSize }),
          createHighlightPlugin({ enabled: !!enabled.highlight }),
          createKbdPlugin({ enabled: !!enabled.kbd }),

          // Block Style
          createAlignPlugin({
            ...alignPlugin,
            enabled: !!enabled.align,
          }),
          createIndentPlugin({
            enabled: !!enabled.indent,
            inject: {
              props: {
                validTypes: [
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
          createIndentListPlugin({
            enabled: id === 'indentlist' || !!enabled.listStyleType,
            inject: {
              props: {
                validTypes: [
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
          createLineHeightPlugin({
            ...lineHeightPlugin,
            enabled: !!enabled.lineHeight,
          }),

          // Functionality
          createAutoformatPlugin({
            enabled: !!enabled.autoformat,
            options: autoformatOptions,
          }),
          createBlockSelectionPlugin({
            enabled: id === 'blockselection' || !!enabled.blockSelection,
            options: {
              areaOptions: {
                boundaries: ['#selection-demo  #scroll_container'],
                container: ['#selection-demo #scroll_container'],
                selectables: [
                  '#selection-demo #scroll_container .slate-selectable',
                ],
                selectionAreaClass: 'slate-selection-area',
              },
              disableContextMenu: true,
              sizes: {
                bottom: 0,
                top: 0,
              },
            },
          }),
          createDndPlugin({
            enabled: !!enabled.dnd,
            options: { enableScroller: true },
          }),
          createEmojiPlugin({ enabled: !!enabled.emoji }),
          createExitBreakPlugin({
            ...exitBreakPlugin,
            enabled: !!enabled.exitBreak,
          }),
          createNodeIdPlugin({ enabled: !!enabled.nodeId }),
          createNormalizeTypesPlugin({
            ...forcedLayoutPlugin,
            enabled: !!enabled.normalizeTypes,
          }),
          createResetNodePlugin({
            ...resetBlockTypePlugin,
            enabled: !!enabled.resetNode,
          }),
          createSelectOnBackspacePlugin({
            ...selectOnBackspacePlugin,
            enabled: !!enabled.selectOnBackspace,
          }),
          createDeletePlugin({
            enabled: !!enabled.delete,
          }),
          createSingleLinePlugin({
            enabled: id === 'singleline' || !!enabled.singleLine,
          }),
          createSoftBreakPlugin({
            ...softBreakPlugin,
            enabled: !!enabled.softBreak,
          }),
          createTabbablePlugin({
            ...tabbablePlugin,
            enabled: !!enabled.tabbable,
          }),
          createTrailingBlockPlugin({
            ...trailingBlockPlugin,
            enabled: id !== 'singleline' && !!enabled.trailingBlock,
          }),
          { ...dragOverCursorPlugin, enabled: !!enabled.dragOverCursor },

          // Collaboration
          createCommentsPlugin({ enabled: !!enabled.comment }),

          // Deserialization
          createDeserializeDocxPlugin({ enabled: !!enabled.deserializeDocx }),
          createDeserializeMdPlugin({ enabled: !!enabled.deserializeMd }),
          createJuicePlugin({ enabled: !!enabled.juice }),
          createColumnPlugin({ enabled: !!enabled.column }),
        ],
        {
          components,
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled]
  );
};

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

export default function PlaygroundDemo({ id }: { id?: ValueId }) {
  const containerRef = useRef(null);
  const enabled = settingsStore.use.checkedComponents();
  const initialValue = usePlaygroundValue(id);
  const key = useInitialValueVersion(initialValue);

  const plugins = usePlaygroundPlugins({
    components: createPlateUI(
      {},
      {
        draggable: isEnabled('dnd', id),
        placeholder: isEnabled('placeholder', id),
      }
    ),
    id,
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="relative">
        <Plate
          initialValue={initialValue}
          key={key}
          normalizeInitialValue
          plugins={plugins}
        >
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
                className={cn('relative flex w-full overflow-x-auto')}
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
