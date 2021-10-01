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
import { createHeadingPlugin, ELEMENT_H1 } from '@udecode/plate-heading';
import { createImagePlugin, ELEMENT_IMAGE } from '@udecode/plate-image';
import { createLinkPlugin } from '@udecode/plate-link';
import {
  createParagraphPlugin,
  ELEMENT_PARAGRAPH,
} from '@udecode/plate-paragraph';
import { HeadingToolbar } from '@udecode/plate-toolbar';
import { initialValuePlayground } from '../docs/src/live/config/initialValues';
import { MENTIONABLES } from '../docs/src/live/config/mentionables';
import {
  editableProps,
  optionsAutoformat,
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../docs/src/live/config/pluginOptions';
import {
  BallonToolbarMarks,
  ToolbarButtonsAlign,
  ToolbarButtonsBasicElements,
  ToolbarButtonsBasicMarks,
  ToolbarButtonsList,
  ToolbarButtonsTable,
} from '../docs/src/live/config/Toolbars';
import { withStyledDraggables } from '../docs/src/live/config/withStyledDraggables';
import { withStyledPlaceHolders } from '../docs/src/live/config/withStyledPlaceHolders';
import { createAutoformatPlugin } from '../packages/autoformat/src/createAutoformatPlugin';
import { createExitBreakPlugin } from '../packages/break/src/exit-break/createExitBreakPlugin';
import { createSoftBreakPlugin } from '../packages/break/src/soft-break/createSoftBreakPlugin';
import { Plate } from '../packages/core/src/components/Plate';
import { createDndPlugin } from '../packages/dnd/src/createDndPlugin';
import { createAlignPlugin } from '../packages/elements/alignment/src/createAlignPlugin';
import { ToolbarImage } from '../packages/elements/image-ui/src/ToolbarImage/ToolbarImage';
import { ToolbarLink } from '../packages/elements/link-ui/src/ToolbarLink/ToolbarLink';
import { createListPlugin } from '../packages/elements/list/src/createListPlugin';
import { createTodoListPlugin } from '../packages/elements/list/src/todo-list/createTodoListPlugin';
import { createMediaEmbedPlugin } from '../packages/elements/media-embed/src/createMediaEmbedPlugin';
import { createMentionPlugin } from '../packages/elements/mention/src/createMentionPlugin';
import { MentionCombobox } from '../packages/elements/mention-ui/src/MentionCombobox';
import { createTablePlugin } from '../packages/elements/table/src/createTablePlugin';
import { useFindReplacePlugin } from '../packages/find-replace/src/useFindReplacePlugin';
import { ToolbarSearchHighlight } from '../packages/find-replace-ui/src/ToolbarSearchHighlight/ToolbarSearchHighlight';
import { createBoldPlugin } from '../packages/marks/basic-marks/src/bold/createBoldPlugin';
import { createCodePlugin } from '../packages/marks/basic-marks/src/code/createCodePlugin';
import { createItalicPlugin } from '../packages/marks/basic-marks/src/italic/createItalicPlugin';
import { createStrikethroughPlugin } from '../packages/marks/basic-marks/src/strikethrough/createStrikethroughPlugin';
import { createSubscriptPlugin } from '../packages/marks/basic-marks/src/subscript/createSubscriptPlugin';
import { createSuperscriptPlugin } from '../packages/marks/basic-marks/src/superscript/createSuperscriptPlugin';
import { createUnderlinePlugin } from '../packages/marks/basic-marks/src/underline/createUnderlinePlugin';
import { createHighlightPlugin } from '../packages/marks/highlight/src/createHighlightPlugin';
import { createKbdPlugin } from '../packages/marks/kbd/src/createKbdPlugin';
import { createNodeIdPlugin } from '../packages/node-id/src/createNodeIdPlugin';
import { createNormalizeTypesPlugin } from '../packages/normalizers/src/createNormalizeTypesPlugin';
import { createPlateComponents } from '../packages/plate/src/utils/createPlateComponents';
import { createPlateOptions } from '../packages/plate/src/utils/createPlateOptions';
import { createResetNodePlugin } from '../packages/reset-node/src/createResetNodePlugin';
import { createSelectOnBackspacePlugin } from '../packages/select/src/createSelectOnBackspacePlugin';
import { createDeserializeHTMLPlugin } from '../packages/serializers/html-serializer/src/deserializer/createDeserializeHTMLPlugin';
import { createTrailingBlockPlugin } from '../packages/trailing-block/src/createTrailingBlockPlugin';

export default {
  title: 'Drag & Drop',
} as Meta;

export const Example = () => {
  let styledComponents = createPlateComponents();
  styledComponents = withStyledPlaceHolders(styledComponents);
  styledComponents = withStyledDraggables(styledComponents);

  const defaultOptions = createPlateOptions();

  const Editor = () => {
    const { setSearch, plugin: searchHighlightPlugin } = useFindReplacePlugin();

    const pluginsMemo = useMemo(() => {
      const plugins = [
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
        createAutoformatPlugin(optionsAutoformat),
        createResetNodePlugin(optionsResetBlockTypePlugin),
        createSoftBreakPlugin(optionsSoftBreakPlugin),
        createExitBreakPlugin(optionsExitBreakPlugin),
        createNormalizeTypesPlugin({
          rules: [{ path: [0], strictType: ELEMENT_H1 }],
        }),
        createTrailingBlockPlugin({ type: ELEMENT_PARAGRAPH }),
        createSelectOnBackspacePlugin({ allow: ELEMENT_IMAGE }),
        createMentionPlugin(),
        searchHighlightPlugin,
        createDndPlugin(),
      ];

      plugins.push(createDeserializeHTMLPlugin({ plugins }));

      return plugins;
    }, [searchHighlightPlugin]);

    return (
      <Plate
        id="playground"
        plugins={pluginsMemo}
        components={styledComponents}
        options={defaultOptions}
        editableProps={editableProps}
        initialValue={initialValuePlayground}
      >
        <ToolbarSearchHighlight icon={Search} setSearch={setSearch} />
        <HeadingToolbar>
          <ToolbarButtonsBasicElements />
          <ToolbarButtonsList />
          <ToolbarButtonsBasicMarks />
          <ToolbarButtonsAlign />
          <ToolbarLink icon={<Link />} />
          <ToolbarImage icon={<Image />} />
          <ToolbarButtonsTable />
        </HeadingToolbar>

        <BallonToolbarMarks />

        <MentionCombobox items={MENTIONABLES} />
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
