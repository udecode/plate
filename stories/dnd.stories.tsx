import './dnd.css';
import React, { useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Meta } from '@storybook/react/types-6-0';
import { Image } from '@styled-icons/material/Image';
import { Link } from '@styled-icons/material/Link';
import { Search } from '@styled-icons/material/Search';
import { createBlockquotePlugin } from '@udecode/plate-block-quote';
import { createCodeBlockPlugin } from '@udecode/plate-code-block';
import { createHistoryPlugin, createReactPlugin } from '@udecode/plate-core';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createImagePlugin } from '@udecode/plate-image';
import { createLinkPlugin } from '@udecode/plate-link';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { HeadingToolbar } from '@udecode/plate-toolbar';
import {
  AlignToolbarButtons,
  BasicElementToolbarButtons,
  BasicMarkToolbarButtons,
  ListToolbarButtons,
  MarkBallonToolbar,
  TableToolbarButtons,
} from '../docs/src/live/config/components/Toolbars';
import { withStyledDraggables } from '../docs/src/live/config/components/withStyledDraggables';
import { withStyledPlaceHolders } from '../docs/src/live/config/components/withStyledPlaceHolders';
import { CONFIG } from '../docs/src/live/config/config';
import { VALUES } from '../docs/src/live/config/values/values';
import { createDndPlugin } from '../packages/blocks/dnd/src/createDndPlugin';
import { Plate } from '../packages/core/src/components/Plate';
import { createPlugins } from '../packages/core/src/utils/createPlugins';
import { useFindReplacePlugin } from '../packages/decorators/find-replace/src/useFindReplacePlugin';
import { SearchHighlightToolbar } from '../packages/decorators/find-replace-ui/src/SearchHighlightToolbar/SearchHighlightToolbar';
import { createAutoformatPlugin } from '../packages/editor/autoformat/src/createAutoformatPlugin';
import { createExitBreakPlugin } from '../packages/editor/break/src/exit-break/createExitBreakPlugin';
import { createSoftBreakPlugin } from '../packages/editor/break/src/soft-break/createSoftBreakPlugin';
import { createNodeIdPlugin } from '../packages/editor/node-id/src/createNodeIdPlugin';
import { createNormalizeTypesPlugin } from '../packages/editor/normalizers/src/createNormalizeTypesPlugin';
import { createResetNodePlugin } from '../packages/editor/reset-node/src/createResetNodePlugin';
import { createSelectOnBackspacePlugin } from '../packages/editor/select/src/createSelectOnBackspacePlugin';
import { createTrailingBlockPlugin } from '../packages/editor/trailing-block/src/createTrailingBlockPlugin';
import { createAlignPlugin } from '../packages/elements/alignment/src/createAlignPlugin';
import { ImageToolbarButton } from '../packages/elements/image-ui/src/ImageToolbarButton/ImageToolbarButton';
import { LinkToolbarButton } from '../packages/elements/link-ui/src/LinkToolbarButton/LinkToolbarButton';
import { createListPlugin } from '../packages/elements/list/src/createListPlugin';
import { createTodoListPlugin } from '../packages/elements/list/src/todo-list/createTodoListPlugin';
import { createMediaEmbedPlugin } from '../packages/elements/media-embed/src/createMediaEmbedPlugin';
import { createMentionPlugin } from '../packages/elements/mention/src/createMentionPlugin';
import { MentionCombobox } from '../packages/elements/mention-ui/src/MentionCombobox/MentionCombobox';
import { createTablePlugin } from '../packages/elements/table/src/createTablePlugin';
import { createBoldPlugin } from '../packages/marks/basic-marks/src/bold/createBoldPlugin';
import { createCodePlugin } from '../packages/marks/basic-marks/src/code/createCodePlugin';
import { createItalicPlugin } from '../packages/marks/basic-marks/src/italic/createItalicPlugin';
import { createStrikethroughPlugin } from '../packages/marks/basic-marks/src/strikethrough/createStrikethroughPlugin';
import { createSubscriptPlugin } from '../packages/marks/basic-marks/src/subscript/createSubscriptPlugin';
import { createSuperscriptPlugin } from '../packages/marks/basic-marks/src/superscript/createSuperscriptPlugin';
import { createUnderlinePlugin } from '../packages/marks/basic-marks/src/underline/createUnderlinePlugin';
import { createHighlightPlugin } from '../packages/marks/highlight/src/createHighlightPlugin';
import { createKbdPlugin } from '../packages/marks/kbd/src/createKbdPlugin';
import { createPlateComponents } from '../packages/plate/src/utils/createPlateComponents';
import { createDeserializeHtmlPlugin } from '../packages/serializers/html/src/deserializer/createDeserializeHtmlPlugin';

export default {
  title: 'Drag & Drop',
} as Meta;

export const Example = () => {
  let components = createPlateComponents();
  components = withStyledPlaceHolders(components);
  components = withStyledDraggables(components);

  const Editor = () => {
    const { setSearch, plugin: searchHighlightPlugin } = useFindReplacePlugin();

    const pluginsMemo = useMemo(() => {
      const plugins = createPlugins(
        [
          createReactPlugin(),
          createHistoryPlugin(),
          createParagraphPlugin(),
          createBlockquotePlugin(),
          createTodoListPlugin(),
          createHeadingPlugin(),
          createImagePlugin(),
          createLinkPlugin(),
          createListPlugin(),
          createTablePlugin(),
          createMediaEmbedPlugin(),
          createCodeBlockPlugin(),
          createAlignPlugin(),
          createBoldPlugin(),
          createCodePlugin(),
          createItalicPlugin(),
          createHighlightPlugin(),
          createUnderlinePlugin(),
          createStrikethroughPlugin(),
          createSubscriptPlugin(),
          createSuperscriptPlugin(),
          createKbdPlugin(),
          createNodeIdPlugin(),
          createAutoformatPlugin(CONFIG.autoformat),
          createResetNodePlugin(CONFIG.resetBlockType),
          createSoftBreakPlugin(CONFIG.softBreak),
          createExitBreakPlugin(CONFIG.exitBreak),
          createNormalizeTypesPlugin(CONFIG.forceLayout),
          createTrailingBlockPlugin(CONFIG.trailingBlock),
          createSelectOnBackspacePlugin(CONFIG.selectOnBackspace),
          createMentionPlugin(),
          searchHighlightPlugin,
          createDndPlugin(),
        ],
        {
          components,
        }
      );

      plugins.push(createDeserializeHtmlPlugin({ plugins }));

      return plugins;
    }, [searchHighlightPlugin]);

    return (
      <Plate
        id="playground"
        plugins={pluginsMemo}
        editableProps={CONFIG.editableProps}
        initialValue={VALUES.playground}
      >
        <SearchHighlightToolbar icon={Search} setSearch={setSearch} />
        <HeadingToolbar>
          <BasicElementToolbarButtons />
          <ListToolbarButtons />
          <BasicMarkToolbarButtons />
          <AlignToolbarButtons />
          <LinkToolbarButton icon={<Link />} />
          <ImageToolbarButton icon={<Image />} />
          <TableToolbarButtons />
        </HeadingToolbar>

        <MarkBallonToolbar />

        <MentionCombobox items={CONFIG.mentionItems} />
      </Plate>
    );
  };

  return (
    <div className="main">
      <DndProvider backend={HTML5Backend}>
        <Editor />
      </DndProvider>
    </div>
  );
};
