'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPlateUI } from '@/plate/create-plate-ui';
import { CommentsProvider } from '@/plate/demo/comments/CommentsProvider';
import { editableProps } from '@/plate/demo/editableProps';
import { isEnabled } from '@/plate/demo/is-enabled';
import { alignPlugin } from '@/plate/demo/plugins/alignPlugin';
import { autoformatIndentLists } from '@/plate/demo/plugins/autoformatIndentLists';
import { autoformatLists } from '@/plate/demo/plugins/autoformatLists';
import { autoformatRules } from '@/plate/demo/plugins/autoformatRules';
import { dragOverCursorPlugin } from '@/plate/demo/plugins/dragOverCursorPlugin';
import { emojiPlugin } from '@/plate/demo/plugins/emojiPlugin';
import { exitBreakPlugin } from '@/plate/demo/plugins/exitBreakPlugin';
import { forcedLayoutPlugin } from '@/plate/demo/plugins/forcedLayoutPlugin';
import { lineHeightPlugin } from '@/plate/demo/plugins/lineHeightPlugin';
import { linkPlugin } from '@/plate/demo/plugins/linkPlugin';
import { resetBlockTypePlugin } from '@/plate/demo/plugins/resetBlockTypePlugin';
import { selectOnBackspacePlugin } from '@/plate/demo/plugins/selectOnBackspacePlugin';
import { softBreakPlugin } from '@/plate/demo/plugins/softBreakPlugin';
import { tabbablePlugin } from '@/plate/demo/plugins/tabbablePlugin';
import { trailingBlockPlugin } from '@/plate/demo/plugins/trailingBlockPlugin';
import { MENTIONABLES } from '@/plate/demo/values/mentionables';
import { usePlaygroundValue } from '@/plate/demo/values/usePlaygroundValue';
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
  createBlockquotePlugin,
  ELEMENT_BLOCKQUOTE,
} from '@udecode/plate-block-quote';
import {
  createExitBreakPlugin,
  createSingleLinePlugin,
  createSoftBreakPlugin,
} from '@udecode/plate-break';
import { createCaptionPlugin } from '@udecode/plate-caption';
import {
  createCodeBlockPlugin,
  ELEMENT_CODE_BLOCK,
} from '@udecode/plate-code-block';
import { createComboboxPlugin } from '@udecode/plate-combobox';
import { createCommentsPlugin } from '@udecode/plate-comments';
import {
  createPlugins,
  Plate,
  PlatePluginComponent,
  Value,
} from '@udecode/plate-common';
import { createDndPlugin } from '@udecode/plate-dnd';
import { createEmojiPlugin } from '@udecode/plate-emoji';
import { createExcalidrawPlugin } from '@udecode/plate-excalidraw';
import {
  createFontBackgroundColorPlugin,
  createFontColorPlugin,
  createFontSizePlugin,
} from '@udecode/plate-font';
import {
  createHeadingPlugin,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading';
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
import {
  createParagraphPlugin,
  ELEMENT_PARAGRAPH,
} from '@udecode/plate-paragraph';
import { createResetNodePlugin } from '@udecode/plate-reset-node';
import {
  createDeletePlugin,
  createSelectOnBackspacePlugin,
} from '@udecode/plate-select';
import { createBlockSelectionPlugin } from '@udecode/plate-selection';
import { createDeserializeDocxPlugin } from '@udecode/plate-serializer-docx';
import { createDeserializeMdPlugin } from '@udecode/plate-serializer-md';
import { createTabbablePlugin } from '@udecode/plate-tabbable';
import { createTablePlugin } from '@udecode/plate-table';
import { createTogglePlugin, ELEMENT_TOGGLE } from '@udecode/plate-toggle';
import { createTrailingBlockPlugin } from '@udecode/plate-trailing-block';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { ValueId } from '@/config/customizer-plugins';
import { captionPlugin } from '@/lib/plate/demo/plugins/captionPlugin';
import { settingsStore } from '@/components/context/settings-store';
import { PlaygroundFixedToolbarButtons } from '@/components/plate-ui/playground-fixed-toolbar-buttons';
import { PlaygroundFloatingToolbarButtons } from '@/components/plate-ui/playground-floating-toolbar-buttons';
import { CommentsPopover } from '@/registry/default/plate-ui/comments-popover';
import { CursorOverlay } from '@/registry/default/plate-ui/cursor-overlay';
import { Editor } from '@/registry/default/plate-ui/editor';
import { FixedToolbar } from '@/registry/default/plate-ui/fixed-toolbar';
import { FloatingToolbar } from '@/registry/default/plate-ui/floating-toolbar';
import {
  CheckedMarker,
  TodoMarker,
} from '@/registry/default/plate-ui/indent-todo-marker-component';
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
    () => {
      return createPlugins(
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
          createAlignPlugin({ ...alignPlugin, enabled: !!enabled.align }),
          createIndentPlugin({
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
            enabled: !!enabled.indent,
          }),
          createIndentListPlugin({
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
            enabled: id === 'indentlist' || !!enabled.listStyleType,
            options: {
              markerComponent: TodoMarker,
              markerCheckedStyle: CheckedMarker,
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
        <Plate
          key={key}
          initialValue={initialValue}
          plugins={plugins}
          normalizeInitialValue
        >
          <CommentsProvider>
            {enabled['fixed-toolbar'] && (
              <FixedToolbar>
                {enabled['fixed-toolbar-buttons'] && (
                  <PlaygroundFixedToolbarButtons id={id} />
                )}
              </FixedToolbar>
            )}

            <div className="flex w-full">
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
                <Editor
                  {...editableProps}
                  placeholder=""
                  variant="ghost"
                  size="md"
                  focusRing={false}
                  className={cn(
                    editableProps.className,
                    'px-8',
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
            </div>
          </CommentsProvider>
        </Plate>
      </div>
    </DndProvider>
  );
}

[
  {
    component: {},
    enabled: true,
    key: 'p',
    isElement: true,
    handlers: {},
    options: {
      hotkey: ['mod+opt+0', 'mod+shift+0'],
    },
    deserializeHtml: {
      rules: [
        {
          validNodeName: 'P',
        },
      ],
    },
    type: 'p',
    inject: {},
    editor: {},
  },
  {
    enabled: true,
    key: 'heading',
    options: {
      levels: 6,
    },
    _thenReplaced: 2,
    type: 'heading',
    inject: {},
    editor: {},
  },
  {
    component: {},
    enabled: true,
    key: 'blockquote',
    isElement: true,
    deserializeHtml: {
      rules: [
        {
          validNodeName: 'BLOCKQUOTE',
        },
      ],
    },
    handlers: {},
    options: {
      hotkey: 'mod+shift+.',
    },
    type: 'blockquote',
    inject: {},
    editor: {},
  },
  {
    component: {},
    enabled: true,
    key: 'code_block',
    isElement: true,
    deserializeHtml: {
      rules: [
        {
          validNodeName: 'PRE',
        },
        {
          validNodeName: 'P',
          validStyle: {
            fontFamily: 'Consolas',
          },
        },
      ],
    },
    handlers: {},
    options: {
      hotkey: ['mod+opt+8', 'mod+shift+8'],
      syntax: true,
      syntaxPopularFirst: false,
    },
    plugins: [
      {
        component: {},
        key: 'code_line',
        isElement: true,
        type: 'code_line',
        options: {},
        inject: {},
        editor: {},
      },
      {
        component: {},
        key: 'code_syntax',
        isLeaf: true,
        type: 'code_syntax',
        options: {},
        inject: {},
        editor: {},
      },
    ],
    _thenReplaced: 2,
    type: 'code_block',
    inject: {},
    editor: {},
  },
  {
    component: {},
    enabled: true,
    key: 'hr',
    isElement: true,
    isVoid: true,
    deserializeHtml: {
      rules: [
        {
          validNodeName: 'HR',
        },
      ],
    },
    type: 'hr',
    options: {},
    inject: {},
    editor: {},
  },
  {
    component: {},
    enabled: true,
    key: 'a',
    isElement: true,
    isInline: true,
    options: {
      allowedSchemes: ['http', 'https', 'mailto', 'tel'],
      dangerouslySkipSanitization: false,
      defaultLinkAttributes: {},
      rangeBeforeOptions: {
        matchString: ' ',
        skipInvalid: true,
        afterMatch: true,
      },
      triggerFloatingLinkHotkeys: 'meta+k, ctrl+k',
      keepSelectedTextOnPaste: true,
    },
    _thenReplaced: 2,
    type: 'a',
    inject: {},
    editor: {},
  },
  {
    enabled: false,
    key: 'list',
    plugins: [
      {
        component: {},
        key: 'ul',
        isElement: true,
        handlers: {},
        deserializeHtml: {
          rules: [
            {
              validNodeName: 'UL',
            },
          ],
        },
      },
      {
        component: {},
        key: 'ol',
        isElement: true,
        handlers: {},
        deserializeHtml: {
          rules: [
            {
              validNodeName: 'OL',
            },
          ],
        },
      },
      {
        component: {},
        key: 'li',
        isElement: true,
        deserializeHtml: {
          rules: [
            {
              validNodeName: 'LI',
            },
          ],
        },
        _thenReplaced: 2,
      },
      {
        key: 'lic',
        isElement: true,
      },
    ],
    type: 'list',
    options: {},
    inject: {},
    editor: {},
  },
  {
    component: {},
    enabled: true,
    key: 'img',
    isElement: true,
    isVoid: true,
    _thenReplaced: 2,
    type: 'img',
    options: {},
    inject: {},
    editor: {},
  },
  {
    component: {},
    enabled: true,
    key: 'media_embed',
    isElement: true,
    isVoid: true,
    options: {},
    _thenReplaced: 2,
    type: 'media_embed',
    inject: {},
    editor: {},
  },
  {
    options: {
      pluginKeys: ['img', 'media_embed'],
    },
    enabled: true,
    key: 'caption',
    handlers: {},
    type: 'caption',
    inject: {},
    editor: {},
  },
  {
    component: {},
    enabled: true,
    options: {
      triggerPreviousCharPattern: {},
      trigger: '@',
    },
    key: 'mention',
    isElement: true,
    isInline: true,
    isVoid: true,
    isMarkableVoid: true,
    handlers: {},
    plugins: [
      {
        component: {},
        key: 'mention_input',
        isElement: true,
        isInline: true,
        type: 'mention_input',
        options: {},
        inject: {},
        editor: {},
      },
    ],
    _thenReplaced: 2,
    type: 'mention',
    inject: {},
    editor: {},
  },
  {
    component: {},
    enabled: true,
    options: {
      enableMerging: false,
      minColumnWidth: 48,
      _cellIndices: {},
    },
    key: 'table',
    isElement: true,
    handlers: {},
    deserializeHtml: {
      rules: [
        {
          validNodeName: 'TABLE',
        },
      ],
    },
    plugins: [
      {
        component: {},
        key: 'tr',
        isElement: true,
        deserializeHtml: {
          rules: [
            {
              validNodeName: 'TR',
            },
          ],
        },
        type: 'tr',
        options: {},
        inject: {},
        editor: {},
      },
      {
        component: {},
        key: 'td',
        isElement: true,
        deserializeHtml: {
          attributeNames: ['rowspan', 'colspan'],
          rules: [
            {
              validNodeName: 'TD',
            },
          ],
        },
        type: 'td',
        options: {},
        inject: {},
        editor: {},
      },
      {
        component: {},
        key: 'th',
        isElement: true,
        deserializeHtml: {
          attributeNames: ['rowspan', 'colspan'],
          rules: [
            {
              validNodeName: 'TH',
            },
          ],
        },
        type: 'th',
        options: {},
        inject: {},
        editor: {},
      },
    ],
    type: 'table',
    inject: {},
    editor: {},
  },
  {
    component: {},
    enabled: true,
    key: 'action_item',
    isElement: true,
    handlers: {},
    options: {
      hotkey: ['mod+opt+4', 'mod+shift+4'],
    },
    type: 'action_item',
    inject: {},
    editor: {},
  },
  {
    component: {},
    enabled: true,
    key: 'toggle',
    isElement: true,
    inject: {},
    type: 'toggle',
    options: {
      openIds: {},
      toggleIndex: {},
    },
    editor: {},
  },
  {
    component: {},
    enabled: true,
    key: 'excalidraw',
    isElement: true,
    isVoid: true,
    type: 'excalidraw',
    options: {},
    inject: {},
    editor: {},
  },
  {
    component: {},
    enabled: true,
    key: 'bold',
    isLeaf: true,
    deserializeHtml: {
      rules: [
        {
          validNodeName: ['STRONG', 'B'],
        },
        {
          validStyle: {
            fontWeight: ['600', '700', 'bold'],
          },
        },
      ],
    },
    handlers: {},
    options: {
      hotkey: 'mod+b',
    },
    type: 'bold',
    inject: {},
    editor: {},
  },
  {
    component: {},
    enabled: true,
    key: 'italic',
    isLeaf: true,
    handlers: {},
    options: {
      hotkey: 'mod+i',
    },
    deserializeHtml: {
      rules: [
        {
          validNodeName: ['EM', 'I'],
        },
        {
          validStyle: {
            fontStyle: 'italic',
          },
        },
      ],
    },
    type: 'italic',
    inject: {},
    editor: {},
  },
  {
    component: {},
    enabled: true,
    key: 'underline',
    isLeaf: true,
    handlers: {},
    options: {
      hotkey: 'mod+u',
    },
    deserializeHtml: {
      rules: [
        {
          validNodeName: ['U'],
        },
        {
          validStyle: {
            textDecoration: ['underline'],
          },
        },
      ],
    },
    type: 'underline',
    inject: {},
    editor: {},
  },
  {
    component: {},
    enabled: true,
    key: 'strikethrough',
    isLeaf: true,
    handlers: {},
    options: {
      hotkey: 'mod+shift+x',
    },
    deserializeHtml: {
      rules: [
        {
          validNodeName: ['S', 'DEL', 'STRIKE'],
        },
        {
          validStyle: {
            textDecoration: 'line-through',
          },
        },
      ],
    },
    type: 'strikethrough',
    inject: {},
    editor: {},
  },
  {
    component: {},
    enabled: true,
    key: 'code',
    isLeaf: true,
    deserializeHtml: {
      rules: [
        {
          validNodeName: ['CODE'],
        },
        {
          validStyle: {
            fontFamily: 'Consolas',
          },
        },
      ],
    },
    handlers: {},
    options: {
      hotkey: 'mod+e',
    },
    type: 'code',
    inject: {},
    editor: {},
  },
  {
    component: {},
    enabled: true,
    key: 'subscript',
    isLeaf: true,
    handlers: {},
    options: {
      hotkey: 'mod+,',
      clear: 'superscript',
    },
    deserializeHtml: {
      rules: [
        {
          validNodeName: ['SUB'],
        },
        {
          validStyle: {
            verticalAlign: 'sub',
          },
        },
      ],
    },
    type: 'subscript',
    inject: {},
    editor: {},
  },
  {
    component: {},
    enabled: true,
    key: 'superscript',
    isLeaf: true,
    handlers: {},
    options: {
      hotkey: 'mod+.',
      clear: 'subscript',
    },
    deserializeHtml: {
      rules: [
        {
          validNodeName: ['SUP'],
        },
        {
          validStyle: {
            verticalAlign: 'super',
          },
        },
      ],
    },
    type: 'superscript',
    inject: {},
    editor: {},
  },
  {
    enabled: true,
    key: 'color',
    inject: {
      props: {
        nodeKey: 'color',
        defaultNodeValue: 'black',
      },
    },
    _thenReplaced: 2,
    type: 'color',
    options: {},
    editor: {},
  },
  {
    enabled: true,
    key: 'backgroundColor',
    inject: {
      props: {
        nodeKey: 'backgroundColor',
      },
    },
    _thenReplaced: 2,
    type: 'backgroundColor',
    options: {},
    editor: {},
  },
  {
    enabled: true,
    key: 'fontSize',
    inject: {
      props: {
        nodeKey: 'fontSize',
      },
    },
    _thenReplaced: 2,
    type: 'fontSize',
    options: {},
    editor: {},
  },
  {
    component: {},
    enabled: true,
    key: 'highlight',
    isLeaf: true,
    handlers: {},
    deserializeHtml: {
      rules: [
        {
          validNodeName: ['MARK'],
        },
      ],
    },
    options: {
      hotkey: 'mod+shift+h',
    },
    type: 'highlight',
    inject: {},
    editor: {},
  },
  {
    component: {},
    enabled: true,
    key: 'kbd',
    isLeaf: true,
    handlers: {},
    deserializeHtml: {
      rules: [
        {
          validNodeName: ['KBD'],
        },
      ],
    },
    type: 'kbd',
    options: {},
    inject: {},
    editor: {},
  },
  {
    inject: {
      props: {
        validTypes: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        nodeKey: 'align',
        defaultNodeValue: 'start',
        styleKey: 'textAlign',
        validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
      },
      pluginsByKey: {
        p: {
          deserializeHtml: {},
        },
        h1: {
          deserializeHtml: {},
        },
        h2: {
          deserializeHtml: {},
        },
        h3: {
          deserializeHtml: {},
        },
        h4: {
          deserializeHtml: {},
        },
        h5: {
          deserializeHtml: {},
        },
        h6: {
          deserializeHtml: {},
        },
      },
    },
    enabled: true,
    key: 'align',
    _thenReplaced: 2,
    type: 'align',
    options: {},
    editor: {},
  },
  {
    inject: {
      props: {
        validTypes: [
          'p',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'blockquote',
          'code_block',
          'toggle',
        ],
        nodeKey: 'indent',
        styleKey: 'marginLeft',
      },
      pluginsByKey: {
        deserializeHtml: {
          editor: {
            insertData: {},
          },
        },
      },
    },
    enabled: true,
    key: 'indent',
    handlers: {},
    options: {
      offset: 24,
      unit: 'px',
    },
    _thenReplaced: 2,
    type: 'indent',
    editor: {},
  },
  {
    inject: {
      props: {
        validTypes: [
          'p',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'blockquote',
          'code_block',
          'toggle',
        ],
        nodeKey: 'indent',
        styleKey: 'marginLeft',
      },
      pluginsByKey: {
        deserializeHtml: {
          editor: {
            insertData: {},
          },
        },
      },
    },
    enabled: true,
    key: 'listStyleType',
    handlers: {},
    options: {},
    _thenReplaced: 2,
    type: 'listStyleType',
    editor: {},
  },
  {
    inject: {
      props: {
        defaultNodeValue: 1.5,
        validNodeValues: [1, 1.2, 1.5, 2, 3],
        validTypes: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        nodeKey: 'lineHeight',
      },
      pluginsByKey: {
        p: {
          deserializeHtml: {},
        },
        h1: {
          deserializeHtml: {},
        },
        h2: {
          deserializeHtml: {},
        },
        h3: {
          deserializeHtml: {},
        },
        h4: {
          deserializeHtml: {},
        },
        h5: {
          deserializeHtml: {},
        },
        h6: {
          deserializeHtml: {},
        },
      },
    },
    enabled: true,
    key: 'lineHeight',
    _thenReplaced: 2,
    type: 'lineHeight',
    options: {},
    editor: {},
  },
  {
    enabled: true,
    options: {
      rules: [
        {
          mode: 'block',
          type: 'h1',
          match: '# ',
        },
        {
          mode: 'block',
          type: 'h2',
          match: '## ',
        },
        {
          mode: 'block',
          type: 'h3',
          match: '### ',
        },
        {
          mode: 'block',
          type: 'h4',
          match: '#### ',
        },
        {
          mode: 'block',
          type: 'h5',
          match: '##### ',
        },
        {
          mode: 'block',
          type: 'h6',
          match: '###### ',
        },
        {
          mode: 'block',
          type: 'blockquote',
          match: '> ',
        },
        {
          mode: 'block',
          type: 'code_block',
          match: '```',
          triggerAtBlockStart: false,
        },
        {
          mode: 'block',
          type: 'toggle',
          match: '+ ',
        },
        {
          mode: 'block',
          type: 'hr',
          match: ['---', '—-', '___ '],
        },
        {
          mode: 'mark',
          type: ['bold', 'italic'],
          match: '***',
        },
        {
          mode: 'mark',
          type: ['underline', 'italic'],
          match: '__*',
        },
        {
          mode: 'mark',
          type: ['underline', 'bold'],
          match: '__**',
        },
        {
          mode: 'mark',
          type: ['underline', 'bold', 'italic'],
          match: '___***',
        },
        {
          mode: 'mark',
          type: 'bold',
          match: '**',
        },
        {
          mode: 'mark',
          type: 'underline',
          match: '__',
        },
        {
          mode: 'mark',
          type: 'italic',
          match: '*',
        },
        {
          mode: 'mark',
          type: 'italic',
          match: '_',
        },
        {
          mode: 'mark',
          type: 'strikethrough',
          match: '~~',
        },
        {
          mode: 'mark',
          type: 'superscript',
          match: '^',
        },
        {
          mode: 'mark',
          type: 'subscript',
          match: '~',
        },
        {
          mode: 'mark',
          type: 'highlight',
          match: '==',
        },
        {
          mode: 'mark',
          type: 'highlight',
          match: '≡',
        },
        {
          mode: 'mark',
          type: 'code',
          match: '`',
        },
        {
          mode: 'text',
          match: '"',
          format: ['“', '”'],
        },
        {
          mode: 'text',
          match: "'",
          format: ['‘', '’'],
        },
        {
          mode: 'text',
          match: '--',
          format: '—',
        },
        {
          mode: 'text',
          match: '...',
          format: '…',
        },
        {
          mode: 'text',
          match: '>>',
          format: '»',
        },
        {
          mode: 'text',
          match: '<<',
          format: '«',
        },
        {
          mode: 'text',
          match: ['(tm)', '(TM)'],
          format: '™',
        },
        {
          mode: 'text',
          match: ['(r)', '(R)'],
          format: '®',
        },
        {
          mode: 'text',
          match: ['(c)', '(C)'],
          format: '©',
        },
        {
          mode: 'text',
          match: '&trade;',
          format: '™',
        },
        {
          mode: 'text',
          match: '&reg;',
          format: '®',
        },
        {
          mode: 'text',
          match: '&copy;',
          format: '©',
        },
        {
          mode: 'text',
          match: '&sect;',
          format: '§',
        },
        {
          mode: 'text',
          match: '->',
          format: '→',
        },
        {
          mode: 'text',
          match: '<-',
          format: '←',
        },
        {
          mode: 'text',
          match: '=>',
          format: '⇒',
        },
        {
          mode: 'text',
          match: ['<=', '≤='],
          format: '⇐',
        },
        {
          mode: 'text',
          match: '!>',
          format: '≯',
        },
        {
          mode: 'text',
          match: '!<',
          format: '≮',
        },
        {
          mode: 'text',
          match: '>=',
          format: '≥',
        },
        {
          mode: 'text',
          match: '<=',
          format: '≤',
        },
        {
          mode: 'text',
          match: '!>=',
          format: '≱',
        },
        {
          mode: 'text',
          match: '!<=',
          format: '≰',
        },
        {
          mode: 'text',
          match: '!=',
          format: '≠',
        },
        {
          mode: 'text',
          match: '==',
          format: '≡',
        },
        {
          mode: 'text',
          match: ['!==', '≠='],
          format: '≢',
        },
        {
          mode: 'text',
          match: '~=',
          format: '≈',
        },
        {
          mode: 'text',
          match: '!~=',
          format: '≉',
        },
        {
          mode: 'text',
          match: '+-',
          format: '±',
        },
        {
          mode: 'text',
          match: '%%',
          format: '‰',
        },
        {
          mode: 'text',
          match: ['%%%', '‰%'],
          format: '‱',
        },
        {
          mode: 'text',
          match: '//',
          format: '÷',
        },
        {
          mode: 'text',
          match: '1/2',
          format: '½',
        },
        {
          mode: 'text',
          match: '1/3',
          format: '⅓',
        },
        {
          mode: 'text',
          match: '1/4',
          format: '¼',
        },
        {
          mode: 'text',
          match: '1/5',
          format: '⅕',
        },
        {
          mode: 'text',
          match: '1/6',
          format: '⅙',
        },
        {
          mode: 'text',
          match: '1/7',
          format: '⅐',
        },
        {
          mode: 'text',
          match: '1/8',
          format: '⅛',
        },
        {
          mode: 'text',
          match: '1/9',
          format: '⅑',
        },
        {
          mode: 'text',
          match: '1/10',
          format: '⅒',
        },
        {
          mode: 'text',
          match: '2/3',
          format: '⅔',
        },
        {
          mode: 'text',
          match: '2/5',
          format: '⅖',
        },
        {
          mode: 'text',
          match: '3/4',
          format: '¾',
        },
        {
          mode: 'text',
          match: '3/5',
          format: '⅗',
        },
        {
          mode: 'text',
          match: '3/8',
          format: '⅜',
        },
        {
          mode: 'text',
          match: '4/5',
          format: '⅘',
        },
        {
          mode: 'text',
          match: '5/6',
          format: '⅚',
        },
        {
          mode: 'text',
          match: '5/8',
          format: '⅝',
        },
        {
          mode: 'text',
          match: '7/8',
          format: '⅞',
        },
        {
          mode: 'text',
          match: '^o',
          format: '°',
        },
        {
          mode: 'text',
          match: '^+',
          format: '⁺',
        },
        {
          mode: 'text',
          match: '^-',
          format: '⁻',
        },
        {
          mode: 'text',
          match: '~+',
          format: '₊',
        },
        {
          mode: 'text',
          match: '~-',
          format: '₋',
        },
        {
          mode: 'text',
          match: '^0',
          format: '⁰',
        },
        {
          mode: 'text',
          match: '^1',
          format: '¹',
        },
        {
          mode: 'text',
          match: '^2',
          format: '²',
        },
        {
          mode: 'text',
          match: '^3',
          format: '³',
        },
        {
          mode: 'text',
          match: '^4',
          format: '⁴',
        },
        {
          mode: 'text',
          match: '^5',
          format: '⁵',
        },
        {
          mode: 'text',
          match: '^6',
          format: '⁶',
        },
        {
          mode: 'text',
          match: '^7',
          format: '⁷',
        },
        {
          mode: 'text',
          match: '^8',
          format: '⁸',
        },
        {
          mode: 'text',
          match: '^9',
          format: '⁹',
        },
        {
          mode: 'text',
          match: '~0',
          format: '₀',
        },
        {
          mode: 'text',
          match: '~1',
          format: '₁',
        },
        {
          mode: 'text',
          match: '~2',
          format: '₂',
        },
        {
          mode: 'text',
          match: '~3',
          format: '₃',
        },
        {
          mode: 'text',
          match: '~4',
          format: '₄',
        },
        {
          mode: 'text',
          match: '~5',
          format: '₅',
        },
        {
          mode: 'text',
          match: '~6',
          format: '₆',
        },
        {
          mode: 'text',
          match: '~7',
          format: '₇',
        },
        {
          mode: 'text',
          match: '~8',
          format: '₈',
        },
        {
          mode: 'text',
          match: '~9',
          format: '₉',
        },
        {
          mode: 'block',
          type: 'list',
          match: ['* ', '- '],
        },
        {
          mode: 'block',
          type: 'list',
          match: ['1. ', '1) '],
        },
      ],
      enableUndoOnDelete: true,
    },
    key: 'autoformat',
    handlers: {},
    type: 'autoformat',
    inject: {},
    editor: {},
  },
  {
    options: {
      sizes: {
        top: 0,
        bottom: 0,
        left: 4,
        right: 4,
      },
      query: {
        maxLevel: 1,
      },
    },
    enabled: true,
    key: 'blockSelection',
    inject: {},
    handlers: {},
    _thenReplaced: 2,
    type: 'blockSelection',
    editor: {},
  },
  {
    enabled: true,
    key: 'combobox',
    handlers: {},
    type: 'combobox',
    options: {},
    inject: {},
    editor: {},
  },
  {
    options: {
      enableScroller: true,
    },
    enabled: true,
    key: 'dnd',
    handlers: {},
    _thenReplaced: 2,
    type: 'dnd',
    inject: {},
    editor: {},
  },
  {
    enabled: true,
    key: 'emoji',
    options: {
      trigger: ':',
      emojiTriggeringController: {
        options: {
          trigger: ':',
          limitTriggeringChars: 2,
        },
        _isTriggering: false,
        _hasTriggeringMark: false,
        text: '',
      },
    },
    _thenReplaced: 2,
    type: 'emoji',
    inject: {},
    editor: {},
  },
  {
    options: {
      rules: [
        {
          hotkey: 'mod+enter',
        },
        {
          hotkey: 'mod+shift+enter',
          before: true,
        },
        {
          hotkey: 'enter',
          query: {
            start: true,
            end: true,
            allow: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
          },
          relative: true,
          level: 1,
        },
      ],
    },
    enabled: true,
    key: 'exitBreak',
    handlers: {},
    type: 'exitBreak',
    inject: {},
    editor: {},
  },
  {
    enabled: true,
    key: 'nodeId',
    options: {
      idKey: 'id',
      filterText: true,
    },
    type: 'nodeId',
    inject: {},
    editor: {},
  },
  {
    options: {
      rules: [
        {
          path: [0],
          strictType: 'h1',
        },
      ],
    },
    enabled: false,
    key: 'normalizeTypes',
    type: 'normalizeTypes',
    inject: {},
    editor: {},
  },
  {
    options: {
      rules: [
        {
          types: ['blockquote', 'action_item'],
          defaultType: 'p',
          hotkey: 'Enter',
        },
        {
          types: ['blockquote', 'action_item'],
          defaultType: 'p',
          hotkey: 'Backspace',
        },
        {
          types: ['code_block'],
          defaultType: 'p',
          hotkey: 'Enter',
        },
        {
          types: ['code_block'],
          defaultType: 'p',
          hotkey: 'Backspace',
        },
      ],
    },
    enabled: true,
    key: 'resetNode',
    handlers: {},
    type: 'resetNode',
    inject: {},
    editor: {},
  },
  {
    options: {
      query: {
        allow: ['img', 'hr'],
      },
      removeNodeIfEmpty: false,
    },
    enabled: false,
    key: 'selectOnBackspace',
    type: 'selectOnBackspace',
    inject: {},
    editor: {},
  },
  {
    enabled: true,
    key: 'delete',
    options: {
      query: {
        allow: ['p'],
      },
    },
    type: 'delete',
    inject: {},
    editor: {},
  },
  {
    enabled: false,
    key: 'singleLine',
    handlers: {},
    type: 'singleLine',
    options: {},
    inject: {},
    editor: {},
  },
  {
    options: {
      rules: [
        {
          hotkey: 'shift+enter',
        },
        {
          hotkey: 'enter',
          query: {
            allow: ['code_block', 'blockquote', 'td'],
          },
        },
      ],
    },
    enabled: true,
    key: 'softBreak',
    handlers: {},
    type: 'softBreak',
    inject: {},
    editor: {},
  },
  {
    options: {
      globalEventListener: false,
    },
    enabled: true,
    key: 'tabbable',
    plugins: [
      {
        key: 'tabbable_element',
        isElement: true,
        isVoid: true,
        type: 'tabbable_element',
        options: {},
        inject: {},
        editor: {},
      },
    ],
    type: 'tabbable',
    inject: {},
    editor: {},
  },
  {
    options: {
      type: 'p',
      level: 0,
    },
    enabled: true,
    key: 'trailingBlock',
    _thenReplaced: 2,
    type: 'trailingBlock',
    inject: {},
    editor: {},
  },
  {
    key: 'dragOverCursor',
    handlers: {},
    enabled: true,
    type: 'dragOverCursor',
    options: {},
    inject: {},
    editor: {},
  },
  {
    enabled: true,
    key: 'comment',
    isLeaf: true,
    options: {
      hotkey: ['meta+shift+m', 'ctrl+shift+m'],
    },
    type: 'comment',
    inject: {},
    editor: {},
  },
  {
    enabled: true,
    key: 'deserializeDocx',
    inject: {
      pluginsByKey: {
        deserializeHtml: {
          editor: {
            insertData: {},
          },
        },
      },
    },
    overrideByKey: {
      p: {},
      h1: {},
      h2: {},
      h3: {},
      h4: {},
      h5: {},
      h6: {},
      img: {
        editor: {
          insertData: {},
        },
      },
    },
    type: 'deserializeDocx',
    options: {},
    editor: {},
  },
  {
    enabled: true,
    key: 'deserializeMd',
    options: {
      elementRules: {
        heading: {},
        list: {},
        listItem: {},
        paragraph: {},
        link: {},
        image: {},
        blockquote: {},
        code: {},
        thematicBreak: {},
      },
      textRules: {
        text: {},
        emphasis: {},
        strong: {},
        inlineCode: {},
        html: {},
      },
      indentList: false,
    },
    _thenReplaced: 2,
    type: 'deserializeMd',
    inject: {},
    editor: {},
  },
  {
    enabled: true,
    key: 'juice',
    inject: {
      pluginsByKey: {
        deserializeHtml: {
          editor: {
            insertData: {},
          },
        },
      },
    },
    type: 'juice',
    options: {},
    editor: {},
  },
];
