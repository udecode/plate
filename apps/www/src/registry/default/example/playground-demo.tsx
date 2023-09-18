'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { createPlateUI } from '@/plate/create-plate-ui';
import { CommentsProvider } from '@/plate/demo/comments/CommentsProvider';
import { editableProps } from '@/plate/demo/editableProps';
import { isEnabled } from '@/plate/demo/is-enabled';
import { alignPlugin } from '@/plate/demo/plugins/alignPlugin';
import { autoformatIndentLists } from '@/plate/demo/plugins/autoformatIndentLists';
import { autoformatLists } from '@/plate/demo/plugins/autoformatLists';
import { autoformatRules } from '@/plate/demo/plugins/autoformatRules';
import { captionPlugin } from '@/plate/demo/plugins/captionPlugin';
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
import { createCaptionPlugin } from '@udecode/plate-caption';
import { createCodeBlockPlugin } from '@udecode/plate-code-block';
import { createComboboxPlugin } from '@udecode/plate-combobox';
import { createCommentsPlugin } from '@udecode/plate-comments';
import {
  createPlateEditor,
  Plate,
  PlateContent,
  PlatePluginComponent,
  useEditorRef,
  usePlateActions,
} from '@udecode/plate-common';
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
import { createDeserializeDocxPlugin } from '@udecode/plate-serializer-docx';
import { createDeserializeMdPlugin } from '@udecode/plate-serializer-md';
import { createTabbablePlugin } from '@udecode/plate-tabbable';
import { createTablePlugin } from '@udecode/plate-table';
import { createTrailingBlockPlugin } from '@udecode/plate-trailing-block';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { createMyPlugins, MyValue } from '@/types/plate-types';
import { ValueId } from '@/config/customizer-plugins';
import { cn } from '@/lib/utils';
import { settingsStore } from '@/components/context/settings-store';
import { PlaygroundFixedToolbarButtons } from '@/components/plate-ui/playground-fixed-toolbar-buttons';
import { PlaygroundFloatingToolbarButtons } from '@/components/plate-ui/playground-floating-toolbar-buttons';
import { CommentsPopover } from '@/registry/default/plate-ui/comments-popover';
import { CursorOverlay } from '@/registry/default/plate-ui/cursor-overlay';
import { FixedToolbar } from '@/registry/default/plate-ui/fixed-toolbar';
import { FloatingToolbar } from '@/registry/default/plate-ui/floating-toolbar';
import { MentionCombobox } from '@/registry/default/plate-ui/mention-combobox';

export const usePlaygroundPlugins = ({
  id,
  components = createPlateUI(),
}: {
  id?: ValueId;
  components?: Record<string, PlatePluginComponent>;
} = {}) => {
  const enabled = settingsStore.use.checkedPlugins();

  const autoformatOptions = {
    rules: [...autoformatRules],
    enableUndoOnDelete: true,
  };

  if (id === 'indentlist') {
    autoformatOptions.rules.push(...autoformatIndentLists);
  } else if (id === 'list') {
    autoformatOptions.rules.push(...autoformatLists);
  } else if (!!enabled.listStyleType) {
    autoformatOptions.rules.push(...autoformatIndentLists);
  } else if (!!enabled.list) {
    autoformatOptions.rules.push(...autoformatLists);
  }

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
            enabled: id === 'list' || !!enabled.list,
          }),
          createImagePlugin({ enabled: !!enabled.img }),
          createMediaEmbedPlugin({ enabled: !!enabled.media_embed }),
          createCaptionPlugin({ ...captionPlugin, enabled: !!enabled.caption }),
          createMentionPlugin({
            enabled: !!enabled.mention,
            options: {
              triggerPreviousCharPattern: /^$|^[\s"']$/,
            },
          }),
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
            ...indentPlugin,
            enabled: id === 'indentlist' || !!enabled.listStyleType,
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
            options: {
              sizes: {
                top: 0,
                bottom: 0,
              },
            },
            enabled: id === 'blockselection' || !!enabled.blockSelection,
          }),
          createComboboxPlugin({ enabled: !!enabled.combobox }),
          createDndPlugin({
            options: { enableScroller: true },
            enabled: !!enabled.dnd,
          }),
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

export interface ResetPluginsEffectProps {
  initialValue: any;
  plugins: any;
}

export function ResetPluginsEffect({
  initialValue,
  plugins,
}: ResetPluginsEffectProps) {
  const editor = useEditorRef();
  const setEditor = usePlateActions().editor();
  const setValue = usePlateActions().value();

  useEffect(() => {
    const newEditor = createPlateEditor({ id: editor.id, plugins });
    newEditor.children = initialValue ?? editor.children;
    setValue(initialValue);
    setEditor(newEditor);
  }, [plugins, setEditor, editor.id, editor.children, initialValue, setValue]);

  return null;
}

export default function PlaygroundDemo({ id }: { id?: ValueId }) {
  const containerRef = useRef(null);
  const enabled = settingsStore.use.checkedComponents();
  const initialValue = usePlaygroundValue(id);

  const plugins = usePlaygroundPlugins({
    id,
    components: createPlateUI(
      {},
      {
        placeholder: isEnabled('placeholder', id),
        draggable: isEnabled('dnd', id),
      }
    ),
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="relative">
        <Plate<MyValue>
          initialValue={initialValue}
          plugins={plugins}
          normalizeInitialValue
        >
          <ResetPluginsEffect initialValue={initialValue} plugins={plugins} />

          {enabled['fixed-toolbar'] && (
            <FixedToolbar>
              {enabled['fixed-toolbar-buttons'] && (
                <PlaygroundFixedToolbarButtons id={id} />
              )}
            </FixedToolbar>
          )}

          <div className="flex w-full">
            <CommentsProvider>
              <div
                ref={containerRef}
                className={cn(
                  'relative flex w-full overflow-x-auto',
                  '[&_.slate-start-area-top]:!h-4',
                  '[&_.slate-start-area-left]:!w-3 [&_.slate-start-area-right]:!w-3',
                  !id &&
                    'md:[&_.slate-start-area-left]:!w-[64px] md:[&_.slate-start-area-right]:!w-[64px]'
                )}
              >
                <PlateContent
                  {...editableProps}
                  placeholder=""
                  className={cn(
                    editableProps.className,
                    'px-8 outline-none',
                    !id && 'min-h-[920px] pb-[20vh] pt-4 md:px-[96px]',
                    id && 'pb-8 pt-2'
                  )}
                />

                {enabled['floating-toolbar'] && (
                  <FloatingToolbar>
                    {enabled['floating-toolbar-buttons'] && (
                      <PlaygroundFloatingToolbarButtons id={id} />
                    )}
                  </FloatingToolbar>
                )}

                {isEnabled('mention', id, enabled['mention-combobox']) && (
                  <MentionCombobox items={MENTIONABLES} />
                )}

                {isEnabled('cursoroverlay', id) && (
                  <CursorOverlay containerRef={containerRef} />
                )}
              </div>

              {isEnabled('comment', id, enabled['comments-popover']) && (
                <CommentsPopover />
              )}
            </CommentsProvider>
          </div>
        </Plate>
      </div>
    </DndProvider>
  );
}
