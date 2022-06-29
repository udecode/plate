import React, { useMemo, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  AlignToolbarButtons,
  BasicElementToolbarButtons,
  BasicMarkToolbarButtons,
  CollaborationToolbarButtons,
  IndentToolbarButtons,
  ListToolbarButtons,
  MarkBallonToolbar as BallonToolbarMarks,
  TableToolbarButtons,
} from '@example/config/components/Toolbars';
import { withStyledDraggables } from '@example/config/components/withStyledDraggables';
import { withStyledPlaceHolders } from '@example/config/components/withStyledPlaceHolders';
import { CONFIG } from '@example/config/config';
import {
  createDragOverCursorPlugin,
  cursorStore,
} from '@example/config/plugins';
import { MyEditor, MyValue } from '@example/config/typescript';
import { VALUES } from '@example/config/values/values';
import {
  Check,
  FontDownload,
  FormatColorText,
  Image,
  LineWeight,
  Link,
  OndemandVideo,
} from '@styled-icons/material';
import {
  CursorOverlay,
  LinkToolbarButton,
  MentionCombobox,
} from '@udecode/plate';
import { createAlignPlugin } from '@udecode/plate-alignment';
import { createAutoformatPlugin } from '@udecode/plate-autoformat';
import { AutoformatPlugin } from '@udecode/plate-autoformat/src';
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
import {
  createPlugins,
  Plate,
  withPlateEventProvider,
} from '@udecode/plate-core';
import {
  createFontBackgroundColorPlugin,
  createFontColorPlugin,
  createFontFamilyPlugin,
  createFontSizePlugin,
  createFontWeightPlugin,
  MARK_BG_COLOR,
  MARK_COLOR,
} from '@udecode/plate-font';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createHighlightPlugin } from '@udecode/plate-highlight';
import { createHorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { createImagePlugin } from '@udecode/plate-image';
import { createIndentPlugin } from '@udecode/plate-indent';
import { createJuicePlugin } from '@udecode/plate-juice';
import { createKbdPlugin } from '@udecode/plate-kbd';
import { createLineHeightPlugin } from '@udecode/plate-line-height';
import { createLinkPlugin } from '@udecode/plate-link';
import { createListPlugin, createTodoListPlugin } from '@udecode/plate-list';
import { createMediaEmbedPlugin } from '@udecode/plate-media-embed';
import { createMentionPlugin } from '@udecode/plate-mention';
import { createNodeIdPlugin } from '@udecode/plate-node-id';
import { createNormalizeTypesPlugin } from '@udecode/plate-normalizers';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { createResetNodePlugin } from '@udecode/plate-reset-node';
import { createSelectOnBackspacePlugin } from '@udecode/plate-select';
import { createDeserializeCsvPlugin } from '@udecode/plate-serializer-csv';
import { createDeserializeDocxPlugin } from '@udecode/plate-serializer-docx';
import { createDeserializeMdPlugin } from '@udecode/plate-serializer-md';
import { createTablePlugin } from '@udecode/plate-table';
import { createTrailingBlockPlugin } from '@udecode/plate-trailing-block';
import { createPlateUI } from '@udecode/plate-ui';
import { createExcalidrawPlugin } from '@udecode/plate-ui-excalidraw';
import { ColorPickerToolbarDropdown } from '@udecode/plate-ui-font';
import { ImageToolbarButton } from '@udecode/plate-ui-image';
import { LineHeightToolbarDropdown } from '@udecode/plate-ui-line-height';
import { MediaEmbedToolbarButton } from '@udecode/plate-ui-media-embed';
import { HeadingToolbar } from '@udecode/plate-ui-toolbar';
import { createThreadPlugin, ELEMENT_THREAD } from '@xolvio/plate-comments';
import {
  FetchContacts,
  OnAddThread,
  ThreadElement,
} from '@xolvio/plate-ui-comments';
import {
  RetrieveUser,
  UseCommentsReturnType,
} from '@xolvio/plate-ui-comments/src';
import { Comments } from './Comments';
import { useFetchContacts } from './useFetchContacts';
import { useRetrieveUser } from './useRetrieveUser';

const CursorOverlayContainer = (props) => {
  const cursors = cursorStore.use.cursors();

  return <CursorOverlay {...props} cursors={cursors} />;
};

const Toolbar = withPlateEventProvider(
  ({
    onAddThread,
    fetchContacts,
    retrieveUser,
  }: {
    onAddThread: OnAddThread;
    fetchContacts: FetchContacts;
    retrieveUser: RetrieveUser;
  }) => (
    <HeadingToolbar>
      <BasicElementToolbarButtons />
      <ListToolbarButtons />
      <IndentToolbarButtons />
      <BasicMarkToolbarButtons />
      <ColorPickerToolbarDropdown
        pluginKey={MARK_COLOR}
        icon={<FormatColorText />}
        selectedIcon={<Check />}
        tooltip={{ content: 'Text color' }}
      />
      <ColorPickerToolbarDropdown
        pluginKey={MARK_BG_COLOR}
        icon={<FontDownload />}
        selectedIcon={<Check />}
        tooltip={{ content: 'Highlight color' }}
      />
      <AlignToolbarButtons />
      <LineHeightToolbarDropdown icon={<LineWeight />} />
      <LinkToolbarButton icon={<Link />} />
      <ImageToolbarButton icon={<Image />} />
      <MediaEmbedToolbarButton icon={<OndemandVideo />} />
      <TableToolbarButtons />
      <CollaborationToolbarButtons
        onAddThread={onAddThread}
        fetchContacts={fetchContacts}
        retrieveUser={retrieveUser}
      />
    </HeadingToolbar>
  )
);

export function Playground() {
  const components = React.useMemo(() => {
    let components2 = createPlateUI({
      [ELEMENT_THREAD]: ThreadElement,
    });
    components2 = withStyledPlaceHolders(components2);
    components2 = withStyledDraggables(components2);
    return components2;
  }, []);

  const plugins = useMemo(
    () =>
      createPlugins<MyValue, MyEditor>(
        [
          createParagraphPlugin(),
          createBlockquotePlugin(),
          createTodoListPlugin(),
          createHeadingPlugin(),
          createImagePlugin(),
          createHorizontalRulePlugin(),
          createLineHeightPlugin(CONFIG.lineHeight),
          createLinkPlugin(),
          createListPlugin(),
          createTablePlugin(),
          createMediaEmbedPlugin(),
          createExcalidrawPlugin(),
          createCodeBlockPlugin(),
          createAlignPlugin(CONFIG.align),
          createBoldPlugin(),
          createCodePlugin(),
          createItalicPlugin(),
          createHighlightPlugin(),
          createUnderlinePlugin(),
          createStrikethroughPlugin(),
          createSubscriptPlugin(),
          createSuperscriptPlugin(),
          createFontBackgroundColorPlugin(),
          createFontFamilyPlugin(),
          createFontColorPlugin(),
          createFontSizePlugin(),
          createFontWeightPlugin(),
          createKbdPlugin(),
          createNodeIdPlugin(),
          createIndentPlugin(CONFIG.indent),
          createAutoformatPlugin<
            AutoformatPlugin<MyValue, MyEditor>,
            MyValue,
            MyEditor
          >(CONFIG.autoformat),
          createResetNodePlugin(CONFIG.resetBlockType),
          createSoftBreakPlugin(CONFIG.softBreak),
          createExitBreakPlugin(CONFIG.exitBreak),
          createNormalizeTypesPlugin(CONFIG.forceLayout),
          createTrailingBlockPlugin(CONFIG.trailingBlock),
          createSelectOnBackspacePlugin(CONFIG.selectOnBackspace),
          createDragOverCursorPlugin(), // local plugin
          createComboboxPlugin(),
          createMentionPlugin(),
          createDeserializeMdPlugin(),
          createDeserializeCsvPlugin(),
          createDeserializeDocxPlugin(),
          createJuicePlugin(),
          createThreadPlugin(),
        ],
        {
          components,
        }
      ),
    [components]
  );

  const [comments, setComments] = useState<UseCommentsReturnType | null>(null);
  const fetchContacts = useFetchContacts();
  const retrieveUser = useRetrieveUser();

  const containerRef = useRef();

  return (
    <DndProvider backend={HTML5Backend}>
      <Toolbar
        onAddThread={comments?.onAddThread}
        fetchContacts={fetchContacts}
        retrieveUser={retrieveUser}
      />

      <div ref={containerRef} style={{ position: 'relative' }}>
        <Plate
          id="playground"
          editableProps={CONFIG.editableProps}
          initialValue={VALUES.playground}
          plugins={plugins}
        >
          <BallonToolbarMarks />

          <MentionCombobox items={CONFIG.mentionItems} />

          <CursorOverlayContainer containerRef={containerRef} />

          <Comments setComments={setComments} />
        </Plate>
      </div>
    </DndProvider>
  );
}
