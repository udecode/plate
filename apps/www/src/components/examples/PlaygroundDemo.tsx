'use client';

import React, { useMemo, useRef, useState } from 'react';
import { createAlignPlugin } from '@udecode/plate-alignment';
import {
  AutoformatPlugin,
  createAutoformatPlugin,
} from '@udecode/plate-autoformat';
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
  createSoftBreakPlugin,
} from '@udecode/plate-break';
import { createCodeBlockPlugin } from '@udecode/plate-code-block';
import { createComboboxPlugin } from '@udecode/plate-combobox';
import { createCommentsPlugin } from '@udecode/plate-comments';
import { Plate, PlateProvider } from '@udecode/plate-common';
import { createDndPlugin } from '@udecode/plate-dnd';
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
import { createDeserializeCsvPlugin } from '@udecode/plate-serializer-csv';
import { createDeserializeDocxPlugin } from '@udecode/plate-serializer-docx';
import { createDeserializeMdPlugin } from '@udecode/plate-serializer-md';
import { createTabbablePlugin } from '@udecode/plate-tabbable';
import { createTablePlugin } from '@udecode/plate-table';
import { createTrailingBlockPlugin } from '@udecode/plate-trailing-block';

import { settingsStore } from '@/components/context/settings-store';
import { useDebounce } from '@/components/hooks/use-debounce';
import { CommentsPopover } from '@/components/plate-ui/comments-popover';
import { CursorOverlay } from '@/components/plate-ui/cursor-overlay';
import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/plate-ui/fixed-toolbar-buttons';
import { FloatingToolbar } from '@/components/plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/components/plate-ui/floating-toolbar-buttons';
import { MentionCombobox } from '@/components/plate-ui/mention-combobox';
import { withPlaceHolders } from '@/components/plate-ui/placeholder';
import { withDraggables } from '@/components/plate-ui/with-draggables';
import { SettingsPanel } from '@/components/settings-toggle';
import { createPlateUI } from '@/plate/createPlateUI';
import { CommentsProvider } from '@/plate/demo/comments/CommentsProvider';
import { editableProps } from '@/plate/demo/editableProps';
import { alignPlugin } from '@/plate/demo/plugins/alignPlugin';
import { autoformatPlugin } from '@/plate/demo/plugins/autoformatPlugin';
import { blockSelectionPlugin } from '@/plate/demo/plugins/blockSelectionPlugin';
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
import {
  createMyPlugins,
  MyEditor,
  MyPlatePlugin,
  MyValue,
} from '@/plate/plate.types';

const components = withDraggables(withPlaceHolders(createPlateUI()));

export function PlaygroundDemo() {
  const containerRef = useRef(null);

  const checkedIds = settingsStore.use.checkedIds();
  const [_key, setKey] = useState(1);
  const key = useDebounce(_key, 1000);

  const initialValue = usePlaygroundValue();

  const plugins = useMemo(() => {
    setKey(Math.random());

    return createMyPlugins(
      [
        createParagraphPlugin({ enabled: checkedIds.p }),
        createHeadingPlugin({ enabled: checkedIds.heading }),
        createBlockquotePlugin({ enabled: checkedIds.blockquote }),
        createCodeBlockPlugin({ enabled: checkedIds.code_block }),
        createTodoListPlugin({ enabled: checkedIds.action_item }),
        createImagePlugin({ enabled: checkedIds.img }),
        createHorizontalRulePlugin({ enabled: checkedIds.hr }),
        createBoldPlugin({ enabled: checkedIds.bold }),
        createItalicPlugin({ enabled: checkedIds.italic }),
        createHighlightPlugin({ enabled: checkedIds.highlight }),
        createTablePlugin({ enabled: checkedIds.table }),
        createMediaEmbedPlugin({ enabled: checkedIds.media_embed }),
        createStrikethroughPlugin({ enabled: checkedIds.strikethrough }),
        createUnderlinePlugin({ enabled: checkedIds.underline }),
        createSubscriptPlugin({ enabled: checkedIds.subscript }),
        createCodePlugin({ enabled: checkedIds.code }),
        createFontColorPlugin({ enabled: checkedIds.color }),
        createSuperscriptPlugin({ enabled: checkedIds.superscript }),
        createFontSizePlugin({ enabled: checkedIds.fontSize }),
        createFontBackgroundColorPlugin({
          enabled: checkedIds.backgroundColor,
        }),
        createResetNodePlugin({
          ...resetBlockTypePlugin,
          enabled: checkedIds.resetNode,
        }),
        createLinkPlugin({ ...linkPlugin, enabled: checkedIds.a }),
        createAlignPlugin({ ...alignPlugin, enabled: checkedIds.align }),
        createLineHeightPlugin({
          ...lineHeightPlugin,
          enabled: checkedIds.lineHeight,
        }),
        createKbdPlugin({ enabled: checkedIds.kbd }),
        createNodeIdPlugin({ enabled: checkedIds.nodeId }),
        createBlockSelectionPlugin({
          ...blockSelectionPlugin,
          enabled: checkedIds.blockSelection,
        }),
        createIndentPlugin({ ...indentPlugin, enabled: checkedIds.indent }),
        createExcalidrawPlugin({
          enabled: checkedIds.excalidraw,
        }) as MyPlatePlugin,
        // TT
        createDndPlugin({ options: { enableScroller: true } }),
        createAutoformatPlugin<
          AutoformatPlugin<MyValue, MyEditor>,
          MyValue,
          MyEditor
        >(autoformatPlugin),
        createSoftBreakPlugin({
          ...softBreakPlugin,
          enabled: checkedIds.softBreak,
        }),
        createExitBreakPlugin(exitBreakPlugin),
        createNormalizeTypesPlugin(forcedLayoutPlugin),
        createTrailingBlockPlugin(trailingBlockPlugin),
        createSelectOnBackspacePlugin(selectOnBackspacePlugin),
        createComboboxPlugin(),
        createMentionPlugin(),
        createCommentsPlugin(),
        createTabbablePlugin(tabbablePlugin),
        createDeserializeMdPlugin() as MyPlatePlugin,
        createDeserializeCsvPlugin(),
        createDeserializeDocxPlugin(),
        createJuicePlugin() as MyPlatePlugin,
        createEmojiPlugin(emojiPlugin),
        dragOverCursorPlugin,
        // Choose either "list" or "indent list" plugin
        createListPlugin(),
        createIndentListPlugin(),
      ],
      {
        components,
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedIds]);

  return (
    <PlateProvider<MyValue>
      key={key}
      initialValue={initialValue}
      plugins={plugins}
      normalizeInitialValue
    >
      <FixedToolbar>
        <FixedToolbarButtons />
      </FixedToolbar>

      <CommentsProvider>
        <div ref={containerRef} className="relative">
          <Plate editableProps={editableProps}>
            <FloatingToolbar>
              <FloatingToolbarButtons />
            </FloatingToolbar>

            <MentionCombobox items={MENTIONABLES} />

            <CursorOverlay containerRef={containerRef} />

            <SettingsPanel />
          </Plate>
        </div>

        <CommentsPopover />
      </CommentsProvider>
    </PlateProvider>
  );
}
