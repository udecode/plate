'use client';

import React, { useMemo, useRef } from 'react';
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
import { createBlockquotePlugin } from '@udecode/plate-block-quote';
import {
  createExitBreakPlugin,
  createSingleLinePlugin,
  createSoftBreakPlugin,
} from '@udecode/plate-break';
import { createCodeBlockPlugin } from '@udecode/plate-code-block';
import { createComboboxPlugin } from '@udecode/plate-combobox';
import { createCommentsPlugin } from '@udecode/plate-comments';
import { Plate, PlateProvider } from '@udecode/plate-common';
import { PlatePluginComponent } from '@udecode/plate-core';
import { createEmojiPlugin } from '@udecode/plate-emoji';
import { createExcalidrawPlugin } from '@udecode/plate-excalidraw';
import {
  createFontBackgroundColorPlugin,
  createFontColorPlugin,
  createFontSizePlugin,
} from '@udecode/plate-font';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createHighlightPlugin } from '@udecode/plate-highlight';
import { createHorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { createIndentPlugin } from '@udecode/plate-indent';
import { createIndentListPlugin } from '@udecode/plate-indent-list';
import { createJuicePlugin } from '@udecode/plate-juice';
import { createKbdPlugin } from '@udecode/plate-kbd';
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
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { createResetNodePlugin } from '@udecode/plate-reset-node';
import { createSelectOnBackspacePlugin } from '@udecode/plate-select';
import { createBlockSelectionPlugin } from '@udecode/plate-selection';
import { createDeserializeDocxPlugin } from '@udecode/plate-serializer-docx';
import { createDeserializeMdPlugin } from '@udecode/plate-serializer-md';
import { createTabbablePlugin } from '@udecode/plate-tabbable';
import { createTablePlugin } from '@udecode/plate-table';
import { createTrailingBlockPlugin } from '@udecode/plate-trailing-block';

import { settingsStore } from '@/components/context/settings-store';
import { CommentsPopover } from '@/components/plate-ui/comments-popover/comments-popover';
import { CursorOverlay } from '@/components/plate-ui/cursor-overlay/cursor-overlay';
import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/plate-ui/fixed-toolbar-buttons';
import { FloatingToolbar } from '@/components/plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/components/plate-ui/floating-toolbar-buttons';
import { MentionCombobox } from '@/components/plate-ui/mention-combobox';
import { SettingsPanel } from '@/components/settings-panel';
import { ValueId } from '@/config/setting-values';
import { cn } from '@/lib/utils';
import { createPlateUI } from '@/plate/createPlateUI';
import { CommentsProvider } from '@/plate/demo/comments/CommentsProvider';
import { editableProps } from '@/plate/demo/editableProps';
import { isEnabled } from '@/plate/demo/is-enabled';
import { alignPlugin } from '@/plate/demo/plugins/alignPlugin';
import { autoformatPlugin } from '@/plate/demo/plugins/autoformatPlugin';
import { dragOverCursorPlugin } from '@/plate/demo/plugins/dragOverCursorPlugin';
import { emojiPlugin } from '@/plate/demo/plugins/emojiPlugin';
import { exitBreakPlugin } from '@/plate/demo/plugins/exitBreakPlugin';
import { forcedLayoutPlugin } from '@/plate/demo/plugins/forcedLayoutPlugin';
import { indentPlugin } from '@/plate/demo/plugins/indentPlugin';
import { lineHeightPlugin } from '@/plate/demo/plugins/lineHeightPlugin';
import { linkPlugin } from '@/plate/demo/plugins/linkPlugin';
import { resetBlockTypePlugin } from '@/plate/demo/plugins/resetBlockTypePlugin';
import { selectOnBackspacePlugin } from '@/plate/demo/plugins/selectOnBackspacePlugin';
import { softBreakPlugin } from '@/plate/demo/plugins/softBreakPlugin';
import { tabbablePlugin } from '@/plate/demo/plugins/tabbablePlugin';
import { trailingBlockPlugin } from '@/plate/demo/plugins/trailingBlockPlugin';
import { MENTIONABLES } from '@/plate/demo/values/mentionables';
import { usePlaygroundValue } from '@/plate/demo/values/usePlaygroundValue';
import { createMyPlugins, MyValue } from '@/plate/plate-types';

export const usePlaygroundPlugins = ({
  id,
  components = createPlateUI(),
}: {
  id?: ValueId;
  components?: Record<string, PlatePluginComponent>;
} = {}) => {
  const enabled = settingsStore.use.checkedPlugins();

  return useMemo(
    () =>
      createMyPlugins(
        [
          // Nodes
          createParagraphPlugin({ enabled: !!enabled.p }),
          createHeadingPlugin({ enabled: !!enabled.heading }),
          createBlockquotePlugin({ enabled: !!enabled.blockquote }),
          createCodeBlockPlugin({ enabled: !!enabled.code_block }),
          createHorizontalRulePlugin({ enabled: !!enabled.hr }),
          createLinkPlugin({ ...linkPlugin, enabled: !!enabled.a }),
          createListPlugin({
            enabled: isEnabled('list', id) || !!enabled.list,
          }),
          createImagePlugin({ enabled: !!enabled.img }),
          createMediaEmbedPlugin({ enabled: !!enabled.media_embed }),
          createMentionPlugin({ enabled: !!enabled.mention }),
          createTablePlugin({ enabled: !!enabled.table }),
          createTodoListPlugin({ enabled: !!enabled.action_item }),
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
          createAlignPlugin({ ...alignPlugin, enabled: !!enabled.align }),
          createIndentPlugin({ ...indentPlugin, enabled: !!enabled.indent }),
          createIndentListPlugin({
            enabled: isEnabled('indentlist', id) || !!enabled.listStyleType,
          }),
          createLineHeightPlugin({
            ...lineHeightPlugin,
            enabled: !!enabled.lineHeight,
          }),

          // Functionality
          createAutoformatPlugin({
            ...(autoformatPlugin as any),
            enabled: !!enabled.autoformat,
          }),
          createBlockSelectionPlugin({
            options: {
              sizes: {
                left: id === 'blockselection' ? 32 : 76,
                top: 0,
                right: id === 'blockselection' ? 32 : 76,
                bottom: 0,
              },
            },
            enabled: id === 'blockselection' && !!enabled.blockSelection,
          }),
          createComboboxPlugin({ enabled: !!enabled.combobox }),
          // createDndPlugin({
          //   options: { enableScroller: true },
          //   enabled: !!enabled.dnd,
          // }),
          createEmojiPlugin({ ...emojiPlugin, enabled: !!enabled.emoji }),
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
        ],
        {
          components,
        }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled]
  );
};

export function PlaygroundDemo({ id }: { id?: ValueId }) {
  const containerRef = useRef(null);

  const initialValue = usePlaygroundValue(id);

  const plugins = usePlaygroundPlugins({
    id,
    components: createPlateUI(
      {},
      {
        placeholder: isEnabled('placeholder', id),
        // draggable: isEnabled('dnd', id),
      }
    ),
  });

  return (
    // <DndProvider backend={HTML5Backend}>
    <div className="relative">
      <PlateProvider<MyValue>
        key={settingsStore.use.key()}
        initialValue={initialValue}
        plugins={plugins}
        normalizeInitialValue
      >
        <FixedToolbar>
          <FixedToolbarButtons id={id} />
        </FixedToolbar>

        <CommentsProvider>
          <div
            ref={containerRef}
            className={cn(
              'relative flex max-w-[900px] overflow-x-auto',
              !id && 'w-[calc(100vw-64px)]'
            )}
          >
            <Plate
              editableProps={{
                ...editableProps,
                className: cn(
                  editableProps.className,
                  !id && 'min-h-[920px] w-[900px] px-[96px] pb-[20vh] pt-4',
                  id && 'px-8 pb-8 pt-2'
                ),
              }}
            >
              <FloatingToolbar>
                <FloatingToolbarButtons id={id} />
              </FloatingToolbar>

              {isEnabled('mention', id) && (
                <MentionCombobox items={MENTIONABLES} />
              )}

              {isEnabled('cursoroverlay', id) && (
                <CursorOverlay containerRef={containerRef} />
              )}
            </Plate>
          </div>

          {isEnabled('comment', id) && <CommentsPopover />}
        </CommentsProvider>
      </PlateProvider>

      {!id && <SettingsPanel />}
    </div>
    // </DndProvider>
  );
}
